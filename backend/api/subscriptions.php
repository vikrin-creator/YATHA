<?php

header('Content-Type: application/json');

error_reporting(E_ALL);
ini_set('display_errors', '0');

require_once __DIR__ . '/../src/middleware/AuthMiddleware.php';
require_once __DIR__ . '/../src/utils/Response.php';
require_once __DIR__ . '/../src/config/Database.php';

// Load Stripe config with error logging
$stripeConfigPath = __DIR__ . '/../src/config/stripe.php';
error_log('[subscriptions] Config path: ' . $stripeConfigPath);
error_log('[subscriptions] Config exists: ' . (file_exists($stripeConfigPath) ? 'YES' : 'NO'));

$stripeCfg = include $stripeConfigPath;
$stripeSecret = $stripeCfg['secret_key'] ?? '';
error_log('[subscriptions] Secret key loaded: ' . (strlen($stripeSecret) > 0 ? 'YES (' . strlen($stripeSecret) . ' chars)' : 'NO'));
error_log('[subscriptions] Config keys: ' . json_encode(array_keys($stripeCfg)));

function stripeRequest($method, $path, $params = []) {
    global $stripeSecret;

    $url = 'https://api.stripe.com' . $path;

    $postData = http_build_query($params);
    $auth = base64_encode($stripeSecret . ':');
    
    $contextOptions = [
        'http' => [
            'method' => strtoupper($method),
            'header' => [
                'Authorization: Basic ' . $auth,
                'Content-Type: application/x-www-form-urlencoded',
                'User-Agent: Yatha/1.0'
            ],
            'content' => (strtoupper($method) === 'POST') ? $postData : null,
            'timeout' => 30
        ],
        'ssl' => [
            'verify_peer' => true,
            'verify_peer_name' => true
        ]
    ];
    
    $context = stream_context_create($contextOptions);
    
    try {
        $response = file_get_contents($url, false, $context);
        
        if (isset($http_response_header)) {
            preg_match('/HTTP\/\d+\.\d+ (\d+)/', $http_response_header[0], $matches);
            $status = intval($matches[1] ?? 200);
        } else {
            $status = 200;
        }

        $decoded = json_decode($response, true);
        return ['status' => $status, 'body' => $decoded];
    } catch (Exception $e) {
        throw new Exception('Stripe request failed: ' . $e->getMessage());
    }
}

try {
    $method = $_SERVER['REQUEST_METHOD'];
    $input = json_decode(file_get_contents('php://input'), true) ?: [];

    $user = AuthMiddleware::verify();
    $database = new Database();
    $db = $database->connect();

    if (!$db) {
        throw new Exception('Database connection failed');
    }

    if ($method === 'POST') {
        // Create a Stripe Checkout Session for subscription
        // Expected body: { items: [...], total: number, address_id, success_url, cancel_url }
        $items = $input['items'] ?? [];
        $total = isset($input['total']) ? floatval($input['total']) : null;
        $addressId = $input['address_id'] ?? null;
        $successUrl = $input['success_url'] ?? ($_SERVER['HTTP_ORIGIN'] ?? '') . '/';
        $cancelUrl = $input['cancel_url'] ?? ($_SERVER['HTTP_ORIGIN'] ?? '') . '/product';

        if ($total === null || count($items) === 0) {
            Response::validationError(['message' => 'items and total are required']);
        }

        if (!$stripeSecret) {
            Response::error('Stripe not configured on server. Set STRIPE_SECRET_KEY.', 500);
        }

        // Create or retrieve Stripe customer for the user
        // Check if user has stripe_customer_id in users table
        $stmt = $db->prepare("SELECT id, stripe_customer_id, email, name FROM users WHERE id = ?");
        $stmt->bind_param('i', $user['user_id']);
        $stmt->execute();
        $result = $stmt->get_result();
        $userRow = $result->fetch_assoc();

        $stripeCustomerId = $userRow['stripe_customer_id'] ?? null;

        if (!$stripeCustomerId) {
            // create customer
            $custParams = [
                'email' => $userRow['email'] ?? null,
                'name' => $userRow['name'] ?? null,
                'metadata[user_id]' => $user['user_id']
            ];

            $custResp = stripeRequest('POST', '/v1/customers', $custParams);
            if ($custResp['status'] >= 400) {
                Response::error('Failed to create Stripe customer', 500);
            }
            $stripeCustomerId = $custResp['body']['id'];

            // store in users table (add column if necessary)
            $update = $db->prepare("UPDATE users SET stripe_customer_id = ? WHERE id = ?");
            $update->bind_param('si', $stripeCustomerId, $user['user_id']);
            $update->execute();
        }

        // Build line items from items array (similar to checkout)
        $amountCents = intval(round($total * 100));

        $params = [
            'payment_method_types[]' => 'card',
            'mode' => 'subscription',
            'success_url' => $successUrl,
            'cancel_url' => $cancelUrl,
            'customer' => $stripeCustomerId,
            // single line item representing the total amount
            'line_items[0][price_data][currency]' => 'usd',
            'line_items[0][price_data][product_data][name]' => 'Subscription from Yatha',
            'line_items[0][price_data][recurring][interval]' => 'month',
            'line_items[0][price_data][unit_amount]' => $amountCents,
            'line_items[0][quantity]' => 1,
            // attach metadata
            "subscription_data[metadata][user_id]" => $user['user_id']
        ];

        if ($addressId) $params["subscription_data[metadata][address_id]"] = $addressId;
        // Attach items JSON in metadata if present
        if (!empty($items)) $params["subscription_data[metadata][items]"] = json_encode(array_slice($items, 0, 10));

        $sessionResp = stripeRequest('POST', '/v1/checkout/sessions', $params);
        if ($sessionResp['status'] >= 400) {
            $errMsg = 'Failed to create Stripe Checkout Session';
            if (is_array($sessionResp['body']) && isset($sessionResp['body']['error']['message'])) {
                $errMsg = $sessionResp['body']['error']['message'];
            }
            Response::error($errMsg, 500, $sessionResp['body'] ?? []);
        }

        // Return session URL
        echo json_encode([
            'success' => true,
            'status' => 'created',
            'message' => 'Subscription checkout session created',
            'data' => [
                'session' => $sessionResp['body']
            ]
        ]);
        http_response_code(201);
        exit;
    } else {
        Response::error('Method not allowed', 405);
    }
} catch (Exception $e) {
    Response::error($e->getMessage(), 500);
}

?>
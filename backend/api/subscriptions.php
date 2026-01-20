<?php

// Set CORS headers FIRST - before anything else
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 86400');
header('Content-Type: application/json');

// Handle OPTIONS preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

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
    
    error_log('[stripe-request] Method: ' . $method . ', Path: ' . $path);
    error_log('[stripe-request] URL: ' . $url);
    error_log('[stripe-request] Params count: ' . count($params));
    error_log('[stripe-request] PostData length: ' . strlen($postData) . ' chars');
    
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
        error_log('[stripe-request] Sending request to Stripe...');
        $response = file_get_contents($url, false, $context);
        error_log('[stripe-request] Received response, length: ' . strlen($response) . ' bytes');
        
        if (isset($http_response_header)) {
            preg_match('/HTTP\/\d+\.\d+ (\d+)/', $http_response_header[0], $matches);
            $status = intval($matches[1] ?? 200);
        } else {
            $status = 200;
        }

        $decoded = json_decode($response, true);
        error_log('[stripe-request] Response status: ' . $status);
        return ['status' => $status, 'body' => $decoded];
    } catch (Exception $e) {
        error_log('[stripe-request] EXCEPTION: ' . $e->getMessage());
        throw new Exception('Stripe request failed: ' . $e->getMessage());
    }
}

try {
    $method = $_SERVER['REQUEST_METHOD'];
    $input = json_decode(file_get_contents('php://input'), true) ?: [];

    // Debug: Log authentication attempt
    $debugLog = __DIR__ . '/../subscriptions-debug.log';
    file_put_contents($debugLog, '[' . date('Y-m-d H:i:s') . '] Authentication attempt started' . PHP_EOL, FILE_APPEND | LOCK_EX);
    error_log('[subscriptions] Authentication attempt started');
    
    $user = AuthMiddleware::verify();
    
    // Debug: Log successful authentication  
    file_put_contents($debugLog, '[' . date('Y-m-d H:i:s') . '] User authenticated: ' . json_encode(['user_id' => $user['user_id'], 'role' => $user['role'] ?? 'user']) . PHP_EOL, FILE_APPEND | LOCK_EX);
    error_log('[subscriptions] User authenticated: ' . json_encode(['user_id' => $user['user_id'], 'role' => $user['role'] ?? 'user']));
    
    $database = new Database();
    $db = $database->connect();

    if (!$db) {
        error_log('[subscriptions] Database connection failed');
        throw new Exception('Database connection failed');
    }

    error_log('[subscriptions] Database connected successfully');

    // GET /api/subscriptions - Get customer's active subscriptions
    if ($method === 'GET') {
        error_log('[subscriptions] GET request - fetching subscriptions for user: ' . $user['user_id']);
        
        $query = "
            SELECT 
                s.id,
                s.stripe_subscription_id,
                s.product_id,
                s.status,
                s.created_at,
                p.name as product_name,
                p.price
            FROM subscriptions s
            LEFT JOIN products p ON s.product_id = p.id
            WHERE s.user_id = ?
            ORDER BY s.created_at DESC
        ";
        
        error_log('[subscriptions] Preparing query: ' . str_replace(PHP_EOL, ' ', $query));
        
        $stmt = $db->prepare($query);
        
        if (!$stmt) {
            error_log('[subscriptions] Prepare error: ' . $db->error);
            throw new Exception('Database error: ' . $db->error);
        }
        
        error_log('[subscriptions] Query prepared successfully');
        
        $stmt->bind_param('i', $user['user_id']);
        error_log('[subscriptions] Executing query for user_id: ' . $user['user_id']);
        
        if (!$stmt->execute()) {
            error_log('[subscriptions] Execute error: ' . $stmt->error);
            throw new Exception('Query execution failed: ' . $stmt->error);
        }
        
        error_log('[subscriptions] Query executed successfully');
        
        $result = $stmt->get_result();
        $subscriptions = [];
        
        while ($row = $result->fetch_assoc()) {
            $subscriptions[] = $row;
        }
        
        error_log('[subscriptions] Found ' . count($subscriptions) . ' subscriptions for user');
        
        Response::success($subscriptions, 'Subscriptions retrieved successfully');
        $stmt->close();
        exit;
    }

    if ($method === 'POST') {
        // Create a Stripe Checkout Session for subscription
        // Expected body: { items: [...], total: number, address_id, success_url, cancel_url }
        $items = $input['items'] ?? [];
        $total = isset($input['total']) ? floatval($input['total']) : null;
        $addressId = $input['address_id'] ?? null;
        $baseUrl = $input['success_url'] ?? ($_SERVER['HTTP_ORIGIN'] ?? '');
        $successUrl = $baseUrl . (strpos($baseUrl, '?') ? '&' : '?') . 'session_id={CHECKOUT_SESSION_ID}';
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
            // create customer with metadata
            $custParams = [
                'email' => $userRow['email'] ?? null,
                'name' => $userRow['name'] ?? null,
                'metadata[user_id]' => $user['user_id'],
                'metadata[product_id]' => isset($items[0]['id']) ? intval($items[0]['id']) : null
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
            // Metadata at line_item level - flows to subscription
            'line_items[0][metadata][user_id]' => $user['user_id'],
            'line_items[0][metadata][subscription_type]' => 'recurring',
            // Also attach metadata at session level for webhook compatibility
            "metadata[user_id]" => $user['user_id'],
            "metadata[subscription_type]" => 'recurring'
        ];

        // Extract product_id from first item if available
        if (!empty($items) && isset($items[0]['id'])) {
            $productId = intval($items[0]['id']);
            $params["metadata[product_id]"] = $productId;
            $params["line_items[0][metadata][product_id]"] = $productId;
        }

        if ($addressId) $params["metadata[address_id]"] = $addressId;
        // Attach items JSON in metadata if present
        if (!empty($items)) $params["metadata[items]"] = json_encode(array_slice($items, 0, 10));

        // Debug: Log the metadata being sent to Stripe
        $metadata_debug = [
            'user_id' => $user['user_id'], 
            'address_id' => $addressId,
            'items_count' => count($items)
        ];
        error_log('[subscriptions] Stripe metadata: ' . json_encode($metadata_debug));
        error_log('[subscriptions] POST REQUEST BODY: ' . json_encode($input));
        error_log('[subscriptions] POST METHOD: ' . $method);
        error_log('[subscriptions] Attempting Stripe session creation with ' . count($params) . ' parameters');
        error_log('[subscriptions] Stripe params: ' . json_encode($params));

        $sessionResp = stripeRequest('POST', '/v1/checkout/sessions', $params);
        error_log('[subscriptions] Stripe response status: ' . $sessionResp['status']);
        error_log('[subscriptions] Stripe response body: ' . json_encode($sessionResp['body']));
        
        if ($sessionResp['status'] >= 400) {
            $errMsg = 'Failed to create Stripe Checkout Session';
            if (is_array($sessionResp['body']) && isset($sessionResp['body']['error']['message'])) {
                $errMsg = $sessionResp['body']['error']['message'];
            }
            error_log('[subscriptions] ERROR: ' . $errMsg);
            Response::error($errMsg, 500, $sessionResp['body'] ?? []);
        }

        error_log('[subscriptions] SUCCESS: Checkout session created: ' . $sessionResp['body']['id']);
        
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
    } elseif ($method === 'DELETE') {
        // DELETE /api/subscriptions/{id} - Cancel subscription
        // Get subscription ID from URL path
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $pathParts = explode('/', trim($path, '/'));
        $subscriptionId = end($pathParts);
        
        if (!is_numeric($subscriptionId)) {
            Response::error('Invalid subscription ID', 400);
        }
        
        // Get subscription details
        $stmt = $db->prepare("
            SELECT stripe_subscription_id 
            FROM subscriptions 
            WHERE id = ? AND user_id = ?
        ");
        
        if (!$stmt) {
            throw new Exception('Database error: ' . $db->error);
        }
        
        $stmt->bind_param('ii', $subscriptionId, $user['user_id']);
        
        if (!$stmt->execute()) {
            throw new Exception('Query execution failed');
        }
        
        $result = $stmt->get_result();
        $subscription = $result->fetch_assoc();
        $stmt->close();
        
        if (!$subscription) {
            Response::error('Subscription not found', 404);
        }
        
        // Cancel the Stripe subscription
        try {
            $cancelParams = [];
            $cancelResp = stripeRequest('DELETE', '/v1/subscriptions/' . $subscription['stripe_subscription_id'], $cancelParams);
            
            if ($cancelResp['status'] >= 400) {
                $errMsg = 'Failed to cancel subscription on Stripe';
                if (is_array($cancelResp['body']) && isset($cancelResp['body']['error']['message'])) {
                    $errMsg = $cancelResp['body']['error']['message'];
                }
                Response::error($errMsg, 400);
            }
        } catch (Exception $e) {
            Response::error('Failed to cancel subscription: ' . $e->getMessage(), 500);
        }
        
        // Update local database - set status to 'canceled'
        $updateStmt = $db->prepare("
            UPDATE subscriptions 
            SET status = 'canceled'
            WHERE id = ? AND user_id = ?
        ");
        
        if (!$updateStmt) {
            throw new Exception('Database error: ' . $db->error);
        }
        
        $updateStmt->bind_param('ii', $subscriptionId, $user['user_id']);
        
        if (!$updateStmt->execute()) {
            throw new Exception('Failed to update subscription status');
        }
        
        $updateStmt->close();
        
        Response::success('Subscription canceled successfully');
        exit;
    } else {
        Response::error('Method not allowed', 405);
    }
} catch (Exception $e) {
    error_log('[subscriptions] EXCEPTION: ' . $e->getMessage());
    error_log('[subscriptions] Stack trace: ' . $e->getTraceAsString());
    Response::error($e->getMessage(), 500);
}

?>
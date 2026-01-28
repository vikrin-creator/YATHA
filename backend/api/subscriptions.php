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

// Load .env file
if (file_exists(__DIR__ . '/../.env')) {
    $envLines = file(__DIR__ . '/../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($envLines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            [$key, $value] = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value, '\'"');
            if (!getenv($key)) {
                putenv("$key=$value");
            }
        }
    }
}

require_once __DIR__ . '/../src/middleware/AuthMiddleware.php';
require_once __DIR__ . '/../src/utils/Response.php';
require_once __DIR__ . '/../src/config/Database.php';
require_once __DIR__ . '/../src/services/SubscriptionFulfillment.php';

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
        
        // Check if requesting subscription details with orders
        $pathParts = explode('/', trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/'));
        $subscriptionId = end($pathParts);
        
        if (is_numeric($subscriptionId) && $subscriptionId > 0) {
            // GET /api/subscriptions/{id} - Get specific subscription with order history
            error_log('[subscriptions] GET request for subscription ID: ' . $subscriptionId);
            
            $stmt = $db->prepare("
                SELECT 
                    s.id,
                    s.stripe_subscription_id,
                    s.product_id,
                    s.shipment_quantity,
                    s.status,
                    s.current_period_start,
                    s.current_period_end,
                    s.next_billing_date,
                    s.created_at,
                    p.name as product_name,
                    p.price,
                    p.description
                FROM subscriptions s
                LEFT JOIN products p ON s.product_id = p.id
                WHERE s.id = ? AND s.user_id = ?
            ");
            
            if (!$stmt) {
                error_log('[subscriptions] Prepare error: ' . $db->error);
                throw new Exception('Database error: ' . $db->error);
            }
            
            $stmt->bind_param('ii', $subscriptionId, $user['user_id']);
            
            if (!$stmt->execute()) {
                error_log('[subscriptions] Execute error: ' . $stmt->error);
                throw new Exception('Query execution failed: ' . $stmt->error);
            }
            
            $result = $stmt->get_result();
            $subscription = $result->fetch_assoc();
            $stmt->close();
            
            if (!$subscription) {
                Response::error('Subscription not found', 404);
            }
            
            // Get associated orders
            try {
                $fulfillment = new SubscriptionFulfillment($db);
                $orders = $fulfillment->getSubscriptionOrders($subscriptionId);
                $subscription['orders'] = $orders;
            } catch (Exception $e) {
                error_log('[subscriptions] Error fetching orders: ' . $e->getMessage());
                $subscription['orders'] = [];
            }
            
            Response::success($subscription, 'Subscription details retrieved successfully');
            exit;
        }
        
        // GET /api/subscriptions - List all subscriptions
        $query = "
            SELECT 
                s.id,
                s.stripe_subscription_id,
                s.product_id,
                s.shipment_quantity,
                s.status,
                s.next_billing_date,
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
        // Expected body: { items: [...], total: number, shipment_quantity: 1, address_id, success_url, cancel_url }
        $items = $input['items'] ?? [];
        $total = isset($input['total']) ? floatval($input['total']) : null;
        $shipmentQuantity = intval($input['shipment_quantity'] ?? 1);
        $addressId = $input['address_id'] ?? null;
        
        // Determine the base URL - use production URL if not localhost
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        if (strpos($origin, 'localhost') !== false || strpos($origin, '127.0.0.1') !== false) {
            // For local development, use production URL for Stripe checkout
            $productionUrl = 'https://tan-goshawk-974791.hostingersite.com';
            $baseUrl = $input['success_url'] ?? $productionUrl;
        } else {
            // In production, use the origin
            $baseUrl = $input['success_url'] ?? $origin;
        }
        
        $successUrl = $baseUrl . (strpos($baseUrl, '?') ? '&' : '?') . 'session_id={CHECKOUT_SESSION_ID}';
        $cancelUrl = $input['cancel_url'] ?? $baseUrl . '/product';

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
            // Metadata at session level
            "metadata[user_id]" => $user['user_id'],
            "metadata[subscription_type]" => 'recurring',
            // IMPORTANT: subscription_data allows setting metadata on the subscription object
            'subscription_data[metadata][user_id]' => $user['user_id'],
            'subscription_data[metadata][subscription_type]' => 'recurring',
            'subscription_data[metadata][shipment_quantity]' => $shipmentQuantity
        ];

        // Extract product_id from first item if available
        if (!empty($items) && isset($items[0]['id'])) {
            $productId = intval($items[0]['id']);
            $params["metadata[product_id]"] = $productId;
            $params['subscription_data[metadata][product_id]'] = $productId;
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
    } elseif ($method === 'PATCH') {
        // PATCH /api/subscriptions/{id} - Update subscription (quantity, etc)
        // Expected body: { shipment_quantity: number } or { action: 'pause'/'resume'/'skip' }
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $pathParts = explode('/', trim($path, '/'));
        $subscriptionId = end($pathParts);
        
        if (!is_numeric($subscriptionId)) {
            Response::error('Invalid subscription ID', 400);
        }
        
        // Verify subscription exists and belongs to user
        $checkStmt = $db->prepare("
            SELECT id FROM subscriptions 
            WHERE id = ? AND user_id = ?
        ");
        
        $checkStmt->bind_param('ii', $subscriptionId, $user['user_id']);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if (!$checkResult->fetch_assoc()) {
            Response::error('Subscription not found', 404);
        }
        $checkStmt->close();
        
        // Handle different actions
        $action = $input['action'] ?? null;
        
        if ($action === 'skip') {
            // Skip next shipment
            try {
                $fulfillment = new SubscriptionFulfillment($db);
                $skipId = $fulfillment->skipNextShipment($subscriptionId);
                Response::success(['skip_id' => $skipId], 'Next shipment skipped');
                exit;
            } catch (Exception $e) {
                Response::error('Failed to skip shipment: ' . $e->getMessage(), 500);
            }
        } elseif ($action === 'pause') {
            // Pause subscription
            $pauseStmt = $db->prepare("
                UPDATE subscriptions 
                SET status = 'paused'
                WHERE id = ? AND user_id = ?
            ");
            
            $pauseStmt->bind_param('ii', $subscriptionId, $user['user_id']);
            
            if (!$pauseStmt->execute()) {
                Response::error('Failed to pause subscription', 500);
            }
            $pauseStmt->close();
            
            Response::success('Subscription paused');
            exit;
        } elseif ($action === 'resume') {
            // Resume subscription
            $resumeStmt = $db->prepare("
                UPDATE subscriptions 
                SET status = 'active'
                WHERE id = ? AND user_id = ?
            ");
            
            $resumeStmt->bind_param('ii', $subscriptionId, $user['user_id']);
            
            if (!$resumeStmt->execute()) {
                Response::error('Failed to resume subscription', 500);
            }
            $resumeStmt->close();
            
            Response::success('Subscription resumed');
            exit;
        } else if (isset($input['shipment_quantity'])) {
            // Update shipment quantity
            $newQuantity = intval($input['shipment_quantity']);
            
            if ($newQuantity < 1) {
                Response::validationError(['message' => 'Quantity must be at least 1']);
            }
            
            $quantityStmt = $db->prepare("
                UPDATE subscriptions 
                SET shipment_quantity = ?
                WHERE id = ? AND user_id = ?
            ");
            
            $quantityStmt->bind_param('iii', $newQuantity, $subscriptionId, $user['user_id']);
            
            if (!$quantityStmt->execute()) {
                Response::error('Failed to update quantity', 500);
            }
            $quantityStmt->close();
            
            Response::success(['shipment_quantity' => $newQuantity], 'Shipment quantity updated');
            exit;
        } else {
            Response::validationError(['message' => 'No update action specified']);
        }
    } else {
        Response::error('Method not allowed', 405);
    }
} catch (Exception $e) {
    error_log('[subscriptions] EXCEPTION: ' . $e->getMessage());
    error_log('[subscriptions] Stack trace: ' . $e->getTraceAsString());
    Response::error($e->getMessage(), 500);
}

?>
<?php

header('Content-Type: application/json');

error_reporting(E_ALL);
ini_set('display_errors', '0');

// Set up error handler to catch all errors as JSON responses
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    error_log("[checkout] PHP Error ({$errno}): {$errstr} in {$errfile}:{$errline}");
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'status' => 'error',
        'message' => 'Server error: ' . $errstr,
        'file' => basename($errfile),
        'line' => $errline,
        'debug' => true
    ]);
    exit;
}, E_ALL);

// Set up exception handler
set_exception_handler(function(Throwable $e) {
    error_log("[checkout] Exception: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'status' => 'error',
        'message' => 'Server error: ' . $e->getMessage(),
        'file' => basename($e->getFile()),
        'line' => $e->getLine(),
        'debug' => true
    ]);
    exit;
});

require_once __DIR__ . '/../src/middleware/AuthMiddleware.php';
require_once __DIR__ . '/../src/utils/Response.php';
require_once __DIR__ . '/../src/config/Database.php';

error_log('[checkout] Loading Stripe config...');
$stripeConfigPath = __DIR__ . '/../src/config/stripe.php';
error_log('[checkout] Stripe config path: ' . $stripeConfigPath);
error_log('[checkout] Stripe config exists: ' . (file_exists($stripeConfigPath) ? 'YES' : 'NO'));

$stripeCfg = include $stripeConfigPath;
$stripeSecret = $stripeCfg['secret_key'] ?? '';
error_log('[checkout] Stripe secret loaded: ' . (strlen($stripeSecret) > 0 ? 'YES (' . strlen($stripeSecret) . ' chars)' : 'NO'));
error_log('[checkout] Stripe config keys: ' . json_encode(array_keys($stripeCfg)));

if (!$stripeSecret || strlen(trim($stripeSecret)) === 0) {
    error_log('[checkout] ERROR: Stripe secret key is empty. Full config: ' . json_encode($stripeCfg));
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'status' => 'error',
        'message' => 'Stripe not configured on server. Set STRIPE_SECRET_KEY in backend/.env',
        'debug' => ['config_keys' => array_keys($stripeCfg ?? [])]
    ]);
    exit;
}

// Log incoming request for debugging
$raw = @file_get_contents('php://input');
error_log('[checkout] REQUEST ' . $_SERVER['REQUEST_METHOD'] . ' ' . ($_SERVER['REQUEST_URI'] ?? '') );
if (function_exists('getallheaders')) {
    error_log('[checkout] HEADERS: ' . json_encode(getallheaders()));
}
error_log('[checkout] BODY: ' . substr($raw, 0, 2000));

// Register shutdown function to catch fatal errors
register_shutdown_function(function() {
    $err = error_get_last();
    if ($err) {
        error_log('[checkout] SHUTDOWN error: ' . json_encode($err));
    }
});

function stripeRequest($method, $path, $params = []) {
    global $stripeSecret;
    $url = 'https://api.stripe.com' . $path;
    
    error_log("[checkout] stripeRequest to $url with method: $method");
    error_log("[checkout] params: " . json_encode($params));
    
    // Use file_get_contents with stream context (works without curl extension)
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
        
        // Get response headers to check status code
        if (isset($http_response_header)) {
            preg_match('/HTTP\/\d+\.\d+ (\d+)/', $http_response_header[0], $matches);
            $status = intval($matches[1] ?? 200);
        } else {
            $status = 200;
        }
        
        error_log('[checkout] stripe response status: ' . $status . ' body: ' . substr($response, 0, 2000));
        
        return ['status' => $status, 'body' => json_decode($response, true)];
    } catch (Exception $e) {
        error_log('[checkout] stream error: ' . $e->getMessage());
        throw new Exception('Stripe request failed: ' . $e->getMessage());
    }
}

try {
    $method = $_SERVER['REQUEST_METHOD'];
    $input = json_decode(file_get_contents('php://input'), true) ?: [];

    // Debug: Log the authentication attempt
    $debugLog = __DIR__ . '/../checkout-debug.log';
    file_put_contents($debugLog, '[' . date('Y-m-d H:i:s') . '] Authentication attempt started' . PHP_EOL, FILE_APPEND | LOCK_EX);
    error_log('[checkout] Authentication attempt started');
    
    $user = AuthMiddleware::verify();
    
    // Debug: Log successful authentication
    file_put_contents($debugLog, '[' . date('Y-m-d H:i:s') . '] User authenticated: ' . json_encode(['user_id' => $user['user_id'], 'role' => $user['role'] ?? 'user']) . PHP_EOL, FILE_APPEND | LOCK_EX);
    error_log('[checkout] User authenticated: ' . json_encode(['user_id' => $user['user_id'], 'role' => $user['role'] ?? 'user']));
    
    $database = new Database();
    $db = $database->connect();

    if (!$db) Response::error('DB connection failed', 500);

    if ($method === 'POST') {
        // Expected: { items: [...], total: number (decimal), address_id, success_url, cancel_url }
        $items = $input['items'] ?? [];
        $total = isset($input['total']) ? floatval($input['total']) : null;
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
        $cancelUrl = $input['cancel_url'] ?? $baseUrl . '/checkout';

        if ($total === null) {
            Response::validationError(['message' => 'total amount is required']);
        }

        if (!$stripeSecret) {
            Response::error('Stripe not configured on server. Set STRIPE_SECRET_KEY.', 500);
        }

        // Build line item for the total. Using price_data for one-off payment
        $amountCents = intval(round($total * 100));

        $params = [
            'payment_method_types[]' => 'card',
            'mode' => 'payment',
            'success_url' => $successUrl,
            'cancel_url' => $cancelUrl,
            // single line item representing the total amount
            'line_items[0][price_data][currency]' => 'usd',
            'line_items[0][price_data][product_data][name]' => 'Order from Yatha',
            'line_items[0][price_data][unit_amount]' => $amountCents,
            'line_items[0][quantity]' => 1,
            // attach metadata
            "metadata[user_id]" => $user['user_id']
        ];

        if ($addressId) $params["metadata[address_id]"] = $addressId;
        // Attach a minimal items JSON in metadata if present (avoid too large)
        if (!empty($items)) $params["metadata[items]"] = json_encode(array_slice($items,0,10));

        // Debug: Log the metadata being sent to Stripe
        $metadata_debug = [
            'user_id' => $user['user_id'],
            'address_id' => $addressId,
            'items_count' => count($items)
        ];
        error_log('[checkout] Stripe metadata: ' . json_encode($metadata_debug));

        $sessionResp = stripeRequest('POST', '/v1/checkout/sessions', $params);
        if ($sessionResp['status'] >= 400) {
            // include Stripe error details in response for easier debugging (dev only)
            $errMsg = 'Failed to create Stripe Checkout Session';
            if (is_array($sessionResp['body']) && isset($sessionResp['body']['error']['message'])) {
                $errMsg = $sessionResp['body']['error']['message'];
            }
            Response::error($errMsg, 500, $sessionResp['body'] ?? []);
        }

        // Create order immediately after successful Stripe session creation
        try {
            $database = new Database();
            $db = $database->connect();
            
            if (!$db) {
                throw new Exception('Database connection failed');
            }

            $sessionId = $sessionResp['body']['id'] ?? null;
            $shippingAddressJson = null;
            
            // Get shipping address if address_id provided
            if ($addressId) {
                $addressQuery = "SELECT full_name, address_line_1, address_line_2, city, state, pincode, country FROM addresses WHERE id = ? AND user_id = ?";
                $addressStmt = $db->prepare($addressQuery);
                $addressStmt->bind_param('ii', $addressId, $user['user_id']);
                $addressStmt->execute();
                $addressResult = $addressStmt->get_result();
                
                if ($addressRow = $addressResult->fetch_assoc()) {
                    $shippingAddressJson = json_encode($addressRow);
                }
            }

            // Create order record
            $orderQuery = "INSERT INTO orders (user_id, total_amount, status, stripe_session_id, shipping_address, created_at) VALUES (?, ?, 'pending', ?, ?, NOW())";
            $orderStmt = $db->prepare($orderQuery);
            $orderStmt->bind_param('idss', $user['user_id'], $total, $sessionId, $shippingAddressJson);
            
            if (!$orderStmt->execute()) {
                error_log('[checkout] Failed to create order: ' . $orderStmt->error);
                throw new Exception('Failed to create order record');
            }
            
            $orderId = $orderStmt->insert_id;
            error_log('[checkout] Order created successfully with ID: ' . $orderId . ' for session: ' . $sessionId);
            
        } catch (Exception $orderException) {
            error_log('[checkout] Order creation error: ' . $orderException->getMessage());
            // Don't fail the checkout if order creation fails - the payment is already initiated
            // The order can be manually created later if needed
        }

        echo json_encode([
            'success' => true,
            'status' => 'created',
            'data' => ['session' => $sessionResp['body']]
        ]);
        http_response_code(201);
        exit;
    } else {
        Response::error('Method not allowed', 405);
    }
} catch (Exception $e) {
    error_log('[checkout] ERROR: ' . $e->getMessage());
    // Debug: Log authentication failure
    $debugLog = __DIR__ . '/../checkout-debug.log';
    file_put_contents($debugLog, '[' . date('Y-m-d H:i:s') . '] ERROR: ' . $e->getMessage() . PHP_EOL, FILE_APPEND | LOCK_EX);
    Response::error($e->getMessage(), 500);
}

?>

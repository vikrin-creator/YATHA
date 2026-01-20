<?php
/**
 * Fallback webhook handler for when Stripe's actual webhook fails
 * Called directly from OrderSuccess page to create order if it doesn't exist
 */

error_reporting(E_ALL);
ini_set('display_errors', '0');

error_log('[stripe-fallback] ========== FALLBACK WEBHOOK STARTED ==========');
error_log('[stripe-fallback] Request method: ' . $_SERVER['REQUEST_METHOD']);
error_log('[stripe-fallback] Request headers: ' . json_encode(getallheaders()));

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    error_log('[stripe-fallback] OPTIONS request, exiting');
    exit(0);
}

require_once __DIR__ . '/../src/utils/Response.php';
require_once __DIR__ . '/../src/middleware/AuthMiddleware.php';
require_once __DIR__ . '/../src/config/Database.php';

try {
    $method = $_SERVER['REQUEST_METHOD'];
    $input = json_decode(file_get_contents('php://input'), true);

    error_log('[stripe-fallback] Input data: ' . json_encode($input));

    // Verify user is authenticated
    error_log('[stripe-fallback] Attempting authentication...');
    $user = AuthMiddleware::verify();
    error_log('[stripe-fallback] Authentication successful: ' . json_encode(['user_id' => $user['user_id']]));
    
    if ($method === 'POST') {
        $sessionId = $input['session_id'] ?? null;
        error_log('[stripe-fallback] Session ID from input: ' . ($sessionId ?: 'NULL'));
        
        if (!$sessionId) {
            error_log('[stripe-fallback] ERROR: session_id is required');
            Response::validationError(['message' => 'session_id is required']);
            exit;
        }
        
        error_log('[stripe-fallback] Connecting to database...');
        $database = new Database();
        $db = $database->connect();
        if (!$db) {
            error_log('[stripe-fallback] ERROR: Database connection failed');
            Response::error('Database connection failed', 500);
            exit;
        }
        
        error_log('[stripe-fallback] Database connected, checking for existing order...');
        
        // Check if order already exists for this session
        $checkStmt = $db->prepare("SELECT id FROM orders WHERE stripe_session_id = ? LIMIT 1");
        if (!$checkStmt) {
            error_log('[stripe-fallback] ERROR: Prepare failed for check order: ' . $db->error);
        }
        
        $checkStmt->bind_param('s', $sessionId);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows > 0) {
            // Order already exists, just fetch and return it
            $row = $checkResult->fetch_assoc();
            $orderId = $row['id'];
            
            $orderStmt = $db->prepare("SELECT * FROM orders WHERE id = ? LIMIT 1");
            $orderStmt->bind_param('i', $orderId);
            $orderStmt->execute();
            $orderResult = $orderStmt->get_result();
            
            if ($orderResult->num_rows > 0) {
                Response::success($orderResult->fetch_assoc());
            } else {
                Response::error('Order not found', 404);
            }
            exit;
        }
        
        // Order doesn't exist yet - try to fetch from Stripe and create it
        $stripeCfg = include __DIR__ . '/../src/config/stripe.php';
        $stripeSecret = $stripeCfg['secret_key'] ?? null;
        
        if (!$stripeSecret) {
            Response::error('Stripe not configured', 500);
            exit;
        }
        
        // Call Stripe API to get session details
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://api.stripe.com/v1/checkout/sessions/{$sessionId}");
        curl_setopt($ch, CURLOPT_USERPWD, $stripeSecret . ':');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        
        $response = curl_exec($ch);
        $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($statusCode !== 200) {
            Response::error('Failed to retrieve Stripe session details', 500);
            exit;
        }
        
        $session = json_decode($response, true);
        if (!$session) {
            Response::error('Invalid session response from Stripe', 500);
            exit;
        }
        
        // Verify payment status
        if ($session['payment_status'] !== 'paid') {
            Response::error('Payment not completed', 400);
            exit;
        }
        
        // Extract metadata
        $metadata = $session['metadata'] ?? [];
        $sessionUserId = isset($metadata['user_id']) ? intval($metadata['user_id']) : null;
        $addressId = isset($metadata['address_id']) ? intval($metadata['address_id']) : null;
        $subscriptionType = $metadata['subscription_type'] ?? 'one-time';
        $amountTotal = isset($session['amount_total']) ? intval($session['amount_total']) / 100 : 0;
        
        // Security: Ensure the authenticated user matches the session user
        if ($sessionUserId !== $user['user_id']) {
            error_log('[stripe-fallback] SECURITY: Session user mismatch - session: ' . $sessionUserId . ', auth: ' . $user['user_id']);
            Response::error('Unauthorized - session belongs to different user', 403);
            exit;
        }
        
        error_log('[stripe-fallback] Session mode: ' . $session['mode']);
        error_log('[stripe-fallback] Session metadata: ' . json_encode($metadata));
        error_log('[stripe-fallback] Payment status: ' . $session['payment_status']);
        
        // For subscription mode, create subscription record instead of order
        if ($session['mode'] === 'subscription') {
            error_log('[stripe-fallback] Creating subscription record');
            // Handle subscription creation
            $status = 'active';
            $createdAt = date('Y-m-d H:i:s');
            $productId = isset($metadata['product_id']) ? intval($metadata['product_id']) : null;
            
            error_log('[stripe-fallback] Product ID from metadata: ' . ($productId ?: 'NULL'));
            error_log('[stripe-fallback] User ID: ' . $user['user_id']);
            error_log('[stripe-fallback] Session ID: ' . $sessionId);
            error_log('[stripe-fallback] Metadata: ' . json_encode($metadata));
            
            // Insert subscription record (if subscriptions table exists)
            $insertStmt = $db->prepare(
                "INSERT INTO subscriptions (user_id, stripe_session_id, product_id, status, created_at) 
                 VALUES (?, ?, ?, ?, ?)"
            );
            
            if ($insertStmt) {
                $insertStmt->bind_param(
                    'isiss',
                    $user['user_id'],
                    $sessionId,
                    $productId,
                    $status,
                    $createdAt
                );
                
                if (!$insertStmt->execute()) {
                    error_log('[stripe-fallback] Subscription insert error: ' . $insertStmt->error);
                    Response::error('Failed to create subscription: ' . $insertStmt->error, 500);
                    exit;
                } else {
                    error_log('[stripe-fallback] Subscription created successfully. Subscription ID: ' . $db->insert_id);
                }
                $insertStmt->close();
            } else {
                error_log('[stripe-fallback] Prepare statement failed: ' . $db->error);
                Response::error('Database prepare failed: ' . $db->error, 500);
                exit;
            }
            
            error_log('[stripe-fallback] Subscription success response');
            Response::success(['message' => 'Subscription created successfully', 'type' => 'subscription']);
            exit;
        }
        
        // For payment mode, create order record
        error_log('[stripe-fallback] Creating order record for payment mode');
        $status = 'completed';
        $createdAt = date('Y-m-d H:i:s');
        
        error_log('[stripe-fallback] Creating order with amount: ' . $amountTotal . ', address_id: ' . ($addressId ?: 'NULL'));
        
        $insertStmt = $db->prepare(
            "INSERT INTO orders (user_id, total_amount, status, stripe_session_id, address_id, created_at) 
             VALUES (?, ?, ?, ?, ?, ?)"
        );
        
        if (!$insertStmt) {
            error_log('[stripe-fallback] Prepare error: ' . $db->error);
            Response::error('Database prepare failed: ' . $db->error, 500);
            exit;
        }
        
        $insertStmt->bind_param(
            'idsssi',
            $user['user_id'],
            $amountTotal,
            $status,
            $sessionId,
            $addressId,
            $createdAt
        );
        
        if (!$insertStmt->execute()) {
            error_log('[stripe-fallback] Order insert error: ' . $insertStmt->error);
            Response::error('Failed to create order: ' . $insertStmt->error, 500);
            exit;
        }
        
        error_log('[stripe-fallback] Order created successfully with ID: ' . $db->insert_id);
        $orderId = $db->insert_id;
        
        // Fetch and return the newly created order
        $orderStmt = $db->prepare("SELECT * FROM orders WHERE id = ? LIMIT 1");
        $orderStmt->bind_param('i', $orderId);
        $orderStmt->execute();
        $orderResult = $orderStmt->get_result();
        
        if ($orderResult->num_rows > 0) {
            Response::success($orderResult->fetch_assoc());
        } else {
            Response::error('Order created but could not retrieve', 500);
        }
    } else {
        Response::error('Method not allowed', 405);
    }
} catch (Exception $e) {
    error_log('[stripe-fallback] Error: ' . $e->getMessage());
    Response::error($e->getMessage(), 500);
}

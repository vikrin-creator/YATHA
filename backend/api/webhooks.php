<?php

/**
 * Stripe Webhook Handler for Subscription Management
 * 
 * This endpoint handles Stripe webhook events for:
 * - invoice.payment_succeeded: Create monthly orders from active subscriptions
 * - customer.subscription.created: Store subscription in database after checkout
 * - customer.subscription.updated: Update subscription status
 * - customer.subscription.deleted: Mark subscription as canceled
 */

// Don't require authentication for webhooks (Stripe will verify signature)
header('Content-Type: application/json');

error_reporting(E_ALL);
ini_set('display_errors', '0');

require_once __DIR__ . '/../src/config/Database.php';
require_once __DIR__ . '/../src/utils/Response.php';
require_once __DIR__ . '/../src/services/SubscriptionFulfillment.php';

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

// Load Stripe config
$stripeCfg = include __DIR__ . '/../src/config/stripe.php';
$stripeSecret = $stripeCfg['secret_key'] ?? '';
$webhookSecret = getenv('STRIPE_WEBHOOK_SECRET') ?: $_ENV['STRIPE_WEBHOOK_SECRET'] ?? null;

// Get the raw request body
$rawInput = file_get_contents('php://input');
$stripeSignature = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';

if (!$webhookSecret) {
    error_log('[webhooks] ERROR: STRIPE_WEBHOOK_SECRET not configured');
    http_response_code(500);
    echo json_encode(['error' => 'Webhook secret not configured']);
    exit;
}

if (!$stripeSignature) {
    error_log('[webhooks] ERROR: No Stripe signature provided');
    http_response_code(400);
    echo json_encode(['error' => 'No Stripe signature']);
    exit;
}

// Verify webhook signature
function verifyWebhookSignature($payload, $signature, $secret) {
    $timestampAndSignatures = explode(',', $signature);
    
    foreach ($timestampAndSignatures as $item) {
        if (strpos($item, 't=') === 0) {
            $timestamp = substr($item, 2);
        } elseif (strpos($item, 'v1=') === 0) {
            $signatureToVerify = substr($item, 3);
        }
    }
    
    if (!isset($timestamp) || !isset($signatureToVerify)) {
        return false;
    }
    
    // Prevent timestamp too old (more than 5 minutes)
    if (time() - intval($timestamp) > 300) {
        error_log('[webhooks] Signature timestamp too old');
        return false;
    }
    
    $signedContent = $timestamp . '.' . $payload;
    $expectedSignature = hash_hmac('sha256', $signedContent, $secret);
    
    // Use timing-safe comparison
    return hash_equals($expectedSignature, $signatureToVerify);
}

try {
    // Verify signature
    if (!verifyWebhookSignature($rawInput, $stripeSignature, $webhookSecret)) {
        error_log('[webhooks] ERROR: Invalid webhook signature');
        http_response_code(403);
        echo json_encode(['error' => 'Invalid signature']);
        exit;
    }
    
    $event = json_decode($rawInput, true);
    error_log('[webhooks] Received event: ' . $event['type'] . ' (ID: ' . $event['id'] . ')');
    
    $database = new Database();
    $db = $database->connect();
    
    if (!$db) {
        error_log('[webhooks] Database connection failed');
        http_response_code(500);
        echo json_encode(['error' => 'Database error']);
        exit;
    }
    
    $eventType = $event['type'] ?? null;
    $eventData = $event['data']['object'] ?? [];
    
    switch ($eventType) {
        case 'invoice.payment_succeeded':
            handlePaymentSucceeded($db, $eventData);
            break;
            
        case 'customer.subscription.created':
            handleSubscriptionCreated($db, $eventData);
            break;
            
        case 'customer.subscription.updated':
            handleSubscriptionUpdated($db, $eventData);
            break;
            
        case 'customer.subscription.deleted':
            handleSubscriptionDeleted($db, $eventData);
            break;
            
        default:
            error_log('[webhooks] Unhandled event type: ' . $eventType);
    }
    
    http_response_code(200);
    echo json_encode(['received' => true]);
    exit;
    
} catch (Exception $e) {
    error_log('[webhooks] Exception: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
    exit;
}

/**
 * Handle invoice.payment_succeeded event
 * Creates monthly order from active subscription
 */
function handlePaymentSucceeded($db, $invoiceData) {
    error_log('[webhooks] Processing invoice.payment_succeeded');
    
    $stripeSubscriptionId = $invoiceData['subscription'] ?? null;
    
    if (!$stripeSubscriptionId) {
        error_log('[webhooks] No subscription ID in invoice');
        file_put_contents(__DIR__ . '/webhook_debug.log', date('Y-m-d H:i:s') . ' - No subscription ID in invoice\n', FILE_APPEND);
        return;
    }
    
    error_log('[webhooks] Looking for subscription: ' . $stripeSubscriptionId);
    file_put_contents(__DIR__ . '/webhook_debug.log', date('Y-m-d H:i:s') . ' - Looking for subscription: ' . $stripeSubscriptionId . "\n", FILE_APPEND);
    
    // Get subscription details from local database
    // First try with status = 'active', then try without status filter
    $stmt = $db->prepare("
        SELECT id, user_id, product_id, shipment_quantity, stripe_customer_id, status
        FROM subscriptions 
        WHERE stripe_subscription_id = ?
    ");
    
    if (!$stmt) {
        $errMsg = 'Database prepare error: ' . $db->error;
        error_log('[webhooks] ' . $errMsg);
        file_put_contents(__DIR__ . '/webhook_debug.log', date('Y-m-d H:i:s') . ' - ' . $errMsg . "\n", FILE_APPEND);
        return;
    }
    
    $stmt->bind_param('s', $stripeSubscriptionId);
    
    if (!$stmt->execute()) {
        $errMsg = 'Query execution failed: ' . $stmt->error;
        error_log('[webhooks] ' . $errMsg);
        file_put_contents(__DIR__ . '/webhook_debug.log', date('Y-m-d H:i:s') . ' - ' . $errMsg . "\n", FILE_APPEND);
        return;
    }
    
    $result = $stmt->get_result();
    $subscription = $result->fetch_assoc();
    $stmt->close();
    
    if (!$subscription) {
        $errMsg = 'Subscription not found: ' . $stripeSubscriptionId;
        error_log('[webhooks] ' . $errMsg);
        file_put_contents(__DIR__ . '/webhook_debug.log', date('Y-m-d H:i:s') . ' - ' . $errMsg . "\n", FILE_APPEND);
        return;
    }
    
    error_log('[webhooks] Found subscription: id=' . $subscription['id'] . ', user_id=' . $subscription['user_id'] . ', status=' . $subscription['status']);
    file_put_contents(__DIR__ . '/webhook_debug.log', date('Y-m-d H:i:s') . ' - Found subscription: id=' . $subscription['id'] . ', user_id=' . $subscription['user_id'] . ', status=' . $subscription['status'] . "\n", FILE_APPEND);
    
    // Get product details
    $productStmt = $db->prepare("SELECT name, price FROM products WHERE id = ?");
    $productStmt->bind_param('i', $subscription['product_id']);
    $productStmt->execute();
    $productResult = $productStmt->get_result();
    $product = $productResult->fetch_assoc();
    $productStmt->close();
    
    if (!$product) {
        error_log('[webhooks] Product not found: ' . $subscription['product_id']);
        return;
    }
    
    // Create monthly order - insert directly
    try {
        $invoiceId = $invoiceData['id'] ?? null;
        $totalAmount = (float)$product['price'] * (int)($subscription['shipment_quantity'] ?? 1);
        $status = 'pending';
        
        $orderStmt = $db->prepare("
            INSERT INTO orders 
            (user_id, total_amount, status, shipping_address, stripe_invoice_id, created_at)
            VALUES (?, ?, ?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE
            updated_at = NOW()
        ");
        
        if (!$orderStmt) {
            throw new Exception('Failed to prepare orders insert: ' . $db->error);
        }
        
        $emptyAddress = '';
        $orderStmt->bind_param('idsss', $subscription['user_id'], $totalAmount, $status, $emptyAddress, $invoiceId);
        
        if (!$orderStmt->execute()) {
            throw new Exception('Failed to execute orders insert: ' . $orderStmt->error);
        }
        
        $orderId = $orderStmt->insert_id;
        $orderStmt->close();
        
        error_log('[webhooks] Order created: order_id=' . $orderId . ', amount=' . $totalAmount . ', invoice=' . $invoiceId);
    } catch (Exception $e) {
        error_log('[webhooks] Error creating order: ' . $e->getMessage());
    }
}

/**
 * Handle customer.subscription.created event
 * Store subscription in database after successful checkout
 */
function handleSubscriptionCreated($db, $subscriptionData) {
    error_log('[webhooks] Processing customer.subscription.created');
    
    $stripeSubscriptionId = $subscriptionData['id'] ?? null;
    $stripeCustomerId = $subscriptionData['customer'] ?? null;
    $metadata = $subscriptionData['metadata'] ?? [];
    
    if (!$stripeSubscriptionId || !$stripeCustomerId) {
        error_log('[webhooks] Missing subscription or customer ID');
        return;
    }
    
    $userId = intval($metadata['user_id'] ?? 0);
    $productId = intval($metadata['product_id'] ?? 0);
    $shipmentQuantity = intval($metadata['shipment_quantity'] ?? 1);
    
    if (!$userId) {
        error_log('[webhooks] No user_id in subscription metadata');
        return;
    }
    
    // Check if subscription already exists
    $checkStmt = $db->prepare("SELECT id FROM subscriptions WHERE stripe_subscription_id = ?");
    $checkStmt->bind_param('s', $stripeSubscriptionId);
    $checkStmt->execute();
    
    if ($checkStmt->get_result()->fetch_assoc()) {
        error_log('[webhooks] Subscription already exists in database');
        $checkStmt->close();
        return;
    }
    $checkStmt->close();
    
    // Extract billing dates from subscription
    $currentPeriodStart = date('Y-m-d H:i:s', $subscriptionData['current_period_start'] ?? time());
    $currentPeriodEnd = date('Y-m-d H:i:s', $subscriptionData['current_period_end'] ?? (time() + 2592000)); // +30 days
    $nextBillingDate = date('Y-m-d', $subscriptionData['current_period_end'] ?? (time() + 2592000));
    
    // Try to insert with all columns (including billing dates)
    $insertStmt = $db->prepare("
        INSERT INTO subscriptions 
        (user_id, stripe_subscription_id, stripe_customer_id, product_id, status, shipment_quantity, current_period_start, current_period_end, next_billing_date)
        VALUES (?, ?, ?, ?, 'active', ?, ?, ?, ?)
    ");
    
    // If that fails, try without billing date columns (in case they don't exist in old databases)
    if (!$insertStmt) {
        error_log('[webhooks] First insert attempt failed, trying without billing dates: ' . $db->error);
        
        $insertStmt = $db->prepare("
            INSERT INTO subscriptions 
            (user_id, stripe_subscription_id, stripe_customer_id, product_id, status, shipment_quantity)
            VALUES (?, ?, ?, ?, 'active', ?)
        ");
        
        if (!$insertStmt) {
            error_log('[webhooks] Database prepare error (second attempt): ' . $db->error);
            http_response_code(500);
            echo json_encode(['error' => 'Failed to prepare subscription insert']);
            return;
        }
        
        $insertStmt->bind_param(
            'issii',
            $userId,
            $stripeSubscriptionId,
            $stripeCustomerId,
            $productId,
            $shipmentQuantity
        );
    } else {
        // First attempt succeeded, use all columns
        $status = 'active';
        $insertStmt->bind_param(
            'issiisss',
            $userId,
            $stripeSubscriptionId,
            $stripeCustomerId,
            $productId,
            $shipmentQuantity,
            $currentPeriodStart,
            $currentPeriodEnd,
            $nextBillingDate
        );
    }
    
    if (!$insertStmt->execute()) {
        $errorMsg = '[webhooks] Failed to insert subscription: ' . $insertStmt->error;
        error_log($errorMsg);
        file_put_contents(__DIR__ . '/webhook_debug.log', date('Y-m-d H:i:s') . ' - ' . $errorMsg . "\n", FILE_APPEND);
        http_response_code(500);
        echo json_encode(['error' => 'Failed to insert subscription: ' . $insertStmt->error]);
        return;
    }
    
    $subscriptionDbId = $insertStmt->insert_id;
    $insertStmt->close();
    
    error_log('[webhooks] Subscription created in database with ID: ' . $subscriptionDbId);
}

/**
 * Handle customer.subscription.updated event
 * Update subscription status and billing dates
 */
function handleSubscriptionUpdated($db, $subscriptionData) {
    error_log('[webhooks] Processing customer.subscription.updated');
    
    $stripeSubscriptionId = $subscriptionData['id'] ?? null;
    $status = $subscriptionData['status'] ?? null;
    
    if (!$stripeSubscriptionId || !$status) {
        error_log('[webhooks] Missing subscription ID or status');
        return;
    }
    
    // Map Stripe status to our status enum
    $statusMap = [
        'active' => 'active',
        'past_due' => 'past_due',
        'paused' => 'paused',
        'canceled' => 'cancelled',
        'trialing' => 'active'
    ];
    
    $dbStatus = $statusMap[$status] ?? 'active';
    
    // Update subscription in database
    $currentPeriodStart = date('Y-m-d H:i:s', $subscriptionData['current_period_start'] ?? time());
    $currentPeriodEnd = date('Y-m-d H:i:s', $subscriptionData['current_period_end'] ?? (time() + 2592000));
    $nextBillingDate = date('Y-m-d', $subscriptionData['current_period_end'] ?? (time() + 2592000));
    
    $updateStmt = $db->prepare("
        UPDATE subscriptions 
        SET status = ?, current_period_start = ?, current_period_end = ?, next_billing_date = ?
        WHERE stripe_subscription_id = ?
    ");
    
    if (!$updateStmt) {
        error_log('[webhooks] Database prepare error: ' . $db->error);
        return;
    }
    
    $updateStmt->bind_param('sssss', $dbStatus, $currentPeriodStart, $currentPeriodEnd, $nextBillingDate, $stripeSubscriptionId);
    
    if (!$updateStmt->execute()) {
        error_log('[webhooks] Failed to update subscription: ' . $updateStmt->error);
        return;
    }
    
    $updateStmt->close();
    error_log('[webhooks] Subscription updated with status: ' . $dbStatus);
}

/**
 * Handle customer.subscription.deleted event
 * Mark subscription as cancelled
 */
function handleSubscriptionDeleted($db, $subscriptionData) {
    error_log('[webhooks] Processing customer.subscription.deleted');
    
    $stripeSubscriptionId = $subscriptionData['id'] ?? null;
    
    if (!$stripeSubscriptionId) {
        error_log('[webhooks] Missing subscription ID');
        return;
    }
    
    $deleteStmt = $db->prepare("
        UPDATE subscriptions 
        SET status = 'cancelled'
        WHERE stripe_subscription_id = ?
    ");
    
    if (!$deleteStmt) {
        error_log('[webhooks] Database prepare error: ' . $db->error);
        return;
    }
    
    $deleteStmt->bind_param('s', $stripeSubscriptionId);
    
    if (!$deleteStmt->execute()) {
        error_log('[webhooks] Failed to update subscription: ' . $deleteStmt->error);
        return;
    }
    
    $deleteStmt->close();
    error_log('[webhooks] Subscription marked as cancelled');
}

?>

<?php

header('Content-Type: application/json');

error_reporting(E_ALL);
ini_set('display_errors', '0');

require_once __DIR__ . '/../../src/utils/Response.php';
require_once __DIR__ . '/../../src/config/Database.php';

// Log all webhook activity for debugging
$logFile = __DIR__ . '/../../stripe-webhook.log';

function logWebhook($message, $data = null) {
    global $logFile;
    $timestamp = date('Y-m-d H:i:s');
    $message = "[{$timestamp}] {$message}";
    if ($data) {
        $message .= " | " . json_encode($data);
    }
    error_log($message, 3, $logFile);
    error_log($message);
}

logWebhook('==== WEBHOOK REQUEST RECEIVED ====');

$stripeCfg = include __DIR__ . '/../../src/config/stripe.php';
$webhookSecret = $stripeCfg['webhook_secret'] ?? getenv('STRIPE_WEBHOOK_SECRET');

logWebhook('Webhook secret configured', ['has_secret' => !empty($webhookSecret), 'secret_length' => strlen($webhookSecret ?? '')]);

// Read raw payload
$payload = @file_get_contents('php://input');
$sig_header = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';

logWebhook('Raw payload received', ['payload_length' => strlen($payload), 'sig_header_present' => !empty($sig_header)]);

// Simple helper to respond
function respond($code = 200, $msg = 'ok') {
    global $logFile;
    logWebhook('RESPONSE', ['code' => $code, 'msg' => $msg]);
    http_response_code($code);
    echo json_encode(['message' => $msg]);
    exit;
}

// If webhook secret provided, verify signature per Stripe docs
if ($webhookSecret) {
    logWebhook('Verifying webhook signature');
    
    // parse header for t= and v1=
    $elements = explode(',', $sig_header);
    $timestamp = null;
    $v1 = null;
    foreach ($elements as $el) {
        if (strpos($el, 't=') === 0) $timestamp = substr($el, 2);
        if (strpos($el, 'v1=') === 0) $v1 = substr($el, 3);
    }

    if (!$timestamp || !$v1) {
        logWebhook('Signature verification failed - missing timestamp or v1');
        respond(400, 'Invalid Stripe signature header');
    }

    $signed_payload = $timestamp . '.' . $payload;
    $expected_sig = hash_hmac('sha256', $signed_payload, $webhookSecret);

    logWebhook('Signature check', ['expected_sig' => substr($expected_sig, 0, 20) . '...', 'provided_sig' => substr($v1, 0, 20) . '...', 'match' => hash_equals($expected_sig, $v1)]);

    if (!hash_equals($expected_sig, $v1)) {
        logWebhook('Signature verification failed - signature mismatch');
        respond(400, 'Invalid signature');
    }
    
    logWebhook('Signature verification passed');
} else {
    logWebhook('WARNING: No webhook secret configured, skipping signature verification');
}

$event = json_decode($payload, true);
if (!$event) {
    logWebhook('Failed to parse JSON payload');
    respond(400, 'Invalid payload');
}

logWebhook('Event parsed successfully', ['event_type' => $event['type'] ?? 'unknown']);

// Connect DB
$database = new Database();
$db = $database->connect();
if (!$db) {
    logWebhook('Database connection failed');
    respond(500, 'DB connection failed');
}

logWebhook('Database connected');

// Helper to create order from checkout session (one-time purchase)
function createOrderFromCheckoutSession($db, $session) {
    global $logFile;
    
    logWebhook('createOrderFromCheckoutSession called');
    
    $sessionId = $session['id'] ?? null;
    $amountTotal = isset($session['amount_total']) ? intval($session['amount_total']) / 100 : 0;
    $customerId = $session['customer'] ?? null;
    $metadata = $session['metadata'] ?? [];
    $userId = isset($metadata['user_id']) ? intval($metadata['user_id']) : null;
    $addressId = isset($metadata['address_id']) ? intval($metadata['address_id']) : null;

    logWebhook('Session details', ['sessionId' => $sessionId, 'userId' => $userId, 'addressId' => $addressId, 'amount' => $amountTotal]);

    if (!$sessionId || !$userId) {
        logWebhook('FAILED: Missing sessionId or userId');
        return false;
    }

    // Check idempotency: if order with this session exists
    $check = $db->prepare("SELECT id FROM orders WHERE stripe_session_id = ?");
    $check->bind_param('s', $sessionId);
    $check->execute();
    $res = $check->get_result();
    if ($res->num_rows > 0) {
        logWebhook('Order already exists for this session (idempotent)');
        return true; // already processed
    }

    // Fetch shipping address from addresses table if address_id is available
    $shippingAddress = null;
    if ($addressId) {
        $addrStmt = $db->prepare("SELECT address_line_1, address_line_2, city, state, pincode, country FROM addresses WHERE id = ? LIMIT 1");
        $addrStmt->bind_param('i', $addressId);
        $addrStmt->execute();
        $addrRes = $addrStmt->get_result();
        if ($addrRes && $addrRes->num_rows > 0) {
            $addrRow = $addrRes->fetch_assoc();
            $shippingAddress = json_encode([
                'address_line_1' => $addrRow['address_line_1'] ?? '',
                'address_line_2' => $addrRow['address_line_2'] ?? '',
                'city' => $addrRow['city'] ?? '',
                'state' => $addrRow['state'] ?? '',
                'pincode' => $addrRow['pincode'] ?? '',
                'country' => $addrRow['country'] ?? ''
            ]);
            logWebhook('Shipping address fetched from addresses table', ['addressId' => $addressId]);
        }
    }

    // Insert order with paid status
    $stmt = $db->prepare("INSERT INTO orders (user_id, total_amount, status, stripe_session_id, address_id, shipping_address, created_at) 
                         VALUES (?, ?, 'paid', ?, ?, ?, NOW())");
    if (!$stmt) {
        logWebhook('FAILED: Database prepare error', ['error' => $db->error]);
        return false;
    }
    
    $stmt->bind_param('idsis', $userId, $amountTotal, $sessionId, $addressId, $shippingAddress);
    
    if ($stmt->execute()) {
        $orderId = $db->insert_id;
        logWebhook('Order created successfully', ['orderId' => $orderId, 'userId' => $userId, 'amount' => $amountTotal, 'shippingAddress' => !is_null($shippingAddress) ? 'YES' : 'NO']);
        return true;
    } else {
        logWebhook('FAILED: Order insert error', ['error' => $stmt->error]);
        return false;
    }
}

// Helper to create order from invoice (subscription charge)
function createOrderFromInvoice($db, $invoice) {
    // invoice: array from Stripe invoice object
    $invoiceId = $invoice['id'] ?? null;
    $amountPaid = isset($invoice['amount_paid']) ? intval($invoice['amount_paid']) / 100 : 0;
    $subscriptionId = $invoice['subscription'] ?? null;

    if (!$invoiceId || !$subscriptionId) return false;

    // Check idempotency: if order with this invoice exists (we'll store stripe_invoice_id in orders table)
    $check = $db->prepare("SELECT id FROM orders WHERE stripe_invoice_id = ?");
    $check->bind_param('s', $invoiceId);
    $check->execute();
    $res = $check->get_result();
    if ($res->num_rows > 0) {
        return true; // already processed
    }

    // Get subscription metadata from Stripe to find user_id and address_id
    global $stripeCfg;
    $stripeSecret = $stripeCfg['secret_key'] ?? '';
    if (!$stripeSecret) return false;

    $url = 'https://api.stripe.com/v1/subscriptions/' . $subscriptionId;
    $auth = base64_encode($stripeSecret . ':');
    
    $contextOptions = [
        'http' => [
            'method' => 'GET',
            'header' => [
                'Authorization: Basic ' . $auth,
                'User-Agent: Yatha/1.0'
            ],
            'timeout' => 30
        ],
        'ssl' => [
            'verify_peer' => true,
            'verify_peer_name' => true
        ]
    ];
    
    $context = stream_context_create($contextOptions);
    
    try {
        $resp = file_get_contents($url, false, $context);
        if (isset($http_response_header)) {
            preg_match('/HTTP\/\d+\.\d+ (\d+)/', $http_response_header[0], $matches);
            $status = intval($matches[1] ?? 200);
        } else {
            $status = 200;
        }
    } catch (Exception $e) {
        return false;
    }
    
    if ($status >= 400) return false;

    $sub = json_decode($resp, true);
    $metadata = $sub['metadata'] ?? [];
    $userId = isset($metadata['user_id']) ? intval($metadata['user_id']) : null;
    $addressId = isset($metadata['address_id']) ? intval($metadata['address_id']) : null;

    if (!$userId) return false;

    // Insert order
    $stmt = $db->prepare("INSERT INTO orders (user_id, total_amount, status, stripe_invoice_id, created_at) VALUES (?, ?, 'paid', ?, NOW())");
    $stmt->bind_param('ids', $userId, $amountPaid, $invoiceId);
    if ($stmt->execute()) {
        return true;
    }
    return false;
}

// Helper to create or update subscription record
function updateSubscriptionRecord($db, $subscription) {
    $subId = $subscription['id'] ?? null;
    $customerId = $subscription['customer'] ?? null;
    $status = $subscription['status'] ?? 'active';
    $metadata = $subscription['metadata'] ?? [];
    $userId = isset($metadata['user_id']) ? intval($metadata['user_id']) : null;
    
    if (!$subId || !$userId) return false;
    
    $currentPeriodStart = isset($subscription['current_period_start']) ? 
        date('Y-m-d H:i:s', $subscription['current_period_start']) : null;
    $currentPeriodEnd = isset($subscription['current_period_end']) ? 
        date('Y-m-d H:i:s', $subscription['current_period_end']) : null;
    $nextBillingDate = isset($subscription['current_period_end']) ? 
        date('Y-m-d', $subscription['current_period_end']) : null;
    
    // Check if subscription record exists
    $check = $db->prepare("SELECT id FROM subscriptions WHERE stripe_subscription_id = ?");
    $check->bind_param('s', $subId);
    $check->execute();
    $res = $check->get_result();
    
    if ($res->num_rows > 0) {
        // Update existing subscription
        $stmt = $db->prepare("UPDATE subscriptions 
                            SET status = ?, current_period_start = ?, current_period_end = ?, 
                                next_billing_date = ?, updated_at = NOW() 
                            WHERE stripe_subscription_id = ?");
        $stmt->bind_param('sssss', $status, $currentPeriodStart, $currentPeriodEnd, $nextBillingDate, $subId);
    } else {
        // Create new subscription record
        $stmt = $db->prepare("INSERT INTO subscriptions 
                            (user_id, stripe_subscription_id, stripe_customer_id, status, 
                             current_period_start, current_period_end, next_billing_date, created_at, updated_at) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())");
        $stmt->bind_param('issssss', $userId, $subId, $customerId, $status, 
                         $currentPeriodStart, $currentPeriodEnd, $nextBillingDate);
    }
    
    return $stmt->execute();
}

// Helper to handle failed payments
function handlePaymentFailed($db, $invoice) {
    $invoiceId = $invoice['id'] ?? null;
    $userId = null;
    $subscriptionId = $invoice['subscription'] ?? null;
    
    if ($subscriptionId) {
        // Get user_id from subscription metadata
        $check = $db->prepare("SELECT user_id FROM subscriptions WHERE stripe_subscription_id = ?");
        $check->bind_param('s', $subscriptionId);
        $check->execute();
        $result = $check->get_result();
        $row = $result->fetch_assoc();
        $userId = $row['user_id'] ?? null;
    }
    
    // Log failed payment (can be used for notifications)
    if ($userId && $invoiceId) {
        error_log("[webhook] Payment failed for user $userId, invoice: $invoiceId");
        // TODO: Send email notification to user
    }
    
    return true;
}

// Helper to handle refunds
function handleRefund($db, $charge) {
    $chargeId = $charge['id'] ?? null;
    $refundAmount = isset($charge['amount_refunded']) ? intval($charge['amount_refunded']) / 100 : 0;
    
    if ($chargeId && $refundAmount > 0) {
        error_log("[webhook] Refund processed: charge=$chargeId, amount=$refundAmount");
        // TODO: Create refund record in database
    }
    
    return true;
}

// Handle event types
$type = $event['type'] ?? '';

logWebhook('Processing event type: ' . $type);

switch ($type) {
    case 'checkout.session.completed':
        // One-time purchase completed
        logWebhook('Event: checkout.session.completed');
        $session = $event['data']['object'];
        $paymentStatus = $session['payment_status'] ?? null;
        
        logWebhook('Session payment status', ['status' => $paymentStatus]);
        
        if ($paymentStatus === 'paid') {
            $ok = createOrderFromCheckoutSession($db, $session);
            if ($ok) {
                logWebhook('checkout.session.completed - order created successfully');
                respond(200, 'checkout.session.completed - order created');
            }
        }
        logWebhook('checkout.session.completed handled');
        respond(200, 'checkout.session.completed handled');
        break;
        
    case 'invoice.payment_succeeded':
        // Subscription payment succeeded (recurring)
        $invoice = $event['data']['object'];
        $ok = createOrderFromInvoice($db, $invoice);
        if ($ok) respond(200, 'invoice.payment_succeeded - order created');
        respond(200, 'invoice.payment_succeeded handled');
        break;
        
    case 'invoice.payment_failed':
        // Subscription payment failed
        $invoice = $event['data']['object'];
        handlePaymentFailed($db, $invoice);
        respond(200, 'invoice.payment_failed handled');
        break;
        
    case 'customer.subscription.created':
        // New subscription created
        $subscription = $event['data']['object'];
        updateSubscriptionRecord($db, $subscription);
        respond(200, 'customer.subscription.created - subscription tracked');
        break;
        
    case 'customer.subscription.updated':
        // Subscription details changed (pause, resume, etc)
        $subscription = $event['data']['object'];
        updateSubscriptionRecord($db, $subscription);
        respond(200, 'customer.subscription.updated - subscription updated');
        break;
        
    case 'customer.subscription.deleted':
        // Subscription cancelled
        $subscription = $event['data']['object'];
        $subId = $subscription['id'] ?? null;
        if ($subId) {
            $stmt = $db->prepare("UPDATE subscriptions SET status = 'cancelled', updated_at = NOW() 
                                 WHERE stripe_subscription_id = ?");
            $stmt->bind_param('s', $subId);
            $stmt->execute();
        }
        respond(200, 'customer.subscription.deleted - subscription cancelled');
        break;
        
    case 'customer.subscription.paused':
        // Subscription paused
        $subscription = $event['data']['object'];
        $subId = $subscription['id'] ?? null;
        if ($subId) {
            $stmt = $db->prepare("UPDATE subscriptions SET status = 'paused', updated_at = NOW() 
                                 WHERE stripe_subscription_id = ?");
            $stmt->bind_param('s', $subId);
            $stmt->execute();
        }
        respond(200, 'customer.subscription.paused - subscription paused');
        break;
        
    case 'charge.refunded':
        // Payment refunded
        $charge = $event['data']['object'];
        handleRefund($db, $charge);
        respond(200, 'charge.refunded handled');
        break;
        
    case 'charge.refund.updated':
        // Refund details updated
        respond(200, 'charge.refund.updated handled');
        break;
        
    default:
        respond(200, 'event ignored');
}

?>
<?php
/**
 * Test invoice.payment_succeeded webhook locally
 */

require_once __DIR__ . '/../src/config/Database.php';

$database = new Database();
$db = $database->connect();

if (!$db) {
    die('Database connection failed');
}

// Get a real subscription from database
$stmt = $db->prepare("SELECT * FROM subscriptions LIMIT 1");
$stmt->execute();
$result = $stmt->get_result();
$subscription = $result->fetch_assoc();
$stmt->close();

if (!$subscription) {
    die('No subscriptions found in database');
}

echo "=== Testing invoice.payment_succeeded webhook ===\n\n";
echo "Subscription found:\n";
echo "  ID: " . $subscription['id'] . "\n";
echo "  User: " . $subscription['user_id'] . "\n";
echo "  Product: " . $subscription['product_id'] . "\n";
echo "  Stripe Sub ID: " . $subscription['stripe_subscription_id'] . "\n\n";

// Simulate the invoice data that Stripe sends
$invoiceData = [
    'id' => 'in_test_' . time(),
    'subscription' => $subscription['stripe_subscription_id'],  // This is the key - subscription ID string
    'customer' => $subscription['stripe_customer_id'],
    'paid' => true,
    'status' => 'paid'
];

echo "Invoice data being sent:\n";
echo json_encode($invoiceData, JSON_PRETTY_PRINT) . "\n\n";

// Now simulate the webhook handler
echo "--- Running handlePaymentSucceeded logic ---\n\n";

$stripeSubscriptionId = $invoiceData['subscription'] ?? null;

if (!$stripeSubscriptionId) {
    die('ERROR: No subscription ID in invoice');
}

echo "Step 1: Looking for subscription with ID: " . $stripeSubscriptionId . "\n";

// Get subscription from database
$stmt = $db->prepare("
    SELECT id, user_id, product_id, shipment_quantity, stripe_customer_id, status
    FROM subscriptions 
    WHERE stripe_subscription_id = ?
");

if (!$stmt) {
    die('Database prepare error: ' . $db->error);
}

$stmt->bind_param('s', $stripeSubscriptionId);

if (!$stmt->execute()) {
    die('Query execution failed: ' . $stmt->error);
}

$result = $stmt->get_result();
$foundSubscription = $result->fetch_assoc();
$stmt->close();

if (!$foundSubscription) {
    die('ERROR: Subscription not found with stripe_subscription_id: ' . $stripeSubscriptionId);
}

echo "✅ Found subscription in database\n";
echo "   Subscription ID: " . $foundSubscription['id'] . "\n";
echo "   User ID: " . $foundSubscription['user_id'] . "\n";
echo "   Product ID: " . $foundSubscription['product_id'] . "\n\n";

echo "Step 2: Looking for product ID: " . $foundSubscription['product_id'] . "\n";

// Get product details
$productStmt = $db->prepare("SELECT name, price FROM products WHERE id = ?");
if (!$productStmt) {
    die('Product prepare failed: ' . $db->error);
}

$productStmt->bind_param('i', $foundSubscription['product_id']);

if (!$productStmt->execute()) {
    die('Product execute failed: ' . $productStmt->error);
}

$productResult = $productStmt->get_result();
$product = $productResult->fetch_assoc();
$productStmt->close();

if (!$product) {
    die('ERROR: Product not found for ID: ' . $foundSubscription['product_id']);
}

echo "✅ Found product\n";
echo "   Name: " . $product['name'] . "\n";
echo "   Price: $" . $product['price'] . "\n\n";

echo "Step 3: Creating order...\n";

// Create the order
try {
    $invoiceId = $invoiceData['id'] ?? null;
    $totalAmount = (float)$product['price'] * (int)($foundSubscription['shipment_quantity'] ?? 1);
    $status = 'pending';
    $emptyAddress = '';
    $userId = (int)$foundSubscription['user_id'];
    
    echo "   User ID: " . $userId . " (type: " . gettype($userId) . ")\n";
    echo "   Total Amount: $" . $totalAmount . " (type: " . gettype($totalAmount) . ")\n";
    echo "   Status: " . $status . " (type: " . gettype($status) . ")\n";
    echo "   Address: (empty)\n";
    echo "   Invoice ID: " . $invoiceId . " (type: " . gettype($invoiceId) . ")\n\n";
    
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
    
    echo "   Binding parameters with types: idsss\n";
    $orderStmt->bind_param('idsss', $userId, $totalAmount, $status, $emptyAddress, $invoiceId);
    
    if (!$orderStmt->execute()) {
        throw new Exception('Failed to execute orders insert: ' . $orderStmt->error);
    }
    
    $orderId = $orderStmt->insert_id;
    $orderStmt->close();
    
    echo "\n✅ SUCCESS! Order created\n";
    echo "   Order ID: " . $orderId . "\n";
    echo "   Amount: $" . $totalAmount . "\n";
    echo "   Invoice: " . $invoiceId . "\n\n";
    
    // Verify it was created
    $verifyStmt = $db->prepare("SELECT * FROM orders WHERE id = ?");
    $verifyStmt->bind_param('i', $orderId);
    $verifyStmt->execute();
    $verifyResult = $verifyStmt->get_result();
    $newOrder = $verifyResult->fetch_assoc();
    $verifyStmt->close();
    
    echo "Order verified in database:\n";
    echo json_encode($newOrder, JSON_PRETTY_PRINT) . "\n";
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

$db->close();

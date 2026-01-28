<?php
/**
 * Test webhook order creation directly
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

echo "Found subscription: ID=" . $subscription['id'] . ", User=" . $subscription['user_id'] . ", Product=" . $subscription['product_id'] . "\n";

// Simulate webhook invoice data
$invoiceData = [
    'id' => 'in_test_' . time(),
    'subscription' => $subscription['stripe_subscription_id'],
    'customer' => $subscription['stripe_customer_id']
];

echo "Simulating webhook with data:\n";
echo json_encode($invoiceData, JSON_PRETTY_PRINT) . "\n\n";

// Get product details
$productStmt = $db->prepare("SELECT name, price FROM products WHERE id = ?");
$productStmt->bind_param('i', $subscription['product_id']);
$productStmt->execute();
$productResult = $productStmt->get_result();
$product = $productResult->fetch_assoc();
$productStmt->close();

if (!$product) {
    die('Product not found');
}

echo "Found product: " . $product['name'] . " - $" . $product['price'] . "\n";

// Now try to create order
$totalAmount = (float)$product['price'] * (int)($subscription['shipment_quantity'] ?? 1);
$status = 'pending';
$emptyAddress = '';
$invoiceId = $invoiceData['id'];
$userId = (int)$subscription['user_id'];

echo "\nAttempting order creation...\n";
echo "User ID: " . $userId . "\n";
echo "Total Amount: " . $totalAmount . "\n";
echo "Status: " . $status . "\n";
echo "Invoice ID: " . $invoiceId . "\n";

$orderStmt = $db->prepare("
    INSERT INTO orders 
    (user_id, total_amount, status, shipping_address, stripe_invoice_id, created_at)
    VALUES (?, ?, ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE
    updated_at = NOW()
");

if (!$orderStmt) {
    die('Prepare failed: ' . $db->error);
}

$orderStmt->bind_param('idsss', $userId, $totalAmount, $status, $emptyAddress, $invoiceId);

echo "\nExecuting insert...\n";
if (!$orderStmt->execute()) {
    die('Execute failed: ' . $orderStmt->error);
}

$orderId = $orderStmt->insert_id;
$orderStmt->close();

if ($orderId) {
    echo "✅ SUCCESS! Order ID: " . $orderId . "\n";
    
    // Verify it was created
    $verifyStmt = $db->prepare("SELECT * FROM orders WHERE id = ?");
    $verifyStmt->bind_param('i', $orderId);
    $verifyStmt->execute();
    $verifyResult = $verifyStmt->get_result();
    $newOrder = $verifyResult->fetch_assoc();
    $verifyStmt->close();
    
    echo "\nOrder details:\n";
    echo json_encode($newOrder, JSON_PRETTY_PRINT) . "\n";
} else {
    echo "❌ No insert ID returned\n";
}

$db->close();

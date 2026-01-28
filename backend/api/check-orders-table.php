<?php
/**
 * Check orders table structure
 */

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

require_once __DIR__ . '/../src/config/Database.php';

$database = new Database();
$db = $database->connect();

echo "=== ORDERS TABLE STRUCTURE ===\n";
$result = $db->query("DESCRIBE orders");
while ($row = $result->fetch_assoc()) {
    echo $row['Field'] . " | " . $row['Type'] . " | " . $row['Null'] . " | " . $row['Key'] . "\n";
}

echo "\n=== TRYING TO INSERT A TEST ORDER ===\n";
$testStmt = $db->prepare("
    INSERT INTO orders 
    (user_id, total_amount, status, shipping_address, stripe_invoice_id, created_at)
    VALUES (?, ?, ?, ?, ?, NOW())
");

if (!$testStmt) {
    echo "ERROR preparing statement: " . $db->error . "\n";
} else {
    $userId = 5;
    $amount = 99.99;
    $status = 'pending';
    $address = '{"test":"address"}';
    $invoiceId = 'test_invoice_' . time();
    
    $testStmt->bind_param('idsss', $userId, $amount, $status, $address, $invoiceId);
    
    if (!$testStmt->execute()) {
        echo "ERROR executing insert: " . $testStmt->error . "\n";
    } else {
        echo "✅ TEST INSERT SUCCESSFUL - Order ID: " . $testStmt->insert_id . "\n";
    }
    $testStmt->close();
}
?>

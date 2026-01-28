<?php
/**
 * Debug endpoint - shows actual database state
 * Access via: https://yoursite.com/backend/api/debug-state.php
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

header('Content-Type: application/json');

$data = [];

// Get user 5's subscriptions
$stmt = $db->prepare("SELECT id, stripe_subscription_id, status, product_id, shipment_quantity FROM subscriptions WHERE user_id = 5");
$stmt->execute();
$result = $stmt->get_result();
$subs = [];
while ($row = $result->fetch_assoc()) {
    $subs[] = $row;
}
$stmt->close();

$data['subscriptions'] = $subs;

// Get user 5's orders
$stmt = $db->prepare("SELECT id, total_amount, status, stripe_invoice_id, created_at FROM orders WHERE user_id = 5 ORDER BY created_at DESC");
$stmt->execute();
$result = $stmt->get_result();
$orders = [];
while ($row = $result->fetch_assoc()) {
    $orders[] = $row;
}
$stmt->close();

$data['orders'] = $orders;

// Get subscription_orders
$stmt = $db->prepare("
    SELECT so.id, so.subscription_id, so.order_id, so.product_id, so.quantity, so.unit_price
    FROM subscription_orders so
    WHERE so.subscription_id IN (SELECT id FROM subscriptions WHERE user_id = 5)
");
$stmt->execute();
$result = $stmt->get_result();
$links = [];
while ($row = $result->fetch_assoc()) {
    $links[] = $row;
}
$stmt->close();

$data['subscription_orders'] = $links;

// Get last webhook debug log entries
$debugLogFile = __DIR__ . '/webhook_debug.log';
if (file_exists($debugLogFile)) {
    $lines = file($debugLogFile, FILE_IGNORE_NEW_LINES);
    $data['recent_webhook_logs'] = array_slice($lines, -20);
} else {
    $data['recent_webhook_logs'] = ['No log file found'];
}

echo json_encode($data, JSON_PRETTY_PRINT);
?>

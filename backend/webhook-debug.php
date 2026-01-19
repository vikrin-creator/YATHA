<?php
/**
 * Webhook Debug Script - Check if webhooks are working
 */
header('Content-Type: text/plain');

echo "=== WEBHOOK DIAGNOSTIC ===\n\n";

// 1. Check if webhook log exists
$log_file = __DIR__ . '/stripe-webhook.log';
echo "1. Webhook Log Check:\n";
if (file_exists($log_file)) {
    echo "   ✓ Log file exists\n";
    $size = filesize($log_file);
    echo "   File size: " . number_format($size) . " bytes\n";
    
    if ($size > 0) {
        echo "   Recent entries (last 20 lines):\n";
        $lines = file($log_file);
        $recent = array_slice($lines, -20);
        foreach ($recent as $line) {
            echo "   " . trim($line) . "\n";
        }
    } else {
        echo "   ⚠ Log file is empty (no webhooks received)\n";
    }
} else {
    echo "   ✗ Log file not found (no webhooks received yet)\n";
}

// 2. Check webhook URL accessibility
echo "\n2. Webhook URL Test:\n";
$webhook_url = "https://tan-goshawk-974791.hostingersite.com/api/webhooks/stripe.php";
echo "   URL: $webhook_url\n";

// 3. Check database for recent orders
echo "\n3. Database Orders Check:\n";
try {
    require_once __DIR__ . '/src/config/Database.php';
    $database = new Database();
    $db = $database->connect();
    
    // Total orders
    $result = $db->query("SELECT COUNT(*) as total FROM orders");
    $total = $result->fetch_assoc()['total'];
    echo "   Total orders: $total\n";
    
    // Recent orders (last hour)
    $result = $db->query("SELECT COUNT(*) as recent FROM orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)");
    $recent = $result->fetch_assoc()['recent'];
    echo "   Orders (last hour): $recent\n";
    
    if ($recent > 0) {
        echo "   ✓ Recent orders found\n";
    } else {
        echo "   ✗ No recent orders - webhook likely not working\n";
    }
    
    // Check last 5 orders
    echo "\n   Last 5 orders:\n";
    $result = $db->query("SELECT id, user_id, total_amount, status, stripe_session_id, created_at FROM orders ORDER BY created_at DESC LIMIT 5");
    while ($row = $result->fetch_assoc()) {
        echo "   - Order #" . $row['id'] . ": $" . $row['total_amount'] . " (" . $row['status'] . ") - " . substr($row['created_at'], 0, 16) . "\n";
        if ($row['stripe_session_id']) {
            echo "     Session: " . substr($row['stripe_session_id'], 0, 25) . "...\n";
        } else {
            echo "     ⚠ Missing stripe_session_id\n";
        }
    }
    
} catch (Exception $e) {
    echo "   ✗ Database error: " . $e->getMessage() . "\n";
}

// 4. Stripe configuration check
echo "\n4. Stripe Configuration:\n";
$config_file = __DIR__ . '/src/config/stripe.php';
if (file_exists($config_file)) {
    echo "   ✓ Stripe config found\n";
    try {
        $config = include $config_file;
        if (!empty($config['webhook_secret'])) {
            echo "   ✓ Webhook secret configured\n";
        } else {
            echo "   ✗ Webhook secret missing\n";
        }
        if (!empty($config['secret_key'])) {
            echo "   ✓ Secret key configured\n";
        } else {
            echo "   ✗ Secret key missing\n";
        }
    } catch (Exception $e) {
        echo "   ✗ Config error: " . $e->getMessage() . "\n";
    }
} else {
    echo "   ✗ Stripe config not found\n";
}

echo "\n=== DIAGNOSIS ===\n";
if (!file_exists($log_file) || filesize($log_file) == 0) {
    echo "❌ WEBHOOK NOT RECEIVING EVENTS\n";
    echo "\nTo fix:\n";
    echo "1. Go to https://dashboard.stripe.com/webhooks\n";
    echo "2. Check if webhook exists for: $webhook_url\n";
    echo "3. If not, create new webhook with events:\n";
    echo "   - checkout.session.completed\n";
    echo "   - invoice.payment_succeeded\n";
    echo "4. Copy webhook signing secret to your .env file\n";
} else {
    echo "✓ Webhook is receiving events\n";
    echo "Check the log entries above for errors\n";
}

echo "\n=== NEXT STEPS ===\n";
echo "1. Fix webhook configuration in Stripe Dashboard\n";
echo "2. Test with a small payment\n";
echo "3. Check this diagnostic again\n";
echo "4. If orders appear, the OrderSuccess page will work\n";

?>
<?php
require_once __DIR__ . '/../src/config/Database.php';

$db = (new Database())->connect();
$r = $db->query('SELECT id, stripe_subscription_id, current_period_end, next_billing_date, created_at FROM subscriptions ORDER BY created_at DESC');

echo "=== Subscription Billing Dates ===\n\n";
while($row = $r->fetch_assoc()) {
    echo "Subscription " . $row['id'] . ":\n";
    echo "  Created: " . $row['created_at'] . "\n";
    echo "  Next Billing: " . $row['next_billing_date'] . "\n";
    echo "  Period End: " . $row['current_period_end'] . "\n";
    echo "  Days until billing: " . (strtotime($row['next_billing_date']) - time()) / 86400 . " days\n";
    echo "\n";
}

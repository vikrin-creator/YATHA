<?php
/**
 * Run this script via: php database/migrations/run_migrations.php
 * It applies all pending migrations to update the database schema
 */

require_once __DIR__ . '/../../src/config/Database.php';

$database = new Database();
$db = $database->connect();

if (!$db) {
    echo "❌ Database connection failed\n";
    exit(1);
}

echo "Running migrations...\n\n";

// Migration 1: Add Stripe columns to orders table
echo "→ Adding Stripe tracking columns to orders table...\n";

$migrations = [
    "ALTER TABLE orders 
    ADD COLUMN stripe_session_id VARCHAR(255) UNIQUE AFTER user_id,
    ADD COLUMN stripe_invoice_id VARCHAR(255) UNIQUE AFTER stripe_session_id,
    ADD COLUMN address_id INT AFTER stripe_invoice_id,
    ADD INDEX idx_stripe_session (stripe_session_id),
    ADD INDEX idx_stripe_invoice (stripe_invoice_id)"
];

foreach ($migrations as $sql) {
    if (@$db->query($sql)) {
        echo "  ✅ Migration applied\n";
    } else {
        if (strpos($db->error, 'Duplicate') !== false) {
            echo "  ⚠️  Already exists (skipped)\n";
        } else {
            echo "  ❌ Error: " . $db->error . "\n";
        }
    }
}

echo "\n✅ All migrations completed!\n";

// Show orders table structure
echo "\nOrders table structure:\n";
$result = $db->query("DESCRIBE orders");
while ($row = $result->fetch_assoc()) {
    echo "  - {$row['Field']}: {$row['Type']}" . ($row['Null'] === 'NO' ? ' (NOT NULL)' : '') . "\n";
}

$db->close();
?>

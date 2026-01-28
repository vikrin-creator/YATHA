<?php
require_once __DIR__ . '/../src/config/Database.php';

$database = new Database();
$db = $database->connect();

if (!$db) {
    die('Database connection failed');
}

// Check subscriptions
$result = $db->query("SELECT s.id, s.user_id, s.product_id, s.status, u.name, u.email, p.name as pname FROM subscriptions s LEFT JOIN users u ON s.user_id = u.id LEFT JOIN products p ON s.product_id = p.id");

echo "=== Subscriptions in Database ===\n\n";

if ($result->num_rows === 0) {
    echo "No subscriptions found\n";
} else {
    while ($row = $result->fetch_assoc()) {
        echo "ID: " . $row['id'] . "\n";
        echo "  User: " . ($row['name'] ?? 'NULL') . " (" . ($row['email'] ?? 'NULL') . ")\n";
        echo "  Product: " . ($row['pname'] ?? 'NULL') . "\n";
        echo "  Status: " . $row['status'] . "\n";
        echo "\n";
    }
}

// Check if users table has data
echo "\n=== Users Table ===\n";
$users = $db->query("SELECT id, name, email FROM users LIMIT 5");
echo "Sample users:\n";
while ($row = $users->fetch_assoc()) {
    echo "- " . $row['name'] . " (" . $row['email'] . ")\n";
}

// Check if products table has data
echo "\n=== Products Table ===\n";
$products = $db->query("SELECT id, name FROM products LIMIT 5");
echo "Sample products:\n";
while ($row = $products->fetch_assoc()) {
    echo "- " . $row['name'] . "\n";
}

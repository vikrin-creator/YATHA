<?php

// Database seeding script
// Usage: php database/seeds/seed_database.php

require_once __DIR__ . '/../../src/config/Database.php';

$database = new Database();
$db = $database->connect();

// Check if data already exists
$result = $db->query("SELECT COUNT(*) as count FROM users");
$row = $result->fetch_assoc();

if ($row['count'] > 0) {
    echo "Database already seeded!\n";
    exit;
}

// Seed users
$users = [
    ['Admin User', 'admin@gmail.com', 'password123'],
    ['John Doe', 'john@example.com', 'password123'],
    ['Jane Smith', 'jane@example.com', 'password123'],
    ['Bob Johnson', 'bob@example.com', 'password123']
];

foreach ($users as $user) {
    $password = password_hash($user[2], PASSWORD_BCRYPT);
    $query = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    $stmt = $db->prepare($query);
    $stmt->bind_param('sss', $user[0], $user[1], $password);
    $stmt->execute();
    echo "Created user: {$user[0]}\n";
}

// Seed products
$products = [
    ['Laptop Pro', 'High-performance laptop for professionals', 1299.99, '/uploads/images/placeholder.png'],
    ['Wireless Mouse', 'Comfortable wireless mouse', 29.99, '/uploads/images/placeholder.png'],
    ['USB-C Cable', 'Fast charging USB-C cable', 15.99, '/uploads/images/placeholder.png'],
    ['Monitor 27"', 'UHD 27 inch monitor', 399.99, '/uploads/images/placeholder.png']
];

foreach ($products as $product) {
    $query = "INSERT INTO products (name, description, price, image) VALUES (?, ?, ?, ?)";
    $stmt = $db->prepare($query);
    $stmt->bind_param('ssds', $product[0], $product[1], $product[2], $product[3]);
    $stmt->execute();
    echo "Created product: {$product[0]}\n";
}

echo "\nDatabase seeded successfully!\n";
?>

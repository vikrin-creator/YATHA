<?php
require_once __DIR__ . '/src/config/Database.php';

$db = new Database();
$conn = $db->connect();

echo "=== Testing Product Query ===\n\n";

$result = $conn->query('SELECT id, name, image FROM products LIMIT 1');
$row = $result->fetch_assoc();
echo "Direct query result:\n";
echo json_encode($row, JSON_PRETTY_PRINT) . "\n\n";

echo "=== Testing API Response ===\n";
$result = $conn->query('SELECT * FROM products LIMIT 1');
$row = $result->fetch_assoc();
echo "Full product row:\n";
print_r($row);
?>

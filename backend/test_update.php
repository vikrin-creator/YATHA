<?php
require_once __DIR__ . '/src/config/Database.php';

$db = new Database();
$conn = $db->connect();

echo "=== Before Update ===\n";
$result = $conn->query("SELECT id, name, image, featured, stock_quantity FROM products WHERE id = 1");
$product = $result->fetch_assoc();
echo json_encode($product, JSON_PRETTY_PRINT) . "\n\n";

echo "=== Attempting Update ===\n";
$query = "UPDATE products SET name = 'Updated Moringa Powder', featured = 1, stock_quantity = 150 WHERE id = 1";
if ($conn->query($query)) {
    echo "Update query executed successfully\n";
    echo "Affected rows: " . $conn->affected_rows . "\n\n";
} else {
    echo "Update failed: " . $conn->error . "\n\n";
}

echo "=== After Update ===\n";
$result = $conn->query("SELECT id, name, image, featured, stock_quantity FROM products WHERE id = 1");
$product = $result->fetch_assoc();
echo json_encode($product, JSON_PRETTY_PRINT) . "\n";

// Reset back
$conn->query("UPDATE products SET name = 'Moringa Powder', featured = 1, stock_quantity = 100 WHERE id = 1");
echo "\n=== Database reset to original values ===\n";
?>

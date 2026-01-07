<?php
require 'src/config/Database.php';

$db = new Database();
$conn = $db->connect();

echo "Testing reviews query...\n\n";

$query = "SELECT r.*, p.name as product_name, u.first_name, u.last_name, u.email 
          FROM reviews r 
          LEFT JOIN products p ON r.product_id = p.id 
          LEFT JOIN users u ON r.user_id = u.id 
          ORDER BY r.created_at DESC";

$result = $conn->query($query);

if (!$result) {
    echo "Query failed: " . $conn->error . "\n";
    exit;
}

echo "Query successful!\n";
echo "Number of reviews: " . $result->num_rows . "\n\n";

while ($row = $result->fetch_assoc()) {
    echo "Review ID: " . $row['id'] . "\n";
    echo "Product: " . ($row['product_name'] ?? 'N/A') . "\n";
    echo "Customer: " . ($row['first_name'] ?? '') . " " . ($row['last_name'] ?? '') . "\n";
    echo "Rating: " . $row['rating'] . "\n";
    echo "Comment: " . substr($row['comment'], 0, 50) . "...\n";
    echo "---\n";
}
?>

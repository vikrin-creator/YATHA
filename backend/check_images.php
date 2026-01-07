<?php
require 'src/config/Database.php';

try {
  $db = new Database();
  $conn = $db->connect();
  
  if (!$conn) {
    echo "Connection failed\n";
    exit;
  }
  
  echo "Connected successfully\n";
  
  $result = $conn->query('SELECT id, name, image FROM products LIMIT 5');
  
  if (!$result) {
    echo "Query failed: " . $conn->error . "\n";
    exit;
  }
  
  echo "Results:\n";
  while($row = $result->fetch_assoc()) {
    echo "ID: {$row['id']} | Name: {$row['name']} | Image: {$row['image']}\n";
  }
  
} catch (Exception $e) {
  echo "Error: " . $e->getMessage() . "\n";
}
?>

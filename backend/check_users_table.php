<?php
require 'src/config/Database.php';

$db = new Database();
$conn = $db->connect();

echo "Users table structure:\n";
$result = $conn->query("DESCRIBE users");
while($row = $result->fetch_assoc()) {
  echo "  {$row['Field']} - {$row['Type']}\n";
}

echo "\nSample user data:\n";
$result = $conn->query("SELECT * FROM users LIMIT 1");
$user = $result->fetch_assoc();
print_r($user);
?>

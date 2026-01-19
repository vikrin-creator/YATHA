<?php
/**
 * Admin User Management Script
 * Create, reset password, or promote users to admin
 */

require_once __DIR__ . '/src/config/Database.php';

$database = new Database();
$db = $database->connect();

if (!$db) {
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// Configuration
$adminEmail = 'admin@yatha.com';  // Existing admin email
$newPassword = 'Admin@123456';     // Change this to desired password

echo "========================================\n";
echo "Admin User Management\n";
echo "========================================\n\n";

// Check if user exists
$query = "SELECT id, role FROM users WHERE email = ?";
$stmt = $db->prepare($query);
$stmt->bind_param('s', $adminEmail);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo "User with email $adminEmail not found.\n";
    echo "Creating new admin user...\n\n";
    
    // Create new admin user
    $name = 'Admin';
    $password = password_hash($newPassword, PASSWORD_BCRYPT);
    $role = 'admin';
    $email_verified = 1;
    
    $query = "INSERT INTO users (name, email, password, role, email_verified, email_verified_at, created_at) 
              VALUES (?, ?, ?, ?, ?, NOW(), NOW())";
    $stmt = $db->prepare($query);
    $stmt->bind_param('ssssi', $name, $adminEmail, $password, $role, $email_verified);
    
    if ($stmt->execute()) {
        echo "✓ SUCCESS! Admin user created\n";
        echo "----------------------------------------\n";
        echo "Email: $adminEmail\n";
        echo "Password: $newPassword\n";
        echo "User ID: " . $stmt->insert_id . "\n";
        echo "----------------------------------------\n";
    } else {
        echo "✗ FAILED to create admin user: " . $db->error . "\n";
    }
} else {
    $user = $result->fetch_assoc();
    
    // Reset password for existing user
    $password_hash = password_hash($newPassword, PASSWORD_BCRYPT);
    $query = "UPDATE users SET password = ?, role = 'admin' WHERE email = ?";
    $stmt = $db->prepare($query);
    $stmt->bind_param('ss', $password_hash, $adminEmail);
    
    if ($stmt->execute()) {
        echo "✓ SUCCESS! Admin password reset\n";
        echo "----------------------------------------\n";
        echo "Email: $adminEmail\n";
        echo "New Password: $newPassword\n";
        echo "Role: admin\n";
        echo "----------------------------------------\n";
    } else {
        echo "✗ FAILED to reset password: " . $db->error . "\n";
    }
}

echo "\nNow you can login to admin panel with:\n";
echo "Email: $adminEmail\n";
echo "Password: $newPassword\n\n";

$db->close();
?>

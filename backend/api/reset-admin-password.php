<?php
/**
 * Reset Admin User Password
 */

require_once __DIR__ . '/../src/config/Database.php';

$database = new Database();
$db = $database->connect();

if (!$db) {
    die('Database connection failed');
}

// New password for admin
$newPassword = 'Admin@123'; // Change this to whatever you want
$hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);

echo "=== Resetting Admin Password ===\n\n";
echo "New password: " . $newPassword . "\n\n";

// Update admin user (usually email = admin@yathaglobal.com or role = 'admin')
$stmt = $db->prepare("UPDATE users SET password = ? WHERE role = 'admin' LIMIT 1");
$stmt->bind_param('s', $hashedPassword);

if ($stmt->execute()) {
    echo "✅ Admin password reset successfully!\n";
    echo "You can now login with:\n";
    echo "  Email: admin@yathaglobal.com (or your admin email)\n";
    echo "  Password: " . $newPassword . "\n\n";
    echo "⚠️  IMPORTANT: Change this password after logging in!\n";
} else {
    echo "❌ Failed to reset password: " . $stmt->error . "\n";
}

$stmt->close();
$db->close();

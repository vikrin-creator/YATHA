<?php

require_once __DIR__ . '/../../src/config/Database.php';

try {
    $database = new Database();
    $db = $database->connect();

    if (!$db) {
        throw new Exception('Database connection failed');
    }

    // Check if role column already exists
    $query = "SHOW COLUMNS FROM users LIKE 'role'";
    $result = $db->query($query);

    if ($result->num_rows === 0) {
        // Add role column
        $alter_query = "ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user' AFTER password";
        
        if ($db->query($alter_query)) {
            echo "✅ Successfully added 'role' column to users table\n";
        } else {
            throw new Exception('Failed to add role column: ' . $db->error);
        }
    } else {
        echo "ℹ️ Role column already exists\n";
    }

    // Check if phone column exists
    $query = "SHOW COLUMNS FROM users LIKE 'phone'";
    $result = $db->query($query);

    if ($result->num_rows === 0) {
        // Add phone column
        $alter_query = "ALTER TABLE users ADD COLUMN phone VARCHAR(20) AFTER password";
        
        if ($db->query($alter_query)) {
            echo "✅ Successfully added 'phone' column to users table\n";
        } else {
            throw new Exception('Failed to add phone column: ' . $db->error);
        }
    } else {
        echo "ℹ️ Phone column already exists\n";
    }

    // Set first user as admin
    $update_query = "UPDATE users SET role = 'admin' ORDER BY id ASC LIMIT 1";
    
    if ($db->query($update_query)) {
        echo "✅ Successfully set first user as admin\n";
        
        // Get the admin user
        $select_query = "SELECT id, name, email, role FROM users WHERE role = 'admin' LIMIT 1";
        $result = $db->query($select_query);
        $admin = $result->fetch_assoc();
        
        if ($admin) {
            echo "👤 Admin user: {$admin['name']} ({$admin['email']})\n";
        }
    } else {
        throw new Exception('Failed to update user role: ' . $db->error);
    }

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\n✅ Migration completed successfully!\n";
?>

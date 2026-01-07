<?php

// Database connection details
$host = 'srv2124.hstgr.io';
$db_name = 'u177524058_YATHA';
$username = 'u177524058_YATHA';
$password = 'Yatha@2025';

try {
    // Connect to MySQL with the existing database
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Read the schema.sql file
    $schema_sql = file_get_contents(__DIR__ . '/database/schema.sql');
    
    // Remove CREATE DATABASE statements since we're using existing database
    $schema_sql = preg_replace('/CREATE\s+DATABASE\s+IF\s+NOT\s+EXISTS\s+[^;]+;/i', '', $schema_sql);
    $schema_sql = preg_replace('/USE\s+[^;]+;/i', '', $schema_sql);
    
    // Split SQL statements by semicolon and execute each one
    $statements = array_filter(array_map('trim', explode(';', $schema_sql)));
    
    $executed = 0;
    foreach ($statements as $statement) {
        if (!empty($statement)) {
            try {
                $conn->exec($statement);
                $executed++;
                echo "✓ Executed statement " . $executed . "\n";
            } catch (PDOException $e) {
                // Only treat as warning if it's not a duplicate key error (table already exists)
                if (strpos($e->getMessage(), 'already exists') !== false || 
                    strpos($e->getMessage(), 'Duplicate') !== false) {
                    echo "⚠ Table/Data already exists (skipped)\n";
                } else {
                    echo "⚠ Warning: " . $e->getMessage() . "\n";
                }
            }
        }
    }
    
    echo "\n✓ Schema execution completed! Executed $executed statements.\n";
    
} catch (PDOException $e) {
    echo "✗ Connection failed: " . $e->getMessage() . "\n";
    exit(1);
}
?>

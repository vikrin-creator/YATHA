<?php
require_once __DIR__ . '/config/database.php';

echo "Seeding database with initial data...\n";

$database = new Database();
$db = $database->getConnection();

try {
    // Read and execute the schema
    $schema = file_get_contents(__DIR__ . '/database/admin_schema.sql');
    
    // Split by semicolons and execute each statement
    $statements = explode(';', $schema);
    
    foreach ($statements as $statement) {
        $statement = trim($statement);
        if (!empty($statement)) {
            $db->exec($statement);
        }
    }
    
    echo "✅ Database seeded successfully!\n";
    echo "Admin login: admin@yatha.com\n";
    echo "Products added: 4\n";
    echo "You can now access the admin panel at: /admin\n";
    
} catch (PDOException $e) {
    echo "❌ Error seeding database: " . $e->getMessage() . "\n";
}
?>
<?php
require_once __DIR__ . '/config/database.php';

$db = new Database();
try {
    $conn = $db->getConnection();
    if ($conn instanceof PDO) {
        echo json_encode(['success' => true, 'message' => 'Database connection successful']);
    } else {
        echo json_encode(['success' => false, 'message' => 'getConnection did not return a PDO instance']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

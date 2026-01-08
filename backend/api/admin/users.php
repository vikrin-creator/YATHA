<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once __DIR__ . '/../../src/config/Database.php';
require_once __DIR__ . '/../../src/middleware/AuthMiddleware.php';
require_once __DIR__ . '/../../src/utils/Response.php';

$method = $_SERVER['REQUEST_METHOD'];

// Verify admin access
$user = AuthMiddleware::verify();
$database = new Database();
$db = $database->connect();

// Check if user is admin (you can add a role/is_admin column to users table later)
// For now, we'll allow any authenticated user to view users

if ($method === 'GET') {
    getAllUsers($db);
} else {
    Response::error('Method not allowed', 405);
}

function getAllUsers($db)
{
    $query = "SELECT id, name, email, phone, created_at, updated_at FROM users ORDER BY id DESC";
    
    try {
        $result = $db->query($query);
        
        if (!$result) {
            Response::error('Failed to fetch users: ' . $db->error, 500);
        }
        
        $users = [];
        while ($row = $result->fetch_assoc()) {
            $users[] = $row;
        }
        
        Response::success($users, 'Users retrieved successfully', 200);
    } catch (Exception $e) {
        Response::error('Error fetching users: ' . $e->getMessage(), 500);
    }
}
?>

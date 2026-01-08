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

// Verify user is admin
verifyAdmin($db, $user['user_id'], $user['role'] ?? null);

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

function verifyAdmin($db, $user_id, $user_role = null)
{
    if ($user_role !== null && $user_role !== 'admin') {
        Response::error('Admin access required', 403);
    } elseif ($user_role === null) {
        // Fallback: query database if role not provided via JWT
        $query = "SELECT role FROM users WHERE id = ?";
        $stmt = $db->prepare($query);
        if (!$stmt) {
            Response::error('Database error', 500);
        }
        $stmt->bind_param('i', $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();

        if (!$user || $user['role'] !== 'admin') {
            Response::error('Admin access required', 403);
        }
    }
}
?>

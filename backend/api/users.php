<?php

header('Content-Type: application/json');

error_reporting(E_ALL);
ini_set('display_errors', '0');

require_once __DIR__ . '/../src/utils/Response.php';
require_once __DIR__ . '/../src/middleware/AuthMiddleware.php';
require_once __DIR__ . '/../src/config/Database.php';

try {
    $method = $_SERVER['REQUEST_METHOD'];
    $input = json_decode(file_get_contents('php://input'), true);

    $user = AuthMiddleware::verify();
    $database = new Database();
    $db = $database->connect();

    if (!$db) {
        throw new Exception('Database connection failed');
    }

    if ($method === 'GET') {
        getUserProfile($db, $user['user_id']);
    } elseif ($method === 'PUT') {
        updateUserProfile($db, $input, $user['user_id']);
    } else {
        Response::error('Method not allowed', 405);
    }
} catch (Exception $e) {
    Response::error($e->getMessage(), 500);
}

function getUserProfile($db, $user_id)
{
    $query = "SELECT id, name, email, phone, created_at FROM users WHERE id = ?";
    $stmt = $db->prepare($query);
    $stmt->bind_param('i', $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        Response::error('User not found', 404);
    }

    $user = $result->fetch_assoc();
    Response::success($user, 'User profile fetched successfully');
}

function updateUserProfile($db, $input, $user_id)
{
    $name = trim($input['name'] ?? '');

    if (empty($name)) {
        Response::validationError(['name' => 'Name is required']);
    }

    $query = "UPDATE users SET name = ? WHERE id = ?";
    $stmt = $db->prepare($query);
    $stmt->bind_param('si', $name, $user_id);

    if ($stmt->execute()) {
        Response::success([], 'User profile updated successfully');
    } else {
        Response::error('Failed to update profile', 500);
    }
}
?>

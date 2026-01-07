<?php

require_once __DIR__ . '/../src/utils/Response.php';
require_once __DIR__ . '/../src/middleware/AuthMiddleware.php';
require_once __DIR__ . '/../src/config/Database.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

$user = AuthMiddleware::verify();
$database = new Database();
$db = $database->connect();

if ($method === 'GET') {
    getOrders($db, $user['user_id']);
} elseif ($method === 'POST') {
    createOrder($db, $input, $user['user_id']);
} else {
    Response::error('Method not allowed', 405);
}

function getOrders($db, $user_id)
{
    $query = "SELECT id, user_id, total_amount, status, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->bind_param('i', $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $orders = [];
    while ($row = $result->fetch_assoc()) {
        $orders[] = $row;
    }

    Response::success($orders, 'Orders fetched successfully');
}

function createOrder($db, $input, $user_id)
{
    if (!isset($input['items']) || !is_array($input['items'])) {
        Response::validationError(['message' => 'Invalid order items']);
    }

    $total_amount = floatval($input['total_amount'] ?? 0);

    $query = "INSERT INTO orders (user_id, total_amount, status, created_at) VALUES (?, ?, 'pending', NOW())";
    $stmt = $db->prepare($query);
    $stmt->bind_param('id', $user_id, $total_amount);

    if ($stmt->execute()) {
        Response::success(
            ['order_id' => $stmt->insert_id],
            'Order created successfully',
            201
        );
    } else {
        Response::error('Failed to create order', 500);
    }
}
?>

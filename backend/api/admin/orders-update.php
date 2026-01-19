<?php
// Set error handling to JSON
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    error_log("PHP Error: [$errno] $errstr in $errfile:$errline");
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'status' => 'error',
        'message' => 'Server error: ' . $errstr,
        'data' => []
    ]);
    exit;
});

set_exception_handler(function($e) {
    error_log("Exception: " . $e->getMessage() . " in " . $e->getFile() . ":" . $e->getLine());
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'status' => 'error',
        'message' => 'Server error: ' . $e->getMessage(),
        'data' => []
    ]);
    exit;
});

header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', '0');

require_once __DIR__ . '/../../src/config/Database.php';
require_once __DIR__ . '/../../src/utils/Response.php';
require_once __DIR__ . '/../../src/utils/JWT.php';
require_once __DIR__ . '/../../src/middleware/AuthMiddleware.php';

// Handle CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow PUT/PATCH requests
if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'PATCH') {
    Response::error('Method not allowed', 405);
    exit();
}

// Verify JWT token
$token = getAuthToken();
if (!$token) {
    Response::error('No authorization token', 401);
    exit();
}

$jwt = new JWT();
$decoded = $jwt->verifyToken($token);
if (!$decoded) {
    Response::error('Invalid token', 401);
    exit();
}

$userId = $decoded['user_id'] ?? null;
$input = json_decode(file_get_contents('php://input'), true);

try {
    $db = new Database();
    $conn = $db->connect();
    
    // Check if user is admin
    $userQuery = "SELECT role FROM users WHERE id = ?";
    $stmt = $conn->prepare($userQuery);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    
    if (!$user || $user['role'] !== 'admin') {
        Response::error('Access denied: Admin only', 403);
        exit();
    }
    
    // Get order ID from URL
    $segments = explode('/', trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/'));
    $orderId = end($segments);
    
    if (!is_numeric($orderId)) {
        Response::error('Invalid order ID', 400);
        exit();
    }
    
    $orderId = (int)$orderId;
    
    // Validate input
    if (!isset($input['status'])) {
        Response::error('Status is required', 400);
        exit();
    }
    
    $status = $input['status'];
    $allowedStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!in_array($status, $allowedStatuses)) {
        Response::error('Invalid status. Allowed: ' . implode(', ', $allowedStatuses), 400);
        exit();
    }
    
    // Update order status
    $updateQuery = "
        UPDATE orders 
        SET status = ? 
        WHERE id = ?
    ";
    
    error_log("Updating order. OrderID: " . $orderId . ", Status: " . $status);
    
    $stmt = $conn->prepare($updateQuery);
    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }
    
    $stmt->bind_param("si", $status, $orderId);
    
    if (!$stmt->execute()) {
        throw new Exception('Update failed: ' . $stmt->error);
    }
    
    error_log("Affected rows: " . $stmt->affected_rows);
    
    if ($stmt->affected_rows === 0) {
        Response::error('Order not found or no changes made', 404);
        exit();
    }
    
    // Fetch updated order
    $fetchQuery = "
        SELECT 
            o.id,
            o.user_id,
            o.total_amount,
            o.status,
            o.created_at,
            u.name as user_name,
            u.email as user_email,
            o.stripe_session_id,
            o.stripe_invoice_id
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        WHERE o.id = ?
    ";
    
    $stmt = $conn->prepare($fetchQuery);
    $stmt->bind_param("i", $orderId);
    $stmt->execute();
    $result = $stmt->get_result();
    $order = $result->fetch_assoc();
    
    if (!$order) {
        Response::error('Order not found', 404);
        exit();
    }
    
    Response::success([
        'order' => [
            'id' => (int)$order['id'],
            'user_id' => (int)$order['user_id'],
            'user_name' => $order['user_name'] ?? 'Unknown',
            'user_email' => $order['user_email'] ?? 'N/A',
            'total_amount' => $order['total_amount'],
            'status' => $order['status'],
            'created_at' => $order['created_at'],
            'stripe_session_id' => $order['stripe_session_id'],
            'stripe_invoice_id' => $order['stripe_invoice_id']
        ]
    ], 'Order updated successfully');
    
} catch (Exception $e) {
    error_log('Error in admin order update endpoint: ' . $e->getMessage());
    Response::error('Server error: ' . $e->getMessage(), 500);
}
?>

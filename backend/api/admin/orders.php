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
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
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
    
    // Fetch all orders with user information
    $query = "
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
        ORDER BY o.created_at DESC
    ";
    
    $result = $conn->query($query);
    
    if (!$result) {
        throw new Exception('Query failed: ' . $conn->error);
    }
    
    $orders = [];
    while ($row = $result->fetch_assoc()) {
        $orders[] = [
            'id' => (int)$row['id'],
            'user_id' => (int)$row['user_id'],
            'user_name' => $row['user_name'] ?? 'Unknown',
            'user_email' => $row['user_email'] ?? 'N/A',
            'total_amount' => $row['total_amount'],
            'status' => $row['status'],
            'created_at' => $row['created_at'],
            'stripe_session_id' => $row['stripe_session_id'],
            'stripe_invoice_id' => $row['stripe_invoice_id']
        ];
    }
    
    Response::success([
        'orders' => $orders,
        'total' => count($orders)
    ]);
    
} catch (Exception $e) {
    error_log('Error in admin orders endpoint: ' . $e->getMessage());
    Response::error('Server error: ' . $e->getMessage(), 500);
}
?>

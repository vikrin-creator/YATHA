<?php
header('Content-Type: application/json');

require_once '../../src/config/Database.php';
require_once '../../src/utils/Response.php';
require_once '../../src/utils/JWT.php';
require_once '../../src/middleware/AuthMiddleware.php';

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

$decoded = JWT::verify($token);
if (!$decoded) {
    Response::error('Invalid token', 401);
    exit();
}

$userId = $decoded->user_id ?? null;

try {
    $db = new Database();
    
    // Check if user is admin
    $userQuery = "SELECT role FROM users WHERE id = ?";
    $stmt = $db->getConnection()->prepare($userQuery);
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
    
    $result = $db->getConnection()->query($query);
    
    if (!$result) {
        throw new Exception('Query failed: ' . $db->getConnection()->error);
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

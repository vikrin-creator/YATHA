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
    
    // Fetch all subscriptions with user details
    $query = "
        SELECT 
            s.id,
            s.user_id,
            s.stripe_subscription_id,
            s.product_id,
            s.status,
            s.created_at,
            u.name as user_name,
            u.email as user_email,
            p.name as product_name,
            p.price as product_price
        FROM subscriptions s
        LEFT JOIN users u ON s.user_id = u.id
        LEFT JOIN products p ON s.product_id = p.id
        ORDER BY s.created_at DESC
    ";
    
    $result = $conn->query($query);
    
    if (!$result) {
        throw new Exception('Query failed: ' . $conn->error);
    }
    
    $subscriptions = [];
    while ($row = $result->fetch_assoc()) {
        $subscriptions[] = [
            'id' => (int)$row['id'],
            'user_id' => (int)$row['user_id'],
            'user_name' => $row['user_name'] ?? 'Unknown',
            'user_email' => $row['user_email'] ?? 'N/A',
            'product_name' => $row['product_name'] ?? 'Unknown Product',
            'product_price' => $row['product_price'] ?? 0,
            'stripe_subscription_id' => $row['stripe_subscription_id'],
            'status' => $row['status'],
            'created_at' => $row['created_at']
        ];
    }
    
    Response::success([
        'subscriptions' => $subscriptions,
        'total' => count($subscriptions)
    ], 'Subscriptions fetched successfully');
    
} catch (Exception $e) {
    error_log('Error in admin subscriptions endpoint: ' . $e->getMessage());
    Response::error('Server error: ' . $e->getMessage(), 500);
}
?>

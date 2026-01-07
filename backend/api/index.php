<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../routes/admin_api.php';
require_once __DIR__ . '/../routes/reviews_api.php';
require_once __DIR__ . '/../routes/auth_api.php';

$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Remove query string and get the path
$path = parse_url($requestUri, PHP_URL_PATH);

// Strip /backend/api or /api prefix
$path = preg_replace('#^/backend/api#', '', $path);
$path = preg_replace('#^/api#', '', $path);

// Handle image upload first (before setting JSON header)
if ($path === '/admin/upload-image' && $requestMethod === 'POST') {
    header('Content-Type: application/json');
    handleImageUpload();
    exit();
}

// Set JSON header for other routes
header('Content-Type: application/json');

// Initialize database connection
$db = Database::getInstance()->getConnection();

// Auth routes
if (strpos($path, '/auth') === 0) {
    handleAuthRequest($requestMethod, $path, $db);
    exit();
}

// Admin routes
if (strpos($path, '/admin/products') === 0) {
    handleProductsRequest($requestMethod, $path, $db);
    exit();
}

// Review routes
if (strpos($path, '/admin/reviews') === 0 || strpos($path, '/reviews') === 0) {
    handleReviewsRequest($requestMethod, $path, $db);
    exit();
}

// Default response
echo json_encode([
    'success' => true,
    'message' => 'Yatha API',
    'version' => '1.0.0'
]);

<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Don't set Content-Type globally - let individual endpoints set it
// Only set for non-upload endpoints
$request_path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$is_upload = strpos($request_path, '/upload-image') !== false;
if (!$is_upload) {
    header('Content-Type: application/json');
}

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get request path
$request_path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Log for debugging
error_log("Original REQUEST_URI: " . $_SERVER['REQUEST_URI']);
error_log("Parsed path: " . $request_path);

// Remove /backend/api, /backend, or /api from the path
$request_path = preg_replace('#^/backend/api/#', '', $request_path);
$request_path = preg_replace('#^/backend/#', '', $request_path);
$request_path = preg_replace('#^/api/#', '', $request_path);
$request_path = trim($request_path, '/');

error_log("Final path after cleanup: " . $request_path);

// If empty path, show API info
if (empty($request_path)) {
    echo json_encode([
        'status' => 'success',
        'message' => 'Yatha API',
        'version' => '1.0',
        'endpoints' => [
            'POST /api/auth/register',
            'POST /api/auth/login',
            'GET /api/products',
            'POST /api/products',
            'GET /api/reviews',
            'POST /api/reviews',
            'GET /api/faqs',
            'POST /api/faqs',
            'PUT /api/faqs/{id}',
            'DELETE /api/faqs/{id}',
            'GET /api/orders',
            'POST /api/orders',
            'GET /api/users',
            'PUT /api/users',
            'GET /api/admin/users',
            'POST /api/upload-image'
        ]
    ]);
    exit;
}

// Split path into segments
$segments = explode('/', $request_path);
$route = $segments[0] ?? '';
$subroute = $segments[1] ?? '';

// Store segments in globals for use by included files
$GLOBALS['route'] = $route;
$GLOBALS['subroute'] = $subroute;
$GLOBALS['segments'] = $segments;

// Route handler - include the appropriate API file
switch ($route) {
    case 'auth':
        require_once __DIR__ . '/auth.php';
        break;
    case 'products':
        require_once __DIR__ . '/products.php';
        break;
    case 'reviews':
        require_once __DIR__ . '/reviews.php';
        break;
    case 'orders':
        require_once __DIR__ . '/orders.php';
        break;
    case 'faqs':
        require_once __DIR__ . '/faqs.php';
        break;
    case 'users':
        require_once __DIR__ . '/users.php';
        break;
    case 'admin':
        // Route admin endpoints
        switch ($subroute) {
            case 'users':
                require_once __DIR__ . '/admin/users.php';
                break;
            default:
                http_response_code(404);
                echo json_encode(['success' => false, 'status' => 'error', 'message' => 'Admin route not found']);
                break;
        }
        break;
    case 'upload-image':
        require_once __DIR__ . '/upload-image.php';
        break;
    default:
        http_response_code(404);
        echo json_encode(['success' => false, 'status' => 'error', 'message' => 'Route not found']);
        break;
}
?>

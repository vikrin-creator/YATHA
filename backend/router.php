<?php
/**
 * Development Server Router
 * This file routes all requests to the appropriate handler
 * Usage: php -S localhost:8000 router.php
 */

$request_uri = $_SERVER['REQUEST_URI'];
$request_path = parse_url($request_uri, PHP_URL_PATH);

// Handle root path
if ($request_path === '/') {
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'success',
        'message' => 'Yatha API Server',
        'version' => '1.0',
        'endpoints' => [
            'GET /api - API Information',
            'POST /api/auth/register - Register new user',
            'POST /api/auth/login - User login',
            'GET /api/products - Get all products',
            'POST /api/products - Create product (admin)',
            'GET /api/reviews - Get all reviews',
            'POST /api/reviews - Create review',
            'GET /api/orders - Get user orders',
            'POST /api/orders - Create order',
            'GET /api/users - Get user profile',
            'PUT /api/users - Update user profile'
        ],
        'database' => 'connected'
    ], JSON_PRETTY_PRINT);
    exit;
}

// Check if requesting a real file or directory
// Handle both /public/... and /uploads/... paths
if (strpos($request_path, '/public/') === 0) {
    // Remove /public prefix since we're already checking in the public folder
    $file_path = __DIR__ . $request_path;
} else if (strpos($request_path, '/uploads/') === 0) {
    // Legacy path without /public prefix
    $file_path = __DIR__ . '/public' . $request_path;
} else {
    $file_path = __DIR__ . $request_path;
}

// If file exists and is a real file, serve it directly
if (is_file($file_path)) {
    // For images and other static files
    $ext = pathinfo($file_path, PATHINFO_EXTENSION);
    $mime_types = [
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png' => 'image/png',
        'gif' => 'image/gif',
        'css' => 'text/css',
        'js' => 'application/javascript',
        'json' => 'application/json'
    ];
    
    if (isset($mime_types[strtolower($ext)])) {
        header('Content-Type: ' . $mime_types[strtolower($ext)]);
    }
    
    readfile($file_path);
    exit;
}

// Route everything else to public/index.php for API handling
$_SERVER['SCRIPT_FILENAME'] = __DIR__ . '/public/index.php';
require __DIR__ . '/public/index.php';
?>
?>

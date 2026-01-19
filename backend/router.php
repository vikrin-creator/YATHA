<?php
/**
 * Development Server Router
 * This file routes all requests to the appropriate handler
 * Usage: php -S localhost:8000 -r router.php
 */

// Set CORS headers at the TOP before anything else
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 86400');

$request_uri = $_SERVER['REQUEST_URI'];
$request_path = parse_url($request_uri, PHP_URL_PATH);

// Handle preflight OPTIONS request immediately
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Priority 1: Check if requesting the /api path - route to API
if (strpos($request_path, '/api') === 0) {
    // Set content type for API (except uploads)
    if (strpos($request_path, '/upload-image') === false) {
        header('Content-Type: application/json');
    }
    
    // Route to API handler
    $_SERVER['SCRIPT_FILENAME'] = __DIR__ . '/api/index.php';
    require __DIR__ . '/api/index.php';
    exit(0);
}

// Priority 2: Handle root path
if ($request_path === '/' || $request_path === '') {
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
            'PUT /api/users - Update user profile',
            'GET /api/admin/users - Get all users (admin)'
        ],
        'database' => 'connected'
    ], JSON_PRETTY_PRINT);
    exit(0);
}

// Priority 3: Check if requesting a real file (for static assets)
// This should return false so PHP handles it naturally
$file_path = __DIR__ . $request_path;

if (is_file($file_path)) {
    // Return false to let PHP serve the file
    return false;
}

// Check if it's a directory
if (is_dir($file_path)) {
    return false;
}

// If nothing matched and it's not /api, return false so PHP can handle it
return false;



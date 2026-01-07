<?php

require_once __DIR__ . '/admin_api.php';
require_once __DIR__ . '/reviews_api.php';
require_once __DIR__ . '/auth_api.php';

function handleRequest($method, $uri) {
    // Remove base path if needed
    $path = parse_url($uri, PHP_URL_PATH);
    
    // Strip /backend prefix if present (for production deployment)
    $path = preg_replace('#^/backend#', '', $path);
    
    // Initialize database connection
    $db = Database::getInstance()->getConnection();
    
    // Auth routes
    if (strpos($path, '/api/auth') === 0) {
        handleAuthRequest($method, $path, $db);
        return;
    }
    
    // Admin routes
    if (strpos($path, '/api/admin/products') === 0) {
        handleProductsRequest($method, $path, $db);
        return;
    }
    
    if ($path === '/api/admin/upload-image' && $method === 'POST') {
        handleImageUpload();
        return;
    }
    
    // Review routes
    if (strpos($path, '/api/admin/reviews') === 0) {
        handleReviewsRequest($method, $path, $db);
        return;
    }
    
    if (strpos($path, '/api/reviews') === 0) {
        handleReviewsRequest($method, $path, $db);
        return;
    }
    
    // Define routes
    switch($path) {
        case '/':
        case '/index.php':
            if ($method === 'GET') {
                echo json_encode([
                    'success' => true,
                    'message' => 'Welcome to Yatha API',
                    'version' => '1.0.0'
                ]);
            }
            break;
            
        case '/api/test':
            if ($method === 'GET') {
                echo json_encode([
                    'success' => true,
                    'message' => 'API is working!',
                    'timestamp' => date('Y-m-d H:i:s')
                ]);
            }
            break;
            
        default:
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Route not found'
            ]);
            break;
    }
}

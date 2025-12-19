<?php

function handleRequest($method, $uri) {
    // Remove base path if needed
    $path = parse_url($uri, PHP_URL_PATH);
    
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

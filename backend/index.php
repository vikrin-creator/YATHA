<?php
// Debug logging
error_log("REQUEST_URI: " . $_SERVER['REQUEST_URI']);
error_log("REQUEST_METHOD: " . $_SERVER['REQUEST_METHOD']);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Serve images from backend uploads folder when requested via /images/... URLs
$requestUri = $_SERVER['REQUEST_URI'];
$requestPath = strtok($requestUri, '?');

// Strip /backend prefix if present
$requestPath = preg_replace('#^/backend#', '', $requestPath);

if (strpos($requestPath, '/images/') === 0) {
    // Map to backend uploads folder and decode URL
    $relativePath = urldecode(substr($requestPath, strlen('/images/')));
    
    // Only serve from backend uploads folder
    $imageFile = __DIR__ . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'images' . DIRECTORY_SEPARATOR . $relativePath;
    
    if (file_exists($imageFile)) {
        $extension = pathinfo($imageFile, PATHINFO_EXTENSION);
        $mimeTypes = [
            'png' => 'image/png',
            'jpg' => 'image/jpeg', 
            'jpeg' => 'image/jpeg',
            'gif' => 'image/gif',
            'webp' => 'image/webp'
        ];
        $mimeType = isset($mimeTypes[strtolower($extension)]) ? $mimeTypes[strtolower($extension)] : 'image/png';

        header('Content-Type: ' . $mimeType);
        header('Cache-Control: public, max-age=86400');
        readfile($imageFile);
        exit();
    } else {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Image not found: ' . $relativePath]);
        exit();
    }
}

// Set JSON content type for API responses
header('Content-Type: application/json');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/routes/api.php';

$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Remove query string
$uri = strtok($requestUri, '?');

// Route the request
handleRequest($requestMethod, $uri);

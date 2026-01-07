<?php
// Router file for PHP built-in server
// This ensures all requests go through our PHP code

$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Serve uploaded images directly
if (preg_match('#^/backend/uploads/#', $request_uri)) {
    $file_path = __DIR__ . str_replace('/backend', '', $request_uri);
    if (is_file($file_path)) {
        return false; // Let PHP serve the file
    }
}

// Serve static files directly
if (preg_match('#\.(png|jpg|jpeg|gif|webp|css|js|woff|woff2|ttf|svg|eot|ico)$#i', $request_uri)) {
    $file_path = __DIR__ . $request_uri;
    if (is_file($file_path)) {
        return false; // Let PHP serve the file
    }
}

// For everything else, route through index.php
require __DIR__ . '/index.php';
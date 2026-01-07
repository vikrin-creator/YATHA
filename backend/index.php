<?php

// This file helps with routing on servers where .htaccess might not work properly

// Set headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get the request URI
$request_uri = $_SERVER['REQUEST_URI'];

// Remove query string
$request_uri = strtok($request_uri, '?');

// Check if it's an API request
if (strpos($request_uri, '/backend/api/') !== false || strpos($request_uri, '/api/') !== false) {
    // Forward to api/index.php
    require_once __DIR__ . '/api/index.php';
    exit;
}

// For non-API requests, return 404
http_response_code(404);
echo json_encode(['error' => 'Not found']);
?>

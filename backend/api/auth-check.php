<?php

// Simple authentication test endpoint
header('Content-Type: application/json');

// Log to specific file
$debugLog = __DIR__ . '/auth-check-debug.log';
file_put_contents($debugLog, '[' . date('Y-m-d H:i:s') . '] Auth check endpoint accessed' . PHP_EOL, FILE_APPEND | LOCK_EX);

// Check if JWT is being sent
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
file_put_contents($debugLog, '[' . date('Y-m-d H:i:s') . '] Auth header: ' . $authHeader . PHP_EOL, FILE_APPEND | LOCK_EX);

// Mock response
echo json_encode([
    'success' => true,
    'message' => 'Auth test endpoint called',
    'timestamp' => date('Y-m-d H:i:s'),
    'auth_header_present' => !empty($authHeader),
    'method' => $_SERVER['REQUEST_METHOD'],
    'uri' => $_SERVER['REQUEST_URI'] ?? ''
]);

?>
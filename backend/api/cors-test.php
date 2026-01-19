<?php
// CORS Test Script
// This helps verify if CORS headers are being sent correctly

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

echo json_encode([
    'success' => true,
    'message' => 'CORS test endpoint working',
    'method' => $_SERVER['REQUEST_METHOD'],
    'headers' => getallheaders(),
    'timestamp' => date('Y-m-d H:i:s')
]);
?>

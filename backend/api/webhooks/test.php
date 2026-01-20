<?php
// Simple test endpoint for webhook
header('Content-Type: application/json');
echo json_encode([
    'status' => 'success',
    'message' => 'Webhook test endpoint works',
    'request_method' => $_SERVER['REQUEST_METHOD'],
    'request_path' => $_SERVER['REQUEST_URI'],
    'time' => date('Y-m-d H:i:s')
]);
?>

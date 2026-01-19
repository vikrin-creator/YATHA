<?php
/**
 * Simple Webhook Test Endpoint
 * This logs ANY request to verify the webhook URL is reachable
 */

error_reporting(E_ALL);
ini_set('display_errors', '1');

$log_file = __DIR__ . '/webhook-test.log';

// Log the request
$timestamp = date('Y-m-d H:i:s');
$method = $_SERVER['REQUEST_METHOD'] ?? 'UNKNOWN';
$headers = json_encode(getallheaders());
$body = file_get_contents('php://input');

$log_entry = "[{$timestamp}] {$method} request received\n";
$log_entry .= "Headers: {$headers}\n";
$log_entry .= "Body length: " . strlen($body) . "\n";
$log_entry .= "Body: " . substr($body, 0, 200) . "\n";
$log_entry .= "---\n";

file_put_contents($log_file, $log_entry, FILE_APPEND);

// Respond
header('Content-Type: application/json');
echo json_encode([
    'success' => true,
    'message' => 'Test webhook received',
    'timestamp' => $timestamp,
    'method' => $method
]);

?>
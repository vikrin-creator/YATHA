<?php
/**
 * Simple webhook test endpoint
 * Returns last 10 webhook events processed
 */

header('Content-Type: application/json');

$logFile = __DIR__ . '/webhook_events.log';

if (!file_exists($logFile)) {
    echo json_encode(['error' => 'No webhook events logged yet', 'file' => $logFile]);
    exit;
}

$lines = file($logFile);
$lastLines = array_slice($lines, -10);

echo json_encode([
    'total_lines' => count($lines),
    'last_10_events' => $lastLines,
    'file' => $logFile
]);

<?php

// Simple log test script
ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "Testing log functionality...<br>";

// Check where error_log() writes to
echo "Error log location: " . ini_get('error_log') . "<br>";
echo "Log errors enabled: " . (ini_get('log_errors') ? 'YES' : 'NO') . "<br>";

// Test basic error_log
error_log('[LOG TEST] This is a test log entry from log-test.php');

// Test writing to a specific file
$logFile = __DIR__ . '/test-debug.log';
error_log('[LOG TEST] Writing to specific file: ' . date('Y-m-d H:i:s'), 3, $logFile);

// Check if the file was created
if (file_exists($logFile)) {
    echo "Log file created successfully at: " . $logFile . "<br>";
    echo "Contents: <pre>" . file_get_contents($logFile) . "</pre>";
} else {
    echo "Log file was NOT created<br>";
}

// Show PHP info for logging configuration
echo "<h3>PHP Logging Configuration:</h3>";
echo "error_log: " . ini_get('error_log') . "<br>";
echo "log_errors: " . ini_get('log_errors') . "<br>";
echo "log_errors_max_len: " . ini_get('log_errors_max_len') . "<br>";

// Check if we can write to error_log directory
$errorLogDir = dirname(ini_get('error_log'));
if (is_writable($errorLogDir)) {
    echo "Error log directory is writable<br>";
} else {
    echo "Error log directory is NOT writable<br>";
}

?>
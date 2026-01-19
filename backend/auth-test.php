<?php

// Test authentication logging specifically
header('Content-Type: application/json');

// Enable all error reporting
error_reporting(E_ALL);
ini_set('display_errors', '1');

// Set up the same logging as checkout.php
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    error_log("[auth-test] PHP Error ({$errno}): {$errstr} in {$errfile}:{$errline}");
}, E_ALL);

echo json_encode(['test' => 'starting']) . "\n";

// Test basic logging
error_log('[auth-test] Starting authentication test');

try {
    // Simulate what happens in checkout.php
    error_log('[auth-test] Authentication attempt started');
    
    // Mock user data
    $user = ['user_id' => 999, 'role' => 'test_user'];
    error_log('[auth-test] User authenticated: ' . json_encode($user));
    
    echo json_encode([
        'success' => true,
        'message' => 'Authentication test completed',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
} catch (Exception $e) {
    error_log('[auth-test] Exception: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

error_log('[auth-test] Test completed');

?>
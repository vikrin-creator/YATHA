<?php
// Main entry point - handle routing for development server
// This file acts as a router for the PHP built-in server

$request_path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Serve static files directly (but not /api routes)
if (strpos($request_path, '/api') !== 0 && file_exists(__DIR__ . $request_path)) {
    return false; // Let PHP serve the file
}

// Route to API
require_once __DIR__ . '/../api/index.php';
?>

<?php
// Router file for PHP built-in server
// This ensures all requests go through our PHP code

$requested_file = __DIR__ . $_SERVER['REQUEST_URI'];

// Only serve actual files (not directories) if they exist outside our special routes
if (is_file($requested_file) && !preg_match('#\.(png|jpg|jpeg|gif|webp|css|js|woff|woff2|ttf|svg|eot)$#i', $_SERVER['REQUEST_URI'])) {
    return false; // Let the server serve it
}

// For everything else (including /images/), route through index.php
require __DIR__ . '/index.php';
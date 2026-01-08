<?php

header('Content-Type: application/json');

error_reporting(E_ALL);
ini_set('display_errors', '0');

require_once __DIR__ . '/../src/utils/Response.php';
require_once __DIR__ . '/../src/utils/JWT.php';
require_once __DIR__ . '/../src/middleware/AuthMiddleware.php';
require_once __DIR__ . '/../src/config/Database.php';

try {
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method !== 'POST') {
        Response::error('Method not allowed', 405);
        exit;
    }

    // Verify JWT token and admin access
    $user = AuthMiddleware::verify();
    $database = new Database();
    $db = $database->connect();

    if (!$db) {
        throw new Exception('Database connection failed');
    }

    verifyAdmin($db, $user['user_id'], $user['role'] ?? null);

    // Check if file was uploaded
    if (!isset($_FILES['image'])) {
        Response::error('No image file provided', 400);
        exit;
    }

    $file = $_FILES['image'];

// Upload directory should be in public folder, not api folder
$upload_dir = __DIR__ . '/../public/uploads/images/';

error_log("Upload directory: " . $upload_dir);
error_log("Directory exists: " . (is_dir($upload_dir) ? 'yes' : 'no'));

// Create directory if it doesn't exist
if (!is_dir($upload_dir)) {
    if (!mkdir($upload_dir, 0755, true)) {
        Response::error('Failed to create upload directory', 500);
        exit;
    }
    error_log("Created upload directory");
}

// Validate file
$allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
if (!in_array($file['type'], $allowed_types)) {
    error_log("Invalid file type: " . $file['type']);
    Response::error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.', 400);
    exit;
}

$max_size = 5 * 1024 * 1024; // 5MB
if ($file['size'] > $max_size) {
    error_log("File too large: " . $file['size']);
    Response::error('File size exceeds 5MB limit', 400);
    exit;
}

// Generate unique filename
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = uniqid('img_') . '.' . $extension;
$filepath = $upload_dir . $filename;

error_log("Filename: " . $filename);
error_log("Full path: " . $filepath);
error_log("File size: " . $file['size']);

// Move uploaded file
if (move_uploaded_file($file['tmp_name'], $filepath)) {
    error_log("File uploaded successfully");
    Response::success(
        ['url' => '/public/uploads/images/' . $filename, 'filename' => $filename],
        'Image uploaded successfully',
        201
    );
} else {
    error_log("Failed to move file from: " . $file['tmp_name'] . " to: " . $filepath);
    error_log("Error: " . error_get_last());
    Response::error('Failed to upload image', 500);
}
} catch (Exception $e) {
    Response::error($e->getMessage(), 500);
}

function verifyAdmin($db, $user_id, $user_role = null)
{
    // If role is passed from JWT token, check it directly
    if ($user_role !== null) {
        if ($user_role !== 'admin') {
            Response::error('Admin access required', 403);
        }
        return;
    }
    
    // Fallback: query database if role not provided
    $query = "SELECT role FROM users WHERE id = ?";
    $stmt = $db->prepare($query);
    $stmt->bind_param('i', $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    
    if (!$user || $user['role'] !== 'admin') {
        Response::error('Admin access required', 403);
    }
}
?>

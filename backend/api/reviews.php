<?php

// Set JSON header immediately
header('Content-Type: application/json');

// Error handling
error_reporting(E_ALL);
ini_set('display_errors', '0');

require_once __DIR__ . '/../src/utils/Response.php';
require_once __DIR__ . '/../src/utils/JWT.php';
require_once __DIR__ . '/../src/middleware/AuthMiddleware.php';
require_once __DIR__ . '/../src/config/Database.php';

try {
    $method = $_SERVER['REQUEST_METHOD'];
    $input = json_decode(file_get_contents('php://input'), true);

    $database = new Database();
    $db = $database->connect();

    if (!$db) {
        throw new Exception('Database connection failed');
    }

    // Get review ID from URL if available
    $request_path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $path_parts = array_filter(explode('/', $request_path));
    $review_id = end($path_parts) !== 'reviews' ? end($path_parts) : null;

    if ($method === 'GET') {
        getReviews($db);
    } elseif ($method === 'POST') {
        // Optional authentication - allow guest reviews too
        $user_id = null;
        if (isset(getallheaders()['Authorization'])) {
            try {
                $user = AuthMiddleware::verify();
                $user_id = isset($user['user_id']) ? $user['user_id'] : null;
            } catch (Exception $e) {
                // If verification fails, allow guest review
                $user_id = null;
            }
        }
        createReview($db, $input, $user_id);
    } elseif ($method === 'PUT') {
        $user = AuthMiddleware::verify();
        verifyAdmin($db, $user['user_id'], $user['role'] ?? null);
        updateReview($db, $input, $review_id, $user['user_id']);
    } elseif ($method === 'DELETE') {
        $user = AuthMiddleware::verify();
        verifyAdmin($db, $user['user_id'], $user['role'] ?? null);
        deleteReview($db, $review_id, $user['user_id']);
    } else {
        Response::error('Method not allowed', 405);
    }
} catch (Exception $e) {
    Response::error($e->getMessage(), 500);
}

function getReviews($db)
{
    $product_id = isset($_GET['product_id']) ? intval($_GET['product_id']) : null;

    if ($product_id) {
        $query = "SELECT r.*, p.name as product_name, u.name as customer_name, u.email as customer_email 
                  FROM reviews r 
                  LEFT JOIN products p ON r.product_id = p.id 
                  LEFT JOIN users u ON r.user_id = u.id 
                  WHERE r.product_id = ? 
                  ORDER BY r.created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->bind_param('i', $product_id);
        $stmt->execute();
        $result = $stmt->get_result();
    } else {
        $query = "SELECT r.*, p.name as product_name, u.name as customer_name, u.email as customer_email 
                  FROM reviews r 
                  LEFT JOIN products p ON r.product_id = p.id 
                  LEFT JOIN users u ON r.user_id = u.id 
                  ORDER BY r.created_at DESC";
        $result = $db->query($query);
    }

    $reviews = [];
    while ($row = $result->fetch_assoc()) {
        $reviews[] = $row;
    }

    Response::success($reviews, 'Reviews fetched successfully');
}

function createReview($db, $input, $user_id)
{
    if (!isset($input['product_id']) || !isset($input['rating'])) {
        Response::validationError(['message' => 'Missing required fields']);
    }

    $product_id = intval($input['product_id']);
    $rating = intval($input['rating']);
    $comment = trim($input['comment'] ?? '');
    $customer_name = trim($input['customer_name'] ?? '');
    $customer_email = trim($input['customer_email'] ?? '');
    $title = trim($input['title'] ?? '');
    $status = trim($input['status'] ?? 'pending');

    // If user is authenticated, use their name and email from database
    if ($user_id) {
        $user_stmt = $db->prepare("SELECT name, email FROM users WHERE id = ?");
        $user_stmt->bind_param('i', $user_id);
        $user_stmt->execute();
        $user_result = $user_stmt->get_result();
        
        if ($user_result->num_rows > 0) {
            $user = $user_result->fetch_assoc();
            $customer_name = $user['name'];
            $customer_email = $user['email'];
        }
    }

    if ($rating < 1 || $rating > 5) {
        Response::validationError(['rating' => 'Rating must be between 1 and 5']);
    }

    // Check if product exists
    $product_check = $db->prepare("SELECT id FROM products WHERE id = ?");
    $product_check->bind_param('i', $product_id);
    $product_check->execute();
    $product_result = $product_check->get_result();
    
    if ($product_result->num_rows === 0) {
        Response::error('Product not found', 404);
    }

    // Try to insert with status column first (if it exists)
    $query = "INSERT INTO reviews (product_id, user_id, rating, title, comment, status, created_at) 
              VALUES (?, ?, ?, ?, ?, ?, NOW())";
    $stmt = $db->prepare($query);
    
    if (!$stmt) {
        // If query fails, try without status column (backward compatibility)
        $query = "INSERT INTO reviews (product_id, user_id, rating, title, comment, created_at) 
                  VALUES (?, ?, ?, ?, ?, NOW())";
        $stmt = $db->prepare($query);
        
        if (!$stmt) {
            Response::error('Database error: ' . $db->error, 500);
        }
        
        // Bind without status
        $stmt->bind_param('iiiss', $product_id, $user_id, $rating, $title, $comment);
    } else {
        // Bind with status
        $stmt->bind_param('iiisss', $product_id, $user_id, $rating, $title, $comment, $status);
    }

    if ($stmt->execute()) {
        Response::success(
            ['review_id' => $stmt->insert_id],
            'Review submitted successfully! It will appear after admin approval.',
            201
        );
    } else {
        Response::error('Failed to create review: ' . $stmt->error, 500);
    }
}

function updateReview($db, $input, $review_id, $user_id)
{
    if (!$review_id) {
        Response::error('Review ID is required', 400);
        return;
    }

    // Check if review exists and user owns it
    $check = $db->prepare("SELECT id, user_id FROM reviews WHERE id = ?");
    $check->bind_param('i', $review_id);
    $check->execute();
    $review = $check->get_result()->fetch_assoc();
    
    if (!$review) {
        Response::error('Review not found', 404);
        return;
    }
    
    if ($review['user_id'] !== $user_id) {
        Response::error('Unauthorized to update this review', 403);
        return;
    }

    // Build update query dynamically
    $updates = [];
    $params = [];
    $types = '';

    $allowed_fields = ['title', 'rating', 'comment', 'status'];
    
    foreach ($allowed_fields as $field) {
        if (isset($input[$field])) {
            $updates[] = "$field = ?";
            
            if ($field === 'rating') {
                $rating = intval($input[$field]);
                if ($rating < 1 || $rating > 5) {
                    Response::validationError(['rating' => 'Rating must be between 1 and 5']);
                    return;
                }
                $params[] = $rating;
                $types .= 'i';
            } else {
                $params[] = trim($input[$field]);
                $types .= 's';
            }
        }
    }

    if (empty($updates)) {
        Response::error('No fields to update', 400);
        return;
    }

    $updates[] = "updated_at = NOW()";
    $params[] = $review_id;
    $types .= 'i';

    $query = "UPDATE reviews SET " . implode(', ', $updates) . " WHERE id = ?";
    $stmt = $db->prepare($query);
    $stmt->bind_param($types, ...$params);

    if ($stmt->execute()) {
        Response::success(['review_id' => $review_id], 'Review updated successfully');
    } else {
        Response::error('Failed to update review: ' . $db->error, 500);
    }
}

function deleteReview($db, $review_id, $user_id)
{
    if (!$review_id) {
        Response::error('Review ID is required', 400);
        return;
    }

    // Check if review exists
    $check = $db->prepare("SELECT id FROM reviews WHERE id = ?");
    $check->bind_param('i', $review_id);
    $check->execute();
    $review = $check->get_result()->fetch_assoc();
    
    if (!$review) {
        Response::error('Review not found', 404);
        return;
    }

    $query = "DELETE FROM reviews WHERE id = ?";
    $stmt = $db->prepare($query);
    $stmt->bind_param('i', $review_id);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            Response::success(['review_id' => $review_id], 'Review deleted successfully');
        } else {
            Response::error('Review not found', 404);
        }
    } else {
        Response::error('Failed to delete review', 500);
    }
}

function verifyAdmin($db, $user_id, $user_role = null)
{
    if ($user_role !== null && $user_role !== 'admin') {
        Response::error('Admin access required', 403);
    } elseif ($user_role === null) {
        // Fallback: query database if role not provided via JWT
        $query = "SELECT role FROM users WHERE id = ?";
        $stmt = $db->prepare($query);
        if (!$stmt) {
            Response::error('Database error', 500);
        }
        $stmt->bind_param('i', $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();

        if (!$user || $user['role'] !== 'admin') {
            Response::error('Admin access required', 403);
        }
    }
}
?>

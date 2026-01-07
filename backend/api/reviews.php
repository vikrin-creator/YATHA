<?php

require_once __DIR__ . '/../src/utils/Response.php';
require_once __DIR__ . '/../src/utils/JWT.php';
require_once __DIR__ . '/../src/middleware/AuthMiddleware.php';
require_once __DIR__ . '/../src/config/Database.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

$database = new Database();
$db = $database->connect();

// Get review ID from URL if available
$request_path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path_parts = array_filter(explode('/', $request_path));
$review_id = end($path_parts) !== 'reviews' ? end($path_parts) : null;

if ($method === 'GET') {
    getReviews($db);
} elseif ($method === 'POST') {
    $user = AuthMiddleware::verify();
    createReview($db, $input, $user['user_id']);
} elseif ($method === 'PUT') {
    updateReview($db, $input, $review_id);
} elseif ($method === 'DELETE') {
    deleteReview($db, $review_id);
} else {
    Response::error('Method not allowed', 405);
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

    if ($rating < 1 || $rating > 5) {
        Response::validationError(['rating' => 'Rating must be between 1 and 5']);
    }

    $query = "INSERT INTO reviews (product_id, user_id, rating, comment, created_at) VALUES (?, ?, ?, ?, NOW())";
    $stmt = $db->prepare($query);
    $stmt->bind_param('iiis', $product_id, $user_id, $rating, $comment);

    if ($stmt->execute()) {
        Response::success(
            ['review_id' => $stmt->insert_id],
            'Review created successfully',
            201
        );
    } else {
        Response::error('Failed to create review', 500);
    }
}

function updateReview($db, $input, $review_id)
{
    if (!$review_id) {
        Response::error('Review ID is required', 400);
        return;
    }

    // Check if review exists
    $check = $db->prepare("SELECT id FROM reviews WHERE id = ?");
    $check->bind_param('i', $review_id);
    $check->execute();
    if (!$check->get_result()->fetch_assoc()) {
        Response::error('Review not found', 404);
        return;
    }

    // Build update query dynamically
    $updates = [];
    $params = [];
    $types = '';

    $allowed_fields = ['rating', 'comment', 'status'];
    
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

function deleteReview($db, $review_id)
{
    if (!$review_id) {
        Response::error('Review ID is required', 400);
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
?>

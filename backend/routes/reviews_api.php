<?php

function handleReviewsRequest($method, $uri, $db) {
    switch($method) {
        case 'GET':
            if (preg_match('/\/api\/reviews\/(\d+)/', $uri, $matches)) {
                // Get reviews for a specific product
                getProductReviews($db, $matches[1]);
            } else {
                // Get all reviews (admin)
                getAllReviews($db);
            }
            break;
        case 'POST':
            createReview($db);
            break;
        case 'PUT':
            if (preg_match('/\/api\/admin\/reviews\/(\d+)/', $uri, $matches)) {
                updateReview($db, $matches[1]);
            }
            break;
        case 'DELETE':
            if (preg_match('/\/api\/admin\/reviews\/(\d+)/', $uri, $matches)) {
                deleteReview($db, $matches[1]);
            }
            break;
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}

function getProductReviews($db, $productId) {
    try {
        $stmt = $db->prepare("
            SELECT * FROM reviews 
            WHERE product_id = ? AND status = 'approved'
            ORDER BY created_at DESC
        ");
        $stmt->execute([$productId]);
        $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'data' => $reviews
        ]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

function getAllReviews($db) {
    try {
        $stmt = $db->prepare("
            SELECT r.*, p.name as product_name, p.slug
            FROM reviews r
            LEFT JOIN products p ON r.product_id = p.id
            ORDER BY r.created_at DESC
        ");
        $stmt->execute();
        $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'data' => $reviews
        ]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

function createReview($db) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $db->prepare("
            INSERT INTO reviews (product_id, customer_name, customer_email, title, rating, comment, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $input['product_id'],
            $input['customer_name'] ?? 'Anonymous',
            $input['customer_email'] ?? '',
            $input['title'] ?? '',
            $input['rating'] ?? 5,
            $input['comment'] ?? '',
            $input['status'] ?? 'pending'
        ]);

        $reviewId = $db->lastInsertId();

        echo json_encode([
            'success' => true,
            'data' => ['id' => $reviewId],
            'message' => 'Review submitted successfully'
        ]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

function updateReview($db, $id) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $db->prepare("
            UPDATE reviews 
            SET customer_name = ?, customer_email = ?, title = ?, rating = ?, comment = ?, status = ?
            WHERE id = ?
        ");
        
        $stmt->execute([
            $input['customer_name'] ?? 'Anonymous',
            $input['customer_email'] ?? '',
            $input['title'] ?? '',
            $input['rating'] ?? 5,
            $input['comment'] ?? '',
            $input['status'] ?? 'pending',
            $id
        ]);

        echo json_encode([
            'success' => true,
            'message' => 'Review updated successfully'
        ]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

function deleteReview($db, $id) {
    try {
        $stmt = $db->prepare("DELETE FROM reviews WHERE id = ?");
        $stmt->execute([$id]);

        if ($stmt->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Review deleted successfully'
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Review not found']);
        }
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

?>

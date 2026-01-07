<?php

function handleProductsRequest($method, $uri, $db) {
    switch($method) {
        case 'GET':
            if (preg_match('/\/api\/admin\/products\/(\d+)/', $uri, $matches)) {
                // Get single product
                getProduct($db, $matches[1]);
            } else {
                // Get all products
                getAllProducts($db);
            }
            break;
        case 'POST':
            createProduct($db);
            break;
        case 'PUT':
            if (preg_match('/\/api\/admin\/products\/(\d+)/', $uri, $matches)) {
                updateProduct($db, $matches[1]);
            }
            break;
        case 'DELETE':
            if (preg_match('/\/api\/admin\/products\/(\d+)/', $uri, $matches)) {
                deleteProduct($db, $matches[1]);
            }
            break;
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}

function getAllProducts($db) {
    try {
        $stmt = $db->prepare("
            SELECT p.*, 
                   GROUP_CONCAT(pi.image_url ORDER BY pi.sort_order) as images
            FROM products p 
            LEFT JOIN product_images pi ON p.id = pi.product_id 
            GROUP BY p.id 
            ORDER BY p.created_at DESC
        ");
        $stmt->execute();
        $products = $stmt->fetchAll();

        // Process images
        foreach ($products as &$product) {
            $product['images'] = $product['images'] ? explode(',', $product['images']) : [];
        }

        echo json_encode([
            'success' => true,
            'data' => $products
        ]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

function getProduct($db, $id) {
    try {
        $stmt = $db->prepare("
            SELECT p.*, 
                   GROUP_CONCAT(pi.image_url ORDER BY pi.sort_order) as images
            FROM products p 
            LEFT JOIN product_images pi ON p.id = pi.product_id 
            WHERE p.id = ? 
            GROUP BY p.id
        ");
        $stmt->execute([$id]);
        $product = $stmt->fetch();

        if ($product) {
            $product['images'] = $product['images'] ? explode(',', $product['images']) : [];
            echo json_encode([
                'success' => true,
                'data' => $product
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Product not found']);
        }
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

function createProduct($db) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $db->prepare("
            INSERT INTO products (name, slug, description, short_description, price, original_price, stock_quantity, category, status, featured) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $input['name'],
            $input['slug'],
            $input['description'],
            $input['short_description'],
            $input['price'],
            $input['original_price'] ?? null,
            $input['stock_quantity'] ?? 0,
            $input['category'] ?? 'Superfood Powders',
            $input['status'] ?? 'active',
            $input['featured'] ?? false
        ]);

        $productId = $db->lastInsertId();

        // Handle images
        if (isset($input['images']) && is_array($input['images'])) {
            foreach ($input['images'] as $index => $imageUrl) {
                $imgStmt = $db->prepare("
                    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) 
                    VALUES (?, ?, ?, ?, ?)
                ");
                $imgStmt->execute([
                    $productId,
                    $imageUrl,
                    $input['name'] . ' Image',
                    $index === 0,
                    $index + 1
                ]);
            }
        }

        echo json_encode([
            'success' => true,
            'data' => ['id' => $productId],
            'message' => 'Product created successfully'
        ]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

function updateProduct($db, $id) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $db->prepare("
            UPDATE products 
            SET name = ?, slug = ?, description = ?, short_description = ?, price = ?, 
                original_price = ?, stock_quantity = ?, category = ?, status = ?, featured = ?
            WHERE id = ?
        ");
        
        $stmt->execute([
            $input['name'],
            $input['slug'],
            $input['description'],
            $input['short_description'],
            $input['price'],
            $input['original_price'] ?? null,
            $input['stock_quantity'] ?? 0,
            $input['category'] ?? 'Superfood Powders',
            $input['status'] ?? 'active',
            $input['featured'] ?? false,
            $id
        ]);

        // Update images if provided
        if (isset($input['images']) && is_array($input['images'])) {
            // Delete existing images
            $deleteStmt = $db->prepare("DELETE FROM product_images WHERE product_id = ?");
            $deleteStmt->execute([$id]);

            // Add new images
            foreach ($input['images'] as $index => $imageUrl) {
                $imgStmt = $db->prepare("
                    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) 
                    VALUES (?, ?, ?, ?, ?)
                ");
                $imgStmt->execute([
                    $id,
                    $imageUrl,
                    $input['name'] . ' Image',
                    $index === 0,
                    $index + 1
                ]);
            }
        }

        echo json_encode([
            'success' => true,
            'message' => 'Product updated successfully'
        ]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

function deleteProduct($db, $id) {
    try {
        $stmt = $db->prepare("DELETE FROM products WHERE id = ?");
        $stmt->execute([$id]);

        if ($stmt->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Product deleted successfully'
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Product not found']);
        }
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

function handleImageUpload() {
    if (!isset($_FILES['image'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'No image file provided']);
        return;
    }

    $uploadedFile = $_FILES['image'];
    
    // Validate file type
    $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!in_array($uploadedFile['type'], $allowedTypes)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed']);
        return;
    }

    // Validate file size (max 5MB)
    if ($uploadedFile['size'] > 5 * 1024 * 1024) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'File too large. Maximum size is 5MB']);
        return;
    }

    // Generate unique filename
    $extension = pathinfo($uploadedFile['name'], PATHINFO_EXTENSION);
    $filename = uniqid() . '_' . time() . '.' . $extension;
    
    // Ensure uploads directory exists
    $uploadDir = __DIR__ . '/../uploads/images/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    $uploadPath = $uploadDir . $filename;

    // Move uploaded file
    if (move_uploaded_file($uploadedFile['tmp_name'], $uploadPath)) {
        echo json_encode([
            'success' => true,
            'data' => [
                'filename' => $filename,
                'url' => '/backend/uploads/images/' . $filename,
                'size' => $uploadedFile['size']
            ],
            'message' => 'Image uploaded successfully'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to upload image. Check directory permissions.']);
    }
}

?>
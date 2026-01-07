<?php

require_once __DIR__ . '/../src/utils/Response.php';
require_once __DIR__ . '/../src/config/Database.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

$database = new Database();
$db = $database->connect();

// Get product ID from URL if available
$request_path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path_parts = array_filter(explode('/', $request_path));
$product_id = end($path_parts) !== 'products' ? end($path_parts) : null;

if ($method === 'GET') {
    getProducts($db, $product_id);
} elseif ($method === 'POST') {
    createProduct($db, $input);
} elseif ($method === 'PUT') {
    updateProduct($db, $input, $product_id);
} elseif ($method === 'DELETE') {
    deleteProduct($db, $product_id);
} else {
    Response::error('Method not allowed', 405);
}

function getProducts($db, $product_id = null)
{
    if ($product_id) {
        // Get single product
        $query = "SELECT * FROM products WHERE id = ?";
        $stmt = $db->prepare($query);
        $stmt->bind_param('i', $product_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $product = $result->fetch_assoc();
        
        if ($product) {
            // Get additional images
            $img_query = "SELECT image_url FROM product_images WHERE product_id = ? ORDER BY display_order";
            $img_stmt = $db->prepare($img_query);
            $img_stmt->bind_param('i', $product_id);
            $img_stmt->execute();
            $img_result = $img_stmt->get_result();
            $product['additional_images'] = [];
            while ($img = $img_result->fetch_assoc()) {
                $product['additional_images'][] = $img['image_url'];
            }
            Response::success($product, 'Product fetched successfully');
        } else {
            Response::error('Product not found', 404);
        }
    } else {
        // Get all products
        $query = "SELECT * FROM products ORDER BY created_at DESC";
        $result = $db->query($query);

        $products = [];
        while ($row = $result->fetch_assoc()) {
            // Get additional images for each product
            $img_query = "SELECT image_url FROM product_images WHERE product_id = ? ORDER BY display_order";
            $img_stmt = $db->prepare($img_query);
            $img_stmt->bind_param('i', $row['id']);
            $img_stmt->execute();
            $img_result = $img_stmt->get_result();
            $row['additional_images'] = [];
            while ($img = $img_result->fetch_assoc()) {
                $row['additional_images'][] = $img['image_url'];
            }
            $products[] = $row;
        }

        Response::success($products, 'Products fetched successfully');
    }
}

function createProduct($db, $input)
{
    if (!isset($input['name']) || !isset($input['price'])) {
        Response::validationError(['message' => 'Missing required fields']);
        return;
    }

    $name = trim($input['name']);
    $slug = trim($input['slug'] ?? '');
    $description = trim($input['description'] ?? '');
    $short_description = trim($input['short_description'] ?? '');
    $price = floatval($input['price']);
    $original_price = isset($input['original_price']) ? floatval($input['original_price']) : $price;
    $stock_quantity = isset($input['stock_quantity']) ? intval($input['stock_quantity']) : 0;
    $category = trim($input['category'] ?? 'General');
    $status = trim($input['status'] ?? 'active');
    $featured = isset($input['featured']) ? (bool)$input['featured'] : false;
    $image = $input['image'] ?? null;

    $query = "INSERT INTO products (name, slug, description, short_description, price, original_price, stock_quantity, category, status, featured, image, created_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
    $stmt = $db->prepare($query);
    $stmt->bind_param('ssssddiisbs', $name, $slug, $description, $short_description, $price, $original_price, $stock_quantity, $category, $status, $featured, $image);

    if ($stmt->execute()) {
        $product_id = $stmt->insert_id;
        
        // Save additional images if provided
        if (isset($input['additional_images']) && is_array($input['additional_images'])) {
            $img_query = "INSERT INTO product_images (product_id, image_url, display_order) VALUES (?, ?, ?)";
            $img_stmt = $db->prepare($img_query);
            foreach ($input['additional_images'] as $index => $img_url) {
                if (!empty($img_url)) {
                    $img_stmt->bind_param('isi', $product_id, $img_url, $index);
                    $img_stmt->execute();
                }
            }
        }
        
        Response::success(
            ['product_id' => $product_id],
            'Product created successfully',
            201
        );
    } else {
        Response::error('Failed to create product: ' . $db->error, 500);
    }
}

function updateProduct($db, $input, $product_id)
{
    if (!$product_id) {
        Response::error('Product ID is required', 400);
        return;
    }

    // Log incoming data for debugging
    error_log("Update Product ID: " . $product_id);
    error_log("Input data: " . json_encode($input));

    // Check if product exists
    $check = $db->prepare("SELECT id FROM products WHERE id = ?");
    $check->bind_param('i', $product_id);
    $check->execute();
    if (!$check->get_result()->fetch_assoc()) {
        Response::error('Product not found', 404);
        return;
    }

    // Build update query dynamically based on provided fields
    $updates = [];
    $params = [];
    $types = '';

    $allowed_fields = ['name', 'slug', 'description', 'short_description', 'price', 'original_price', 'stock_quantity', 'category', 'status', 'featured', 'image'];
    
    foreach ($allowed_fields as $field) {
        if (isset($input[$field])) {
            // Skip empty image field - keep existing image
            if ($field === 'image' && trim($input[$field]) === '') {
                error_log("Skipping empty image field");
                continue;
            }
            
            $updates[] = "$field = ?";
            
            // Handle different data types
            if ($field === 'price' || $field === 'original_price') {
                $params[] = floatval($input[$field]);
                $types .= 'd';
                error_log("Field: $field = " . floatval($input[$field]) . " (float)");
            } elseif ($field === 'stock_quantity') {
                $params[] = intval($input[$field]);
                $types .= 'i';
                error_log("Field: $field = " . intval($input[$field]) . " (int)");
            } elseif ($field === 'featured') {
                // Convert boolean to integer (0 or 1)
                $featured_val = (int)(bool)$input[$field];
                $params[] = $featured_val;
                $types .= 'i';
                error_log("Field: $field = " . $featured_val . " (featured bool->int)");
            } else {
                $params[] = trim($input[$field]);
                $types .= 's';
                error_log("Field: $field = " . trim($input[$field]) . " (string)");
            }
        }
    }

    if (empty($updates)) {
        Response::error('No fields to update', 400);
        return;
    }

    $updates[] = "updated_at = NOW()";
    $params[] = $product_id;
    $types .= 'i';

    error_log("Update query: UPDATE products SET " . implode(', ', $updates) . " WHERE id = ?");
    error_log("Types: " . $types);

    $query = "UPDATE products SET " . implode(', ', $updates) . " WHERE id = ?";
    $stmt = $db->prepare($query);
    
    if (!$stmt) {
        Response::error('Prepare failed: ' . $db->error, 500);
        return;
    }
    
    $stmt->bind_param($types, ...$params);

    if ($stmt->execute()) {
        error_log("Update successful. Affected rows: " . $stmt->affected_rows);
        
        // Update additional images if provided
        if (isset($input['additional_images']) && is_array($input['additional_images'])) {
            // Delete existing additional images
            $del_query = "DELETE FROM product_images WHERE product_id = ?";
            $del_stmt = $db->prepare($del_query);
            $del_stmt->bind_param('i', $product_id);
            $del_stmt->execute();
            
            // Insert new additional images
            $img_query = "INSERT INTO product_images (product_id, image_url, display_order) VALUES (?, ?, ?)";
            $img_stmt = $db->prepare($img_query);
            foreach ($input['additional_images'] as $index => $img_url) {
                if (!empty($img_url)) {
                    $img_stmt->bind_param('isi', $product_id, $img_url, $index);
                    $img_stmt->execute();
                    error_log("Saved additional image: " . $img_url);
                }
            }
        }
        
        Response::success(['product_id' => $product_id], 'Product updated successfully');
    } else {
        error_log("Update failed: " . $stmt->error);
        Response::error('Failed to update product: ' . $db->error, 500);
    }
}

function deleteProduct($db, $product_id)
{
    if (!$product_id) {
        Response::error('Product ID is required', 400);
        return;
    }

    $query = "DELETE FROM products WHERE id = ?";
    $stmt = $db->prepare($query);
    $stmt->bind_param('i', $product_id);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            Response::success(['product_id' => $product_id], 'Product deleted successfully');
        } else {
            Response::error('Product not found', 404);
        }
    } else {
        Response::error('Failed to delete product', 500);
    }
}
?>

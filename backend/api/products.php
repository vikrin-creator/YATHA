<?php

header('Content-Type: application/json');

error_reporting(E_ALL);
ini_set('display_errors', '0');

// Load .env file
if (file_exists(__DIR__ . '/../.env')) {
    $envLines = file(__DIR__ . '/../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($envLines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            [$key, $value] = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value, '\'\'');
            if (!getenv($key)) {
                putenv("$key=$value");
            }
        }
    }
}

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

    // Get product ID from URL if available
    $request_path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $path_parts = array_filter(explode('/', $request_path));
    $product_id = end($path_parts) !== 'products' ? end($path_parts) : null;

    if ($method === 'GET') {
        getProducts($db, $product_id);
    } elseif ($method === 'POST') {
        $user = AuthMiddleware::verify();
        verifyAdmin($db, $user['user_id'], $user['role'] ?? null);
        createProduct($db, $input);
    } elseif ($method === 'PUT') {
        $user = AuthMiddleware::verify();
        verifyAdmin($db, $user['user_id'], $user['role'] ?? null);
        updateProduct($db, $input, $product_id);
    } elseif ($method === 'DELETE') {
        $user = AuthMiddleware::verify();
        verifyAdmin($db, $user['user_id'], $user['role'] ?? null);
        deleteProduct($db, $product_id);
    } else {
        Response::error('Method not allowed', 405);
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
            
            // Get product variants
            $var_query = "SELECT id, weight, price, original_price, stock_quantity FROM product_variants WHERE product_id = ? ORDER BY created_at ASC";
            $var_stmt = $db->prepare($var_query);
            $var_stmt->bind_param('i', $product_id);
            $var_stmt->execute();
            $var_result = $var_stmt->get_result();
            $product['variants'] = [];
            while ($var = $var_result->fetch_assoc()) {
                $product['variants'][] = $var;
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
            
            // Get product variants
            $var_query = "SELECT id, weight, price, original_price, stock_quantity FROM product_variants WHERE product_id = ? ORDER BY created_at ASC";
            $var_stmt = $db->prepare($var_query);
            $var_stmt->bind_param('i', $row['id']);
            $var_stmt->execute();
            $var_result = $var_stmt->get_result();
            $row['variants'] = [];
            while ($var = $var_result->fetch_assoc()) {
                $row['variants'][] = $var;
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
    $subscription_eligible = isset($input['subscription_eligible']) ? (bool)$input['subscription_eligible'] : true;
    $default_shipment_quantity = isset($input['default_shipment_quantity']) ? intval($input['default_shipment_quantity']) : 1;

    $query = "INSERT INTO products (name, slug, description, short_description, price, original_price, stock_quantity, category, status, featured, image, subscription_eligible, default_shipment_quantity, created_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
    $stmt = $db->prepare($query);
    $stmt->bind_param('ssssddiisbsii', $name, $slug, $description, $short_description, $price, $original_price, $stock_quantity, $category, $status, $featured, $image, $subscription_eligible, $default_shipment_quantity);

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
        
        // Save product variants if provided
        if (isset($input['variants']) && is_array($input['variants'])) {
            $var_query = "INSERT INTO product_variants (product_id, weight, price, original_price, stock_quantity, created_at) VALUES (?, ?, ?, ?, ?, NOW())";
            $var_stmt = $db->prepare($var_query);
            foreach ($input['variants'] as $variant) {
                if (!empty($variant['weight']) && isset($variant['price'])) {
                    $weight = trim($variant['weight']);
                    $price = floatval($variant['price']);
                    $original_price = isset($variant['original_price']) && !empty($variant['original_price']) ? floatval($variant['original_price']) : null;
                    $stock_quantity = isset($variant['stock_quantity']) ? intval($variant['stock_quantity']) : 0;
                    $var_stmt->bind_param('isddi', $product_id, $weight, $price, $original_price, $stock_quantity);
                    $var_stmt->execute();
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

    $allowed_fields = ['name', 'slug', 'description', 'short_description', 'price', 'original_price', 'stock_quantity', 'category', 'status', 'featured', 'image', 'subscription_eligible', 'default_shipment_quantity'];
    
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
        
        // Update product variants if provided
        if (isset($input['variants']) && is_array($input['variants'])) {
            // Delete existing variants first
            $del_var_query = "DELETE FROM product_variants WHERE product_id = ?";
            $del_var_stmt = $db->prepare($del_var_query);
            $del_var_stmt->bind_param('i', $product_id);
            $del_var_stmt->execute();
            
            // Insert new variants
            $var_query = "INSERT INTO product_variants (product_id, weight, price, original_price, stock_quantity, created_at) VALUES (?, ?, ?, ?, ?, NOW())";
            $var_stmt = $db->prepare($var_query);
            foreach ($input['variants'] as $variant) {
                if (!empty($variant['weight']) && isset($variant['price'])) {
                    $weight = trim($variant['weight']);
                    $price = floatval($variant['price']);
                    $original_price = isset($variant['original_price']) && !empty($variant['original_price']) ? floatval($variant['original_price']) : null;
                    $stock_quantity = isset($variant['stock_quantity']) ? intval($variant['stock_quantity']) : 0;
                    $var_stmt->bind_param('isddi', $product_id, $weight, $price, $original_price, $stock_quantity);
                    $var_stmt->execute();
                    error_log("Saved variant: weight=$weight, price=$price");
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

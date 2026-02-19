<?php
header('Content-Type: application/json');

error_reporting(E_ALL);
ini_set('display_errors', '0');

require_once __DIR__ . '/../src/config/Database.php';
require_once __DIR__ . '/../src/middleware/AuthMiddleware.php';
require_once __DIR__ . '/../src/utils/Response.php';

try {
  $database = new Database();
  $db = $database->connect();

  if (!$db) {
    throw new Exception('Database connection failed');
  }

  $method = $_SERVER['REQUEST_METHOD'];
  $request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
  
  // Get promo_id from already-parsed segments if available, or extract from path
  $promo_id = null;
  if (isset($GLOBALS['segments']) && count($GLOBALS['segments']) > 1) {
    $promo_id = intval($GLOBALS['segments'][1]);
  } else {
    // Fallback to parsing from REQUEST_URI
    $path_parts = array_filter(explode('/', $request_uri));
    if (end($path_parts) !== 'promotions') {
      $promo_id = intval(end($path_parts));
    }
  }

  if ($method === 'GET') {
    // Check if it's admin endpoint
    if (strpos($request_uri, '/admin') !== false) {
      // Admin endpoint - requires authentication
      $user = AuthMiddleware::verify();
      
      if ($user['role'] !== 'admin') {
        Response::error('Unauthorized', 403);
      }

      // Fetch promotion with product details for admin
      $query = "SELECT p.*, pr.name as product_name, pr.slug, pr.price, pr.original_price, pr.image
                FROM promotions p
                JOIN products pr ON p.product_id = pr.id
                LIMIT 1";
      
      $result = $db->query($query);
      if ($result && $result->num_rows > 0) {
        $promotion = $result->fetch_assoc();
        Response::success($promotion, 'Promotion retrieved');
      } else {
        Response::error('Promotion not found', 404);
      }
    } else {
      // Public endpoint - fetch active promotion
      $query = "SELECT p.id, p.button_text, p.discount_percentage, p.product_id, p.is_active,
                       pr.name as product_name, pr.slug, pr.price, pr.original_price, pr.image
                FROM promotions p
                JOIN products pr ON p.product_id = pr.id
                WHERE p.is_active = TRUE
                LIMIT 1";
      
      $result = $db->query($query);
      if ($result && $result->num_rows > 0) {
        $promotion = $result->fetch_assoc();
        Response::success($promotion, 'Promotion retrieved');
      } else {
        Response::success(null, 'No active promotion found');
      }
    }
  } 
  else if ($method === 'PUT') {
    // Update promotion - requires admin authentication
    $user = AuthMiddleware::verify();
    
    if ($user['role'] !== 'admin') {
      Response::error('Admin access required', 403);
    }

    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data || !isset($data['button_text']) || !isset($data['product_id']) || !isset($data['discount_percentage'])) {
      Response::error('Missing required fields: button_text, product_id, discount_percentage');
    }

    // Validate product exists
    $product_check = $db->prepare("SELECT id FROM products WHERE id = ?");
    $product_id_val = intval($data['product_id']);
    $product_check->bind_param('i', $product_id_val);
    $product_check->execute();
    $product_result = $product_check->get_result();
    
    if ($product_result->num_rows === 0) {
      Response::error('Invalid product_id');
    }

    $promo_id = intval($promo_id);
    $button_text = $data['button_text'];
    $product_id = intval($data['product_id']);
    $discount_percentage = floatval($data['discount_percentage']);
    $is_active = isset($data['is_active']) ? (bool)$data['is_active'] : true;

    $update_query = $db->prepare("UPDATE promotions 
                     SET button_text = ?, 
                         product_id = ?, 
                         discount_percentage = ?,
                         is_active = ?
                     WHERE id = ?");
    
    $is_active_int = $is_active ? 1 : 0;
    $update_query->bind_param('sidii', $button_text, $product_id, $discount_percentage, $is_active_int, $promo_id);

    if ($update_query->execute()) {
      // Fetch updated data
      $fetch_query = $db->prepare("SELECT p.id, p.button_text, p.discount_percentage, p.product_id, p.is_active,
                             pr.name as product_name, pr.slug, pr.price, pr.original_price, pr.image
                      FROM promotions p
                      JOIN products pr ON p.product_id = pr.id
                      WHERE p.id = ?");
      
      $fetch_query->bind_param('i', $promo_id);
      $fetch_query->execute();
      $result = $fetch_query->get_result();
      $promotion = $result->fetch_assoc();

      Response::success($promotion, 'Promotion updated successfully');
    } else {
      Response::error('Failed to update promotion: ' . $db->error);
    }
  }
  else {
    Response::error('Method not allowed', 405);
  }
  
  $db->close();
} catch (Exception $e) {
  Response::error($e->getMessage(), 500);
}
?>

<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once __DIR__ . '/../src/config/Database.php';
require_once __DIR__ . '/../src/utils/JWT.php';
require_once __DIR__ . '/../src/utils/Response.php';

$method = $_SERVER['REQUEST_METHOD'];

// Get the FAQ ID from the request path
$request_path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$request_path = preg_replace('#^/backend/api/#', '', $request_path);
$request_path = preg_replace('#^/backend/#', '', $request_path);
$request_path = preg_replace('#^/api/#', '', $request_path);
$request_path = trim($request_path, '/');

// Remove 'faqs' from the beginning if present
$request_path = preg_replace('#^faqs/?#', '', $request_path);
$request_path = trim($request_path, '/');

$faqId = !empty($request_path) ? $request_path : null;

// Initialize database with MySQLi
$database = new Database();
$db = $database->connect();

try {
    switch ($method) {
        case 'GET':
            if ($faqId) {
                // Get single FAQ
                $stmt = $db->prepare('SELECT * FROM faqs WHERE id = ?');
                $stmt->bind_param('i', $faqId);
                $stmt->execute();
                $result = $stmt->get_result();
                $faq = $result->fetch_assoc();
                
                if ($faq) {
                    Response::success($faq, 'FAQ retrieved', 200);
                } else {
                    Response::error('FAQ not found', 404);
                }
            } else {
                // Get all FAQs ordered by display_order
                $query = 'SELECT * FROM faqs ORDER BY display_order ASC';
                $result = $db->query($query);
                $faqs = [];
                
                if ($result) {
                    while ($row = $result->fetch_assoc()) {
                        $faqs[] = $row;
                    }
                }
                
                Response::success($faqs, 'FAQs retrieved', 200);
            }
            break;

        case 'POST':
            // Create new FAQ - requires admin
            $token = null;
            if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
                preg_match('/Bearer\s+(.*)$/i', $_SERVER['HTTP_AUTHORIZATION'], $matches);
                $token = $matches[1] ?? null;
            }

            if (!$token) {
                Response::error('Authorization token required', 401);
            }

            $jwt = new JWT();
            $decoded = $jwt->verifyToken($token);
            
            if (!$decoded) {
                Response::error('Invalid or expired token', 401);
            }

            // Verify admin role
            verifyAdmin($db, $decoded->user_id, $decoded->role ?? null);

            // Get input data
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['question']) || !isset($data['answer'])) {
                Response::error('Question and answer are required', 400);
            }

            $display_order = $data['display_order'] ?? 0;
            
            $stmt = $db->prepare('INSERT INTO faqs (question, answer, display_order) VALUES (?, ?, ?)');
            $stmt->bind_param('ssi', $data['question'], $data['answer'], $display_order);
            
            if ($stmt->execute()) {
                $faqId = $db->insert_id;
                Response::success([
                    'id' => $faqId,
                    'question' => $data['question'],
                    'answer' => $data['answer'],
                    'display_order' => $display_order
                ], 'FAQ created successfully', 201);
            } else {
                Response::error('Failed to create FAQ', 500);
            }
            break;

        case 'PUT':
            // Update FAQ - requires admin
            if (!$faqId) {
                Response::error('FAQ ID required', 400);
            }

            $token = null;
            if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
                preg_match('/Bearer\s+(.*)$/i', $_SERVER['HTTP_AUTHORIZATION'], $matches);
                $token = $matches[1] ?? null;
            }

            if (!$token) {
                Response::error('Authorization token required', 401);
            }

            $jwt = new JWT();
            $decoded = $jwt->verifyToken($token);
            
            if (!$decoded) {
                Response::error('Invalid or expired token', 401);
            }

            // Verify admin role
            verifyAdmin($db, $decoded->user_id, $decoded->role ?? null);

            $data = json_decode(file_get_contents('php://input'), true);
            
            // Check if FAQ exists
            $stmt = $db->prepare('SELECT id FROM faqs WHERE id = ?');
            $stmt->bind_param('i', $faqId);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows === 0) {
                Response::error('FAQ not found', 404);
            }

            // Build update query dynamically
            $update_fields = [];
            $bind_params = [];
            $bind_types = '';
            $allowed_fields = ['question', 'answer', 'display_order'];
            
            foreach ($allowed_fields as $field) {
                if (isset($data[$field])) {
                    $update_fields[] = "$field = ?";
                    $bind_params[] = $data[$field];
                    $bind_types .= $field === 'display_order' ? 'i' : 's';
                }
            }

            if (empty($update_fields)) {
                Response::error('No fields to update', 400);
            }

            // Add FAQ ID for WHERE clause
            $bind_params[] = $faqId;
            $bind_types .= 'i';
            
            $update_query = 'UPDATE faqs SET ' . implode(', ', $update_fields) . ' WHERE id = ?';
            $stmt = $db->prepare($update_query);
            
            if (!$stmt) {
                Response::error('Prepare failed: ' . $db->error, 500);
            }
            
            // Use call_user_func_array for dynamic bind_param
            $bind_array = array_merge([$bind_types], $bind_params);
            
            // Create references for the bind_param
            $refs = [];
            foreach ($bind_array as $key => $value) {
                $refs[$key] = &$bind_array[$key];
            }
            
            call_user_func_array([$stmt, 'bind_param'], $refs);
            
            if (!$stmt->execute()) {
                Response::error('Execute failed: ' . $stmt->error, 500);
            }
            
            Response::success(['id' => $faqId], 'FAQ updated successfully', 200);
            break;

        case 'DELETE':
            if (!$faqId) {
                Response::error('FAQ ID required', 400);
            }

            $token = null;
            if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
                preg_match('/Bearer\s+(.*)$/i', $_SERVER['HTTP_AUTHORIZATION'], $matches);
                $token = $matches[1] ?? null;
            }

            if (!$token) {
                Response::error('Authorization token required', 401);
            }

            $jwt = new JWT();
            $decoded = $jwt->verifyToken($token);
            
            if (!$decoded) {
                Response::error('Invalid or expired token', 401);
            }

            // Verify admin role
            verifyAdmin($db, $decoded->user_id, $decoded->role ?? null);

            // Check if FAQ exists
            $stmt = $db->prepare('SELECT id FROM faqs WHERE id = ?');
            $stmt->bind_param('i', $faqId);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows === 0) {
                Response::error('FAQ not found', 404);
            }

            $stmt = $db->prepare('DELETE FROM faqs WHERE id = ?');
            $stmt->bind_param('i', $faqId);
            
            if ($stmt->execute()) {
                Response::success([], 'FAQ deleted successfully', 200);
            } else {
                Response::error('Failed to delete FAQ', 500);
            }
            break;

        default:
            Response::error('Method not allowed', 405);
    }
} catch (Exception $e) {
    Response::error($e->getMessage(), 500);
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

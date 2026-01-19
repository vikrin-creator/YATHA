<?php

// Set CORS headers FIRST - before anything else
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 86400');

// Handle preflight OPTIONS request IMMEDIATELY
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../src/config/Database.php';
require_once __DIR__ . '/../src/middleware/AuthMiddleware.php';
require_once __DIR__ . '/../src/utils/Response.php';

try {
    $method = $_SERVER['REQUEST_METHOD'];
    $input = json_decode(file_get_contents('php://input'), true);

    // Verify user authentication
    $user = AuthMiddleware::verify();
    $database = new Database();
    $db = $database->connect();

    if (!$db) {
        Response::error('Database connection failed', 500);
    }

    switch ($method) {
        case 'GET':
            getUserAddresses($db, $user['user_id']);
            break;
        case 'POST':
            createAddress($db, $input, $user['user_id']);
            break;
        case 'PUT':
            updateAddress($db, $input, $user['user_id']);
            break;
        case 'DELETE':
            deleteAddress($db, $_GET['id'] ?? null, $user['user_id']);
            break;
        default:
            Response::error('Method not allowed', 405);
    }
} catch (Exception $e) {
    error_log("Address API error: " . $e->getMessage());
    Response::error($e->getMessage(), 500);
}

function getUserAddresses($db, $user_id)
{
    $query = "SELECT id, type, name, full_name, phone, address_line_1, address_line_2, city, state, pincode, country, is_default, created_at, updated_at
              FROM addresses
              WHERE user_id = ?
              ORDER BY is_default DESC, created_at DESC";

    $stmt = $db->prepare($query);
    $stmt->bind_param('i', $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $addresses = [];
    while ($row = $result->fetch_assoc()) {
        $addresses[] = $row;
    }

    Response::success($addresses, 'Addresses retrieved successfully');
}

function createAddress($db, $input, $user_id)
{
    // Validate required fields
    $required_fields = ['name', 'full_name', 'phone', 'address_line_1', 'city', 'state', 'pincode'];
    $errors = [];

    foreach ($required_fields as $field) {
        if (empty(trim($input[$field] ?? ''))) {
            $errors[$field] = ucfirst(str_replace('_', ' ', $field)) . ' is required';
        }
    }

    if (!empty($errors)) {
        Response::validationError($errors);
    }

    // If this is set as default, unset other defaults
    if (!empty($input['is_default'])) {
        $update_query = "UPDATE addresses SET is_default = 0 WHERE user_id = ?";
        $update_stmt = $db->prepare($update_query);
        $update_stmt->bind_param('i', $user_id);
        $update_stmt->execute();
    }

    $query = "INSERT INTO addresses (user_id, type, name, full_name, phone, address_line_1, address_line_2, city, state, pincode, country, is_default)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $db->prepare($query);
    $type = $input['type'] ?? 'home';
    $name = trim($input['name']);
    $full_name = trim($input['full_name']);
    $phone = trim($input['phone']);
    $address_line_1 = trim($input['address_line_1']);
    $address_line_2 = trim($input['address_line_2'] ?? '');
    $city = trim($input['city']);
    $state = trim($input['state']);
    $pincode = trim($input['pincode']);
    $country = trim($input['country'] ?? 'India');
    $is_default = !empty($input['is_default']) ? 1 : 0;

    $stmt->bind_param('issssssssssi', $user_id, $type, $name, $full_name, $phone, $address_line_1, $address_line_2, $city, $state, $pincode, $country, $is_default);

    if ($stmt->execute()) {
        $address_id = $stmt->insert_id;
        Response::success(['id' => $address_id], 'Address created successfully', 201);
    } else {
        Response::error('Failed to create address', 500);
    }
}

function updateAddress($db, $input, $user_id)
{
    $address_id = $input['id'] ?? null;
    if (!$address_id) {
        Response::validationError(['id' => 'Address ID is required']);
    }

    // Verify address belongs to user
    $check_query = "SELECT id FROM addresses WHERE id = ? AND user_id = ?";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->bind_param('ii', $address_id, $user_id);
    $check_stmt->execute();

    if ($check_stmt->get_result()->num_rows === 0) {
        Response::error('Address not found', 404);
    }

    // Validate required fields
    $required_fields = ['name', 'full_name', 'phone', 'address_line_1', 'city', 'state', 'pincode'];
    $errors = [];

    foreach ($required_fields as $field) {
        if (empty(trim($input[$field] ?? ''))) {
            $errors[$field] = ucfirst(str_replace('_', ' ', $field)) . ' is required';
        }
    }

    if (!empty($errors)) {
        Response::validationError($errors);
    }

    // If this is set as default, unset other defaults
    if (!empty($input['is_default'])) {
        $update_query = "UPDATE addresses SET is_default = 0 WHERE user_id = ? AND id != ?";
        $update_stmt = $db->prepare($update_query);
        $update_stmt->bind_param('ii', $user_id, $address_id);
        $update_stmt->execute();
    }

    $query = "UPDATE addresses SET type = ?, name = ?, full_name = ?, phone = ?, address_line_1 = ?, address_line_2 = ?, city = ?, state = ?, pincode = ?, country = ?, is_default = ?, updated_at = CURRENT_TIMESTAMP
              WHERE id = ? AND user_id = ?";

    $stmt = $db->prepare($query);
    $type = $input['type'] ?? 'home';
    $name = trim($input['name']);
    $full_name = trim($input['full_name']);
    $phone = trim($input['phone']);
    $address_line_1 = trim($input['address_line_1']);
    $address_line_2 = trim($input['address_line_2'] ?? '');
    $city = trim($input['city']);
    $state = trim($input['state']);
    $pincode = trim($input['pincode']);
    $country = trim($input['country'] ?? 'India');
    $is_default = !empty($input['is_default']) ? 1 : 0;

    $stmt->bind_param('sssssssssiii', $type, $name, $full_name, $phone, $address_line_1, $address_line_2, $city, $state, $pincode, $country, $is_default, $address_id, $user_id);

    if ($stmt->execute()) {
        Response::success([], 'Address updated successfully');
    } else {
        Response::error('Failed to update address', 500);
    }
}

function deleteAddress($db, $address_id, $user_id)
{
    if (!$address_id) {
        Response::validationError(['id' => 'Address ID is required']);
    }

    $query = "DELETE FROM addresses WHERE id = ? AND user_id = ?";
    $stmt = $db->prepare($query);
    $stmt->bind_param('ii', $address_id, $user_id);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            Response::success([], 'Address deleted successfully');
        } else {
            Response::error('Address not found', 404);
        }
    } else {
        Response::error('Failed to delete address', 500);
    }
}
?>
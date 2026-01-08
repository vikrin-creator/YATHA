<?php

header('Content-Type: application/json');

error_reporting(E_ALL);
ini_set('display_errors', '0');

require_once __DIR__ . '/../src/utils/JWT.php';
require_once __DIR__ . '/../src/utils/Response.php';
require_once __DIR__ . '/../src/config/Database.php';

try {
    $method = $_SERVER['REQUEST_METHOD'];
    $input = json_decode(file_get_contents('php://input'), true);

    $database = new Database();
    $db = $database->connect();

    if (!$db) {
        throw new Exception('Database connection failed');
    }

    // Get action from global segments passed by index.php router
    // Fall back to URL parsing if not set (for direct calls or different server configs)
    if (isset($GLOBALS['subroute']) && !empty($GLOBALS['subroute'])) {
        $action = $GLOBALS['subroute'];
    } else {
        // Fallback: Parse URL directly
        $request_path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $request_path = preg_replace('#^/backend/api/#', '', $request_path);
        $request_path = preg_replace('#^/backend/#', '', $request_path);
        $request_path = preg_replace('#^/api/#', '', $request_path);
        $request_path = trim($request_path, '/');
        
        $segments = array_values(array_filter(explode('/', $request_path)));
        $action = $segments[1] ?? '';
    }

    if ($method === 'POST') {
        switch ($action) {
            case 'register':
            case 'signup':
                handleRegister($db, $input);
                break;
            case 'login':
                handleLogin($db, $input);
                break;
            default:
                Response::error('Invalid auth action', 400);
        }
    } else {
        Response::error('Method not allowed', 405);
    }
} catch (Exception $e) {
    Response::error($e->getMessage(), 500);
}

function handleRegister($db, $input)
{
    if (!isset($input['email']) || !isset($input['password']) || !isset($input['name'])) {
        Response::validationError(['message' => 'Missing required fields']);
    }

    $email = trim($input['email']);
    $password = $input['password'];
    $name = trim($input['name']);
    $phone = isset($input['phone']) ? trim($input['phone']) : null;

    $query = "SELECT id FROM users WHERE email = ?";
    $stmt = $db->prepare($query);
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        Response::error('User already exists', 400);
    }

    $hashed_password = password_hash($password, PASSWORD_BCRYPT);
    $query = "INSERT INTO users (name, email, phone, password, created_at) VALUES (?, ?, ?, ?, NOW())";
    $stmt = $db->prepare($query);
    $stmt->bind_param('ssss', $name, $email, $phone, $hashed_password);

    if ($stmt->execute()) {
        $user_id = $stmt->insert_id;
        $jwt = new JWT();
        $token = $jwt->generateToken(['user_id' => $user_id, 'email' => $email]);

        echo json_encode([
            'success' => true,
            'status' => 'success',
            'message' => 'User registered successfully',
            'data' => [
                'user_id' => $user_id,
                'user' => [
                    'id' => $user_id,
                    'name' => $name,
                    'email' => $email,
                    'phone' => $phone
                ],
                'token' => $token
            ]
        ]);
        http_response_code(201);
        exit;
    } else {
        Response::error('Registration failed', 500);
    }
}

function handleLogin($db, $input)
{
    if (!isset($input['email']) || !isset($input['password'])) {
        Response::validationError(['message' => 'Missing email or password']);
    }

    $email = trim($input['email']);
    $password = $input['password'];

    $query = "SELECT id, password, name, phone, role FROM users WHERE email = ?";
    $stmt = $db->prepare($query);
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        Response::error('Invalid credentials', 401);
    }

    $user = $result->fetch_assoc();

    if (!password_verify($password, $user['password'])) {
        Response::error('Invalid credentials', 401);
    }

    $jwt = new JWT();
    $token = $jwt->generateToken([
        'user_id' => $user['id'],
        'email' => $user['email'],
        'role' => $user['role']
    ]);

    echo json_encode([
        'success' => true,
        'status' => 'success',
        'message' => 'Login successful',
        'data' => [
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $email,
                'phone' => $user['phone'],
                'role' => $user['role']
            ],
            'token' => $token
        ]
    ]);
    http_response_code(200);
    exit;
}
?>

function handleRegister($db, $input)
{
    if (!isset($input['email']) || !isset($input['password']) || !isset($input['name'])) {
        Response::validationError(['message' => 'Missing required fields']);
    }

    $email = trim($input['email']);
    $password = $input['password'];
    $name = trim($input['name']);
    $phone = isset($input['phone']) ? trim($input['phone']) : null;

    $query = "SELECT id FROM users WHERE email = ?";
    $stmt = $db->prepare($query);
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        Response::error('User already exists', 400);
    }

    $hashed_password = password_hash($password, PASSWORD_BCRYPT);
    $query = "INSERT INTO users (name, email, phone, password, created_at) VALUES (?, ?, ?, ?, NOW())";
    $stmt = $db->prepare($query);
    $stmt->bind_param('ssss', $name, $email, $phone, $hashed_password);

    if ($stmt->execute()) {
        $user_id = $stmt->insert_id;
        $jwt = new JWT();
        $token = $jwt->generateToken(['user_id' => $user_id, 'email' => $email]);

        // Match frontend expectations
        echo json_encode([
            'success' => true,
            'status' => 'success',
            'message' => 'User registered successfully',
            'data' => [
                'user_id' => $user_id,
                'user' => [
                    'id' => $user_id,
                    'name' => $name,
                    'email' => $email,
                    'phone' => $phone
                ],
                'token' => $token
            ]
        ]);
        http_response_code(201);
        exit;
    } else {
        Response::error('Registration failed', 500);
    }
}

function handleLogin($db, $input)
{
    if (!isset($input['email']) || !isset($input['password'])) {
        Response::validationError(['message' => 'Missing email or password']);
    }

    $email = trim($input['email']);
    $password = $input['password'];

    $query = "SELECT id, password, name, phone FROM users WHERE email = ?";
    $stmt = $db->prepare($query);
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        Response::error('Invalid credentials', 401);
    }

    $user = $result->fetch_assoc();

    if (!password_verify($password, $user['password'])) {
        Response::error('Invalid credentials', 401);
    }

    $jwt = new JWT();
    $token = $jwt->generateToken(['user_id' => $user['id'], 'email' => $email]);

    // Match frontend expectations
    echo json_encode([
        'success' => true,
        'status' => 'success',
        'message' => 'Login successful',
        'data' => [
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $email,
                'phone' => $user['phone']
            ],
            'token' => $token
        ]
    ]);
    exit;
}
} catch (Exception $e) {
    Response::error($e->getMessage(), 500);
}
?>

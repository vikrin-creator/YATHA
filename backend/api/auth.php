<?php

require_once __DIR__ . '/../src/utils/JWT.php';
require_once __DIR__ . '/../src/utils/Response.php';
require_once __DIR__ . '/../src/config/Database.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

$database = new Database();
$db = $database->connect();

// Get action from URL
$request_path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$request_path = preg_replace('/^\/api/', '', $request_path);
$segments = array_filter(explode('/', $request_path));
$action = $segments[1] ?? '';

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

function handleRegister($db, $input)
{
    if (!isset($input['email']) || !isset($input['password']) || !isset($input['name'])) {
        Response::validationError(['message' => 'Missing required fields']);
    }

    $email = trim($input['email']);
    $password = $input['password'];
    $name = trim($input['name']);

    $query = "SELECT id FROM users WHERE email = ?";
    $stmt = $db->prepare($query);
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        Response::error('User already exists', 400);
    }

    $hashed_password = password_hash($password, PASSWORD_BCRYPT);
    $query = "INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, NOW())";
    $stmt = $db->prepare($query);
    $stmt->bind_param('sss', $name, $email, $hashed_password);

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
                    'email' => $email
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

    $query = "SELECT id, password, name FROM users WHERE email = ?";
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
                'email' => $email
            ],
            'token' => $token
        ]
    ]);
    http_response_code(200);
    exit;
}
?>

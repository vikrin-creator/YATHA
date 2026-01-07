<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/JWT.php';

function handleAuthRequest($method, $uri, $db) {
    $path = parse_url($uri, PHP_URL_PATH);
    
    switch($path) {
        case '/api/auth/login':
            if ($method === 'POST') {
                handleLogin($db);
            }
            break;
            
        case '/api/auth/signup':
            if ($method === 'POST') {
                handleSignup($db);
            }
            break;
            
        case '/api/auth/verify':
            if ($method === 'POST') {
                handleVerify();
            }
            break;
            
        default:
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Auth route not found'
            ]);
            break;
    }
}

function handleLogin($db) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['email']) || !isset($input['password'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Email and password are required'
            ]);
            return;
        }
        
        $email = $input['email'];
        $password = $input['password'];
        
        // Query to find user by email or mobile
        $query = "SELECT * FROM users WHERE email = :email OR mobile_number = :mobile";
        $stmt = $db->prepare($query);
        $stmt->execute([
            ':email' => $email,
            ':mobile' => $email
        ]);
        
        $user = $stmt->fetch();
        
        if (!$user) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid email or password'
            ]);
            return;
        }
        
        // Verify password
        if (!password_verify($password, $user['password_hash'])) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid email or password'
            ]);
            return;
        }
        
        // Generate JWT token
        $jwt = new JWT();
        $token = $jwt->generateToken([
            'user_id' => $user['id'],
            'email' => $user['email'],
            'first_name' => $user['first_name'],
            'last_name' => $user['last_name']
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'first_name' => $user['first_name'],
                'last_name' => $user['last_name'],
                'mobile_number' => $user['mobile_number']
            ]
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Login failed: ' . $e->getMessage()
        ]);
    }
}

function handleSignup($db) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Validate required fields
        $required = ['first_name', 'last_name', 'email', 'mobile_number', 'password'];
        foreach ($required as $field) {
            if (!isset($input[$field]) || empty($input[$field])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => ucfirst(str_replace('_', ' ', $field)) . ' is required'
                ]);
                return;
            }
        }
        
        $email = trim($input['email']);
        $mobile = trim($input['mobile_number']);
        $password = $input['password'];
        $confirmPassword = $input['confirm_password'] ?? '';
        
        // Validate password match
        if ($password !== $confirmPassword) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Passwords do not match'
            ]);
            return;
        }
        
        // Validate password length
        if (strlen($password) < 6) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Password must be at least 6 characters'
            ]);
            return;
        }
        
        // Check if user already exists
        $checkQuery = "SELECT id FROM users WHERE email = :email OR mobile_number = :mobile";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->execute([':email' => $email, ':mobile' => $mobile]);
        
        if ($checkStmt->fetch()) {
            http_response_code(409);
            echo json_encode([
                'success' => false,
                'message' => 'User with this email or mobile already exists'
            ]);
            return;
        }
        
        // Create new user
        $passwordHash = password_hash($password, PASSWORD_BCRYPT);
        
        $insertQuery = "INSERT INTO users (first_name, last_name, email, mobile_number, password_hash, created_at) 
                       VALUES (:first_name, :last_name, :email, :mobile, :password_hash, NOW())";
        
        $insertStmt = $db->prepare($insertQuery);
        $insertStmt->execute([
            ':first_name' => $input['first_name'],
            ':last_name' => $input['last_name'],
            ':email' => $email,
            ':mobile' => $mobile,
            ':password_hash' => $passwordHash
        ]);
        
        $userId = $db->lastInsertId();
        
        // Generate JWT token
        $jwt = new JWT();
        $token = $jwt->generateToken([
            'user_id' => $userId,
            'email' => $email,
            'first_name' => $input['first_name'],
            'last_name' => $input['last_name']
        ]);
        
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Account created successfully',
            'token' => $token,
            'user' => [
                'id' => $userId,
                'email' => $email,
                'first_name' => $input['first_name'],
                'last_name' => $input['last_name'],
                'mobile_number' => $mobile
            ]
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Signup failed: ' . $e->getMessage()
        ]);
    }
}

function handleVerify() {
    try {
        $jwt = new JWT();
        $token = JWT::getTokenFromHeader();
        
        if (!$token) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'No token provided'
            ]);
            return;
        }
        
        $decoded = $jwt->verifyToken($token);
        
        echo json_encode([
            'success' => true,
            'message' => 'Token is valid',
            'user' => $decoded
        ]);
        
    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Token verification failed: ' . $e->getMessage()
        ]);
    }
}

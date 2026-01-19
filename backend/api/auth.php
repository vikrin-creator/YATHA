<?php

header('Content-Type: application/json');

error_reporting(E_ALL);
ini_set('display_errors', '0');

require_once __DIR__ . '/../src/utils/JWT.php';
require_once __DIR__ . '/../src/utils/Response.php';
require_once __DIR__ . '/../src/config/Database.php';
require_once __DIR__ . '/../src/utils/otp.php';
require_once __DIR__ . '/../src/utils/email-smtp.php';

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
            case 'verify-otp':
                handleVerifyOTP($db, $input);
                break;
            case 'forgot-password':
                handleForgotPassword($db, $input);
                break;
            case 'reset-password':
                handleResetPassword($db, $input);
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

    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        Response::error('Invalid email format', 400);
    }

    // Validate password strength (minimum 8 characters)
    if (strlen($password) < 8) {
        Response::error('Password must be at least 8 characters long', 400);
    }

    $query = "SELECT id FROM users WHERE email = ?";
    $stmt = $db->prepare($query);
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        Response::error('User already exists', 400);
    }

    // Generate OTP and send email
    $otp = generateOTP();
    $otpStored = storeOTP($db, $email, $otp);
    
    if (!$otpStored) {
        Response::error('Failed to generate OTP', 500);
    }
    
    // Send OTP email
    $emailSent = sendOTPEmailSMTP($email, $otp, $name);
    
    if (!$emailSent) {
        Response::error('Failed to send OTP email', 500);
        exit;
    }
    
    // OTP sent, waiting for verification
    echo json_encode([
        'success' => true,
        'status' => 'otp_sent',
        'message' => 'OTP sent to ' . $email . '. Please verify your email to complete registration.',
        'data' => [
            'email' => $email,
            'otp_expires_in' => '10 minutes'
        ]
    ]);
    http_response_code(200);
    exit;
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

function handleVerifyOTP($db, $input)
{
    if (!isset($input['email']) || !isset($input['otp'])) {
        Response::validationError(['message' => 'Missing email or OTP']);
    }

    $email = trim($input['email']);
    $otp = trim($input['otp']);

    // Check if user exists
    $query = "SELECT id, name, email_verified FROM users WHERE email = ?";
    $stmt = $db->prepare($query);
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $result = $stmt->get_result();

    $isExistingUser = $result->num_rows > 0;
    $user = $isExistingUser ? $result->fetch_assoc() : null;

    // Verify OTP using the otp.php utility
    $otpVerification = verifyOTP($db, $email, $otp);

    if (!$otpVerification['success']) {
        Response::error($otpVerification['message'], 400);
    }

    // Check if this is a new registration (email not in users table yet)
    if (!$isExistingUser) {
        // This is a new registration - require password and name for account creation
        if (!isset($input['password']) || !isset($input['name'])) {
            Response::error('Password and name required for account creation', 400);
        }

        $password = $input['password'];
        $name = trim($input['name']);
        $phone = isset($input['phone']) ? trim($input['phone']) : null;

        // Validate password strength
        if (strlen($password) < 8) {
            Response::error('Password must be at least 8 characters long', 400);
        }

        $hashed_password = password_hash($password, PASSWORD_BCRYPT);

        // Create the user account with email verified and default role as 'user'
        $role = 'user';
        $query = "INSERT INTO users (name, email, phone, password, email_verified, email_verified_at, role, created_at) 
                  VALUES (?, ?, ?, ?, 1, NOW(), ?, NOW())";
        $stmt = $db->prepare($query);
        $stmt->bind_param('sssss', $name, $email, $phone, $hashed_password, $role);

        if (!$stmt->execute()) {
            Response::error('Failed to create account', 500);
        }

        $user_id = $stmt->insert_id;

        // Generate JWT token for the new user with role
        $jwt = new JWT();
        $token = $jwt->generateToken(['user_id' => $user_id, 'email' => $email, 'role' => $role]);

        echo json_encode([
            'success' => true,
            'status' => 'account_created',
            'message' => 'Email verified and account created successfully',
            'data' => [
                'user_id' => $user_id,
                'email' => $email,
                'name' => $name,
                'email_verified' => true,
                'token' => $token
            ]
        ]);
        http_response_code(201);
        exit;
    } else {
        // This is an existing user (password reset or re-verification)
        if ($user['email_verified'] == 1) {
            // Email already verified
            $jwt = new JWT();
            $token = $jwt->generateToken(['user_id' => $user['id'], 'email' => $email]);

            echo json_encode([
                'success' => true,
                'status' => 'already_verified',
                'message' => 'Email is already verified',
                'data' => [
                    'user_id' => $user['id'],
                    'email' => $email,
                    'token' => $token
                ]
            ]);
            http_response_code(200);
            exit;
        }

        // Mark email as verified in users table
        $query = "UPDATE users SET email_verified = 1, email_verified_at = NOW() WHERE email = ?";
        $stmt = $db->prepare($query);
        $stmt->bind_param('s', $email);

        if (!$stmt->execute()) {
            Response::error('Failed to verify email', 500);
        }

        // Generate JWT token for the verified user
        $jwt = new JWT();
        $token = $jwt->generateToken(['user_id' => $user['id'], 'email' => $email]);

        echo json_encode([
            'success' => true,
            'status' => 'email_verified',
            'message' => 'Email verified successfully',
            'data' => [
                'user_id' => $user['id'],
                'email' => $email,
                'email_verified' => true,
                'token' => $token
            ]
        ]);
        http_response_code(200);
        exit;
    }
}

function handleForgotPassword($db, $input)
{
    if (!isset($input['email'])) {
        Response::validationError(['message' => 'Email is required']);
    }

    $email = trim($input['email']);

    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        Response::error('Invalid email format', 400);
    }

    // Check if user exists
    $query = "SELECT id, name FROM users WHERE email = ?";
    $stmt = $db->prepare($query);
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        // For security, don't reveal if email exists
        // But log the attempt
        echo json_encode([
            'success' => true,
            'message' => 'If an account with this email exists, you will receive a password reset code'
        ]);
        http_response_code(200);
        exit;
    }

    $user = $result->fetch_assoc();

    // Generate OTP for password reset
    $otp = generateOTP();
    $otpStored = storeOTP($db, $email, $otp);

    if (!$otpStored) {
        Response::error('Failed to generate reset code', 500);
    }

    // Send password reset OTP email
    $emailSent = sendPasswordResetOTPSMTP($email, $otp, $user['name']);

    if (!$emailSent) {
        Response::error('Failed to send reset code email', 500);
    }

    echo json_encode([
        'success' => true,
        'status' => 'otp_sent',
        'message' => 'Password reset code sent to your email',
        'data' => [
            'email' => $email,
            'otp_expires_in' => '10 minutes'
        ]
    ]);
    http_response_code(200);
    exit;
}

function handleResetPassword($db, $input)
{
    if (!isset($input['email']) || !isset($input['otp']) || !isset($input['new_password'])) {
        Response::validationError(['message' => 'Email, OTP, and new password are required']);
    }

    $email = trim($input['email']);
    $otp = trim($input['otp']);
    $newPassword = $input['new_password'];

    // Validate password strength
    if (strlen($newPassword) < 8) {
        Response::error('Password must be at least 8 characters long', 400);
    }

    // Verify OTP
    $otpVerification = verifyOTP($db, $email, $otp);

    if (!$otpVerification['success']) {
        Response::error($otpVerification['message'], 400);
    }

    // Check if user exists
    $query = "SELECT id FROM users WHERE email = ?";
    $stmt = $db->prepare($query);
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        Response::error('User not found', 404);
    }

    // Update password
    $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);
    $query = "UPDATE users SET password = ?, updated_at = NOW() WHERE email = ?";
    $stmt = $db->prepare($query);
    $stmt->bind_param('ss', $hashedPassword, $email);

    if (!$stmt->execute()) {
        Response::error('Failed to reset password', 500);
    }

    echo json_encode([
        'success' => true,
        'status' => 'success',
        'message' => 'Password reset successfully. Please login with your new password.'
    ]);
    http_response_code(200);
    exit;
}
?>

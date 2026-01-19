<?php

require_once __DIR__ . '/../utils/JWT.php';
require_once __DIR__ . '/../utils/Response.php';

/**
 * Helper function to get all headers (works in both Apache and CLI)
 */
function get_request_headers() {
    if (function_exists('getallheaders')) {
        return getallheaders();
    }
    
    // For CLI or non-Apache environments, build headers from $_SERVER
    $headers = [];
    foreach ($_SERVER as $name => $value) {
        if (substr($name, 0, 5) == 'HTTP_') {
            $name = str_replace('HTTP_', '', $name);
            $name = str_replace('_', '-', $name);
            $name = ucwords(strtolower($name), '-');
            $headers[$name] = $value;
        } elseif (in_array($name, ['CONTENT_TYPE', 'CONTENT_LENGTH'])) {
            $headers[$name] = $value;
        }
    }
    return $headers;
}

class AuthMiddleware
{
    /**
     * Check if request has valid JWT token
     */
    public static function verify()
    {
        $headers = get_request_headers();
        $token = null;

        // Check Authorization header
        if (isset($headers['Authorization'])) {
            $auth_header = $headers['Authorization'];
            if (preg_match('/Bearer\s+(.*)$/i', $auth_header, $matches)) {
                $token = $matches[1];
            }
        }

        if (!$token) {
            Response::error('Authorization token required', 401);
        }

        $jwt = new JWT();
        $payload = $jwt->verifyToken($token);

        if (!$payload) {
            Response::error('Invalid or expired token', 401);
        }

        return $payload;
    }

    /**
     * Get token from request header
     */
    public static function getToken()
    {
        $headers = get_request_headers();

        if (isset($headers['Authorization'])) {
            $auth_header = $headers['Authorization'];
            if (preg_match('/Bearer\s+(.*)$/i', $auth_header, $matches)) {
                return $matches[1];
            }
        }

        return null;
    }
}

// Helper function for convenience
function getAuthToken() {
    return AuthMiddleware::getToken();
}
?>

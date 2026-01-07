<?php

require_once __DIR__ . '/../utils/JWT.php';
require_once __DIR__ . '/../utils/Response.php';

class AuthMiddleware
{
    /**
     * Check if request has valid JWT token
     */
    public static function verify()
    {
        $headers = getallheaders();
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
        $headers = getallheaders();

        if (isset($headers['Authorization'])) {
            $auth_header = $headers['Authorization'];
            if (preg_match('/Bearer\s+(.*)$/i', $auth_header, $matches)) {
                return $matches[1];
            }
        }

        return null;
    }
}
?>

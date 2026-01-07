<?php

class JWT {
    private $secret = 'Y4th4-M0r1ng4-JWT-S3cr3t-K3y-2025-Pr0duct10n-S3cur3-T0k3n-G3n3r4t0r'; // Strong production secret
    private $algorithm = 'HS256';
    
    public function __construct() {
        // You can load the secret from environment variable in production
        if (getenv('JWT_SECRET')) {
            $this->secret = getenv('JWT_SECRET');
        }
    }
    
    /**
     * Create a JWT token
     */
    public function generateToken($data, $expiresIn = 86400) {
        $issuedAt = time();
        $expire = $issuedAt + $expiresIn;
        
        $payload = [
            'iat' => $issuedAt,
            'exp' => $expire,
            'data' => $data
        ];
        
        $header = $this->base64UrlEncode(json_encode(['alg' => $this->algorithm, 'typ' => 'JWT']));
        $payload = $this->base64UrlEncode(json_encode($payload));
        
        $signature = $this->base64UrlEncode(
            hash_hmac('sha256', "$header.$payload", $this->secret, true)
        );
        
        return "$header.$payload.$signature";
    }
    
    /**
     * Verify and decode a JWT token
     */
    public function verifyToken($token) {
        $parts = explode('.', $token);
        
        if (count($parts) != 3) {
            throw new Exception('Invalid token format');
        }
        
        $header = $parts[0];
        $payload = $parts[1];
        $signature = $parts[2];
        
        // Verify signature
        $expectedSignature = $this->base64UrlEncode(
            hash_hmac('sha256', "$header.$payload", $this->secret, true)
        );
        
        if ($signature !== $expectedSignature) {
            throw new Exception('Invalid token signature');
        }
        
        // Decode payload
        $decoded = json_decode($this->base64UrlDecode($payload), true);
        
        // Check expiration
        if (isset($decoded['exp']) && time() > $decoded['exp']) {
            throw new Exception('Token expired');
        }
        
        return $decoded['data'];
    }
    
    /**
     * Base64 URL encode
     */
    private function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
    
    /**
     * Base64 URL decode
     */
    private function base64UrlDecode($data) {
        return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', 4 - strlen($data) % 4));
    }
    
    /**
     * Get token from Authorization header
     */
    public static function getTokenFromHeader() {
        $headers = getallheaders();
        if (isset($headers['Authorization'])) {
            $matches = [];
            if (preg_match('/Bearer\s+(.+)/', $headers['Authorization'], $matches)) {
                return $matches[1];
            }
        }
        return null;
    }
}

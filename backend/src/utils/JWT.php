<?php

class JWT
{
    private $secret_key;
    private $algorithm = 'HS256';

    public function __construct()
    {
        $this->secret_key = getenv('JWT_SECRET') ?: 'your-secret-key-change-in-production';
    }

    /**
     * Generate JWT Token
     */
    public function generateToken($data, $expiration = 86400)
    {
        $header = [
            'alg' => $this->algorithm,
            'typ' => 'JWT'
        ];

        $payload = array_merge($data, [
            'iat' => time(),
            'exp' => time() + $expiration
        ]);

        $header_encoded = $this->base64UrlEncode(json_encode($header));
        $payload_encoded = $this->base64UrlEncode(json_encode($payload));

        $signature = hash_hmac(
            'sha256',
            $header_encoded . '.' . $payload_encoded,
            $this->secret_key,
            true
        );

        $signature_encoded = $this->base64UrlEncode($signature);

        return $header_encoded . '.' . $payload_encoded . '.' . $signature_encoded;
    }

    /**
     * Verify JWT Token
     */
    public function verifyToken($token)
    {
        $parts = explode('.', $token);

        if (count($parts) != 3) {
            return false;
        }

        list($header_encoded, $payload_encoded, $signature_provided) = $parts;

        $signature = hash_hmac(
            'sha256',
            $header_encoded . '.' . $payload_encoded,
            $this->secret_key,
            true
        );

        $signature_encoded = $this->base64UrlEncode($signature);

        if ($signature_encoded !== $signature_provided) {
            return false;
        }

        $payload = json_decode($this->base64UrlDecode($payload_encoded), true);

        if ($payload['exp'] < time()) {
            return false;
        }

        return $payload;
    }

    private function base64UrlEncode($data)
    {
        return str_replace(
            ['+', '/', '='],
            ['-', '_', ''],
            base64_encode($data)
        );
    }

    private function base64UrlDecode($data)
    {
        return base64_decode(
            str_replace(
                ['-', '_'],
                ['+', '/'],
                $data
            )
        );
    }
}
?>

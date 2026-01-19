<?php
/**
 * Stripe configuration loader
 * Returns an array with 'secret_key', 'public_key', and 'webhook_secret'.
 * Reads from .env file FIRST (most reliable), then from environment variables.
 */

function load_env_file($path) {
    $result = [];
    if (!file_exists($path)) {
        error_log("[stripe-config] .env file not found at: $path");
        return $result;
    }
    
    if (!is_readable($path)) {
        error_log("[stripe-config] .env file not readable at: $path");
        return $result;
    }
    
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        error_log("[stripe-config] Failed to read .env file");
        return $result;
    }
    
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || strpos($line, '#') === 0) continue;
        if (!strpos($line, '=')) continue;
        
        list($k, $v) = explode('=', $line, 2);
        $k = trim($k);
        $v = trim($v);
        
        // Remove surrounding quotes if present
        if ((substr($v, 0, 1) === '"' && substr($v, -1) === '"') || 
            (substr($v, 0, 1) === "'" && substr($v, -1) === "'")) {
            $v = substr($v, 1, -1);
        }
        
        $result[$k] = $v;
    }
    
    return $result;
}

// PRIMARY: Try to load from .env file directly
$envPath = __DIR__ . '/../../.env';
$envVars = load_env_file($envPath);

error_log("[stripe-config] Loaded from .env: " . json_encode(array_keys($envVars)));

$secret = $envVars['STRIPE_SECRET_KEY'] ?? null;
$public = $envVars['STRIPE_PUBLIC_KEY'] ?? null;
$webhook = $envVars['STRIPE_WEBHOOK_SECRET'] ?? null;

// FALLBACK: If not found in .env, try environment variables
if (!$secret) {
    $secret = getenv('STRIPE_SECRET_KEY') ?: null;
    if ($secret) error_log("[stripe-config] Secret key from getenv()");
}

if (!$public) {
    $public = getenv('STRIPE_PUBLIC_KEY') ?: null;
    if ($public) error_log("[stripe-config] Public key from getenv()");
}

if (!$webhook) {
    $webhook = getenv('STRIPE_WEBHOOK_SECRET') ?: null;
    if ($webhook) error_log("[stripe-config] Webhook secret from getenv()");
}

// Log final status
error_log("[stripe-config] Final keys: secret=" . (strlen($secret ?? '') > 0 ? "YES (" . strlen($secret) . " chars)" : "NO") . 
          ", public=" . (strlen($public ?? '') > 0 ? "YES (" . strlen($public) . " chars)" : "NO") . 
          ", webhook=" . (strlen($webhook ?? '') > 0 ? "YES (" . strlen($webhook) . " chars)" : "NO"));

return [
    'secret_key' => $secret ?: '',
    'public_key' => $public ?: '',
    'webhook_secret' => $webhook ?: ''
];

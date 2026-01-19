<?php
/**
 * Stripe configuration loader
 * Returns an array with 'secret_key' and 'public_key'.
 * Values are read from environment variables first, then from backend/.env if present.
 */

function load_env_file($path) {
    $result = [];
    if (!file_exists($path)) return $result;
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || strpos($line, '#') === 0) continue;
        if (!strpos($line, '=')) continue;
        list($k, $v) = explode('=', $line, 2);
        $result[trim($k)] = trim($v);
    }
    return $result;
}

$secret = getenv('STRIPE_SECRET_KEY') ?: null;
$public = getenv('STRIPE_PUBLIC_KEY') ?: null;
$webhook = getenv('STRIPE_WEBHOOK_SECRET') ?: null;

// If not set in env, try loading backend/.env
if (!$secret || !$public) {
    $envPath = __DIR__ . '/../../.env';
    $vals = load_env_file($envPath);
    if (!$secret && isset($vals['STRIPE_SECRET_KEY'])) $secret = $vals['STRIPE_SECRET_KEY'];
    if (!$public && isset($vals['STRIPE_PUBLIC_KEY'])) $public = $vals['STRIPE_PUBLIC_KEY'];
    if (!$webhook && isset($vals['STRIPE_WEBHOOK_SECRET'])) $webhook = $vals['STRIPE_WEBHOOK_SECRET'];
}

return [
    'secret_key' => $secret ?: '',
    'public_key' => $public ?: '',
    'webhook_secret' => $webhook ?: ''
];

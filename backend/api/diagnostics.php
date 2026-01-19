<?php
// Diagnostic endpoint to check Stripe setup

header('Content-Type: application/json');

$diagnostics = [
    'php_version' => phpversion(),
    'curl_enabled' => extension_loaded('curl'),
    'json_enabled' => extension_loaded('json'),
    'env_vars' => [
        'STRIPE_SECRET_KEY' => getenv('STRIPE_SECRET_KEY') ? 'SET (' . strlen(getenv('STRIPE_SECRET_KEY')) . ' chars)' : 'NOT SET',
        'STRIPE_PUBLIC_KEY' => getenv('STRIPE_PUBLIC_KEY') ? 'SET (' . strlen(getenv('STRIPE_PUBLIC_KEY')) . ' chars)' : 'NOT SET',
        'STRIPE_WEBHOOK_SECRET' => getenv('STRIPE_WEBHOOK_SECRET') ? 'SET' : 'NOT SET',
    ]
];

// Try to load .env file
$envPath = __DIR__ . '/../.env';
if (file_exists($envPath)) {
    $diagnostics['env_file'] = [
        'exists' => true,
        'path' => $envPath,
        'readable' => is_readable($envPath)
    ];
    
    // Try to load config
    $cfg = include __DIR__ . '/../src/config/stripe.php';
    $diagnostics['stripe_config'] = [
        'secret_key' => $cfg['secret_key'] ? 'LOADED (' . strlen($cfg['secret_key']) . ' chars)' : 'EMPTY',
        'public_key' => $cfg['public_key'] ? 'LOADED (' . strlen($cfg['public_key']) . ' chars)' : 'EMPTY',
        'webhook_secret' => $cfg['webhook_secret'] ? 'LOADED' : 'EMPTY'
    ];
} else {
    $diagnostics['env_file'] = [
        'exists' => false,
        'path' => $envPath
    ];
}

echo json_encode($diagnostics, JSON_PRETTY_PRINT);
?>

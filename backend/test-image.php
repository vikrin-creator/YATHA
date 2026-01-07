<?php
// Simple image test
$imagePath = __DIR__ . '/../frontend/src/assets/images/BeetrootPowder.png';
echo "Image path: " . $imagePath . "\n";
echo "File exists: " . (file_exists($imagePath) ? 'YES' : 'NO') . "\n";
echo "File size: " . (file_exists($imagePath) ? filesize($imagePath) : 'N/A') . "\n";

// Try to serve the image
if (file_exists($imagePath)) {
    header('Content-Type: image/png');
    header('Access-Control-Allow-Origin: *');
    readfile($imagePath);
    exit();
} else {
    http_response_code(404);
    echo "Image not found";
}
?>
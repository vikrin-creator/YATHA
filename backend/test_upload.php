<?php
require 'src/config/Database.php';
require 'src/utils/Response.php';

// Create a test image file
$test_image_path = 'test_image.png';

// Simple PNG file (smallest valid PNG)
$png_data = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
file_put_contents($test_image_path, $png_data);

// Now test the upload endpoint
echo "=== Testing Image Upload Endpoint ===\n";
echo "Test image created: " . (file_exists($test_image_path) ? 'YES' : 'NO') . "\n";
echo "File size: " . filesize($test_image_path) . " bytes\n";

// Check upload directory
$upload_dir = __DIR__ . '/public/uploads/images/';
echo "\nUpload directory: " . $upload_dir . "\n";
echo "Directory exists: " . (is_dir($upload_dir) ? 'YES' : 'NO') . "\n";
echo "Directory writable: " . (is_writable($upload_dir) ? 'YES' : 'NO') . "\n";

// List existing images
echo "\nExisting images in directory:\n";
if (is_dir($upload_dir)) {
  $files = scandir($upload_dir);
  foreach ($files as $file) {
    if ($file !== '.' && $file !== '..') {
      echo "  - " . $file . "\n";
    }
  }
}

// Clean up
unlink($test_image_path);
?>

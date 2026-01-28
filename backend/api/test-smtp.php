<?php
/**
 * Test SMTP email connection
 */

require_once __DIR__ . '/../src/config/Database.php';
require_once __DIR__ . '/../src/utils/email-smtp.php';

echo "=== Testing SMTP Email Configuration ===\n\n";

$config = require __DIR__ . '/../src/config/email.php';

echo "Email Configuration:\n";
echo "  SMTP Host: " . $config['smtp_host'] . "\n";
echo "  SMTP Port: " . $config['smtp_port'] . "\n";
echo "  SMTP Username: " . $config['smtp_username'] . "\n";
echo "  From Email: " . $config['from_email'] . "\n";
echo "  From Name: " . $config['from_name'] . "\n\n";

// Check if PHPMailer is installed
if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    echo "✓ PHPMailer is installed\n\n";
    
    try {
        require_once __DIR__ . '/../vendor/autoload.php';
        
        $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
        
        echo "Testing SMTP connection...\n";
        $mail->isSMTP();
        $mail->Host = $config['smtp_host'];
        $mail->SMTPAuth = true;
        $mail->Username = $config['smtp_username'];
        $mail->Password = $config['smtp_password'];
        $mail->SMTPSecure = $config['smtp_secure'];
        $mail->Port = $config['smtp_port'];
        $mail->SMTPOptions = array('ssl' => array('verify_peer' => false, 'verify_peer_name' => false, 'allow_self_signed' => true));
        
        echo "Connecting to SMTP server...\n";
        if ($mail->smtpConnect()) {
            echo "✅ SMTP connection successful!\n";
            $mail->smtpClose();
        } else {
            echo "❌ SMTP connection failed: " . $mail->ErrorInfo . "\n";
        }
        
    } catch (Exception $e) {
        echo "❌ Error: " . $e->getMessage() . "\n";
        echo "Error Info: " . $mail->ErrorInfo ?? "N/A" . "\n";
    }
} else {
    echo "❌ PHPMailer not installed - emails would only be logged\n";
    echo "Run: composer install\n";
}

echo "\n\nTrying to send test OTP to vikrin48@gmail.com...\n";
$result = sendOTPEmailSMTP('vikrin48@gmail.com', '123456', 'Test User');

if ($result) {
    echo "✅ Test email sent successfully\n";
} else {
    echo "❌ Test email failed to send\n";
    echo "Check error logs for details\n";
}

<?php
/**
 * Email Utility with SMTP Support
 * Falls back to logging if PHPMailer not installed (for testing)
 */

// Load PHPMailer via autoload (only if available)
if (file_exists(__DIR__ . '/../../vendor/autoload.php')) {
    require_once __DIR__ . '/../../vendor/autoload.php';
}

/**
 * Send OTP email using SMTP or fallback
 */
function sendOTPEmailSMTP($email, $otp, $name = '') {
    // Load email configuration
    $config = require __DIR__ . '/../config/email.php';
    
    $subject = "YATHA - Email Verification OTP";
    
    $htmlBody = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #8B4513; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
            .otp-box { background-color: #fff; border: 2px dashed #8B4513; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>YATHA</h1>
            </div>
            <div class='content'>
                <h2>Email Verification</h2>
                <p>Hello " . htmlspecialchars($name) . ",</p>
                <p>Thank you for registering with YATHA. Please use the following OTP to verify your email address:</p>
                <div class='otp-box'>$otp</div>
                <p><strong>This OTP is valid for 10 minutes.</strong></p>
                <p>If you didn't request this verification, please ignore this email.</p>
                <p>For any assistance, feel free to contact us.</p>
            </div>
            <div class='footer'>
                <p>&copy; " . date('Y') . " YATHA. All rights reserved.</p>
                <p>Weaving Tradition with Excellence</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    $textBody = "Hello $name,\n\nYour OTP for email verification is: $otp\n\nThis OTP is valid for 10 minutes.\n\nRegards,\nYATHA";
    
    // Try PHPMailer if available, otherwise log
    if (file_exists(__DIR__ . '/../../vendor/autoload.php')) {
        try {
            $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
            $mail->isSMTP();
            $mail->Host = $config['smtp_host'];
            $mail->SMTPAuth = true;
            $mail->Username = $config['smtp_username'];
            $mail->Password = $config['smtp_password'];
            $mail->SMTPSecure = $config['smtp_secure'];
            $mail->Port = $config['smtp_port'];
            $mail->SMTPOptions = array('ssl' => array('verify_peer' => false, 'verify_peer_name' => false, 'allow_self_signed' => true));
            $mail->setFrom($config['from_email'], $config['from_name']);
            $mail->addAddress($email);
            $mail->isHTML(true);
            $mail->CharSet = 'UTF-8';
            $mail->Subject = $subject;
            $mail->Body = $htmlBody;
            $mail->AltBody = $textBody;
            
            $mail->send();
            
            // Log successful send
            error_log("✓ Email sent successfully to: $email");
            return true;
        } catch (\PHPMailer\PHPMailer\Exception $e) {
            error_log("✗ Email send failed: {$e->getMessage()}");
            // Log to error log for debugging
            error_log("SMTP Error Details: " . $mail->ErrorInfo ?? $e->getMessage());
            return false;
        } catch (Exception $e) {
            error_log("✗ General error: {$e->getMessage()}");
            return false;
        }
    } else {
        // Log OTP for testing (no PHPMailer installed)
        error_log("\n╔════════════════════════════════════════╗");
        error_log("║   EMAIL LOG (TESTING MODE)             ║");
        error_log("╠════════════════════════════════════════╣");
        error_log("║ To: $email");
        error_log("║ Subject: $subject");
        error_log("║ OTP CODE: $otp");
        error_log("║ Valid for: 10 minutes");
        error_log("╚════════════════════════════════════════╝\n");
        return true;
    }
}

/**
 * Send Password Reset OTP email
 */
function sendPasswordResetOTPSMTP($email, $otp, $name = '') {
    $config = require __DIR__ . '/../config/email.php';
    
    $subject = "YATHA - Password Reset Code";
    
    $htmlBody = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #8B4513; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
            .otp-box { background-color: #fff; border: 2px dashed #8B4513; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 5px; }
            .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>YATHA</h1>
            </div>
            <div class='content'>
                <h2>Password Reset Request</h2>
                <p>Hello " . htmlspecialchars($name) . ",</p>
                <p>We received a request to reset your password. Please use the following code to reset your password:</p>
                <div class='otp-box'>$otp</div>
                <p><strong>This code is valid for 10 minutes.</strong></p>
                <div class='warning'>
                    <strong>⚠️ Security Notice:</strong> If you didn't request this, ignore this email.
                </div>
            </div>
            <div class='footer'>
                <p>&copy; " . date('Y') . " YATHA. All rights reserved.</p>
                <p>Weaving Tradition with Excellence</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    $textBody = "Hello $name,\n\nYour code for password reset is: $otp\n\nThis code is valid for 10 minutes.\n\nIf you didn't request this, ignore this email.\n\nRegards,\nYATHA";
    
    // Try PHPMailer if available, otherwise log
    if (file_exists(__DIR__ . '/../../vendor/autoload.php')) {
        try {
            $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
            $mail->isSMTP();
            $mail->Host = $config['smtp_host'];
            $mail->SMTPAuth = true;
            $mail->Username = $config['smtp_username'];
            $mail->Password = $config['smtp_password'];
            $mail->SMTPSecure = $config['smtp_secure'];
            $mail->Port = $config['smtp_port'];
            $mail->SMTPOptions = array('ssl' => array('verify_peer' => false, 'verify_peer_name' => false, 'allow_self_signed' => true));
            $mail->setFrom($config['from_email'], $config['from_name']);
            $mail->addAddress($email);
            $mail->isHTML(true);
            $mail->CharSet = 'UTF-8';
            $mail->Subject = $subject;
            $mail->Body = $htmlBody;
            $mail->AltBody = $textBody;
            
            $mail->send();
            
            // Log successful send
            error_log("✓ Email sent successfully to: $email");
            return true;
        } catch (\PHPMailer\PHPMailer\Exception $e) {
            error_log("✗ Email send failed: {$e->getMessage()}");
            error_log("SMTP Error Details: " . $mail->ErrorInfo ?? $e->getMessage());
            return false;
        } catch (Exception $e) {
            error_log("✗ General error: {$e->getMessage()}");
            return false;
        }
    } else {
        // Log OTP for testing (no PHPMailer installed)
        error_log("\n╔════════════════════════════════════════╗");
        error_log("║   PASSWORD RESET LOG (TESTING MODE)    ║");
        error_log("╠════════════════════════════════════════╣");
        error_log("║ To: $email");
        error_log("║ Subject: $subject");
        error_log("║ RESET CODE: $otp");
        error_log("║ Valid for: 10 minutes");
        error_log("╚════════════════════════════════════════╝\n");
        return true;
    }
}
?>

<?php
require_once __DIR__ . '/../config/Database.php';

/**
 * Generate a 6-digit OTP code
 */
function generateOTP() {
    return str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
}

/**
 * Store OTP in database with optional password, name, and phone for registration
 */
function storeOTP($db, $email, $otp_code, $password_hash = null, $fullName = null, $phone = null) {
    // Delete any existing OTPs for this email
    $deleteStmt = $db->prepare("DELETE FROM otp_verification WHERE email = ?");
    $deleteStmt->bind_param("s", $email);
    $deleteStmt->execute();
    
    // Calculate expiration time (10 minutes from now)
    $expires_at = date('Y-m-d H:i:s', strtotime('+10 minutes'));
    
    // Insert OTP record
    $insertStmt = $db->prepare("
        INSERT INTO otp_verification (email, otp_code, expires_at, verified, attempts) 
        VALUES (?, ?, ?, 0, 0)
    ");
    $insertStmt->bind_param("sss", $email, $otp_code, $expires_at);
    return $insertStmt->execute();
}

/**
 * Verify OTP code
 */
function verifyOTP($db, $email, $otp_code) {
    
    // Get OTP record
    $stmt = $db->prepare("
        SELECT * FROM otp_verification 
        WHERE email = ? AND otp_code = ? AND verified = 0
        ORDER BY created_at DESC 
        LIMIT 1
    ");
    $stmt->bind_param("ss", $email, $otp_code);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        return ['success' => false, 'message' => 'Invalid OTP code'];
    }
    
    $record = $result->fetch_assoc();
    
    // Check if already verified
    if ($record['verified'] == 1) {
        return ['success' => false, 'message' => 'OTP already used'];
    }
    
    // Check expiration
    if (strtotime($record['expires_at']) < time()) {
        return ['success' => false, 'message' => 'OTP has expired. Please request a new one'];
    }
    
    // Check attempts
    if ($record['attempts'] >= 5) {
        return ['success' => false, 'message' => 'Too many failed attempts. Please request a new OTP'];
    }
    
    // Mark as verified
    $updateStmt = $db->prepare("
        UPDATE otp_verification 
        SET verified = 1 
        WHERE id = ?
    ");
    $updateStmt->bind_param("i", $record['id']);
    $updateStmt->execute();
    
    return ['success' => true, 'message' => 'OTP verified successfully'];
}

/**
 * Increment failed OTP attempt
 */
function incrementOTPAttempt($db, $email) {
    $stmt = $db->prepare("
        UPDATE otp_verification 
        SET attempts = attempts + 1 
        WHERE email = ? AND verified = 0
        ORDER BY created_at DESC 
        LIMIT 1
    ");
    $stmt->bind_param("s", $email);
    return $stmt->execute();
}

/**
 * Clean up expired OTPs (can be called periodically)
 */
function cleanupExpiredOTPs($db) {
    $stmt = $db->prepare("
        DELETE FROM otp_verification 
        WHERE expires_at < NOW() OR (verified = 1 AND created_at < DATE_SUB(NOW(), INTERVAL 1 DAY))
    ");
    
    return $stmt->execute();
}

/**
 * Clear/Delete OTP for a specific email
 */
function clearOTP($db, $email) {
    $stmt = $db->prepare("DELETE FROM otp_verification WHERE email = ?");
    $stmt->bind_param("s", $email);
    return $stmt->execute();
}
?>

-- Add email verification columns to users table
ALTER TABLE users ADD COLUMN email_verified TINYINT DEFAULT 0;
ALTER TABLE users ADD COLUMN email_verified_at DATETIME NULL;

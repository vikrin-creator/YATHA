-- Add Stripe columns to orders table for tracking payment sessions and invoices
ALTER TABLE orders 
ADD COLUMN stripe_session_id VARCHAR(255) UNIQUE AFTER user_id,
ADD COLUMN stripe_invoice_id VARCHAR(255) UNIQUE AFTER stripe_session_id,
ADD COLUMN address_id INT AFTER stripe_invoice_id,
ADD INDEX idx_stripe_session (stripe_session_id),
ADD INDEX idx_stripe_invoice (stripe_invoice_id);

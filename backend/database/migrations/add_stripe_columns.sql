-- Add stripe_customer_id to users and stripe_invoice_id to orders
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255) NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_invoice_id VARCHAR(255) NULL;

-- Create subscriptions table for bookkeeping
CREATE TABLE IF NOT EXISTS subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  stripe_subscription_id VARCHAR(255) NOT NULL,
  product_id INT DEFAULT NULL,
  price_id VARCHAR(255) DEFAULT NULL,
  status VARCHAR(50) DEFAULT NULL,
  current_period_end DATETIME DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY (stripe_subscription_id),
  INDEX (user_id)
);

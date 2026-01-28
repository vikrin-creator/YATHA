-- Add shipment_quantity column to subscriptions table
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS shipment_quantity INT DEFAULT 1 AFTER product_id;

-- Add stripe_invoice_id column to orders table for tracking
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_invoice_id VARCHAR(255) UNIQUE AFTER stripe_session_id;

-- Create subscription_orders table to link subscriptions to their generated orders
CREATE TABLE IF NOT EXISTS subscription_orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    subscription_id INT NOT NULL,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    shipment_status ENUM('pending', 'processing', 'shipped', 'delivered', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_subscription (subscription_id),
    INDEX idx_order (order_id),
    INDEX idx_shipment_status (shipment_status)
);

-- Create subscription_skips table to track skipped shipments
CREATE TABLE IF NOT EXISTS subscription_skips (
    id INT PRIMARY KEY AUTO_INCREMENT,
    subscription_id INT NOT NULL,
    skip_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
    INDEX idx_subscription (subscription_id),
    INDEX idx_skip_date (skip_date),
    UNIQUE KEY unique_skip (subscription_id, skip_date)
);

-- Add subscription configuration columns to products table
ALTER TABLE products ADD COLUMN subscription_eligible BOOLEAN DEFAULT 1 AFTER featured;
ALTER TABLE products ADD COLUMN default_shipment_quantity INT DEFAULT 1 AFTER subscription_eligible;

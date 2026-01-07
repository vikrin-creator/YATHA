-- Database Schema for YATHA E-commerce Platform

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    stock_quantity INT DEFAULT 0,
    category VARCHAR(100),
    status ENUM('active', 'inactive', 'out_of_stock') DEFAULT 'active',
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Product Images Table
CREATE TABLE IF NOT EXISTS product_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('customer', 'admin') DEFAULT 'customer',
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    shipping_address TEXT NOT NULL,
    billing_address TEXT,
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Insert initial products from home page
INSERT INTO products (name, slug, description, short_description, price, original_price, stock_quantity, category, featured) VALUES
('Moringa Powder', 'moringa-powder', 'Premium organic moringa powder packed with essential nutrients, vitamins, and minerals. Sourced from the finest moringa leaves for maximum potency and purity.', 'Premium organic moringa powder rich in nutrients', 29.99, 39.99, 100, 'Superfood Powders', TRUE),
('Beetroot Powder', 'beetroot-powder', 'Pure beetroot powder made from fresh beetroots. Rich in nitrates, antioxidants, and natural compounds that support cardiovascular health and energy levels.', 'Pure beetroot powder for energy and vitality', 24.99, 34.99, 75, 'Superfood Powders', TRUE),
('ABC Powder', 'abc-powder', 'Unique blend of Amla, Beetroot, and Carrot powders creating a powerful antioxidant supplement. Combines vitamin C, beta-carotene, and natural nutrients.', 'Powerful Amla, Beetroot, Carrot powder blend', 34.99, 44.99, 50, 'Superfood Powders', TRUE),
('Turmeric Powder', 'turmeric-powder', 'High-quality organic turmeric powder with high curcumin content. Known for its anti-inflammatory properties and traditional use in wellness practices.', 'Organic turmeric powder with high curcumin', 19.99, 29.99, 120, 'Superfood Powders', TRUE);

-- Insert product images
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(1, '/images/MoringaPowder.png', 'Premium Organic Moringa Powder', TRUE, 1),
(2, '/images/BeetrootPowder.png', 'Pure Beetroot Powder', TRUE, 1),
(3, '/images/ABC Powder.png', 'ABC Powder Blend', TRUE, 1),
(4, '/images/TurmericPowder.png', 'Organic Turmeric Powder', TRUE, 1);

-- Create admin user
INSERT INTO users (first_name, last_name, email, password_hash, role) VALUES
('Admin', 'User', 'admin@yatha.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');
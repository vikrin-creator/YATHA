
-- Create users table with email verification
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('user', 'admin') DEFAULT 'user',
    email_verified TINYINT DEFAULT 0,
    email_verified_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) AUTO_INCREMENT = 1;

-- Create OTP verification table
CREATE TABLE otp_verification (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    verified TINYINT DEFAULT 0,
    attempts INT DEFAULT 0,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_otp_code (otp_code),
    INDEX idx_expires_at (expires_at)
);

-- Create products table
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description LONGTEXT,
    short_description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    stock_quantity INT DEFAULT 0,
    category VARCHAR(100),
    status ENUM('active', 'inactive') DEFAULT 'active',
    featured BOOLEAN DEFAULT FALSE,
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) AUTO_INCREMENT = 1;

-- Create reviews table
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create orders table
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
    shipping_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create order_items table
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Insert sample data
-- Sample users
INSERT INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@yatha.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('John Doe', 'john@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
('Jane Smith', 'jane@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user');

-- Sample products
INSERT INTO products (name, slug, description, short_description, price, original_price, stock_quantity, category, featured, image) VALUES
('Moringa Powder', 'moringa-powder', 
'Premium organic moringa powder packed with essential nutrients, vitamins, and minerals. Sourced from the finest moringa leaves for maximum potency and purity.', 
'Premium organic moringa powder rich in nutrients.', 
29.99, 39.99, 100, 'Superfood Powders', TRUE, '/uploads/images/moringa-powder.png'),

('Beetroot Powder', 'beetroot-powder', 
'Pure beetroot powder made from fresh beetroots. Rich in nitrates, antioxidants, and natural compounds that support cardiovascular health and energy levels.', 
'Pure beetroot powder for energy and vitality', 
24.99, 34.99, 75, 'Superfood Powders', TRUE, '/uploads/images/beetroot-powder.png'),

('ABC Powder', 'abc-powder', 
'Unique blend of Amla, Beetroot, and Carrot powders creating a powerful antioxidant supplement. Combines vitamin C, beta-carotene, and natural nutrients.', 
'Powerful Amla, Beetroot, Carrot powder blend', 
34.99, 44.99, 50, 'Superfood Powders', TRUE, '/uploads/images/abc-powder.png'),

('Turmeric Powder', 'turmeric-powder', 
'High-quality organic turmeric powder with high curcumin content. Known for its anti-inflammatory properties and traditional use in wellness practices.', 
'Organic turmeric powder with high curcumin', 
19.99, 29.99, 120, 'Superfood Powders', TRUE, '/uploads/images/turmeric-powder.png');

-- Sample reviews
INSERT INTO reviews (product_id, user_id, rating, comment, status) VALUES
(1, 2, 5, 'Excellent quality moringa powder! I feel more energetic.', 'approved'),
(1, 3, 4, 'Great product, arrived quickly.', 'approved'),
(2, 2, 5, 'Love the beetroot powder, great for pre-workout.', 'approved'),
(3, 3, 5, 'ABC powder is amazing! Highly recommend.', 'approved'),
(4, 2, 4, 'Good turmeric, natural taste.', 'approved');

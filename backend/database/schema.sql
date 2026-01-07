-- Yatha Database Schema

CREATE DATABASE IF NOT EXISTS yatha_db;
USE yatha_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sample data table
CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description LONGTEXT,
    short_description VARCHAR(500),
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    stock_quantity INT DEFAULT 0,
    category VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Product Images table
CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    customer_name VARCHAR(100) NOT NULL DEFAULT 'Anonymous',
    customer_email VARCHAR(100),
    title VARCHAR(255),
    rating INT DEFAULT 5,
    comment LONGTEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100),
    total_amount DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sample Reviews for Products
INSERT INTO reviews (product_id, customer_name, customer_email, title, rating, comment, status, created_at) VALUES
-- Moringa reviews (product_id = 1)
(1, 'Sarah M.', 'sarah@email.com', 'Feeling amazing!', 5, 'I\'ve been adding YATHA Moringa to my morning green juice for 2 weeks now. My energy levels are stable throughout the day. Highly recommend!', 'approved', DATE_SUB(NOW(), INTERVAL 15 DAY)),
(1, 'James L.', 'james@email.com', 'So pure and fresh', 5, 'You can tell this is high quality. The color is a vibrant green, not dull like other brands. Tastes earthy but fresh.', 'approved', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(1, 'Priya K.', 'priya@email.com', 'Great for immunity', 4, 'Bought this for my whole family to boost immunity. We love it in smoothies. Packaging is great too.', 'approved', DATE_SUB(NOW(), INTERVAL 8 DAY)),
(1, 'Michael R.', 'michael@email.com', 'Best moringa powder', 5, 'Best moringa powder I\'ve tried. Dissolves well, no chalky aftertaste. Worth every penny.', 'approved', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(1, 'Emma W.', 'emma@email.com', 'Great quality and fast delivery', 4, 'Great quality and fast delivery. Only wish it came in a larger size option for regular users.', 'approved', DATE_SUB(NOW(), INTERVAL 3 DAY)),

-- Beetroot Powder reviews (product_id = 2)
(2, 'David T.', 'david@email.com', 'Perfect pre-workout boost', 5, 'The natural energy boost from beetroot is incredible. No jitters like with coffee. Perfect for pre-workout.', 'approved', DATE_SUB(NOW(), INTERVAL 12 DAY)),
(2, 'Lisa P.', 'lisa@email.com', 'Helps with workouts', 4, 'Really helps with my workouts. Great taste, mixes well. Customer service was also very helpful.', 'approved', DATE_SUB(NOW(), INTERVAL 7 DAY)),
(2, 'John D.', 'john@email.com', 'Pure and effective', 5, 'Pure beetroot, no fillers. I can feel the difference in my athletic performance. Highly satisfied.', 'approved', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(2, 'Amy S.', 'amy@email.com', 'Love the flavor', 4, 'Love the flavor and health benefits. A little goes a long way. Been recommending to friends.', 'approved', DATE_SUB(NOW(), INTERVAL 2 DAY)),

-- Turmeric Powder reviews (product_id = 3)
(3, 'Robert B.', 'robert@email.com', 'Improved my joint health', 5, 'Been using this for my joint health. Noticeable improvement in flexibility and reduced inflammation.', 'approved', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(3, 'Susan H.', 'susan@email.com', 'Amazing for recovery', 5, 'Amazing for recovery after yoga. The quality is premium and I trust this brand completely.', 'approved', DATE_SUB(NOW(), INTERVAL 11 DAY)),
(3, 'Mark V.', 'mark@email.com', 'Real anti-inflammatory benefits', 4, 'Good turmeric powder. The anti-inflammatory benefits are real. Golden milk tastes better with this.', 'approved', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(3, 'Rachel G.', 'rachel@email.com', 'Essential to wellness', 5, 'This has become essential to my wellness routine. No additives, pure turmeric. Recommend!', 'approved', DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- ABC Powder reviews (product_id = 4)
(4, 'Thomas E.', 'thomas@email.com', 'Perfectly balanced blend', 5, 'The superfood blend is perfectly balanced. Great taste and incredible nutritional profile. Worth it!', 'approved', DATE_SUB(NOW(), INTERVAL 14 DAY)),
(4, 'Jennifer M.', 'jennifer@email.com', 'All three in one', 4, 'Love having all three superfoods in one powder. Convenient and delicious. My family loves it.', 'approved', DATE_SUB(NOW(), INTERVAL 9 DAY)),
(4, 'Christopher L.', 'christopher@email.com', 'Best all-in-one powder', 5, 'Best all-in-one superfood powder I\'ve found. The synergy between the three ingredients is amazing.', 'approved', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(4, 'Nicole S.', 'nicole@email.com', 'Perfect for busy mornings', 4, 'Great for busy mornings. One scoop and I get all the benefits. Highly recommend to anyone starting their wellness journey.', 'approved', DATE_SUB(NOW(), INTERVAL 1 DAY));

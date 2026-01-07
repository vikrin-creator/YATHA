<?php

// Database connection details
$host = 'srv2124.hstgr.io';
$db_name = 'u177524058_YATHA';
$username = 'u177524058_YATHA';
$password = 'Yatha@2025';

try {
    // Connect to MySQL with the existing database
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Check if 'title' column exists in reviews table
    $checkColumn = $conn->query("SHOW COLUMNS FROM reviews WHERE Field = 'title'");
    $titleExists = $checkColumn->rowCount() > 0;
    
    if (!$titleExists) {
        echo "Adding 'title' column to reviews table...\n";
        $conn->exec("ALTER TABLE reviews ADD COLUMN title VARCHAR(255) AFTER customer_email");
        echo "✓ 'title' column added successfully\n";
    } else {
        echo "✓ 'title' column already exists\n";
    }
    
    // Now insert the sample reviews
    echo "\nInserting sample reviews...\n";
    
    $reviews_sql = "INSERT INTO reviews (product_id, customer_name, customer_email, title, rating, comment, status, created_at) VALUES
-- Moringa reviews (product_id = 1)
(1, 'Sarah M.', 'sarah@email.com', 'Feeling amazing!', 5, 'I\\'ve been adding YATHA Moringa to my morning green juice for 2 weeks now. My energy levels are stable throughout the day. Highly recommend!', 'approved', DATE_SUB(NOW(), INTERVAL 15 DAY)),
(1, 'James L.', 'james@email.com', 'So pure and fresh', 5, 'You can tell this is high quality. The color is a vibrant green, not dull like other brands. Tastes earthy but fresh.', 'approved', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(1, 'Priya K.', 'priya@email.com', 'Great for immunity', 4, 'Bought this for my whole family to boost immunity. We love it in smoothies. Packaging is great too.', 'approved', DATE_SUB(NOW(), INTERVAL 8 DAY)),
(1, 'Michael R.', 'michael@email.com', 'Best moringa powder', 5, 'Best moringa powder I\\'ve tried. Dissolves well, no chalky aftertaste. Worth every penny.', 'approved', DATE_SUB(NOW(), INTERVAL 5 DAY)),
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
(4, 'Christopher L.', 'christopher@email.com', 'Best all-in-one powder', 5, 'Best all-in-one superfood powder I\\'ve found. The synergy between the three ingredients is amazing.', 'approved', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(4, 'Nicole S.', 'nicole@email.com', 'Perfect for busy mornings', 4, 'Great for busy mornings. One scoop and I get all the benefits. Highly recommend to anyone starting their wellness journey.', 'approved', DATE_SUB(NOW(), INTERVAL 1 DAY))";
    
    // Split and execute review inserts
    $conn->exec($reviews_sql);
    echo "✓ All sample reviews inserted successfully\n";
    
    echo "\n✓ Schema setup completed successfully!\n";
    
} catch (PDOException $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>

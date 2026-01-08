<?php

// Database connection
$host = getenv('DB_HOST') ?: 'srv2124.hstgr.io';
$db = getenv('DB_NAME') ?: 'u177524058_YATHA';
$user = getenv('DB_USER') ?: 'u177524058_YATHA';
$password = getenv('DB_PASSWORD') ?: 'Yatha@2025';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Sample FAQs
    $faqs = [
        [
            'question' => 'What are Yatha products?',
            'answer' => 'Yatha products are high-quality, natural wellness items crafted from moringa and other organic ingredients. Our products are designed to support healthy living and sustainable practices.',
            'display_order' => 1
        ],
        [
            'question' => 'How long does shipping take?',
            'answer' => 'Standard shipping typically takes 5-7 business days. Express shipping options are available at checkout for faster delivery. You will receive tracking information via email once your order ships.',
            'display_order' => 2
        ],
        [
            'question' => 'What is your return policy?',
            'answer' => 'We offer a 30-day money-back guarantee. If you\'re not satisfied with your purchase, simply contact our customer service team with your order number and we\'ll process a full refund.',
            'display_order' => 3
        ],
        [
            'question' => 'Are your products organic?',
            'answer' => 'Yes, all our products are made from certified organic ingredients. We are committed to providing the highest quality natural products without harmful chemicals or additives.',
            'display_order' => 4
        ],
        [
            'question' => 'Do you offer international shipping?',
            'answer' => 'Currently, we ship to select countries. Please check the shipping section at checkout to see if your country is available. We are expanding our shipping network regularly.',
            'display_order' => 5
        ],
        [
            'question' => 'How can I track my order?',
            'answer' => 'You will receive a tracking number via email once your order ships. You can use this number to track your package in real-time on the carrier\'s website.',
            'display_order' => 6
        ],
        [
            'question' => 'What payment methods do you accept?',
            'answer' => 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and other digital payment methods. All transactions are secure and encrypted.',
            'display_order' => 7
        ],
        [
            'question' => 'Are there any discounts for bulk orders?',
            'answer' => 'Yes! We offer special pricing for bulk orders. Please contact our sales team at sales@yatha.com for a custom quote based on your needs.',
            'display_order' => 8
        ],
        [
            'question' => 'How should I store my products?',
            'answer' => 'Store all Yatha products in a cool, dry place away from direct sunlight. Keep containers tightly sealed after opening. For specific storage instructions, refer to the product label or contact us.',
            'display_order' => 9
        ],
        [
            'question' => 'Can I cancel my order?',
            'answer' => 'Orders can be cancelled within 1 hour of placement. After that, your order enters our fulfillment process and cannot be cancelled. If you need to cancel, please contact support immediately.',
            'display_order' => 10
        ]
    ];

    // Insert FAQs
    $stmt = $pdo->prepare('INSERT INTO faqs (question, answer, display_order) VALUES (?, ?, ?)');
    
    foreach ($faqs as $faq) {
        $stmt->execute([$faq['question'], $faq['answer'], $faq['display_order']]);
        echo "✅ Added FAQ: {$faq['question']}\n";
    }

    echo "\n✅ Successfully added " . count($faqs) . " FAQs!\n";

} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>

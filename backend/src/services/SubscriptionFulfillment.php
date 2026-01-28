<?php

/**
 * Subscription Fulfillment Service
 * 
 * Handles automatic order creation from subscription payments
 * Manages recurring order generation and shipment tracking
 */

class SubscriptionFulfillment {
    private $db;
    
    public function __construct($database) {
        $this->db = $database;
    }
    
    /**
     * Create an order from a subscription payment
     * Called when invoice.payment_succeeded webhook is received
     * 
     * @param int $userId User ID
     * @param int $subscriptionId Subscription ID
     * @param int $productId Product ID
     * @param int $quantity Shipment quantity
     * @param string|null $stripeInvoiceId Stripe invoice ID for tracking
     * @return int Created order ID
     */
    public function createSubscriptionOrder($userId, $subscriptionId, $productId, $quantity = 1, $stripeInvoiceId = null) {
        error_log('[fulfillment] Creating subscription order: user=' . $userId . ', subscription=' . $subscriptionId . ', product=' . $productId . ', qty=' . $quantity);
        
        try {
            // Get product details
            $productStmt = $this->db->prepare("
                SELECT price, name FROM products WHERE id = ?
            ");
            
            if (!$productStmt) {
                throw new Exception('Database prepare error: ' . $this->db->error);
            }
            
            $productStmt->bind_param('i', $productId);
            $productStmt->execute();
            $productResult = $productStmt->get_result();
            $product = $productResult->fetch_assoc();
            $productStmt->close();
            
            if (!$product) {
                throw new Exception('Product not found: ' . $productId);
            }
            
            // Get user's default shipping address
            $addressStmt = $this->db->prepare("
                SELECT id, address, city, state, zip_code, country 
                FROM user_addresses 
                WHERE user_id = ? AND is_default = 1
                LIMIT 1
            ");
            
            if (!$addressStmt) {
                throw new Exception('Database error: ' . $this->db->error);
            }
            
            $addressStmt->bind_param('i', $userId);
            $addressStmt->execute();
            $addressResult = $addressStmt->get_result();
            $address = $addressResult->fetch_assoc();
            $addressStmt->close();
            
            // Format shipping address
            $shippingAddress = '';
            if ($address) {
                $shippingAddress = json_encode([
                    'address_id' => $address['id'],
                    'address' => $address['address'] ?? '',
                    'city' => $address['city'] ?? '',
                    'state' => $address['state'] ?? '',
                    'zip_code' => $address['zip_code'] ?? '',
                    'country' => $address['country'] ?? ''
                ]);
            }
            
            // Calculate order total
            $totalAmount = $product['price'] * $quantity;
            
            // Create order record
            $orderStmt = $this->db->prepare("
                INSERT INTO orders 
                (user_id, total_amount, status, shipping_address, stripe_invoice_id, created_at)
                VALUES (?, ?, ?, ?, ?, NOW())
            ");
            
            if (!$orderStmt) {
                throw new Exception('Database prepare error for orders insert: ' . $this->db->error);
            }
            
            $status = 'pending';
            $orderStmt->bind_param('idsss', $userId, $totalAmount, $status, $shippingAddress, $stripeInvoiceId);
            
            if (!$orderStmt->execute()) {
                throw new Exception('Failed to create order: ' . $orderStmt->error);
            }
            
            $orderId = $orderStmt->insert_id;
            $orderStmt->close();
            
            error_log('[fulfillment] Order created: order_id=' . $orderId);
            
            // Create subscription_orders link record
            $linkStmt = $this->db->prepare("
                INSERT INTO subscription_orders 
                (subscription_id, order_id, product_id, quantity, unit_price, shipment_status)
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            
            if (!$linkStmt) {
                throw new Exception('Database prepare error for subscription_orders insert: ' . $this->db->error);
            }
            
            $shipmentStatus = 'pending';
            error_log('[fulfillment] Binding params for subscription_orders: subscription_id=' . $subscriptionId . ', order_id=' . $orderId . ', product_id=' . $productId . ', quantity=' . $quantity . ', unit_price=' . $product['price'] . ', status=' . $shipmentStatus);
            
            $linkStmt->bind_param('iiiids', $subscriptionId, $orderId, $productId, $quantity, $product['price'], $shipmentStatus);
            
            if (!$linkStmt->execute()) {
                throw new Exception('Failed to create subscription_orders link: ' . $linkStmt->error);
            }
            
            $linkStmt->close();
            
            error_log('[fulfillment] Order created successfully: order_id=' . $orderId . ', amount=' . $totalAmount);
            
            return $orderId;
        } catch (Exception $e) {
            error_log('[fulfillment] EXCEPTION: ' . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Get all orders from a subscription
     * 
     * @param int $subscriptionId Subscription ID
     * @return array List of orders
     */
    public function getSubscriptionOrders($subscriptionId) {
        $stmt = $this->db->prepare("
            SELECT 
                o.id,
                o.user_id,
                o.total_amount,
                o.status,
                o.created_at,
                so.quantity,
                so.unit_price,
                so.shipment_status,
                p.name as product_name
            FROM subscription_orders so
            JOIN orders o ON so.order_id = o.id
            LEFT JOIN products p ON so.product_id = p.id
            WHERE so.subscription_id = ?
            ORDER BY o.created_at DESC
        ");
        
        if (!$stmt) {
            throw new Exception('Database error: ' . $this->db->error);
        }
        
        $stmt->bind_param('i', $subscriptionId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $orders = [];
        while ($row = $result->fetch_assoc()) {
            $orders[] = $row;
        }
        
        $stmt->close();
        
        return $orders;
    }
    
    /**
     * Update shipment status for a subscription order
     * 
     * @param int $subscriptionOrderId Subscription order link ID
     * @param string $status New status (pending, processing, shipped, delivered, failed)
     * @return bool Success
     */
    public function updateShipmentStatus($subscriptionOrderId, $status) {
        $validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'failed'];
        
        if (!in_array($status, $validStatuses)) {
            throw new Exception('Invalid shipment status: ' . $status);
        }
        
        $stmt = $this->db->prepare("
            UPDATE subscription_orders 
            SET shipment_status = ?, updated_at = NOW()
            WHERE id = ?
        ");
        
        if (!$stmt) {
            throw new Exception('Database error: ' . $this->db->error);
        }
        
        $stmt->bind_param('si', $status, $subscriptionOrderId);
        
        if (!$stmt->execute()) {
            throw new Exception('Failed to update shipment status: ' . $stmt->error);
        }
        
        $stmt->close();
        
        error_log('[fulfillment] Shipment status updated: id=' . $subscriptionOrderId . ', status=' . $status);
        
        return true;
    }
    
    /**
     * Skip next shipment for a subscription
     * Creates a skip record instead of an order
     * 
     * @param int $subscriptionId Subscription ID
     * @return int Skipped shipment ID
     */
    public function skipNextShipment($subscriptionId) {
        // Get subscription details
        $subStmt = $this->db->prepare("
            SELECT id, next_billing_date FROM subscriptions WHERE id = ?
        ");
        
        $subStmt->bind_param('i', $subscriptionId);
        $subStmt->execute();
        $subResult = $subStmt->get_result();
        $subscription = $subResult->fetch_assoc();
        $subStmt->close();
        
        if (!$subscription) {
            throw new Exception('Subscription not found: ' . $subscriptionId);
        }
        
        // Create skip record
        $skipStmt = $this->db->prepare("
            INSERT INTO subscription_skips 
            (subscription_id, skip_date, created_at)
            VALUES (?, ?, NOW())
        ");
        
        if (!$skipStmt) {
            throw new Exception('Database error: ' . $this->db->error);
        }
        
        $skipStmt->bind_param('is', $subscriptionId, $subscription['next_billing_date']);
        
        if (!$skipStmt->execute()) {
            throw new Exception('Failed to create skip record: ' . $skipStmt->error);
        }
        
        $skipId = $skipStmt->insert_id;
        $skipStmt->close();
        
        error_log('[fulfillment] Shipment skipped for subscription: ' . $subscriptionId);
        
        return $skipId;
    }
    
    /**
     * Check if a shipment should be skipped for a given subscription and date
     * 
     * @param int $subscriptionId Subscription ID
     * @param string $date Date to check (YYYY-MM-DD format)
     * @return bool True if skipped
     */
    public function isShipmentSkipped($subscriptionId, $date) {
        $stmt = $this->db->prepare("
            SELECT id FROM subscription_skips 
            WHERE subscription_id = ? AND DATE(skip_date) = ?
            LIMIT 1
        ");
        
        if (!$stmt) {
            throw new Exception('Database error: ' . $this->db->error);
        }
        
        $stmt->bind_param('is', $subscriptionId, $date);
        $stmt->execute();
        $result = $stmt->get_result();
        $skip = $result->fetch_assoc();
        $stmt->close();
        
        return !empty($skip);
    }
}

?>

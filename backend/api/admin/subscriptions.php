<?php
/**
 * Admin Subscriptions API
 * GET /api/admin/subscriptions - List all subscriptions with filters
 * POST /api/admin/subscriptions/action - Pause, resume, cancel, manually bill, skip
 */

header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', '0');

if (file_exists(__DIR__ . '/../../.env')) {
    $envLines = file(__DIR__ . '/../../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($envLines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            [$key, $value] = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value, '\'"');
            if (!getenv($key)) {
                putenv("$key=$value");
            }
        }
    }
}

require_once __DIR__ . '/../../src/config/Database.php';
require_once __DIR__ . '/../../src/utils/JWT.php';
require_once __DIR__ . '/../../src/utils/Response.php';

// CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get token
function getAuthToken() {
    // Try getallheaders first if available
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        if (isset($headers['Authorization'])) {
            if (preg_match('/Bearer\s+(.*)$/i', $headers['Authorization'], $matches)) {
                return $matches[1];
            }
        }
    }
    
    // Fallback to $_SERVER
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        if (preg_match('/Bearer\s+(.*)$/i', $_SERVER['HTTP_AUTHORIZATION'], $matches)) {
            return $matches[1];
        }
    }
    
    return null;
}

$token = getAuthToken();
if (!$token) {
    Response::error('No authorization token', 401);
    exit;
}

$jwt = new JWT();
$decoded = $jwt->verifyToken($token);
if (!$decoded) {
    Response::error('Invalid token', 401);
    exit;
}

// Check if admin - handle both object property and array key
$role = null;
if (is_object($decoded)) {
    $role = $decoded->role ?? null;
} elseif (is_array($decoded)) {
    $role = $decoded['role'] ?? null;
}

if ($role !== 'admin') {
    Response::error('Unauthorized - Admin access required', 403);
    exit;

$database = new Database();
$db = $database->connect();

if (!$db) {
    Response::error('Database connection failed', 500);
    exit;
}

// Route requests
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    handleGetSubscriptions($db);
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    handleAction($db);
} else {
    Response::error('Method not allowed', 405);
}

function handleGetSubscriptions($db) {
    $filterStatus = $_GET['status'] ?? 'all';
    $filterProduct = $_GET['product_id'] ?? null;
    $search = $_GET['search'] ?? null;

    $query = "
        SELECT 
            s.id,
            s.user_id,
            s.stripe_subscription_id,
            s.stripe_customer_id,
            s.product_id,
            s.shipment_quantity,
            s.status,
            s.current_period_start,
            s.current_period_end,
            s.next_billing_date,
            s.created_at,
            u.name as user_name,
            u.email as user_email,
            p.name as product_name,
            p.price as product_price
        FROM subscriptions s
        JOIN users u ON s.user_id = u.id
        JOIN products p ON s.product_id = p.id
        WHERE 1=1
    ";

    $params = [];
    $types = '';

    if ($filterStatus !== 'all') {
        $query .= " AND s.status = ?";
        $params[] = $filterStatus;
        $types .= 's';
    }

    if ($filterProduct) {
        $query .= " AND s.product_id = ?";
        $params[] = intval($filterProduct);
        $types .= 'i';
    }

    if ($search) {
        $query .= " AND (u.name LIKE ? OR u.email LIKE ?)";
        $searchTerm = '%' . $search . '%';
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $types .= 'ss';
    }

    $query .= " ORDER BY s.created_at DESC";

    $stmt = $db->prepare($query);

    if ($params) {
        $stmt->bind_param($types, ...$params);
    }

    $stmt->execute();
    $result = $stmt->get_result();
    $subscriptions = [];

    while ($row = $result->fetch_assoc()) {
        $subscriptions[] = [
            'id' => (int)$row['id'],
            'user_id' => (int)$row['user_id'],
            'user_name' => $row['user_name'],
            'user_email' => $row['user_email'],
            'product_id' => (int)$row['product_id'],
            'product_name' => $row['product_name'],
            'product_price' => (float)$row['product_price'],
            'shipment_quantity' => (int)$row['shipment_quantity'],
            'stripe_subscription_id' => $row['stripe_subscription_id'],
            'stripe_customer_id' => $row['stripe_customer_id'],
            'status' => $row['status'],
            'next_billing_date' => $row['next_billing_date'],
            'current_period_end' => $row['current_period_end'],
            'created_at' => $row['created_at']
        ];
    }

    $stmt->close();
    Response::success(['subscriptions' => $subscriptions, 'total' => count($subscriptions)]);
}

function handleAction($db) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $subscriptionId = $input['subscription_id'] ?? null;
    $action = $input['action'] ?? null;

    if (!$subscriptionId || !$action) {
        Response::error('Missing subscription_id or action', 400);
        exit;
    }

    // Get subscription
    $stmt = $db->prepare("SELECT * FROM subscriptions WHERE id = ?");
    $stmt->bind_param('i', $subscriptionId);
    $stmt->execute();
    $result = $stmt->get_result();
    $subscription = $result->fetch_assoc();
    $stmt->close();

    if (!$subscription) {
        Response::error('Subscription not found', 404);
        exit;
    }

    switch ($action) {
        case 'pause':
            $newStatus = 'paused';
            $updateStmt = $db->prepare("UPDATE subscriptions SET status = ? WHERE id = ?");
            $updateStmt->bind_param('si', $newStatus, $subscriptionId);
            $updateStmt->execute();
            $updateStmt->close();
            Response::success(['message' => 'Subscription paused']);
            break;

        case 'resume':
            $newStatus = 'active';
            $updateStmt = $db->prepare("UPDATE subscriptions SET status = ? WHERE id = ?");
            $updateStmt->bind_param('si', $newStatus, $subscriptionId);
            $updateStmt->execute();
            $updateStmt->close();
            Response::success(['message' => 'Subscription resumed']);
            break;

        case 'cancel':
            $newStatus = 'cancelled';
            $cancelledDate = date('Y-m-d H:i:s');
            $updateStmt = $db->prepare("UPDATE subscriptions SET status = ?, cancelled_at = ? WHERE id = ?");
            $updateStmt->bind_param('ssi', $newStatus, $cancelledDate, $subscriptionId);
            $updateStmt->execute();
            $updateStmt->close();
            Response::success(['message' => 'Subscription cancelled']);
            break;

        case 'manually_bill':
            createManualOrder($db, $subscription);
            break;

        case 'skip_month':
            $nextBillingDate = date('Y-m-d', strtotime($subscription['next_billing_date'] . ' +1 month'));
            $currentPeriodEnd = date('Y-m-d H:i:s', strtotime($subscription['current_period_end'] . ' +1 month'));
            
            $updateStmt = $db->prepare("UPDATE subscriptions SET next_billing_date = ?, current_period_end = ? WHERE id = ?");
            $updateStmt->bind_param('ssi', $nextBillingDate, $currentPeriodEnd, $subscriptionId);
            $updateStmt->execute();
            $updateStmt->close();
            Response::success(['message' => 'Next month skipped']);
            break;

        default:
            Response::error('Invalid action', 400);
    }
}

function createManualOrder($db, $subscription) {
    // Get product
    $productStmt = $db->prepare("SELECT name, price FROM products WHERE id = ?");
    $productStmt->bind_param('i', $subscription['product_id']);
    $productStmt->execute();
    $productResult = $productStmt->get_result();
    $product = $productResult->fetch_assoc();
    $productStmt->close();

    if (!$product) {
        Response::error('Product not found', 404);
        exit;
    }

    // Create order
    $totalAmount = (float)$product['price'] * (int)($subscription['shipment_quantity'] ?? 1);
    $status = 'pending';
    $emptyAddress = '';
    $invoiceId = 'manual_' . $subscription['id'] . '_' . time();

    $orderStmt = $db->prepare("
        INSERT INTO orders 
        (user_id, total_amount, status, shipping_address, stripe_invoice_id, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
    ");

    $orderStmt->bind_param('idsss', $subscription['user_id'], $totalAmount, $status, $emptyAddress, $invoiceId);
    
    if (!$orderStmt->execute()) {
        Response::error('Failed to create order: ' . $orderStmt->error, 500);
        exit;
    }

    $orderId = $orderStmt->insert_id;
    $orderStmt->close();

    // Link to subscription
    $linkStmt = $db->prepare("INSERT INTO subscription_orders (subscription_id, order_id) VALUES (?, ?)");
    $linkStmt->bind_param('ii', $subscription['id'], $orderId);
    $linkStmt->execute();
    $linkStmt->close();

    Response::success(['message' => 'Order created successfully', 'order_id' => $orderId]);
}
?>

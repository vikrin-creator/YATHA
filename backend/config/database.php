<?php

class Database {
    private static $instance = null;
    private $host = 'localhost';
    private $db_name = 'u177524058_YATHA';
    private $username = 'u177524058_YATHA';
    private $password = 'Yatha@2025';
    private $conn = null;

    private function __construct() {
        // Private constructor for singleton pattern
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    public function getConnection() {
        if ($this->conn === null) {
            try {
                $this->conn = new PDO(
                    "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                    $this->username,
                    $this->password
                );
                $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
                $this->conn->exec("set names utf8");
            } catch(PDOException $e) {
                error_log("Connection error: " . $e->getMessage());
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'message' => 'Database connection failed: ' . $e->getMessage()
                ]);
                exit();
            }
        }
        return $this->conn;
    }
}

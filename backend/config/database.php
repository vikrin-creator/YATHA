<?php

class Database {
    private static $instance = null;
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $conn;

    private function __construct() {
        $this->host = getenv('DB_HOST') ?: 'localhost';
        $this->db_name = getenv('DB_NAME') ?: 'u177524058_YATHA';
        $this->username = getenv('DB_USER') ?: 'u177524058_YATHA';
        $this->password = getenv('DB_PASSWORD') ?: 'Yatha@2025';
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    public function getConnection() {
        $this->conn = null;

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
            throw new Exception("Database connection failed");
        }

        return $this->conn;
    }
}

// Helper function for backward compatibility
function getDBConnection() {
    return Database::getInstance()->getConnection();
}

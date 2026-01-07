<?php

class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $conn = null;

    public function __construct() {
        // Auto-detect environment based on server
        if ($_SERVER['HTTP_HOST'] === 'localhost:5173' || $_SERVER['HTTP_HOST'] === 'localhost:3000' || $_SERVER['SERVER_NAME'] === 'localhost' || php_sapi_name() === 'cli-server') {
            // Development environment
            $this->host = 'localhost';
            $this->db_name = 'yatha_db';
            $this->username = 'root';
            $this->password = '';
        } else {
            // Production environment (Hostinger)
            $this->host = 'srv2124.hstgr.io';
            $this->db_name = 'u177524058_YATHA';
            $this->username = 'u177524058_YATHA';
            $this->password = 'Yatha@2025';
        }
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
            } catch(PDOException $e) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Connection Error: ' . $e->getMessage()
                ]);
                exit();
            }
        }
        return $this->conn;
    }
}

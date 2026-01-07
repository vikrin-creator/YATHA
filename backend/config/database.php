<?php

class Database {
    private $host = 'srv2124.hstgr.io';
    private $db_name = 'u177524058_YATHA';
    private $username = 'u177524058_YATHA';
    private $password = 'Yatha@2025';
    private $conn = null;

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

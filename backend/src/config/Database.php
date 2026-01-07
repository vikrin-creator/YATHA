<?php

class Database
{
    private $host;
    private $db_name;
    private $user;
    private $password;
    private $conn;

    public function __construct()
    {
        $this->host = getenv('DB_HOST') ?: 'srv2124.hstgr.io';
        $this->db_name = getenv('DB_NAME') ?: 'u177524058_YATHA';
        $this->user = getenv('DB_USER') ?: 'u177524058_YATHA';
        $this->password = getenv('DB_PASSWORD') ?: 'Yatha@2025';
    }

    public function connect()
    {
        $this->conn = null;

        try {
            $this->conn = new mysqli(
                $this->host,
                $this->user,
                $this->password,
                $this->db_name
            );

            if ($this->conn->connect_error) {
                throw new Exception('Connection Error: ' . $this->conn->connect_error);
            }

            $this->conn->set_charset("utf8");
        } catch (Exception $e) {
            die('Database connection failed: ' . $e->getMessage());
        }

        return $this->conn;
    }

    public function closeConnection()
    {
        if ($this->conn) {
            $this->conn->close();
        }
    }
}
?>

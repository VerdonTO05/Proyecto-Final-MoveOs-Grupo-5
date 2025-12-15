<?php
class Database
{
    private $host = "localhost";
    private $db_name = "moveos";
    private $username = "root";
    private $password = "";
    private $conn;

    /** 
     * Obtiene la conexión PDO a la base de datos 
     * @return PDO|null 
     */
    public function getConnection()
    {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            // Configurar PDO 
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            $this->conn->exec("set names utf8mb4");
        } catch (PDOException $e) {
            echo "Error de conexión: " . $e->getMessage();
            return $this->conn;
        }
    }
}
?>
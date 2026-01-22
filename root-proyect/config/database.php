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
        if ($this->conn !== null) {
            return $this->conn;
        }

        try {
            $this->conn = new PDO(
                "mysql:host={$this->host};dbname={$this->db_name};charset=utf8mb4",
                $this->username,
                $this->password
            );

            // Configurar PDO
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

        } catch (PDOException $e) {
            die("Error de conexión: " . $e->getMessage());
        }

        return $this->conn;
    }
}
?>
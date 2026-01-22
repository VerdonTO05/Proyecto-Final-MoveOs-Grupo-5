<?php
class Rol {
    private $conn;
    private $table_name = 'roles';

    public $id;
    public $name;

    /**
     * Constructor: recibe la conexión PDO
     * @param PDO $db
     */
    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Obtener todos los roles
     * @return array
     */
    public function getRoles() {
        $sql = "SELECT id, name FROM {$this->table_name} ORDER BY id ASC";
        $stmt = $this->conn->query($sql);
        return $stmt->fetchAll();
    }

    /**
     * Obtener un rol por ID
     * @param int $id
     * @return array|null
     */
    public function getRolById($id) {
        $sql = "SELECT id, name FROM {$this->table_name} WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }
}
?>

<?php
/**
 * Clase Rol
 * Gestiona los roles de usuarios en el sistema.
 */
class Rol {
    /**
     * Conexión a la base de datos (PDO)
     * @var PDO
     */
    private $conn;

    /**
     * Nombre de la tabla en la base de datos
     * @var string
     */
    private $table_name = 'roles';

    /**
     * Propiedades del rol
     */
    public $id;
    public $name;

    /**
     * Constructor
     * @param PDO $db Conexión a la base de datos
     */
    public function __construct($db) {
        $this->conn = $db;
    }

    /* =========================
       FUNCIONES PÚBLICAS
       ========================= */

    /**
     * Obtener todos los roles
     * @return array Lista de roles (cada elemento con 'id' y 'name')
     */
    public function getRoles() {
        $sql = "SELECT id, name FROM {$this->table_name} ORDER BY id ASC";
        $stmt = $this->conn->query($sql);
        return $stmt->fetchAll();
    }

    /**
     * Obtener un rol por su ID
     * @param int $id ID del rol
     * @return array|null Datos del rol o null si no existe
     */
    public function getRolById($id) {
        $sql = "SELECT id, name FROM {$this->table_name} WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }
}
?>

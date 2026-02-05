<?php
/**
 * Clase Category
 * Gestiona las categorías de actividades en la base de datos.
 */
class Category {
    /**
     * Conexión a la base de datos (PDO)
     * @var PDO
     */
    private $conn;

    /**
     * Nombre de la tabla en la base de datos
     * @var string
     */
    private $table_name = 'categories';

    /**
     * ID de la categoría
     * @var int
     */
    public $id;

    /**
     * Código único de la categoría
     * @var string
     */
    public $code;

    /**
     * Nombre de la categoría
     * @var string
     */
    public $name;

    /**
     * Constructor de la clase
     * @param PDO $db Conexión a la base de datos
     */
    public function __construct($db){
        $this->conn = $db;
    }

    /* =========================
       FUNCIONES PÚBLICAS
       ========================= */

    /**
     * Obtener todas las categorías
     * @return array Lista de categorías
     */
    public function getCategories(){
        $sql = "SELECT * FROM {$this->table_name} ORDER BY name ASC";
        $stmt = $this->conn->query($sql);
        return $stmt->fetchAll();
    }

    /**
     * Obtener una categoría por su ID
     * @param int $id ID de la categoría
     * @return array|false Datos de la categoría o false si no existe
     */
    public function getCategoryById($id){
        $sql = "SELECT * FROM {$this->table_name} WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }

    /**
     * Obtener una categoría por su código
     * @param string $code Código único de la categoría
     * @return array|false Datos de la categoría o false si no existe
     */
    public function getCategoryByCode($code){
        $sql = "SELECT * FROM {$this->table_name} WHERE code = :code LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['code' => $code]);
        return $stmt->fetch();
    }

    /* =========================
       FUNCIONES ADMINISTRADOR
       ========================= */

    /**
     * Crear una nueva categoría
     * @param string $code Código único de la categoría
     * @param string $name Nombre de la categoría
     * @return mixed ID de la categoría creada o false si falla
     */
    public function createCategory($code, $name){
        $sql = "INSERT INTO {$this->table_name} (code, name) VALUES (:code, :name)";
        $stmt = $this->conn->prepare($sql);
        if($stmt->execute(['code' => $code, 'name' => $name])){
            // Retorna el ID de la nueva categoría
            return $this->conn->lastInsertId();
        }
        return false;
    }

    /**
     * Editar una categoría existente
     * @param int $id ID de la categoría a editar
     * @param string $code Nuevo código
     * @param string $name Nuevo nombre
     * @return bool True si se actualiza correctamente, false si falla
     */
    public function editCategory($id, $code, $name){
        $sql = "UPDATE {$this->table_name} SET code = :code, name = :name WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute(['code' => $code, 'name' => $name, 'id' => $id]);
    }

    /**
     * Eliminar una categoría
     * @param int $id ID de la categoría a eliminar
     * @return bool True si se elimina correctamente, false si falla
     */
    public function deleteCategory($id){
        $sql = "DELETE FROM {$this->table_name} WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute(['id' => $id]);
    }
}
?>

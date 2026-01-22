<?php
class Category {
    private $conn;
    private $table_name = 'categories';

    public $id;
    public $code;
    public $name;

    public function __construct($db){
        $this->conn = $db;
    }

    // Obtener todas las categorías
    public function getCategories(){
        $sql = "SELECT * FROM {$this->table_name} ORDER BY name ASC";
        $stmt = $this->conn->query($sql);
        return $stmt->fetchAll();
    }

    // Obtener categoría por ID
    public function getCategoryById($id){
        $sql = "SELECT * FROM {$this->table_name} WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }

    // Obtener categoría por código
    public function getCategoryByCode($code){
        $sql = "SELECT * FROM {$this->table_name} WHERE code = :code LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['code' => $code]);
        return $stmt->fetch();
    }


    //FUNCIONES ADMINISTRADOR
    // Crear categoría
    public function createCategory($code, $name){
        $sql = "INSERT INTO {$this->table_name} (code, name) VALUES (:code, :name)";
        $stmt = $this->conn->prepare($sql);
        if($stmt->execute(['code' => $code, 'name' => $name])){
            return $this->conn->lastInsertId();
        }
        return false;
    }

    // Editar categoría
    public function editCategory($id, $code, $name){
        $sql = "UPDATE {$this->table_name} SET code = :code, name = :name WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute(['code' => $code, 'name' => $name, 'id' => $id]);
    }

    // Eliminar categoría
    public function deleteCategory($id){
        $sql = "DELETE FROM {$this->table_name} WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute(['id' => $id]);
    }
}
?>

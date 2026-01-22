<?php
class User {
    private $conn;
    private $table_name = 'users';
    public $id;
    public $full_name;
    public $email;
    public $username;
    public $role_id;
    public $created_at;

    /**
     * Constructor: recibe la conexión a la base de datos
     * @param PDO $db
     */
    public function __construct($db){
        $this->conn = $db;
    }

    /**
     * Obtener todos los usuarios
     * @return array
     */
    public function getUsers() {
        $sql = "SELECT u.id, u.full_name, u.email, u.username, r.name AS role, u.created_at
                FROM {$this->table_name} u
                JOIN roles r ON u.role_id = r.id
                ORDER BY u.full_name ASC";

        $stmt = $this->conn->query($sql);
        return $stmt->fetchAll();
    }

    /**
     * Obtener usuario por ID
     * @param int $id
     * @return array|null
     */
    public function getUserById($id) {
        $sql = "SELECT u.id, u.full_name, u.email, u.username, r.name AS role, u.created_at
                FROM {$this->table_name} u
                JOIN roles r ON u.role_id = r.id
                WHERE u.id = :id";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }

    /**
     * Login de usuario
     * @param string $email
     * @param string $password
     * @return array|false
     */
    public function login($email, $password) {
        $sql = "SELECT * FROM {$this->table_name} WHERE email = :email LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password_hash'])) {
            // Login exitoso
            return $user;
        }

        return false; // login fallido
    }

    /**
     * Registrar un nuevo usuario
     * @param array $data
     * @return int|false ID del usuario o false
     */
    public function registerUser($data) {
        $sql = "INSERT INTO {$this->table_name} 
                (full_name, email, username, password_hash, role_id)
                VALUES (:full_name, :email, :username, :password_hash, :role_id)";

        $stmt = $this->conn->prepare($sql);
        $data['password_hash'] = password_hash($data['password'], PASSWORD_BCRYPT);
        unset($data['password']); // eliminar la clave original por seguridad

        if ($stmt->execute($data)) {
            return $this->conn->lastInsertId();
        }

        return false;
    }

    /**
     * Editar usuario
     * @param int $id
     * @param array $data
     * @return bool
     */
    public function editUser($id, $data) {
        $sql = "UPDATE {$this->table_name} SET
                full_name = :full_name,
                email = :email,
                username = :username,
                role_id = :role_id
                WHERE id = :id";

        $stmt = $this->conn->prepare($sql);
        $data['id'] = $id;
        return $stmt->execute($data);
    }

    /**
     * Logout de usuario (simplemente destruye sesión)
     */
    public function logoutUser() {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
        session_unset();
        session_destroy();
    }
}
?>

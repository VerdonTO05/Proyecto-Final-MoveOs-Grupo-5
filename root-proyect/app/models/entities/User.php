<?php
/**
 * Clase User
 * Gestiona los usuarios del sistema: creación, edición, login y consulta.
 */
class User
{
    /**
     * Conexión a la base de datos (PDO)
     * @var PDO
     */
    private $conn;

    /**
     * Nombre de la tabla en la base de datos
     * @var string
     */
    private $table_name = 'users';

    /**
     * Propiedades del usuario
     */
    public $id;
    public $full_name;
    public $email;
    public $username;
    public $role_id;
    public $created_at;

    /**
     * Constructor
     * @param PDO $db Conexión a la base de datos
     */
    public function __construct($db)
    {
        $this->conn = $db;
    }

    /* =========================
       FUNCIONES DE CONSULTA
       ========================= */

    /**
     * Obtener todos los usuarios
     * @return array Lista de usuarios con su rol
     */
    public function getUsers()
    {
        $sql = "SELECT u.id, u.full_name, u.email, u.username, r.name AS role, u.created_at
                FROM {$this->table_name} u
                JOIN roles r ON u.role_id = r.id
                ORDER BY u.full_name ASC";

        $stmt = $this->conn->query($sql);
        return $stmt->fetchAll();
    }

    /**
     * Obtener usuario por ID
     * @param int $id ID del usuario
     * @return array|null Datos del usuario o null si no existe
     */
    public function getUserById($id)
    {
        $sql = "SELECT u.id, u.full_name, u.email, u.username, r.name AS role, u.created_at
                FROM {$this->table_name} u
                JOIN roles r ON u.role_id = r.id
                WHERE u.id = :id";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }

    /* =========================
       AUTENTICACIÓN
       ========================= */

    /**
     * Login de usuario por username
     * @param string $username
     * @param string $password
     * @return array|false Datos del usuario si las credenciales son correctas, false si no
     */
    public function loginByUsername($username, $password)
    {
        $sql = "SELECT u.*, r.name AS role_name
                FROM {$this->table_name} u
                INNER JOIN roles r ON u.role_id = r.id
                WHERE u.username = :username
                LIMIT 1";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['username' => $username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // Verificar contraseña con password_hash
        if ($user && password_verify($password, $user['password_hash'])) {
            return $user;
        }

        return false;
    }

    /* =========================
       GESTIÓN DE USUARIOS
       ========================= */

    /**
     * Registrar un nuevo usuario
     * @param array $data Datos del usuario ('full_name', 'email', 'username', 'password', 'role_id')
     * @return int|false ID del usuario insertado o false si falla
     */
    public function registerUser($data)
    {
        $sql = "INSERT INTO {$this->table_name} 
                (full_name, email, username, password_hash, role_id)
                VALUES (:full_name, :email, :username, :password_hash, :role_id)";

        // Encriptar la contraseña
        $data['password_hash'] = password_hash($data['password'], PASSWORD_BCRYPT);
        unset($data['password']); // eliminar la clave original por seguridad

        $stmt = $this->conn->prepare($sql);
        if ($stmt->execute($data)) {
            return $this->conn->lastInsertId();
        }

        return false;
    }

    /**
     * Editar un usuario existente
     * @param int $id ID del usuario
     * @param array $data Datos a actualizar ('full_name', 'email', 'username', 'role_id')
     * @return bool true si se actualiza correctamente, false si falla
     */
    public function editUser($id, $data)
    {
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
}
?>

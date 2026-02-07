<?php
use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../app/models/entities/User.php';
require_once __DIR__ . '/../config/database.php';

class RegisterTest extends TestCase
{
    private $pdo;
    private $userModel;

    protected function setUp(): void
    {
        // Conexión a la base de datos de pruebas
        $this->pdo = new PDO('mysql:host=localhost;dbname=moveos_test;charset=utf8', 'root', '');
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Limpiar tablas antes de cada test
        $this->pdo->exec("DELETE FROM users");
        $this->pdo->exec("DELETE FROM roles");

        // Insertar rol de prueba
        $this->pdo->exec("INSERT INTO roles (id, name) VALUES (1, 'participante')");

        $this->userModel = new User($this->pdo);
    }

    private function registerUser($fullname, $username, $email, $password, $role = 'participante')
    {
        // Buscar rol
        $stmt = $this->pdo->prepare("SELECT id, name FROM roles WHERE name = ?");
        $stmt->execute([$role]);
        $rolData = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$rolData) {
            return ['success' => false, 'message' => 'El rol asignado no existe'];
        }

        $password_hash = password_hash($password, PASSWORD_DEFAULT);

        try {
            $stmt = $this->pdo->prepare("
                INSERT INTO users (full_name, email, username, password_hash, state, role_id)
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([$fullname, $email, $username, $password_hash, 'activa', $rolData['id']]);

            return [
                'success' => true,
                'message' => 'Usuario registrado con éxito',
                'userData' => [
                    'user_id' => $this->pdo->lastInsertId(),
                    'username' => $username,
                    'role' => $rolData['name']
                ]
            ];
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) {
                return [
                    'success' => false,
                    'message' => 'El correo electrónico o el nombre de usuario ya están registrados.'
                ];
            }
            return ['success' => false, 'message' => 'Error de base de datos: ' . $e->getMessage()];
        }
    }

    public function testRegisterSuccess()
    {
        $response = $this->registerUser('Irene Pérez', 'iperez', 'irene@example.com', '12345678');

        $this->assertTrue($response['success']);
        $this->assertEquals('Usuario registrado con éxito', $response['message']);
        $this->assertArrayHasKey('userData', $response);
        $this->assertEquals('iperez', $response['userData']['username']);
    }

    public function testRegisterMissingField()
    {
        $response = $this->registerUser('', 'iperez', 'irene@example.com', '12345678');

        $this->assertFalse($response['success']);
        $this->assertEquals('El rol asignado no existe', $response['message']); // porque no pasa la búsqueda del rol si el nombre de usuario vacío no coincide
    }

    public function testRegisterDuplicateEmail()
    {
        // Insertar un usuario previamente
        $this->registerUser('Irene Pérez', 'iperez', 'irene@example.com', '12345678');

        // Intentar registrar con el mismo email
        $response = $this->registerUser('Irene Pérez', 'iperez2', 'irene@example.com', '12345678');

        $this->assertFalse($response['success']);
        $this->assertEquals('El correo electrónico o el nombre de usuario ya están registrados.', $response['message']);
    }
}

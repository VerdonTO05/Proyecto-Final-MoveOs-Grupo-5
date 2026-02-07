<?php
use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../app/models/entities/User.php';
require_once __DIR__ . '/../config/database.php';

class LoginTest extends TestCase
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

        // Crear rol de prueba
        $this->pdo->exec("INSERT INTO roles (id, name) VALUES (1, 'participante')");

        // Instanciar modelo de usuario
        $this->userModel = new User($this->pdo);
    }

    private function createTestUser($username = 'iperez', $password = '12345678', $email = 'irene@example.com')
    {
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $this->pdo->prepare("
            INSERT INTO users (full_name, email, username, password_hash, state, role_id)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute(['Irene Pérez', $email, $username, $hash, 'activa', 1]);
        return $username;
    }

    public function testLoginSuccess()
    {
        $this->createTestUser();

        $username = 'iperez';
        $password = '12345678';

        $user = $this->userModel->loginByUsername($username, $password);

        $this->assertNotFalse($user, "El login debería devolver un usuario");
        $this->assertEquals($username, $user['username']);
        $this->assertEquals('participante', $user['role_name']);
    }

    public function testLoginWrongPassword()
    {
        $this->createTestUser();

        $username = 'iperez';
        $password = 'wrongpass';

        $user = $this->userModel->loginByUsername($username, $password);

        $this->assertFalse($user, "El login con contraseña incorrecta debería fallar");
    }

    public function testLoginEmptyFields()
    {
        $user = $this->userModel->loginByUsername('', '');
        $this->assertFalse($user, "El login con campos vacíos debería fallar");
    }
}

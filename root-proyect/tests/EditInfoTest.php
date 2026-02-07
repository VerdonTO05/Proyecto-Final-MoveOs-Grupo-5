<?php
use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../app/models/entities/User.php';
require_once __DIR__ . '/../config/database.php';

class EditInfoTest extends TestCase
{
    private $pdo;
    private $userModel;
    private $userId;

    protected function setUp(): void
    {
        $this->pdo = new PDO('mysql:host=localhost;dbname=moveos_test;charset=utf8', 'root', '');
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Limpiar tablas
        $this->pdo->exec("DELETE FROM users");
        $this->pdo->exec("DELETE FROM roles");

        // Crear rol y usuario de prueba
        $this->pdo->exec("INSERT INTO roles (id, name) VALUES (1, 'participante')");
        $hash = password_hash('12345678', PASSWORD_DEFAULT);
        $stmt = $this->pdo->prepare("INSERT INTO users (full_name, email, username, password_hash, state, role_id) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute(['Irene Pérez', 'irene@example.com', 'iperez', $hash, 'activa', 1]);
        $this->userId = $this->pdo->lastInsertId();

        $this->userModel = new User($this->pdo);

        // Simular sesión
        $_SESSION = [];
        $_SESSION['user_id'] = $this->userId;
    }

    public function testUpdateWithoutPassword()
    {
        $fullname = 'Irene Actualizada';
        $username = 'iperez123';
        $email = 'irene123@example.com';
        $passwordHash = null;

        $this->userModel->updateUser($this->userId, $fullname, $username, $email, $passwordHash);

        $user = $this->userModel->getUserById($this->userId);

        $this->assertEquals($fullname, $user['full_name']);
        $this->assertEquals($username, $user['username']);
        $this->assertEquals($email, $user['email']);
    }

    public function testUpdateWithPassword()
    {
        $fullname = 'Irene Cambio';
        $username = 'iperez321';
        $email = 'irene321@example.com';
        $newPassword = 'newpass123';
        $passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);

        $this->userModel->updateUser($this->userId, $fullname, $username, $email, $passwordHash);

        $user = $this->userModel->getUserById($this->userId);

        $this->assertEquals($fullname, $user['full_name']);
        $this->assertEquals($username, $user['username']);
        $this->assertEquals($email, $user['email']);
        $this->assertTrue(password_verify($newPassword, $user['password_hash']));
    }
}

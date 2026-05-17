<?php
use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../app/models/entities/User.php';

/**
 * Tests unitarios "puros" de la clase User usando mocks de PDO.
 *
 * A diferencia de LoginTest / RegisterTest / EditInfoTest, estos tests
 * NO se conectan a la base de datos: sustituyen PDO y PDOStatement por
 * dobles controlados por PHPUnit. Esto permite:
 *   - Probar ramas de error difíciles de reproducir con BD real
 *     (PDOException, fallos de execute, etc.)
 *   - Ejecutar los tests en milisegundos
 *   - No depender de XAMPP/MySQL para correr la suite
 *
 * @testdox Pruebas unitarias de Usuario (con Mocks de PDO)
 */
class UserMockTest extends TestCase
{
    /* =========================
       loginByUsername
       ========================= */

    /**
     * @testdox Login correcto con contraseña válida devuelve el usuario
     */
    public function testLoginSuccessWithCorrectPassword()
    {
        $password = '12345678';
        $hash = password_hash($password, PASSWORD_DEFAULT);

        // Mock del statement: execute() devuelve true, fetch() devuelve el usuario
        $stmtMock = $this->createMock(PDOStatement::class);
        $stmtMock->expects($this->once())
                 ->method('execute')
                 ->with(['username' => 'iperez'])
                 ->willReturn(true);

        $stmtMock->method('fetch')
                 ->with(PDO::FETCH_ASSOC)
                 ->willReturn([
                     'id'            => 1,
                     'username'      => 'iperez',
                     'password_hash' => $hash,
                     'role_name'     => 'participante'
                 ]);

        // Mock del PDO: prepare() devuelve nuestro statement falso
        $pdoMock = $this->createMock(PDO::class);
        $pdoMock->expects($this->once())
                ->method('prepare')
                ->willReturn($stmtMock);

        $userModel = new User($pdoMock);
        $result = $userModel->loginByUsername('iperez', $password);

        $this->assertNotFalse($result, "El login con contraseña correcta debería devolver el usuario");
        $this->assertEquals('iperez', $result['username']);
        $this->assertEquals('participante', $result['role_name']);
    }

    /**
     * @testdox Login falla cuando la contraseña es incorrecta
     */
    public function testLoginFailsWithWrongPassword()
    {
        $hash = password_hash('correctpass', PASSWORD_DEFAULT);

        $stmtMock = $this->createMock(PDOStatement::class);
        $stmtMock->method('execute')->willReturn(true);
        $stmtMock->method('fetch')->willReturn([
            'id'            => 1,
            'username'      => 'iperez',
            'password_hash' => $hash,
            'role_name'     => 'participante'
        ]);

        $pdoMock = $this->createMock(PDO::class);
        $pdoMock->method('prepare')->willReturn($stmtMock);

        $userModel = new User($pdoMock);
        $result = $userModel->loginByUsername('iperez', 'wrongpass');

        $this->assertFalse($result, "El login con contraseña incorrecta debería devolver false");
    }

    /**
     * @testdox Login falla cuando el usuario no existe
     */
    public function testLoginFailsWhenUserNotFound()
    {
        // fetch() devuelve false -> usuario no existe
        $stmtMock = $this->createMock(PDOStatement::class);
        $stmtMock->method('execute')->willReturn(true);
        $stmtMock->method('fetch')->willReturn(false);

        $pdoMock = $this->createMock(PDO::class);
        $pdoMock->method('prepare')->willReturn($stmtMock);

        $userModel = new User($pdoMock);
        $result = $userModel->loginByUsername('nobody', 'whatever');

        $this->assertFalse($result, "El login con usuario inexistente debería devolver false");
    }

    /* =========================
       getUserById
       ========================= */

    /**
     * @testdox Obtener usuario por ID devuelve sus datos
     */
    public function testGetUserByIdReturnsUserData()
    {
        $expectedUser = [
            'id'            => 5,
            'full_name'     => 'Francisco Pino',
            'email'         => 'fran@gmail.com',
            'username'      => 'fran_pino',
            'password_hash' => 'irrelevant',
            'profile_image' => 'uploads/avatars/avatar_5.jpg',
            'role'          => 'participante',
            'created_at'    => '2026-04-28 12:50:53'
        ];

        $stmtMock = $this->createMock(PDOStatement::class);
        $stmtMock->expects($this->once())
                 ->method('execute')
                 ->with(['id' => 5])
                 ->willReturn(true);
        $stmtMock->method('fetch')->willReturn($expectedUser);

        $pdoMock = $this->createMock(PDO::class);
        $pdoMock->method('prepare')->willReturn($stmtMock);

        $userModel = new User($pdoMock);
        $result = $userModel->getUserById(5);

        $this->assertEquals('fran_pino', $result['username']);
        $this->assertEquals('Francisco Pino', $result['full_name']);
    }

    /* =========================
       updateUser
       ========================= */

    /**
     * @testdox Editar usuario falla si el email ya está en uso
     */
    public function testUpdateUserFailsWhenEmailTaken()
    {
        // Primer prepare() -> check email: encuentra otro usuario con ese email
        $stmtEmailCheck = $this->createMock(PDOStatement::class);
        $stmtEmailCheck->method('execute')->willReturn(true);
        $stmtEmailCheck->method('fetch')->willReturn(['id' => 99]); // email ocupado

        $pdoMock = $this->createMock(PDO::class);
        // Solo se debe llegar al primer prepare; no debe alcanzar el UPDATE
        $pdoMock->expects($this->once())
                ->method('prepare')
                ->willReturn($stmtEmailCheck);

        $userModel = new User($pdoMock);
        $result = $userModel->updateUser(1, 'Nuevo Nombre', 'newuser', 'taken@example.com');

        $this->assertIsArray($result);
        $this->assertEquals('email_taken', $result['error']);
    }

    /**
     * @testdox Editar usuario falla si el nombre de usuario ya está en uso
     */
    public function testUpdateUserFailsWhenUsernameTaken()
    {
        // 1) check email -> libre (fetch false)
        $stmtEmailCheck = $this->createMock(PDOStatement::class);
        $stmtEmailCheck->method('execute')->willReturn(true);
        $stmtEmailCheck->method('fetch')->willReturn(false);

        // 2) check username -> ocupado
        $stmtUserCheck = $this->createMock(PDOStatement::class);
        $stmtUserCheck->method('execute')->willReturn(true);
        $stmtUserCheck->method('fetch')->willReturn(['id' => 77]);

        $pdoMock = $this->createMock(PDO::class);
        // Dos llamadas a prepare(), en este orden
        $pdoMock->expects($this->exactly(2))
                ->method('prepare')
                ->willReturnOnConsecutiveCalls($stmtEmailCheck, $stmtUserCheck);

        $userModel = new User($pdoMock);
        $result = $userModel->updateUser(1, 'Nuevo Nombre', 'taken_user', 'free@example.com');

        $this->assertIsArray($result);
        $this->assertEquals('username_taken', $result['error']);
    }

    /**
     * @testdox Editar usuario sin cambiar contraseña actualiza los datos
     */
    public function testUpdateUserSucceedsWithoutPassword()
    {
        // 1) check email libre, 2) check username libre, 3) UPDATE
        $stmtEmail = $this->createMock(PDOStatement::class);
        $stmtEmail->method('execute')->willReturn(true);
        $stmtEmail->method('fetch')->willReturn(false);

        $stmtUser = $this->createMock(PDOStatement::class);
        $stmtUser->method('execute')->willReturn(true);
        $stmtUser->method('fetch')->willReturn(false);

        $stmtUpdate = $this->createMock(PDOStatement::class);
        $stmtUpdate->expects($this->once())
                   ->method('execute')
                   ->with(['Nuevo', 'newuser', 'new@example.com', 1])
                   ->willReturn(true);

        $pdoMock = $this->createMock(PDO::class);
        $pdoMock->method('prepare')
                ->willReturnOnConsecutiveCalls($stmtEmail, $stmtUser, $stmtUpdate);

        $userModel = new User($pdoMock);
        $result = $userModel->updateUser(1, 'Nuevo', 'newuser', 'new@example.com');

        $this->assertTrue($result);
    }

    /* =========================
       deactivateUser
       ========================= */

    /**
     * @testdox Dar de baja un usuario llama al procedimiento almacenado deactivate_user
     */
    public function testDeactivateUserCallsStoredProcedure()
    {
        $stmtMock = $this->createMock(PDOStatement::class);
        $stmtMock->expects($this->once())
                 ->method('execute')
                 ->with(['id' => 42])
                 ->willReturn(true);

        $pdoMock = $this->createMock(PDO::class);
        // Verificamos que se llama al procedimiento almacenado correcto
        $pdoMock->expects($this->once())
                ->method('prepare')
                ->with($this->stringContains('CALL deactivate_user'))
                ->willReturn($stmtMock);

        $userModel = new User($pdoMock);
        $this->assertTrue($userModel->deactivateUser(42));
    }

    /* =========================
       toggleUserState
       ========================= */

    /**
     * @testdox Cambiar el estado del usuario pasa los parámetros correctos a la consulta
     */
    public function testToggleUserStatePassesCorrectParams()
    {
        $stmtMock = $this->createMock(PDOStatement::class);
        $stmtMock->expects($this->once())
                 ->method('execute')
                 ->with(['state' => 'inactiva', 'id' => 7])
                 ->willReturn(true);

        $pdoMock = $this->createMock(PDO::class);
        $pdoMock->method('prepare')->willReturn($stmtMock);

        $userModel = new User($pdoMock);
        $this->assertTrue($userModel->toggleUserState(7, 'inactiva'));
    }
}

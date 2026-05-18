<?php
use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../app/models/entities/User.php';
require_once __DIR__ . '/../app/models/entities/Activity.php';
require_once __DIR__ . '/../config/database.php';

/**
 * Pruebas de seguridad del sistema MOVEos.
 *
 * Verifican que el uso de PDO con consultas preparadas bloquea los
 * ataques más comunes contra aplicaciones web:
 *
 *   - Inyección SQL en login, recuperación de contraseña y edición de perfil
 *   - Almacenamiento seguro de contraseñas (hashing con bcrypt)
 *   - Robustez ante entradas extremas (strings vacíos, muy largos, nulos)
 *   - Almacenamiento de payloads XSS como texto plano sin ejecución
 *
 * Todos los tests usan la base de datos 'moveos_test' para no
 * afectar a los datos de producción.
 *
 * @testdox Pruebas de seguridad: inyeccion SQL, hashing y entradas maliciosas
 */
class SecurityTest extends TestCase
{
    private $pdo;
    private $userModel;
    private $userId;

    protected function setUp(): void
    {
        $this->pdo = new PDO('mysql:host=localhost;dbname=moveos_test;charset=utf8', 'root', '');
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Limpiar y preparar datos mínimos
        $this->pdo->exec("DELETE FROM users");
        $this->pdo->exec("DELETE FROM roles");
        $this->pdo->exec("INSERT INTO roles (id, name) VALUES (1, 'participante'), (2, 'organizador'), (3, 'administrador')");

        // Usuario legítimo de referencia
        $hash = password_hash('Password123!', PASSWORD_DEFAULT);
        $stmt = $this->pdo->prepare(
            "INSERT INTO users (full_name, email, username, password_hash, state, role_id)
             VALUES (?, ?, ?, ?, 'activa', 1)"
        );
        $stmt->execute(['Usuario Prueba', 'legitimo@example.com', 'usuarioprueba', $hash]);
        $this->userId = (int) $this->pdo->lastInsertId();

        $this->userModel = new User($this->pdo);
    }

    /* =========================================================
       BLOQUE 1 — Inyección SQL en el login
       =========================================================
       Todos estos payloads deben devolver FALSE: PDO los trata
       como strings literales, nunca como fragmentos SQL.
       ========================================================= */

    /**
     * @testdox Inyeccion SQL clasica en username no salta la autenticacion
     */
    public function testInjectionClasicaEnUsernameDevuelveFalse(): void
    {
        // Payload: cierra la cadena y añade condición siempre verdadera
        $result = $this->userModel->loginByUsername("' OR '1'='1", 'cualquier');
        $this->assertFalse($result, "La inyeccion SQL clasica no debe permitir el acceso");
    }

    /**
     * @testdox Inyeccion SQL con comentario SQL en username es bloqueada
     */
    public function testInjectionConComentarioSqlDevuelveFalse(): void
    {
        // Payload: intenta comentar el resto del WHERE
        $result = $this->userModel->loginByUsername("usuarioprueba'--", 'cualquier');
        $this->assertFalse($result, "El comentario SQL no debe eliminar la comprobacion de password");
    }

    /**
     * @testdox Inyeccion SQL DROP TABLE en username no destruye la tabla
     */
    public function testInjectionDropTableNoDestruyeTabla(): void
    {
        $payload = "'; DROP TABLE users;--";
        $result  = $this->userModel->loginByUsername($payload, 'cualquier');

        $this->assertFalse($result, "El payload DROP TABLE debe tratarse como string literal");

        // Verificar que la tabla users sigue existiendo con sus datos
        $count = (int) $this->pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
        $this->assertEquals(1, $count, "La tabla users debe seguir intacta tras el intento de inyeccion");
    }

    /**
     * @testdox Inyeccion SQL UNION SELECT en username no expone datos de otros usuarios
     */
    public function testInjectionUnionSelectDevuelveFalse(): void
    {
        $payload = "' UNION SELECT id, username, email, password_hash, '', '', role_id, '' FROM users--";
        $result  = $this->userModel->loginByUsername($payload, 'cualquier');
        $this->assertFalse($result, "UNION SELECT no debe devolver filas de otras consultas");
    }

    /**
     * @testdox Inyeccion SQL con OR 1=1 en password no salta la autenticacion
     */
    public function testInjectionEnPasswordDevuelveFalse(): void
    {
        // El password se verifica con password_verify() en PHP, no en SQL
        // pero verificamos que el flujo completo es seguro
        $result = $this->userModel->loginByUsername('usuarioprueba', "' OR '1'='1");
        $this->assertFalse($result, "La inyeccion en el campo password no debe dar acceso");
    }

    /**
     * @testdox Inyeccion SQL en getUserByEmail devuelve null sin exponer datos
     */
    public function testInjectionEnGetUserByEmailDevuelveNull(): void
    {
        $payload = "' OR '1'='1'--";
        $result  = $this->userModel->getUserByEmail($payload);
        $this->assertNull($result, "La inyeccion en getUserByEmail no debe devolver ningun usuario");
    }

    /* =========================================================
       BLOQUE 2 — Seguridad en el almacenamiento de contraseñas
       ========================================================= */

    /**
     * @testdox La contraseña se almacena hasheada con bcrypt, nunca en texto plano
     */
    public function testPasswordSeGuardaHasheadaNoEnTextoPlano(): void
    {
        $plainPassword = 'MiPasswordSegura99';

        $this->userModel->registerUser([
            'full_name'   => 'Nuevo Usuario',
            'email'       => 'nuevo@example.com',
            'username'    => 'nuevousuario',
            'password'    => $plainPassword,
            'role_id'     => 1
        ]);

        $stmt = $this->pdo->prepare("SELECT password_hash FROM users WHERE username = ?");
        $stmt->execute(['nuevousuario']);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        // El hash NO debe ser igual al texto plano
        $this->assertNotEquals(
            $plainPassword,
            $row['password_hash'],
            "La contrasena no debe guardarse en texto plano"
        );

        // El hash SÍ debe verificarse con password_verify
        $this->assertTrue(
            password_verify($plainPassword, $row['password_hash']),
            "El hash almacenado debe ser verificable con la contrasena original"
        );

        // Debe empezar por $2y$ (bcrypt) o $2a$
        $this->assertMatchesRegularExpression(
            '/^\$2[ay]\$/',
            $row['password_hash'],
            "El hash debe ser formato bcrypt"
        );
    }

    /**
     * @testdox Contraseña con caracteres especiales y simbolos es verificable tras el login
     */
    public function testPasswordConCaracteresEspecialesEsVerificable(): void
    {
        // bcrypt maneja cualquier carácter, incluyendo los que se usan en inyecciones
        $specialPassword = "P@ss'w0rd\"<>&!;--";

        $hash = password_hash($specialPassword, PASSWORD_DEFAULT);
        $stmt = $this->pdo->prepare(
            "INSERT INTO users (full_name, email, username, password_hash, state, role_id)
             VALUES ('Special User', 'special@example.com', 'specialuser', ?, 'activa', 1)"
        );
        $stmt->execute([$hash]);

        $result = $this->userModel->loginByUsername('specialuser', $specialPassword);

        $this->assertNotFalse($result, "El login con contrasena de caracteres especiales debe funcionar");
        $this->assertEquals('specialuser', $result['username']);
    }

    /**
     * @testdox Login con contraseña vacía devuelve false aunque el usuario exista
     */
    public function testLoginConPasswordVaciaDevuelveFalse(): void
    {
        $result = $this->userModel->loginByUsername('usuarioprueba', '');
        $this->assertFalse($result, "La contrasena vacia no debe dar acceso aunque el usuario exista");
    }

    /**
     * @testdox Login con contraseña de 500 caracteres no provoca error del servidor
     */
    public function testLoginConPasswordMuyLargaNoRompeElServidor(): void
    {
        $longPassword = str_repeat('A', 500);

        // No debe lanzar ninguna excepción ni error fatal
        try {
            $result = $this->userModel->loginByUsername('usuarioprueba', $longPassword);
            $this->assertFalse($result, "Una contrasena de 500 caracteres incorrecta debe devolver false");
        } catch (\Exception $e) {
            $this->fail("Una contrasena muy larga no debe lanzar una excepcion: " . $e->getMessage());
        }
    }

    /* =========================================================
       BLOQUE 3 — Entradas extremas y robustez
       ========================================================= */

    /**
     * @testdox Username y password completamente vacíos devuelven false
     */
    public function testLoginConCamposVaciosDevuelveFalse(): void
    {
        $result = $this->userModel->loginByUsername('', '');
        $this->assertFalse($result, "Ambos campos vacios deben devolver false");
    }

    /**
     * @testdox Username de 300 caracteres no provoca error del servidor
     */
    public function testUsernameExtremaLargoNoProduceError(): void
    {
        $longUsername = str_repeat('x', 300);

        try {
            $result = $this->userModel->loginByUsername($longUsername, 'password');
            $this->assertFalse($result, "Un username de 300 caracteres inexistente debe devolver false");
        } catch (\Exception $e) {
            $this->fail("Un username muy largo no debe lanzar una excepcion: " . $e->getMessage());
        }
    }

    /**
     * @testdox Un payload XSS en el username se almacena como texto plano sin ejecutarse
     */
    public function testPayloadXssSeAlmacenaComoTextoPlano(): void
    {
        // El payload XSS debe guardarse tal cual en la BD
        // La protección ante XSS es responsabilidad del front (escapeHtml en utils.js)
        $xssPayload = "<script>alert('xss')</script>";

        $hash = password_hash('secure123', PASSWORD_DEFAULT);
        $stmt = $this->pdo->prepare(
            "INSERT INTO users (full_name, email, username, password_hash, state, role_id)
             VALUES (?, 'xss@example.com', 'xssuser', ?, 'activa', 1)"
        );
        $stmt->execute([$xssPayload, $hash]);

        // Recuperar y verificar que se almacenó como string, no ejecutado
        $user = $this->userModel->getUserByEmail('xss@example.com');

        $this->assertNotNull($user, "El usuario con payload XSS debe haberse creado");
        $this->assertEquals(
            $xssPayload,
            $user['full_name'],
            "El payload XSS debe estar almacenado como texto plano (la proteccion es en el front)"
        );
        // No contiene ninguna alteración del payload
        $this->assertStringContainsString('<script>', $user['full_name']);
    }

    /**
     * @testdox Un email con formato SQL malicioso no expone datos al actualizar el perfil
     */
    public function testInjectionEnUpdateUserEmailDevuelveError(): void
    {
        $maliciousEmail = "' OR '1'='1'--@example.com";

        // La actualización debe fallar por unicidad o devolver resultado controlado,
        // nunca ejecutar SQL arbitrario
        try {
            $result = $this->userModel->updateUser(
                $this->userId,
                'Nombre',
                'usuarioprueba',
                $maliciousEmail
            );

            // El resultado es true (se actualizó con el string literal) o array de error
            // En ningún caso debe lanzar excepción ni devolver datos de otros usuarios
            $this->assertTrue(
                $result === true || is_array($result),
                "updateUser debe devolver true o array de error, nunca explotar"
            );
        } catch (\PDOException $e) {
            // Una excepción PDO con mensaje de validación es aceptable
            // Lo que no es aceptable es que funcione y devuelva datos ajenos
            $this->assertStringNotContainsString(
                "syntax error",
                strtolower($e->getMessage()),
                "No debe haber error de sintaxis SQL (indica que hay inyeccion sin sanitizar)"
            );
        }
    }

    /**
     * @testdox Dos intentos de login fallidos consecutivos con el mismo usuario devuelven false ambos
     */
    public function testMultiplesIntentosFallidosNuncaDanAcceso(): void
    {
        $payloads = [
            "' OR '1'='1",
            "' OR 1=1--",
            "admin'--",
            "' UNION SELECT 1,2,3--",
            "'; DROP TABLE users;--",
        ];

        foreach ($payloads as $payload) {
            $result = $this->userModel->loginByUsername($payload, $payload);
            $this->assertFalse(
                $result,
                "El payload '$payload' no debe dar acceso"
            );
        }

        // La tabla debe seguir intacta con el usuario original
        $count = (int) $this->pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
        $this->assertGreaterThanOrEqual(
            1,
            $count,
            "La tabla users debe conservar sus datos tras multiples inyecciones"
        );
    }
}

<?php
/**
 * @file        register.controller.php
 * @brief       Controlador de registro de nuevos usuarios.
 *
 * Recibe los datos del formulario de registro en formato JSON, valida que
 * todos los campos estén presentes, verifica que el rol exista en la base
 * de datos, inserta el nuevo usuario con la contraseña hasheada e inicia
 * sesión automáticamente tras el registro exitoso.
 *
 * @package     App\Controllers\Auth
 * @author      MOVEos
 * @version     1.0.0
 *
 * @uses        Database        Clase de conexión a la base de datos.
 * @uses        User            Modelo de usuario.
 * @uses        EmailService    Servicio de envío de correos electrónicos.
 *
 * Flujo esperado:
 *  1. Recibe POST con JSON { fullname, username, email, rol, password }.
 *  2. Valida que todos los campos estén presentes.
 *  3. Verifica que el rol exista en la tabla `roles`.
 *  4. Hashea la contraseña e inserta el usuario con estado 'activa'.
 *  5. Regenera la sesión e inicia sesión automáticamente.
 *  6. Intenta enviar un email de bienvenida (no bloquea si falla).
 *  7. Devuelve JSON { success, message } o { success, message, userData }.
 *
 * @throws \PDOException  Código 23000 si email o username ya están registrados.
 * @throws \Exception     Error genérico no relacionado con la base de datos.
 */

// Iniciar sesión solo si no hay una activa
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Establecer el tipo de respuesta como JSON con codificación UTF-8
header('Content-Type: application/json; charset=utf-8');

// Cargar la conexión a la base de datos y el modelo de usuario
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../models/entities/User.php';

/**
 * Cuerpo de la petición HTTP en crudo leído desde el flujo de entrada estándar.
 *
 * @var string $input
 */
$input = file_get_contents('php://input');

/**
 * Datos de la petición decodificados desde JSON.
 *
 * Claves esperadas: 'fullname', 'username', 'email', 'rol', 'password'.
 *
 * @var array<string, string>|null $data
 */
$data = json_decode($input, true);

/**
 * Nombre completo del usuario, saneado con trim().
 *
 * @var string $fullname
 */
$fullname = trim($data['fullname'] ?? '');

/**
 * Nombre de usuario único, saneado con trim().
 *
 * @var string $username
 */
$username = trim($data['username'] ?? '');

/**
 * Correo electrónico del usuario, saneado con trim().
 *
 * @var string $email
 */
$email = trim($data['email'] ?? '');

/**
 * Nombre del rol solicitado para el nuevo usuario.
 *
 * @var string $rol
 */
$rol = $data['rol'] ?? '';

/**
 * Contraseña en texto plano recibida desde el cliente.
 * Se hasheará antes de cualquier operación de escritura en BD.
 *
 * @var string $password
 */
$password = $data['password'] ?? '';

// Validar que ningún campo obligatorio esté vacío antes de continuar
if (empty($fullname) || empty($username) || empty($email) || empty($rol) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios']);
    exit;
}

try {
    /**
     * Instancia de Database para obtener la conexión PDO.
     *
     * @var Database $database
     */
    $database = new Database();

    /**
     * Conexión activa a la base de datos.
     *
     * @var \PDO $bd
     */
    $bd = $database->getConnection();

    /**
     * Sentencia preparada para verificar la existencia del rol en la BD.
     *
     * @var \PDOStatement $consultaRol
     */
    $consultaRol = $bd->prepare('SELECT id, name FROM roles WHERE name = ?');
    $consultaRol->execute([$rol]);

    /**
     * Fila de la tabla `roles` correspondiente al rol solicitado,
     * o false si el rol no existe.
     *
     * @var array{id: int, name: string}|false $rolData
     */
    $rolData = $consultaRol->fetch(PDO::FETCH_ASSOC);

    // Si el rol no existe en la BD, rechazar el registro
    if (!$rolData) {
        echo json_encode(['success' => false, 'message' => 'El rol asignado no existe']);
        exit;
    }

    /**
     * ID numérico del rol obtenido de la base de datos.
     *
     * @var int $idRol
     */
    $idRol = $rolData['id'];

    /**
     * Nombre canónico del rol tal como está almacenado en la BD.
     *
     * @var string $rolName
     */
    $rolName = $rolData['name'];

    /**
     * Hash seguro de la contraseña generado con PASSWORD_DEFAULT (bcrypt).
     * Nunca se almacena la contraseña en texto plano.
     *
     * @var string $password_hash
     */
    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    /**
     * Sentencia preparada para insertar el nuevo usuario en la tabla `users`.
     *
     * @var \PDOStatement $insert
     */
    $insert = $bd->prepare(
        'INSERT INTO users (full_name, email, username, password_hash, state, role_id) VALUES (?, ?, ?, ?, ?, ?)'
    );
    $insert->execute([$fullname, $email, $username, $password_hash, 'activa', $idRol]);

    // Confirmar que se insertó exactamente una fila
    if ($insert->rowCount() == 1) {

        /**
         * ID autoincremental del usuario recién insertado.
         *
         * @var string $userId  PDO::lastInsertId() devuelve string; castear a int si se requiere.
         */
        $userId = $bd->lastInsertId();

        // Regenerar el ID de sesión para prevenir ataques de fijación de sesión
        session_regenerate_id(true);

        // Iniciar sesión automáticamente tras el registro exitoso
        $_SESSION['user_id'] = $userId;
        $_SESSION['username'] = $username;
        $_SESSION['role']     = $rolName;
        $_SESSION['email']    = $email;
        $_SESSION['state']    = 'activa'; // Estado por defecto al registrar

        // Enviar email de bienvenida (no bloquea el registro si falla)
        try {
            require_once __DIR__ . '/../../services/EmailService.php';

            /**
             * Servicio de correo electrónico para el envío del mensaje de bienvenida.
             *
             * @var EmailService $emailService
             */
            $emailService = new EmailService();
            $emailService->sendWelcome($email, $fullname);
        } catch (Exception $e) {
            // El fallo en el envío del email se registra en el log pero no interrumpe el flujo
            error_log("Error enviando email de bienvenida: " . $e->getMessage());
        }

        echo json_encode([
            'success'  => true,
            'message'  => 'Usuario registrado con éxito',
            'userData' => [
                'user_id'  => $userId,
                'username' => $username,
                'role'     => $rolName
            ]
        ]);
    }

} catch (PDOException $e) {
    /**
     * Captura errores de base de datos.
     *
     * Código SQLSTATE 23000: violación de restricción UNIQUE.
     * Se produce cuando el email o el username ya están registrados.
     *
     * @var \PDOException $e
     */
    if ($e->getCode() == 23000) {
        echo json_encode([
            'success' => false,
            'message' => 'El correo electrónico o nombre de usuario ya están registrados.'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Error de base de datos. Inténtalo más tarde.'
        ]);
    }
} catch (Exception $e) {
    /**
     * Captura cualquier error genérico no relacionado con la base de datos.
     *
     * @var \Exception $e
     */
    echo json_encode([
        'success' => false,
        'message' => 'Error inesperado. Inténtalo más tarde.'
    ]);
}
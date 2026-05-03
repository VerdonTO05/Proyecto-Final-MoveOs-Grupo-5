<?php
/**
 * @file        login.controller.php
 * @brief       Controlador de autenticación de usuarios.
 *
 * Gestiona el proceso de login: valida las credenciales recibidas por JSON,
 * crea la sesión del usuario autenticado y devuelve la URL de redirección
 * según su rol.
 * Todas las respuestas se emiten en formato JSON.
 *
 * @package     App\Controllers\Auth
 * @author      MOVEos
 * @version     1.0.0
 *
 * @uses        Database   Clase de conexión a la base de datos.
 * @uses        User       Modelo de usuario con método loginByUsername().
 *
 * Flujo esperado:
 *  1. Recibe POST con JSON { "username": "...", "password": "..." }
 *  2. Valida campos no vacíos.
 *  3. Busca al usuario en la BD mediante loginByUsername().
 *  4. Si existe, regenera sesión y guarda datos del usuario.
 *  5. Devuelve JSON { success: true, redirect: "..." } o { success: false, message: "..." }
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
 * Cuerpo de la petición HTTP decodificado desde JSON.
 *
 * Se espera un objeto con las claves 'username' y 'password'.
 *
 * @var array<string, string>|null $input
 */
$input = json_decode(file_get_contents('php://input'), true);

/**
 * Nombre de usuario recibido en la petición, saneado con trim().
 *
 * @var string $username
 */
$username = trim($input['username'] ?? '');

/**
 * Contraseña recibida en la petición, saneada con trim().
 *
 * @var string $password
 */
$password = trim($input['password'] ?? '');

// Validar que ninguno de los campos obligatorios esté vacío
if ($username === '' || $password === '') {
    echo json_encode([
        'success' => false,
        'message' => 'Campos obligatorios'
    ]);
    exit;
}

try {
    /**
     * Instancia de la clase Database para obtener la conexión PDO.
     *
     * @var Database $database
     */
    $database = new Database();

    /**
     * Conexión activa a la base de datos (objeto PDO).
     *
     * @var \PDO $db
     */
    $db = $database->getConnection();

    /**
     * Modelo de usuario usado para autenticar las credenciales.
     *
     * @var User $userModel
     */
    $userModel = new User($db);

    /**
     * Datos del usuario autenticado o false/null si las credenciales son inválidas.
     *
     * Estructura esperada si el login es exitoso:
     * @var array{
     *     id:            int,
     *     username:      string,
     *     email:         string,
     *     role_name:     string,
     *     state:         string,
     *     profile_image: string|null
     * }|false $user
     */
    $user = $userModel->loginByUsername($username, $password);

    // Si las credenciales no coinciden con ningún usuario, denegar el acceso
    if (!$user) {
        echo json_encode([
            'success' => false,
            'message' => 'Credenciales inválidas'
        ]);
        exit;
    }

    // Regenerar el ID de sesión para prevenir ataques de fijación de sesión
    session_regenerate_id(true);

    // Almacenar los datos del usuario en la sesión
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['role'] = $user['role_name'];
    $_SESSION['email'] = $user['email'];
    $_SESSION['state'] = $user['state'];          // 'activa' | 'inactiva'
    $_SESSION['profile_image'] = $user['profile_image'] ?? null;

    /**
     * URL de redirección determinada según el rol del usuario autenticado.
     *
     * - 'administrador' → seeBoth
     * - cualquier otro rol → seeActivities
     *
     * @var string $redirect
     */
    $redirect = $user['role_name'] === 'administrador'
        ? 'index.php?accion=seeBoth'
        : 'index.php?accion=seeActivities';

    // Responder con éxito e indicar al cliente a dónde redirigir
    echo json_encode([
        'success' => true,
        'redirect' => $redirect
    ]);

} catch (Exception $e) {
    /**
     * Captura cualquier excepción no controlada durante el proceso de login.
     *
     * Se responde con HTTP 500 sin exponer detalles internos del error
     * para evitar fugas de información sensible.
     *
     * @var Exception $e
     */
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor'
    ]);
}
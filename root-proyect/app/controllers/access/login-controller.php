<?php
/**
 * Controlador de autenticación de usuarios.
 *
 * Gestiona el proceso de login: valida las credenciales recibidas por JSON,
 * crea la sesión del usuario autenticado y devuelve la URL de redirección
 * según su rol. 
 * Todas las respuestas se emiten en formato JSON.
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

// Leer y decodificar el cuerpo de la petición (se espera un JSON con 'username' y 'password')
$input = json_decode(file_get_contents('php://input'), true);

// Obtener y limpiar los campos del formulario; usar string vacío si no existen
$username = trim($input['username'] ?? '');
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
    // Instanciar la conexión a la base de datos
    $database = new Database();
    $db = $database->getConnection();

    // Instanciar el modelo de usuario y buscar al usuario por sus credenciales
    $userModel = new User($db);
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
    $_SESSION['state'] = $user['state']; // Valores esperados: 'activa' o 'inactiva'
    $_SESSION['profile_image'] = $user['profile_image'] ?? null;

    // Determinar la URL de redirección según el rol del usuario
    $redirect = $user['role_name'] === 'administrador'
        ? 'index.php?accion=seeBoth'        
        : 'index.php?accion=seeActivities'; 

    // Responder con éxito e indicar al cliente a dónde redirigir
    echo json_encode([
        'success' => true,
        'redirect' => $redirect
    ]);

} catch (Exception $e) {
    // Error inesperado del servidor: responder con código 500 sin exponer detalles internos
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor'
    ]);
}
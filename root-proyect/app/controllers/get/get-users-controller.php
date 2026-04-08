<?php
/**
 * Controlador para la gestión de usuarios.
 *
 * Solo accesible por administradores. Soporta dos acciones mediante
 * el parámetro GET 'action':
 * - 'list'   (por defecto): devuelve el listado completo de usuarios.
 * - 'toggle': cambia el estado de un usuario entre 'activa' e 'inactiva'.
 */

// Establecer el tipo de respuesta como JSON
header('Content-Type: application/json');

// Cargar la conexión a la base de datos y el modelo de usuarios
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../models/entities/User.php';

// Iniciar sesión solo si no hay una activa
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Verificar que el usuario autenticado tiene rol de administrador
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'administrador') {
    echo json_encode([
        'success' => false,
        'message' => 'No autorizado'
    ]);
    exit;
}

// Leer la acción solicitada; 'list' es el valor por defecto
$action = $_GET['action'] ?? 'list';

try {
    // Instanciar la conexión y el modelo de usuarios
    $database = new Database();
    $db = $database->getConnection();
    $user = new User($db);

    // --- Acción: cambiar estado de un usuario ---
    if ($action === 'toggle') {
        $id = $_GET['id'] ?? null;
        $state = $_GET['state'] ?? null;

        // Validar que el ID esté presente y que el estado sea uno de los valores permitidos
        if (!$id || !$state || !in_array($state, ['activa', 'inactiva'])) {
            echo json_encode([
                'success' => false,
                'message' => 'Parámetros inválidos'
            ]);
            exit;
        }

        // Ejecutar el cambio de estado y devolver el resultado
        $result = $user->toggleUserState($id, $state);

        echo json_encode([
            'success' => $result,
            'message' => $result
                ? 'Estado actualizado correctamente'
                : 'Error al actualizar el estado'
        ]);
        exit;
    }

    // --- Acción por defecto: listar todos los usuarios ---
    $users = $user->getUsers($_SESSION['user_id']);

    echo json_encode([
        'success' => true,
        'data' => $users
    ]);

} catch (PDOException $e) {
    // Error específico de base de datos: registrar internamente sin exponer detalles
    error_log('[PDOException] manageUsersController: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error de base de datos. Inténtalo más tarde.'
    ]);
} catch (Exception $e) {
    // Error genérico inesperado: registrar internamente sin exponer detalles
    error_log('[Exception] manageUsersController: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error inesperado. Inténtalo más tarde.'
    ]);
}
?>
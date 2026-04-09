<?php
/**
 * Controlador para la gestión de usuarios.
 *
 * Solo accesible por administradores. Soporta tres acciones mediante
 * el parámetro GET 'action':
 * - 'list'   (por defecto): devuelve el listado completo de usuarios.
 * - 'toggle': cambia el estado de un usuario entre 'activa' e 'inactiva'.
 * - 'notify': envía un email al usuario notificando el cambio de estado.
 */

header('Content-Type: application/json');

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../models/entities/User.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'administrador') {
    echo json_encode([
        'success' => false,
        'message' => 'No autorizado'
    ]);
    exit;
}

$action = $_GET['accion'] ?? 'list';

try {
    $database = new Database();
    $db = $database->getConnection();
    $user = new User($db);

    // --- Acción: cambiar estado de un usuario ---
    if ($action === 'toggleUser') {
        $id = $_GET['id'] ?? null;
        $state = $_GET['state'] ?? null;

        if (!$id || !$state || !in_array($state, ['activa', 'inactiva'])) {
            echo json_encode([
                'success' => false,
                'message' => 'Parámetros inválidos'
            ]);
            exit;
        }

        $result = $user->toggleUserState($id, $state);

        echo json_encode([
            'success' => $result,
            'message' => $result
                ? 'Estado actualizado correctamente'
                : 'Error al actualizar el estado'
        ]);
        exit;
    }

    // --- Acción: notificar al usuario por email ---
    if ($action === 'notifyUser') {
        $id = $_GET['id'] ?? null;
        $newState = $_GET['state'] ?? null;
        $adminMessage = $_GET['message'] ?? '';

        if (!$id || !$newState || !in_array($newState, ['activa', 'inactiva'])) {
            echo json_encode([
                'success' => false,
                'message' => 'Parámetros inválidos'
            ]);
            exit;
        }

        $stmt = $db->prepare("SELECT email, full_name FROM users WHERE id = :id");
        $stmt->execute(['id' => $id]);
        $targetUser = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$targetUser) {
            echo json_encode([
                'success' => false,
                'message' => 'Usuario no encontrado'
            ]);
            exit;
        }

        require_once __DIR__ . '/../../services/EmailService.php';
        $emailService = new EmailService();
        $sent = $emailService->sendStateChange(
            $targetUser['email'],
            $targetUser['full_name'],
            $newState,
            $adminMessage
        );

        echo json_encode([
            'success' => $sent,
            'message' => $sent
                ? 'Email enviado correctamente'
                : 'No se pudo enviar el email'
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
    error_log('[PDOException] manageUsersController: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error de base de datos. Inténtalo más tarde.'
    ]);
} catch (Exception $e) {
    error_log('[Exception] manageUsersController: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error inesperado. Inténtalo más tarde.'
    ]);
}
?>
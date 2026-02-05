<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../models/entities/User.php';

// Verificar sesión
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'No hay sesión activa'
    ]);
    exit;
}

$userId = $_SESSION['user_id'];

try {
    $db = (new Database())->getConnection();
    $userModel = new User($db);

    if ($userModel->deleteById($userId)) {

        // Cerrar sesión completamente
        session_unset();
        session_destroy();

        echo json_encode([
            'success' => true,
            'message' => 'Cuenta eliminada correctamente'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'No se pudo eliminar la cuenta'
        ]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor'
    ]);
}

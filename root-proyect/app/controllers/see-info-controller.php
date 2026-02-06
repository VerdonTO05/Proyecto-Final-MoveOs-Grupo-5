<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../models/entities/User.php';
require_once __DIR__ . '/../../config/database.php';

// Comprobar que el usuario está logueado
if (!isset($_SESSION['user_id'])) {
    header('Location: index.php?accion=loginView');
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    $userModel = new User($db);

    // Obtener usuario actual
    $user = $userModel->getUserById($_SESSION['user_id']);
    if (!$user) {
        die('Usuario no encontrado');
    }

    // Mostrar la vista
    require __DIR__ . '/../views/see-info.php';

} catch (Exception $e) {
    http_response_code(500);
    echo 'Error del servidor: ' . htmlspecialchars($e->getMessage());
}

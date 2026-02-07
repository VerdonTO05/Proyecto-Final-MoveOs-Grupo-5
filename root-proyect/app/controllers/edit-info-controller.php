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
    // Conexión a la base de datos
    $database = new Database();
    $db = $database->getConnection();
    $userModel = new User($db);

    // Obtener usuario actual
    $user = $userModel->getUserById($_SESSION['user_id']);
    if (!$user) {
        die('Usuario no encontrado');
    }

    // ===========================
    // Si se envió el formulario
    // ===========================
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Recoger datos del formulario
        $fullname = trim($_POST['fullname'] ?? '');
        $username = trim($_POST['username'] ?? '');
        $email = trim($_POST['email'] ?? '');

        $changePassword = isset($_POST['changePassword']);
        $currentPassword = $_POST['current_password'] ?? '';
        $newPassword = $_POST['new_password'] ?? '';

        // Validaciones básicas
        if (!$fullname || !$username || !$email) {
            die('Faltan datos obligatorios.');
        }

        // Validación de contraseña si el usuario quiere cambiarla
        if ($changePassword) {
            if (!password_verify($currentPassword, $user['password_hash'])) {
                die('La contraseña actual no es correcta.');
            }
            $passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);
        } else {
            $passwordHash = null; // no cambiar contraseña
        }

        // Actualizar usuario en la base de datos
        $userModel->updateUser($_SESSION['user_id'], $fullname, $username, $email, $passwordHash);

        // Redirigir a la misma vista con parámetro de éxito
        header('Location: index.php?accion=viewInfo');
        exit;
    }

    // Si es GET, solo mostrar vista
    require __DIR__ . '/../views/edit-info.php';

} catch (Exception $e) {
    http_response_code(500);
    echo 'Error del servidor: ' . htmlspecialchars($e->getMessage());
}

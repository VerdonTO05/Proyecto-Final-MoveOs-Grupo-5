<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../models/entities/User.php';
require_once __DIR__ . '/../../../config/database.php';

if (!isset($_SESSION['user_id'])) {
    $_SESSION['error'] = 'Debes iniciar sesión';
    header('Location: index.php?accion=loginView');
    exit;
}

try {
    $database  = new Database();
    $db        = $database->getConnection();
    $userModel = new User($db);

    $user = $userModel->getUserById($_SESSION['user_id']);
    if (!$user) {
        $_SESSION['error'] = 'Usuario no encontrado';
        header('Location: index.php?accion=editUser');
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {

        $fullname = trim($_POST['fullname'] ?? '');
        $username = trim($_POST['username'] ?? '');
        $email    = trim($_POST['email'] ?? '');

        $changePassword  = isset($_POST['changePassword']);
        $currentPassword = $_POST['current_password'] ?? '';
        $newPassword     = $_POST['new_password'] ?? '';

        // Validaciones básicas
        $errors = [];
        if (!$fullname) $errors[] = 'El nombre completo es obligatorio.';
        if (!$username) $errors[] = 'El nombre de usuario es obligatorio.';
        if (!$email)    $errors[] = 'El correo electrónico es obligatorio.';

        if ($changePassword) {
            if (!password_verify($currentPassword, $user['password_hash'])) {
                $errors[] = 'La contraseña actual es incorrecta.';
            }
            if (strlen($newPassword) < 6) {
                $errors[] = 'La nueva contraseña debe tener al menos 6 caracteres.';
            }
        }

        if (!empty($errors)) {
            $_SESSION['form_errors']   = $errors;
            $_SESSION['form_old_data'] = $_POST;
            header('Location: index.php?accion=editUser');
            exit;
        }

        $passwordHash = $changePassword
            ? password_hash($newPassword, PASSWORD_DEFAULT)
            : null;

        $result = $userModel->updateUser(
            $_SESSION['user_id'],
            $fullname,
            $username,
            $email,
            $passwordHash
        );

        if ($result === true) {
            // Actualizar datos de sesión
            $_SESSION['username']  = $username;
            $_SESSION['full_name'] = $fullname;
            $_SESSION['email']     = $email;

            header('Location: index.php?accion=viewInfo');
            exit;
        }

        $errorMessages = [
            'email_taken'    => 'El correo electrónico ya está en uso por otro usuario.',
            'username_taken' => 'El nombre de usuario ya está en uso por otro usuario.',
            'update_failed'  => 'No se pudo actualizar el perfil.',
        ];

        $msg = is_array($result) && isset($result['error'])
            ? ($errorMessages[$result['error']] ?? 'Error al actualizar.')
            : 'Error al actualizar.';

        $_SESSION['form_errors']   = [$msg];
        $_SESSION['form_old_data'] = $_POST;
        header('Location: index.php?accion=editUser');
        exit;
    }

    // GET → mostrar vista
    require __DIR__ . '/../../views/user/edit-info.php';

} catch (Exception $e) {
    http_response_code(500);
    echo 'Error del servidor: ' . htmlspecialchars($e->getMessage());
}
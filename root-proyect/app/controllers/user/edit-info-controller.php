<?php
/**
 * Controlador para editar el perfil del usuario autenticado.
 *
 * Gestiona dos fases en una misma ruta:
 * - GET:  carga los datos actuales del usuario y muestra el formulario.
 * - POST: valida los cambios, actualiza el perfil (y opcionalmente la
 *         contraseña) y refresca los datos de sesión si todo es correcto.
 */

// Iniciar sesión solo si no hay una activa
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Cargar el modelo de usuarios y la conexión a la base de datos
require_once __DIR__ . '/../../models/entities/User.php';
require_once __DIR__ . '/../../../config/database.php';

// Verificar que el usuario esté autenticado; redirigir al login si no lo está
if (!isset($_SESSION['user_id'])) {
    $_SESSION['error'] = 'Debes iniciar sesión';
    header('Location: index.php?accion=loginView');
    exit;
}

try {
    // Instanciar la conexión y el modelo de usuarios
    $database  = new Database();
    $db        = $database->getConnection();
    $userModel = new User($db);

    // Obtener los datos actuales del usuario autenticado
    $user = $userModel->getUserById($_SESSION['user_id']);

    // Si el usuario no existe en la BD, redirigir con error
    if (!$user) {
        $_SESSION['error'] = 'Usuario no encontrado';
        header('Location: index.php?accion=editUser');
        exit;
    }

    // ── Fase POST: procesar el formulario de edición ──────────────────────────
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {

        // Recoger y limpiar los campos del formulario
        $fullname = trim($_POST['fullname'] ?? '');
        $username = trim($_POST['username'] ?? '');
        $email    = trim($_POST['email']    ?? '');

        // Determinar si el usuario quiere cambiar su contraseña
        $changePassword  = isset($_POST['changePassword']);
        $currentPassword = $_POST['current_password'] ?? '';
        $newPassword     = $_POST['new_password']     ?? '';

        // Validar que los campos obligatorios no estén vacíos
        $errors = [];
        if (!$fullname) $errors[] = 'El nombre completo es obligatorio.';
        if (!$username) $errors[] = 'El nombre de usuario es obligatorio.';
        if (!$email)    $errors[] = 'El correo electrónico es obligatorio.';

        // Validar el cambio de contraseña si fue solicitado
        if ($changePassword) {
            // Verificar que la contraseña actual introducida sea correcta
            if (!password_verify($currentPassword, $user['password_hash'])) {
                $errors[] = 'La contraseña actual es incorrecta.';
            }
            // Validar longitud mínima de la nueva contraseña
            if (strlen($newPassword) < 6) {
                $errors[] = 'La nueva contraseña debe tener al menos 6 caracteres.';
            }
        }

        // Si hay errores, guardarlos en sesión con los datos del formulario y redirigir
        if (!empty($errors)) {
            $_SESSION['form_errors']   = $errors;
            $_SESSION['form_old_data'] = $_POST;
            header('Location: index.php?accion=editUser');
            exit;
        }

        // Hashear la nueva contraseña solo si se solicitó cambiarla; null si no
        $passwordHash = $changePassword
            ? password_hash($newPassword, PASSWORD_DEFAULT)
            : null;

        // Ejecutar la actualización del perfil en la base de datos
        $result = $userModel->updateUser(
            $_SESSION['user_id'],
            $fullname,
            $username,
            $email,
            $passwordHash
        );

        if ($result === true) {
            // Actualizar los datos de sesión para reflejar los cambios inmediatamente
            $_SESSION['username']  = $username;
            $_SESSION['full_name'] = $fullname;
            $_SESSION['email']     = $email;

            header('Location: index.php?accion=viewInfo');
            exit;
        }

        // Mapear el código de error devuelto por el modelo a un mensaje legible
        $errorMessages = [
            'email_taken'    => 'El correo electrónico ya está en uso por otro usuario.',
            'username_taken' => 'El nombre de usuario ya está en uso por otro usuario.',
            'update_failed'  => 'No se pudo actualizar el perfil.',
        ];

        $msg = is_array($result) && isset($result['error'])
            ? ($errorMessages[$result['error']] ?? 'Error al actualizar.')
            : 'Error al actualizar.';

        // Guardar el error en sesión y redirigir al formulario con los datos anteriores
        $_SESSION['form_errors']   = [$msg];
        $_SESSION['form_old_data'] = $_POST;
        header('Location: index.php?accion=editUser');
        exit;
    }

    // ── Fase GET: mostrar el formulario con los datos actuales del usuario ────
    require __DIR__ . '/../../views/user/edit-info.php';

} catch (PDOException $e) {
    // Error específico de base de datos: registrar internamente sin exponer detalles
    error_log('[PDOException] editUserController: ' . $e->getMessage());
    http_response_code(500);
    echo 'Error de base de datos. Inténtalo más tarde.';
} catch (Exception $e) {
    // Error genérico inesperado: registrar internamente sin exponer detalles
    error_log('[Exception] editUserController: ' . $e->getMessage());
    http_response_code(500);
    echo 'Error del servidor. Inténtalo más tarde.';
}
?>
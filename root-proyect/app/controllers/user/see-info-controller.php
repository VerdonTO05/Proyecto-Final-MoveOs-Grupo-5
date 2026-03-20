<?php
/**
 * Controlador para mostrar la información del perfil del usuario autenticado.
 *
 * Verifica que el usuario esté autenticado, carga sus datos desde la base
 * de datos y renderiza la vista de perfil.
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

    // Obtener los datos del usuario autenticado por su ID de sesión
    $user = $userModel->getUserById($_SESSION['user_id']);

    // Si el usuario no existe en la BD, redirigir con error
    if (!$user) {
        $_SESSION['error'] = 'Información no encontrada';
        header('Location: index.php?accion=viewInfo');
        exit;
    }

    // Renderizar la vista de perfil con los datos del usuario
    require __DIR__ . '/../../views/user/see-info.php';

} catch (PDOException $e) {
    // Error específico de base de datos: registrar internamente sin exponer detalles
    error_log('[PDOException] viewInfoController: ' . $e->getMessage());
    http_response_code(500);
    echo 'Error de base de datos. Inténtalo más tarde.';
} catch (Exception $e) {
    // Error genérico inesperado: registrar internamente sin exponer detalles
    error_log('[Exception] viewInfoController: ' . $e->getMessage());
    http_response_code(500);
    echo 'Error del servidor. Inténtalo más tarde.';
}
?>
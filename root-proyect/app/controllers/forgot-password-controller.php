<?php
/**
 * Controlador para cambiar la contraseña del usuario
 */

// Asegurarse de que la sesión esté iniciada
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Limpiar cualquier salida previa
if (ob_get_level()) {
    ob_clean();
}
ob_start();

header('Content-Type: application/json');

try {
    // Obtener los datos del formulario
    $email = $_POST['email'] ?? '';
    $oldPassword = $_POST['old_password'] ?? '';
    $newPassword = $_POST['new_password'] ?? '';

    // Validar que todos los campos estén presentes
    if (empty($email) || empty($oldPassword) || empty($newPassword)) {
        ob_end_clean();
        echo json_encode([
            'success' => false,
            'message' => 'Todos los campos son obligatorios.'
        ]);
        exit;
    }

    // Validar formato de email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        ob_end_clean();
        echo json_encode([
            'success' => false,
            'message' => 'El formato del correo electrónico no es válido.'
        ]);
        exit;
    }

    // Validar longitud mínima de la contraseña
    if (strlen($newPassword) < 6) {
        ob_end_clean();
        echo json_encode([
            'success' => false,
            'message' => 'La nueva contraseña debe tener al menos 6 caracteres.'
        ]);
        exit;
    }

    // Conectar a la base de datos
    require_once __DIR__ . '/../../config/database.php';
    $database = new Database();
    $pdo = $database->getConnection();

    // Buscar el usuario por email
    $stmt = $pdo->prepare("SELECT id, password_hash FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Verificar si el usuario existe
    if (!$user) {
        ob_end_clean();
        echo json_encode([
            'success' => false,
            'message' => 'No se encontró ningún usuario con ese correo electrónico.'
        ]);
        exit;
    }

    // Verificar la contraseña antigua
    if (!password_verify($oldPassword, $user['password_hash'])) {
        ob_end_clean();
        echo json_encode([
            'success' => false,
            'message' => 'La contraseña antigua es incorrecta.'
        ]);
        exit;
    }

    // Hashear la nueva contraseña
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

    // Actualizar la contraseña en la base de datos
    $updateStmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
    $updateStmt->execute([$hashedPassword, $user['id']]);

    ob_end_clean();
    echo json_encode([
        'success' => true,
        'message' => 'Contraseña actualizada exitosamente.'
    ]);

} catch (PDOException $e) {
    ob_end_clean();
    error_log("Error en forgot-password-controller: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error de base de datos. Por favor, intenta de nuevo más tarde.'
    ]);
} catch (Exception $e) {
    ob_end_clean();
    error_log("Error general en forgot-password-controller: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Ocurrió un error inesperado. Por favor, intenta de nuevo.'
    ]);
}
<?php
/**
 * Controlador para cambiar la contraseña del usuario con código de verificación
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
    $verificationCode = $_POST['verification_code'] ?? '';
    $newPassword = $_POST['new_password'] ?? '';

    // Validar que todos los campos estén presentes
    if (empty($email) || empty($verificationCode) || empty($newPassword)) {
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

    // Validar formato del código (6 dígitos)
    if (!preg_match('/^\d{6}$/', $verificationCode)) {
        ob_end_clean();
        echo json_encode([
            'success' => false,
            'message' => 'El código de verificación debe tener 6 dígitos.'
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

    // Buscar el código de verificación válido
    $codeStmt = $pdo->prepare("
        SELECT id, expires_at 
        FROM password_reset_codes 
        WHERE user_id = ? AND code = ? AND used = 0
        ORDER BY created_at DESC
        LIMIT 1
    ");
    $codeStmt->execute([$user['id'], $verificationCode]);
    $codeRecord = $codeStmt->fetch(PDO::FETCH_ASSOC);

    // Verificar si el código existe
    if (!$codeRecord) {
        ob_end_clean();
        echo json_encode([
            'success' => false,
            'message' => 'El código de verificación es incorrecto o ya fue utilizado.'
        ]);
        exit;
    }

    // Verificar si el código ha expirado
    $now = new DateTime();
    $expiresAt = new DateTime($codeRecord['expires_at']);

    if ($now > $expiresAt) {
        ob_end_clean();
        echo json_encode([
            'success' => false,
            'message' => 'El código de verificación ha expirado. Por favor, solicita uno nuevo.'
        ]);
        exit;
    }

    // Hashear la nueva contraseña
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

    // Actualizar la contraseña en la base de datos
    $updateStmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
    $updateStmt->execute([$hashedPassword, $user['id']]);

    // Marcar el código como usado
    $markUsedStmt = $pdo->prepare("UPDATE password_reset_codes SET used = 1 WHERE id = ?");
    $markUsedStmt->execute([$codeRecord['id']]);

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
<?php
/**
 * Controlador para solicitar código de verificación por email
 */

// Asegurarse de que la sesión esté iniciada
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Cargar autoloader de Composer para PHPMailer
require_once __DIR__ . '/../../vendor/autoload.php';

// Limpiar cualquier salida previa
if (ob_get_level()) {
    ob_clean();
}
ob_start();

header('Content-Type: application/json');

try {
    // Obtener el email del formulario
    $email = $_POST['email'] ?? '';

    // Validar que el email esté presente
    if (empty($email)) {
        ob_end_clean();
        echo json_encode([
            'success' => false,
            'message' => 'El correo electrónico es obligatorio.'
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

    // Conectar a la base de datos
    require_once __DIR__ . '/../../config/database.php';
    $database = new Database();
    $pdo = $database->getConnection();

    // Buscar el usuario por email
    $stmt = $pdo->prepare("SELECT id, full_name FROM users WHERE email = ?");
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

    // Generar código de verificación de 6 dígitos
    $verificationCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

    // Calcular tiempo de expiración (15 minutos desde ahora)
    $expiresAt = date('Y-m-d H:i:s', strtotime('+15 minutes'));

    // Invalidar códigos anteriores del usuario (marcarlos como usados)
    $invalidateStmt = $pdo->prepare("UPDATE password_reset_codes SET used = 1 WHERE user_id = ? AND used = 0");
    $invalidateStmt->execute([$user['id']]);

    // Guardar el nuevo código en la base de datos
    $insertStmt = $pdo->prepare("
        INSERT INTO password_reset_codes (user_id, code, expires_at, used) 
        VALUES (?, ?, ?, 0)
    ");
    $insertStmt->execute([$user['id'], $verificationCode, $expiresAt]);

    // Enviar el código por email usando PHPMailer
    require_once __DIR__ . '/../services/EmailService.php';
    $emailService = new EmailService();
    $emailSent = $emailService->sendVerificationCode($email, $user['full_name'], $verificationCode);

    if ($emailSent) {
        // Verificar si estamos en modo desarrollo
        $emailConfig = require __DIR__ . '/../../config/email-config.php';
        $developmentMode = isset($emailConfig['development_mode']) && $emailConfig['development_mode'] === true;

        ob_end_clean();
        echo json_encode([
            'success' => true,
            'message' => $developmentMode
                ? 'Código generado. Revisa el archivo: logs/verification_codes.log'
                : 'Se ha enviado un código de verificación a tu correo electrónico. Por favor, revisa tu bandeja de entrada.'
        ]);
    } else {
        ob_end_clean();
        echo json_encode([
            'success' => false,
            'message' => 'Error al enviar el email. Por favor, verifica la configuración SMTP o intenta más tarde.'
        ]);
    }

} catch (PDOException $e) {
    ob_end_clean();
    error_log("Error en request-code-controller: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error de base de datos. Por favor, intenta de nuevo más tarde.'
    ]);
} catch (Exception $e) {
    ob_end_clean();
    error_log("Error general en request-code-controller: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Ocurrió un error inesperado. Por favor, intenta de nuevo.'
    ]);
}

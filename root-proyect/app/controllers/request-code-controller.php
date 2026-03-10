<?php
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set('display_errors', 0);

/**
 * Controlador para solicitar código de verificación
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json');

// Limpiar cualquier salida previa
while (ob_get_level()) {
    ob_end_clean();
}

try {
    // Obtener email y opcionalmente ID del usuario
    $email = $_POST['email'] ?? '';
    $userId = $_POST['id'] ?? null; // opcional, si quieres validar con ID

    // Validar email vacío
    if (empty($email)) {
        echo json_encode([
            'success' => false,
            'message' => 'El correo electrónico es obligatorio.'
        ]);
        exit;
    }

    // Validar formato
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode([
            'success' => false,
            'message' => 'El formato del correo electrónico no es válido.'
        ]);
        exit;
    }

    // Conexión a la BD
    require_once __DIR__ . '/../../config/database.php';
    $database = new Database();
    $pdo = $database->getConnection();

    if (!$pdo) {
        echo json_encode([
            'success' => false,
            'message' => 'Error de conexión con la base de datos.'
        ]);
        exit;
    }

    // Preparar consulta: si se pasa ID, comprobar que coincide con email
    if ($userId) {
        $stmt = $pdo->prepare("SELECT id, full_name, email FROM users WHERE id = ? AND email = ?");
        $stmt->execute([$userId, $email]);
    } else {
        $stmt = $pdo->prepare("SELECT id, full_name, email FROM users WHERE email = ?");
        $stmt->execute([$email]);
    }

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode([
            'success' => false,
            'message' => 'No se encontró ningún usuario con ese correo electrónico (o ID no coincide).'
        ]);
        exit;
    }

    // Anti-spam: no permitir más de 1 código cada 2 minutos
    $limitStmt = $pdo->prepare("
        SELECT COUNT(*) 
        FROM password_reset_codes 
        WHERE user_id = ? 
        AND created_at > DATE_SUB(NOW(), INTERVAL 2 MINUTE)
    ");
    $limitStmt->execute([$user['id']]);

    if ($limitStmt->fetchColumn() > 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Espera un momento antes de solicitar otro código.'
        ]);
        exit;
    }

    // Generar código de 6 dígitos
    $verificationCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

    // Expiración 15 minutos
    $expiresAt = date('Y-m-d H:i:s', strtotime('+15 minutes'));

    // Invalidar códigos anteriores
    $invalidateStmt = $pdo->prepare("
        UPDATE password_reset_codes 
        SET used = 1 
        WHERE user_id = ? AND used = 0
    ");
    $invalidateStmt->execute([$user['id']]);

    // Insertar nuevo código
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
        echo json_encode([
            'success' => true,
            'message' => 'Se ha enviado un código de verificación a tu correo electrónico. Por favor, revisa tu bandeja de entrada.'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Error al enviar el correo. Verifica la configuración SMTP o intenta más tarde.'
        ]);
    }

    exit;

} catch (PDOException $e) {
    error_log("Error BD request-code-controller: " . $e->getMessage());

    echo json_encode([
        'success' => false,
        'message' => 'Error de base de datos. Intenta más tarde.'
    ]);
    exit;

} catch (Exception $e) {
    error_log("Error general request-code-controller: " . $e->getMessage());

    echo json_encode([
        'success' => false,
        'message' => 'Ocurrió un error inesperado.'
    ]);
    exit;
}
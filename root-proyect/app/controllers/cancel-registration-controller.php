<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../models/entities/Registration.php';
require_once __DIR__ . '/../models/entities/Request.php';
require_once __DIR__ . '/../../config/database.php';

// Detectar si es AJAX (fetch)
$isAjax = !empty($_SERVER['HTTP_X_REQUESTED_WITH']) &&
          strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';

// Leer JSON si viene por fetch
$input = json_decode(file_get_contents("php://input"), true);

// ── Verificar sesión ─────────────────────────────
if (!isset($_SESSION['user_id'])) {
    if ($isAjax) {
        echo json_encode(['success' => false, 'message' => 'No autenticado']);
        exit;
    }

    $_SESSION['error'] = 'Debes iniciar sesión';
    header('Location: index.php?accion=loginView');
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $registrationModel = new Registration($db);
    $requestModel = new Request($db);

    // ── Obtener ID (JSON o POST) ─────────────────
    $id = $input['id'] ?? ($_POST['id'] ?? 0);
    $id = (int)$id;

    if ($id <= 0) {
        throw new Exception('ID inválido');
    }

    $success = false;

    // ── Lógica según rol ─────────────────────────
    if ($_SESSION['role'] === 'participante') {
        $registration = $registrationModel->getRegistrationByActivityAndParticipant($id, $_SESSION['user_id']);
        $success = $registrationModel->deleteRegistration($registration);
    } else {
        $success = $requestModel->unacceptRequest($id, $_SESSION['user_id']);
    }

    // ── RESPUESTA ────────────────────────────────
    if ($isAjax) {
        echo json_encode([
            'success' => $success,
            'message' => $success
                ? 'Cancelada correctamente'
                : 'No tienes permisos o falló la operación'
        ]);
        exit;
    }

    // Flujo normal (sin fetch)
    $_SESSION[$success ? 'success' : 'error'] =
        $success ? 'Operación realizada correctamente' : 'No tienes permisos o falló la operación';

    header('Location: index.php?accion=seeRegistrations');
    exit;

} catch (Exception $e) {

    if ($isAjax) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
        exit;
    }

    http_response_code(500);
    echo 'Error del servidor: ' . htmlspecialchars($e->getMessage());
}
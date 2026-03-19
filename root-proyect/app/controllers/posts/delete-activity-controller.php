<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../models/entities/Activity.php';
require_once __DIR__ . '/../../models/entities/Request.php';
require_once __DIR__ . '/../../../config/database.php';

header('Content-Type: application/json');

// Verificar sesión
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Debes iniciar sesión'
    ]);
    exit;
}

// Leer input JSON
$input = json_decode(file_get_contents('php://input'), true) ?? [];
$id = $input['id'] ?? null;

if (!$id) {
    echo json_encode([
        'success' => false,
        'message' => 'Publicación a eliminar no recibida'
    ]);
    exit;
}

try {

    $database = new Database();
    $db = $database->getConnection();

    $activityModel = new Activity($db);
    $requestModel = new Request($db);

    $role = $_SESSION['role'];

    if ($role === 'participante') {
        $publication = $requestModel->getRequestById($id);
        $typePublication = 'request';
    } else {
        $publication = $activityModel->getActivityById($id);
        $typePublication = 'activity';
    }

    if (!$publication) {
        echo json_encode([
            'success' => false,
            'message' => 'Publicación no encontrada'
        ]);
        exit;
    }

    // Verificar propiedad
    if ($typePublication === 'activity' && $publication['offertant_id'] != $_SESSION['user_id']) {
        echo json_encode([
            'success' => false,
            'message' => 'Esta actividad no te pertenece'
        ]);
        exit;
    } elseif ($typePublication === 'request' && $publication['participant_id'] != $_SESSION['user_id']) {
        echo json_encode([
            'success' => false,
            'message' => 'Esta petición no te pertenece'
        ]);
        exit;
    }

    // Eliminar publicación
    if ($typePublication === 'activity') {
        $activityModel->deleteActivity($id);
        $msg = 'Actividad eliminada correctamente';
    } else {
        $requestModel->deleteRequest($id);
        $msg = 'Petición eliminada correctamente';
    }

    echo json_encode([
        'success' => true,
        'message' => $msg
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor'
    ]);
}
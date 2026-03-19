<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../models/entities/Request.php';
require_once __DIR__ . '/../../../config/database.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Debes iniciar sesión']);
    exit;
}

if (!isset($input) || empty($input)) {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
}

$id_request = $input['id_request'] ?? null;  // corregido: era 'id_activity'
$organizer_id = $_SESSION['user_id'];

if (!$id_request) {
    echo json_encode(['success' => false, 'message' => 'Petición no recibida']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    $requestModel = new Request($db);

    $result = $requestModel->acceptRequest($id_request, $organizer_id);

    if ($result === true) {

        echo json_encode([
            'success' => true,
            'message' => 'Petición aceptada correctamente'
        ]);

    } elseif (is_array($result) && isset($result['error'])) {

        $messages = [
            'request_not_found' => 'La solicitud no existe o ya fue aceptada.',
            'already_accepted' => 'La solicitud ya fue aceptada por otro organizador.',
            'conflict_request' => 'Ya aceptaste otra solicitud ese día: "' . ($result['title'] ?? '') . '".',
            'conflict_activity' => 'Tienes una actividad propia ese día: "' . ($result['title'] ?? '') . '".',
            'exception' => 'Error del servidor.',
        ];

        echo json_encode([
            'success' => false,
            'message' => $messages[$result['error']] ?? 'No se pudo aceptar la solicitud.'
        ]);

    } else {
        echo json_encode([
            'success' => false,
            'message' => 'No se pudo aceptar la solicitud.'
        ]);
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor'
    ]);
}
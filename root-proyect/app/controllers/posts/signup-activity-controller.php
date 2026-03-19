<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../models/entities/Registration.php';
require_once __DIR__ . '/../../../config/database.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Debes iniciar sesión']);
    exit;
}

if (!isset($input) || empty($input)) {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
}

$id_activity    = $input['id_activity'] ?? null;
$participant_id = $_SESSION['user_id'];

if (!$id_activity) {
    echo json_encode(['success' => false, 'message' => 'Actividad no recibida']);
    exit;
}

try {
    $database          = new Database();
    $db                = $database->getConnection();
    $registrationModel = new Registration($db);

    $result = $registrationModel->createRegistration($id_activity, $participant_id);

    if (is_int($result) || is_string($result)) {

        echo json_encode([
            'success' => true,
            'message' => 'Inscripción realizada correctamente'
        ]);

    } elseif (is_array($result) && isset($result['error'])) {

        $messages = [
            'already_registered' => 'Ya estás inscrito en esta actividad.',
            'activity_not_found' => 'La actividad no existe.',
            'activity_completed' => 'La actividad ya está completa.',
            'activity_full'      => 'No quedan plazas disponibles.',
            'conflict_activity'  => 'Ya tienes una inscripción ese día: "' . ($result['title'] ?? '') . '".',
            'conflict_request'   => 'Ya tienes una solicitud ese día: "' . ($result['title'] ?? '') . '".',
            'exception'          => 'Error del servidor.',
        ];

        echo json_encode([
            'success' => false,
            'message' => $messages[$result['error']] ?? 'No se pudo completar la inscripción.'
        ]);

    } else {
        echo json_encode([
            'success' => false,
            'message' => 'No se pudo completar la inscripción.'
        ]);
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor'
    ]);
}
<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../models/entities/Registration.php';
require_once __DIR__ . '/../../config/database.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Debes iniciar sesión'
    ]);
    exit;
}

// index.php ya puede haber leído php://input; reutilizarlo si está disponible
if (!isset($input) || empty($input)) {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
}
$data = $input;

$id_activity = $data['id_activity'] ?? null;
$participant_id = $_SESSION['user_id'];

if (!$id_activity) {
    echo json_encode([
        'success' => false,
        'message' => 'Actividad no recibida'
    ]);
    exit;
}

try {

    $database = new Database();
    $db = $database->getConnection();

    $registrationModel = new Registration($db);

    $result = $registrationModel->createRegistration($id_activity, $participant_id);

    if ($result) {

        echo json_encode([
            'success' => true,
            'message' => 'Inscripción realizada correctamente'
        ]);

    } else {

        echo json_encode([
            'success' => false,
            'message' => 'Ya estás inscrito en esta actividad'
        ]);

    }

} catch (Exception $e) {

    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor'
    ]);

}
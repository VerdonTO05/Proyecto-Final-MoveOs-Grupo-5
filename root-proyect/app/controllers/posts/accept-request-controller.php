<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../models/entities/Request.php';
require_once __DIR__ . '/../../../config/database.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Debes iniciar sesión'
    ]);
    exit;
}

// index.php puede haber leído php://input; reutilizarlo si está disponible
if (!isset($input) || empty($input)) {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
}
$data = $input;

$id_request = $data['id_activity'] ?? null;
$organizer_id = $_SESSION['user_id'];

if (!$id_request) {
    echo json_encode([
        'success' => false,
        'message' => 'Petición no recibida'
    ]);
    exit;
}

try {

    $database = new Database();
    $db = $database->getConnection();

    $requestModel = new Request($db);

    $result = $requestModel->acceptRequest($id_request, $organizer_id);

    if ($result) {

        echo json_encode([
            'success' => true,
            'message' => 'Petición aceptada correctamente'
        ]);

    } else {

        echo json_encode([
            'success' => false,
            'message' => 'La petición ya fue aceptada o no existe'
        ]);

    }

} catch (Exception $e) {

    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor'
    ]);

}
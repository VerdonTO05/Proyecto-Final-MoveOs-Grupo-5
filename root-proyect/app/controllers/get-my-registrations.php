<?php
header('Content-Type: application/json');

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../models/entities/Activity.php';
require_once __DIR__ . '/../models/entities/Request.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['user_id']) || !isset($_SESSION['role'])) {
    echo json_encode([
        'success' => false,
        'message' => 'No autorizado'
    ]);
    exit;
}

$database = new Database();
$db = $database->getConnection();

$request = new Request($db);
$activity = new Activity($db);

$user_id = $_SESSION['user_id'];
$role = $_SESSION['role'];

$active = [];
$finished = [];

try {

    // ============================
    // ORGANIZADOR
    // ============================
    if ($role === 'organizador') {
        $active = $request->getAcceptedRequestsByOrganizerId($user_id, 'aprobada');
        $finished = $request->getAcceptedRequestsFinishedByOrganizerId($user_id);
    }

    // ============================
    // PARTICIPANTE
    // ============================
    if ($role === 'participante') {
        $active = $activity->getActivitiesByParticipantId($user_id);
        $finished = $activity->getActivitiesFinishedByParticipantId($user_id);
    }

    // ============================
    // Validar imágenes
    // ============================

    $fixImages = function (&$activities) {

        foreach ($activities as &$activity) {

            if (!empty($activity['image_url'])) {
                $fullPath = __DIR__ . '/../../' . $activity['image_url'];
                if (!file_exists($fullPath)) {
                    $activity['image_url'] = 'assets/img/default-activity.jpg';
                }
            } else {

                $activity['image_url'] = 'assets/img/default-activity.jpg';
            }
        }
    };

    $fixImages($active);
    $fixImages($finished);

    echo json_encode([
        'success' => true,
        'data' => [
            'active' => $active,
            'finished' => $finished
        ]
    ]);

} catch (Exception $e) {

    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener actividades'
    ]);

}
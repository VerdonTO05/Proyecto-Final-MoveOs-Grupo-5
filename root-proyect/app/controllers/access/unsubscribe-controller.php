<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

ini_set('display_errors', 0);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../models/entities/User.php';
require_once __DIR__ . '/../../models/entities/Request.php';
require_once __DIR__ . '/../../models/entities/Activity.php';
require_once __DIR__ . '/../../models/entities/Registration.php';
require_once __DIR__ . '/../../services/EmailService.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'No hay sesión activa'
    ]);
    exit;
}

$userId = $_SESSION['user_id'];
$role   = $_SESSION['role'];

try {
    $db = (new Database())->getConnection();

    $userModel        = new User($db);
    $requestModel     = new Request($db);
    $activityModel    = new Activity($db);
    $registrationModel = new Registration($db);

    $emailsToSend = [];

    /* =========================
       RECOPILAR EMAILS
    ========================= */

    if ($role === 'participante') {

        $requests = $requestModel->getRequestsByParticipantId($userId);

        foreach ($requests as $r) {
            if (!empty($r['accepted_by'])) {
                $organizer = $userModel->getUserById($r['accepted_by']);

                if ($organizer) {
                    $emailsToSend[] = [
                        'type' => 'request_deleted',
                        'title' => $r['title'],
                        'user'  => $organizer
                    ];
                }
            }
        }

    } else {

        $activities = $activityModel->getActivitiesByOffertantId($userId);

        foreach ($activities as $a) {
            $registrations = $registrationModel->getRegistrationsByActivityId($a['id']);

            foreach ($registrations as $r) {
                $participant = $userModel->getUserById($r['participant_id']);

                if ($participant) {
                    $emailsToSend[] = [
                        'type' => 'activity_deleted',
                        'title' => $a['title'],
                        'user'  => $participant
                    ];
                }
            }
        }

        $requests = $requestModel->getAcceptedRequestsByOrganizerId($userId, 'aprobada');

        foreach ($requests as $r) {
            $participant = $userModel->getUserById($r['participant_id']);

            if ($participant) {
                $emailsToSend[] = [
                    'type' => 'request_unaccepted',
                    'title' => $r['title'],
                    'user'  => $participant
                ];
            }
        }
    }

    /* =========================
       BORRAR USUARIO
    ========================= */

    if (!$userModel->deactivateUser($userId)) {
        echo json_encode([
            'success' => false,
            'message' => 'No se pudo eliminar la cuenta'
        ]);
        exit;
    }

    /* =========================
       LIMPIAR SESIÓN
    ========================= */

    session_unset();
    session_destroy();

    /* =========================
       RESPUESTA FINAL (IMPORTANTE: LIMPIA)
    ========================= */

    echo json_encode([
        'success' => true,
        'message' => 'Cuenta eliminada correctamente'
    ]);
    exit;

} catch (Exception $e) {
    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor'
    ]);
    exit;
}
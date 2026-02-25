<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../models/entities/Activity.php';
require_once __DIR__ . '/../models/entities/Request.php';
require_once __DIR__ . '/../../config/database.php';

if (!isset($_SESSION['user_id'])) {
    header('Location: index.php?accion=loginView');
    exit;
}

try {

    $database = new Database();
    $db = $database->getConnection();

    $activityModel = new Activity($db);
    $requestModel = new Request($db);

    $id = $_POST['id'] ?? null;

    if (!$id) {
        die('ID publicación no recibido');
    }

    if ($_SESSION['role'] === 'participante') {
        $publication = $requestModel->getRequestById($id);
        $typePublication = 'request';
    } else {
        $publication = $activityModel->getActivityById($id);
        $typePublication = 'activity';
    }

    if (!$publication) {
        die('Publicación no encontrada');
    }

    // Comprobar propiedad 
    if ($typePublication === 'activity') {
        if ($publication['offertant_id'] != $_SESSION['user_id']) {
            die('Esta actividad no te pertenece');
        }
    } else {
        if ($publication['participant_id'] != $_SESSION['user_id']) {
            die('Esta petición no te pertenece');
        }
    }

    if ($typePublication === 'activity') {
        $activityModel->deleteActivity($id);
    } else {
        $requestModel->deleteRequest($id);
    }

    header('Location: index.php?accion=seeMyActivities');
    exit;

} catch (Exception $e) {
    http_response_code(500);
    echo 'Error del servidor: ' . htmlspecialchars($e->getMessage());
}
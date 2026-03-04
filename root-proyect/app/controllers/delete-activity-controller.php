<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../models/entities/Activity.php';
require_once __DIR__ . '/../models/entities/Request.php';
require_once __DIR__ . '/../../config/database.php';

if (!isset($_SESSION['user_id'])) {
    $_SESSION['error'] = 'Debes iniciar sesión';
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
        $_SESSION['error'] = 'Publicación a eliminar no recibida';
        header('Location: index.php?accion=seeMyActivities');
        exit;
    }

    if ($_SESSION['role'] === 'participante') {
        $publication = $requestModel->getRequestById($id);
        $typePublication = 'request';
    } else {
        $publication = $activityModel->getActivityById($id);
        $typePublication = 'activity';
    }

    if (!$publication) {
        $_SESSION['error'] = 'Publicación no encontrada';
        header('Location: index.php?accion=seeMyActivities');
        exit;
    }

    // Comprobar propiedad 
    if ($typePublication === 'activity') {
        if ($publication['offertant_id'] != $_SESSION['user_id']) {
            $_SESSION['error'] = 'Esta actividad no te pertenece';
            header('Location: index.php?accion=seeMyActivities');
            exit;
        }
    } else {
        if ($publication['participant_id'] != $_SESSION['user_id']) {
            $_SESSION['error'] = 'Esta petición no te pertenece';
            header('Location: index.php?accion=seeMyActivities');
            exit;
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
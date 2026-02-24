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
    $requestModel  = new Request($db);

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

    // ==================================================
    // SI SE ENVÍA EL FORMULARIO (UPDATE)
    // ==================================================
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['title'])) {

        $data = [
            'id' => $id,
            'title' => trim($_POST['title'] ?? ''),
            'description' => trim($_POST['description'] ?? ''),
            'category_id' => $_POST['category_id'] ?? null,
            'location' => trim($_POST['location'] ?? ''),
            'date' => $_POST['date'] ?? null,
            'time' => $_POST['time'] ?? null,
            'language' => trim($_POST['language'] ?? ''),
            'min_age' => $_POST['min_age'] ?: null,
            'dress_code' => trim($_POST['dress_code'] ?? ''),
            'transport_included' => isset($_POST['transport_included']) ? 1 : 0,
            'departure_city' => trim($_POST['departure_city'] ?? ''),
            'pets_allowed' => isset($_POST['pets_allowed']) ? 1 : 0,
        ];

        // Solo actividades tienen estos campos
        if ($typePublication === 'activity') {
            $data['price'] = $_POST['price'] ?: null;
            $data['max_people'] = $_POST['max_people'] ?: null;

            $activityModel->updateActivity($data);
        } else {
            $requestModel->updateRequest($data);
        }

        header('Location: index.php?accion=seeMyActivities');
        exit;
    }

    // ==================================================
    // MOSTRAR VISTA
    // ==================================================
    require __DIR__ . '/../views/edit-activity.php';

} catch (Exception $e) {
    http_response_code(500);
    echo 'Error del servidor: ' . htmlspecialchars($e->getMessage());
}
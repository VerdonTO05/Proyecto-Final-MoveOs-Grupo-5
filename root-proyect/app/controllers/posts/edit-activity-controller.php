<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../models/entities/Activity.php';
require_once __DIR__ . '/../../models/entities/Request.php';
require_once __DIR__ . '/../../../config/database.php';

if (!isset($_SESSION['user_id'])) {
    header('Location: index.php?accion=loginView');
    exit;
}

try {

    $database = new Database();
    $db = $database->getConnection();

    $activityModel = new Activity($db);
    $requestModel  = new Request($db);

    // Leer id de GET o POST según el momento
    $id = $_POST['id'] ?? $_GET['id'] ?? null;

    if (!$id) {
        $_SESSION['error'] = 'Información no recibida';
        header('Location: index.php?accion=seeMyActivities');
        exit;
    }

    if ($_SESSION['role'] === 'participante') {
        $publication     = $requestModel->getRequestById($id);
        $typePublication = 'request';
    } else {
        $publication     = $activityModel->getActivityById($id);
        $typePublication = 'activity';
    }

    if (!$publication) {
        $_SESSION['error'] = 'Publicación no encontrada';
        header('Location: index.php?accion=seeMyActivities');
        exit;
    }

    $userId = $_SESSION['user_id'];
    $field  = ($typePublication === 'activity') ? 'offertant_id' : 'participant_id';

    if ($publication[$field] != $userId) {
        $_SESSION['error'] = 'No tienes permiso para editar esta publicación';
        header('Location: index.php?accion=seeMyActivities');
        exit;
    }

    // Si se envía el formulario (update)
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['title'])) {

        $data = [
            'id'                 => $id,
            'title'              => trim($_POST['title'] ?? ''),
            'description'        => trim($_POST['description'] ?? ''),
            'category_id'        => $_POST['category_id'] ?? null,
            'location'           => trim($_POST['location'] ?? ''),
            'date'               => $_POST['date'] ?? null,
            'time'               => $_POST['time'] ?? null,
            'language'           => trim($_POST['language'] ?? ''),
            'min_age'            => $_POST['min_age'] ?: null,
            'dress_code'         => trim($_POST['dress_code'] ?? ''),
            'transport_included' => isset($_POST['transport_included']) ? 1 : 0,
            'departure_city'     => trim($_POST['departure_city'] ?? ''),
            'pets_allowed'       => isset($_POST['pets_allowed']) ? 1 : 0,
        ];

        if ($typePublication === 'activity') {
            $data['price']      = $_POST['price'] ?: null;
            $data['max_people'] = $_POST['max_people'] ?: null;
        }

        // Campos a comparar según el tipo
        $fieldsToCompare = [
            'title', 'description', 'category_id', 'location', 'date',
            'time', 'language', 'min_age', 'dress_code', 'transport_included',
            'departure_city', 'pets_allowed'
        ];

        if ($typePublication === 'activity') {
            $fieldsToCompare[] = 'price';
            $fieldsToCompare[] = 'max_people';
        }

        $hasChanges = false;
        foreach ($fieldsToCompare as $f) {
            if ((string)($data[$f] ?? '') !== (string)($publication[$f] ?? '')) {
                $hasChanges = true;
                break;
            }
        }

        // Sin cambios → salir directamente
        if (!$hasChanges) {
            header('Location: index.php?accion=seeMyActivities');
            exit;
        }

        if ($typePublication === 'activity') {
            $data['offertant_id'] = $_SESSION['user_id'];

            $result = $activityModel->updateActivity($data);

            $errorMessages = [
                'conflict_activity' => 'Ya tienes otra actividad ese día: "' . (is_array($result) ? ($result['title'] ?? '') : '') . '".',
                'conflict_request'  => 'Ya tienes una petición aceptada ese día: "' . (is_array($result) ? ($result['title'] ?? '') : '') . '".',
                'not_found'         => 'La actividad no existe o no se pudo actualizar.',
                'exception'         => 'Error del servidor.',
            ];

        } else {
            $data['participant_id'] = $_SESSION['user_id'];

            $result = $requestModel->updateRequest($data);

            $errorMessages = [
                'conflict_request'  => 'Ya tienes otra petición ese día: "' . (is_array($result) ? ($result['title'] ?? '') : '') . '".',
                'conflict_activity' => 'Ya tienes una inscripción en una actividad ese día: "' . (is_array($result) ? ($result['title'] ?? '') : '') . '".',
                'not_found'         => 'La petición no existe o no se pudo actualizar.',
                'exception'         => 'Error del servidor.',
            ];
        }

        if ($result === true) {
            header('Location: index.php?accion=seeMyActivities');
            exit;
        }

        $msg = is_array($result) && isset($result['error'])
            ? ($errorMessages[$result['error']] ?? 'Error al actualizar.')
            : 'Error al actualizar.';

        $_SESSION['form_errors']   = [$msg];
        $_SESSION['form_old_data'] = $_POST;
        header('Location: index.php?accion=editActivity&id=' . $id);
        exit;
    }

    // Mostrar vista
    require __DIR__ . '/../../views/posts/edit-activity.php';

} catch (Exception $e) {
    http_response_code(500);
    echo 'Error del servidor: ' . htmlspecialchars($e->getMessage());
}
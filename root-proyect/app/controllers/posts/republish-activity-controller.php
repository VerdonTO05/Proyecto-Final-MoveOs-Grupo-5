<?php

header('Content-Type: application/json');

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../models/entities/Activity.php';
require_once __DIR__ . '/../../models/entities/Request.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Solo POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido'
    ]);
    exit;
}

try {

    // ===== CONEXIÓN BD =====
    $database = new Database();
    $db = $database->getConnection();

    // ===== DATOS =====
    $type = $_POST['type'] ?? ''; 
    $id = $_POST['id'] ?? null;
    $newDate = $_POST['date'] ?? null;

    if (!$id || !$newDate || !$type) {
        echo json_encode([
            'success' => false,
            'message' => 'Faltan datos'
        ]);
        exit;
    }

    // ===== VALIDAR FECHA =====
    if (strtotime($newDate) < strtotime(date('Y-m-d'))) {
        echo json_encode([
            'success' => false,
            'message' => 'La fecha no puede ser anterior a hoy'
        ]);
        exit;
    }

    if ($type === 'request') {

        if ($_SESSION['role'] !== 'participante') {
            echo json_encode([
                'success' => false,
                'message' => 'No autorizado'
            ]);
            exit;
        }

        $requestModel = new Request($db);
        $old = $requestModel->getRequestById($id);

        if (!$old) {
            echo json_encode([
                'success' => false,
                'message' => 'Petición no encontrada'
            ]);
            exit;
        }

        // Seguridad
        if ($old['participant_id'] != $_SESSION['user_id']) {
            echo json_encode([
                'success' => false,
                'message' => 'No tienes permiso para esta petición'
            ]);
            exit;
        }

        // Clonar
        $data = [
            'participant_id' => $_SESSION['user_id'],
            'category_id' => $old['category_id'],
            'title' => $old['title'],
            'description' => $old['description'],
            'date' => $newDate,
            'time' => $old['time'],
            'location' => $old['location'],
            'current_registrations' => 0,
            'organizer_email' => $_SESSION['email'] ?? '',
            'transport_included' => $old['transport_included'],
            'departure_city' => $old['departure_city'],
            'language' => $old['language'],
            'min_age' => $old['min_age'],
            'pets_allowed' => $old['pets_allowed'],
            'dress_code' => $old['dress_code'],
            'image_url' => $old['image_url'],
            'state' => 'pendiente'
        ];

        $result = $requestModel->createRequest($data);

        if ($result === true || is_string($result) || is_int($result)) {
            echo json_encode([
                'success' => true,
                'message' => 'Petición republicada correctamente'
            ]);
            exit;
        }

        // ===== ERRORES REQUEST =====
        if (is_array($result) && isset($result['error'])) {

            echo json_encode([
                'success' => false,
                'message' => match ($result['error']) {
                    'conflict_request' => 'Ya tienes una petición aceptada ese día',
                    'conflict_activity' => 'Tienes una actividad ese día',
                    default => 'No se ha podido republicar la petición'
                },
                'conflict' => $result['title'] ?? null
            ]);
            exit;
        }

        echo json_encode([
            'success' => false,
            'message' => 'Error inesperado al republicar la petición'
        ]);
        exit;
    }

    if ($type === 'activity') {

        $activityModel = new Activity($db);
        $old = $activityModel->getActivityById($id);

        if (!$old) {
            echo json_encode([
                'success' => false,
                'message' => 'Actividad no encontrada'
            ]);
            exit;
        }

        // Seguridad
        if (!isset($_SESSION['user_id']) || $old['offertant_id'] != $_SESSION['user_id']) {
            echo json_encode([
                'success' => false,
                'message' => 'No tienes permiso para esta actividad'
            ]);
            exit;
        }

        // Clonar
        $data = [
            'offertant_id' => $_SESSION['user_id'],
            'category_id' => $old['category_id'],
            'title' => $old['title'],
            'description' => $old['description'],
            'date' => $newDate,
            'time' => $old['time'],
            'price' => $old['price'],
            'max_people' => $old['max_people'],
            'current_registrations' => 0,
            'organizer_email' => $_SESSION['email'] ?? '',
            'location' => $old['location'],
            'transport_included' => $old['transport_included'],
            'departure_city' => $old['departure_city'],
            'language' => $old['language'],
            'min_age' => $old['min_age'],
            'pets_allowed' => $old['pets_allowed'],
            'dress_code' => $old['dress_code'],
            'image_url' => $old['image_url'],
            'state' => 'pendiente'
        ];

        $result = $activityModel->createActivity($data);

        if (is_string($result) || is_int($result)) {
            echo json_encode([
                'success' => true,
                'message' => 'Actividad republicada correctamente'
            ]);
            exit;
        }

        // ===== ERRORES ACTIVITY =====
        if (is_array($result) && isset($result['error'])) {

            $message = match ($result['error']) {
                'conflict_activity' => 'Ya tienes otra actividad ese día',
                'conflict_request' => 'Tienes una petición aceptada ese día',
                'insert_failed' => 'Error al crear la actividad',
                'exception' => 'Error interno en la base de datos',
                default => 'No se ha podido republicar la actividad'
            };

            echo json_encode([
                'success' => false,
                'message' => $message,
                'conflict' => $result['title'] ?? null
            ]);
            exit;
        }

        echo json_encode([
            'success' => false,
            'message' => 'Error inesperado al republicar la actividad'
        ]);
        exit;
    }

    // ===== TYPE inválido =====
    echo json_encode([
        'success' => false,
        'message' => 'Tipo no válido'
    ]);
    exit;

} catch (Exception $e) {

    error_log("Error republish: " . $e->getMessage());

    echo json_encode([
        'success' => false,
        'message' => 'Error interno del servidor'
    ]);
    exit;
}
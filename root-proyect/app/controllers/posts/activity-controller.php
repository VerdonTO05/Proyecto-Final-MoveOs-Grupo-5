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
    $title = trim($_POST['title'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $category_id = $_POST['category_id'] ?? '';
    $location = trim($_POST['location'] ?? '');
    $date = $_POST['date'] ?? '';
    $time = $_POST['time'] ?? '';
    $price = $_POST['price'] ?? 0;
    $max_people = $_POST['max_people'] ?? 0;

    $transport_included = isset($_POST['transport_included']) ? 1 : 0;
    $departure_city = trim($_POST['departure_city'] ?? '');
    $language = $_POST['language'] ?? '';
    $min_age = $_POST['min_age'] ?? 0;
    $pets_allowed = isset($_POST['pets_allowed']) ? 1 : 0;
    $dress_code = $_POST['dress_code'] ?? '';

    // ===== VALIDACIONES =====
    $errors = [];

    if (strlen($title) < 5) $errors[] = "El título debe tener al menos 5 caracteres.";
    if (strlen($title) > 50) $errors[] = "El título debe tener menos de 50 caracteres.";
    if (strlen($description) < 15) $errors[] = "La descripción debe tener al menos 15 caracteres.";
    if (empty($category_id)) $errors[] = "Debes seleccionar una categoría.";
    if (empty($location)) $errors[] = "La ubicación es obligatoria.";

    if (!empty($date)) {
        if ($date < date('Y-m-d')) {
            $errors[] = "La fecha no puede ser anterior a hoy.";
        }
    }

    if ($price < 0) $errors[] = "El precio no puede ser negativo.";
    if ($max_people < 0) $errors[] = "El número de participantes no es válido.";

    // ===== IMAGEN =====
    $imagePath = null;

    if (isset($_FILES['image_file']) && $_FILES['image_file']['error'] === 0) {

        $file = $_FILES['image_file'];
        $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        $fileType = mime_content_type($file['tmp_name']);

        if (!in_array($fileType, $allowedTypes)) {
            $errors[] = "Tipo de imagen no permitido.";
        }

        if ($file['size'] > 5 * 1024 * 1024) {
            $errors[] = "La imagen no puede superar 5MB.";
        }

    } else {
        $errors[] = "Debes subir una imagen.";
    }

    // ===== SI HAY ERRORES =====
    if (!empty($errors)) {
        echo json_encode([
            'success' => false,
            'message' => 'Errores de validación',
            'errors' => $errors
        ]);
        exit;
    }

    // ===== SUBIR IMAGEN =====
    if (isset($file)) {

        $uploadDir = __DIR__ . '/../../../public/uploads/activities/';

        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);

        $fileName = ($type === 'request' ? 'request_' : 'activity_') . time() . '_' . uniqid() . '.' . $extension;

        $uploadPath = $uploadDir . $fileName;

        if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
            $imagePath = 'uploads/activities/' . $fileName;
        }
    }

    // ===== REQUEST (PARTICIPANTE) =====
    if ($type === 'request' && $_SESSION['role'] === 'participante') {

        $request = new Request($db);

        $data = [
            'participant_id' => $_SESSION['user_id'],
            'category_id' => $category_id,
            'title' => htmlspecialchars($title),
            'description' => htmlspecialchars($description),
            'date' => $date,
            'time' => $time,
            'location' => $location,
            'current_registrations' => 0,
            'organizer_email' => $_SESSION['email'] ?? '',
            'transport_included' => $transport_included,
            'departure_city' => $departure_city,
            'language' => $language,
            'min_age' => $min_age,
            'pets_allowed' => $pets_allowed,
            'dress_code' => $dress_code,
            'image_url' => $imagePath,
            'state' => 'pendiente'
        ];

        $result = $request->createRequest($data);

        if ($result === true || is_string($result) || is_int($result)) {
            echo json_encode([
                'success' => true,
                'message' => 'Petición creada correctamente'
            ]);
            exit;
        }

        echo json_encode([
            'success' => false,
            'message' => 'Error al crear la petición'
        ]);
        exit;
    }

    // ===== ACTIVITY (ORGANIZADOR) =====
    $activity = new Activity($db);

    $data = [
        'offertant_id' => $_SESSION['user_id'] ?? 0,
        'category_id' => $category_id,
        'title' => htmlspecialchars($title),
        'description' => htmlspecialchars($description),
        'date' => $date,
        'time' => $time,
        'price' => $price,
        'max_people' => $max_people,
        'current_registrations' => 0,
        'organizer_email' => $_SESSION['email'] ?? '',
        'location' => $location,
        'transport_included' => $transport_included,
        'departure_city' => $departure_city,
        'language' => $language,
        'min_age' => $min_age,
        'pets_allowed' => $pets_allowed,
        'dress_code' => $dress_code,
        'image_url' => $imagePath,
        'state' => 'pendiente'
    ];

    $result = $activity->createActivity($data);

    if (is_string($result) || is_int($result)) {
        echo json_encode([
            'success' => true,
            'message' => 'Actividad creada correctamente'
        ]);
        exit;
    }

    echo json_encode([
        'success' => false,
        'message' => 'Error al crear la actividad'
    ]);
    exit;

} catch (Exception $e) {

    error_log("Error activity-validation: " . $e->getMessage());

    echo json_encode([
        'success' => false,
        'message' => 'Error interno del servidor'
    ]);
    exit;
}
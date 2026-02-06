<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../models/entities/Activity.php';
require_once __DIR__ . '/../models/entities/Request.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $database = new Database();
    $db = $database->getConnection();

    // Recoger valores POST y limpiar
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

    $errors = [];

    // ===== Validaciones =====
    if (strlen($title) < 5) $errors[] = "El título debe tener al menos 5 caracteres.";
    if (strlen($description) < 15) $errors[] = "La descripción debe tener al menos 15 caracteres.";
    if (empty($category_id)) $errors[] = "Debes seleccionar una categoría.";
    if (empty($location)) $errors[] = "La ubicación es obligatoria.";

    if (!empty($date)) {
        $today = date('Y-m-d');
        if ($date < $today) $errors[] = "La fecha no puede ser anterior a hoy.";
    }

    if ($price < 0) $errors[] = "El precio no puede ser negativo.";
    if ($max_people < 1) $errors[] = "La cantidad de usuarios debe ser al menos 1.";

    // Validación de imagen
    $imagePath = null;
    if (isset($_FILES['image_file']) && $_FILES['image_file']['error'] === 0) {
        $file = $_FILES['image_file'];
        $allowedTypes = ['image/jpeg','image/jpg','image/png'];
        $fileType = mime_content_type($file['tmp_name']);
        if (!in_array($fileType, $allowedTypes)) $errors[] = "Tipo de imagen no permitido.";
        if ($file['size'] > 5*1024*1024) $errors[] = "La imagen no puede superar 5MB.";
    } else {
        $errors[] = "Debes subir una imagen.";
    }

    if (!empty($errors)) {
        // Mostrar errores (puedes redirigir y guardar en session para mostrar en la vista)
        echo "<h3>Errores en el formulario:</h3><ul>";
        foreach($errors as $err) echo "<li>$err</li>";
        echo "</ul>";
        exit;
    }

    // ===== Subida de imagen =====
    if (isset($file) && $file['error'] === 0) {
        $uploadDir = __DIR__ .'/../../uploads/activities/';
        if (!file_exists($uploadDir)) mkdir($uploadDir, 0755, true);
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $fileName = ($type === 'request' ? 'request_' : 'activity_') . time() . '_' . uniqid() . '.' . $extension;
        $uploadPath = $uploadDir . $fileName;
        if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
            $imagePath = 'uploads/activities/' . $fileName;
        }
    }

    // ===== Insertar en DB =====
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
        if ($request->createRequest($data)) {
            header("Location: ../../public/index.php?accion=seeMyActivities"); exit;
        } else {
            echo "Error al crear la petición";
        }
    } else {
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
        if ($activity->createActivity($data)) {
            header("Location: ../../public/index.php?accion=seeMyActivities"); exit;
        } else {
            echo "Error al crear la actividad";
        }
    }
}
?>

<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../models/entities/Activity.php';
require_once __DIR__ . '/../models/entities/Request.php';

// Iniciar sesión si no está activa
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $database = new Database();
    $db = $database->getConnection();

    if ($_POST['type'] === 'request' && $_SESSION['rol'] === 'participante') {

        $request = new Request($db);

        $data = [
            'participant_id' => $_SESSION['user_id'], // importante
            'category_id' => $_POST['category_id'],
            'title' => htmlspecialchars($_POST['title']),
            'description' => htmlspecialchars($_POST['description']),
            'date' => $_POST['date'],
            'time' => $_POST['time'],
            'location' => $_POST['location'],
            'current_registrations' => 0,
            'organizer_email' => $_SESSION['email'],
            'transport_included' => isset($_POST['transport_included']) ? 1 : 0,
            'departure_city' => $_POST['departure_city'] ?? '',
            'language' => $_POST['language'],
            'min_age' => $_POST['min_age'],
            'max_age' => null,
            'pets_allowed' => isset($_POST['pets_allowed']) ? 1 : 0,
            'dress_code' => $_POST['dress_code'],
            'state' => 'pendiente'
        ];

        if ($request->createRequest($data)) {
            header("Location: ../views/control.php?status=request_created");
            exit;
        } else {
            echo "Error al crear la petición";
        }

    } else {

        $activity = new Activity($db);

        // Manejar subida de imagen
        $imagePath = null;
        if (isset($_FILES['image_file']) && $_FILES['image_file']['error'] === 0) {
            $file = $_FILES['image_file'];

            // Validar tipo de archivo
            $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            $fileType = mime_content_type($file['tmp_name']);

            if (in_array($fileType, $allowedTypes)) {
                // Validar tamaño (máximo 5MB)
                if ($file['size'] <= 5 * 1024 * 1024) {
                    // Crear directorio si no existe - en public para accesibilidad web
                    $uploadDir = __DIR__ . '/../../public/uploads/activities/';
                    if (!file_exists($uploadDir)) {
                        mkdir($uploadDir, 0755, true);
                    }

                    // Generar nombre único
                    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
                    $fileName = 'activity_' . time() . '_' . uniqid() . '.' . $extension;
                    $uploadPath = $uploadDir . $fileName;

                    // Mover archivo
                    if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
                        $imagePath = 'uploads/activities/' . $fileName;
                    }
                }
            }
        }

        $data = [
            'offertant_id' => $_SESSION['user_id'],
            'category_id' => $_POST['category_id'],
            'title' => htmlspecialchars($_POST['title']),
            'description' => htmlspecialchars($_POST['description']),
            'date' => $_POST['date'],
            'time' => $_POST['time'],
            'price' => $_POST['price'],
            'max_people' => $_POST['max_people'],
            'current_registrations' => 0,
            'organizer_email' => $_SESSION['email'],
            'location' => $_POST['location'],
            'transport_included' => isset($_POST['transport_included']) ? 1 : 0,
            'departure_city' => $_POST['departure_city'] ?? '',
            'language' => $_POST['language'],
            'min_age' => $_POST['min_age'],
            'pets_allowed' => isset($_POST['pets_allowed']) ? 1 : 0,
            'dress_code' => $_POST['dress_code'],
            'image_url' => $imagePath,
            'state' => 'pendiente'
        ];

        // Log para debug
        error_log("Intentando crear actividad: " . json_encode($data));

        $result = $activity->createActivity($data);

        if ($result) {
            error_log("Actividad creada exitosamente con ID: " . $result);
            header("Location: ../../public/index.php?status=activity_created");
            exit;
        } else {
            error_log("Error al crear la actividad - createActivity retornó false");
            echo "Error al crear la actividad. Por favor, revisa los logs del servidor.";
        }
    }
}
?>
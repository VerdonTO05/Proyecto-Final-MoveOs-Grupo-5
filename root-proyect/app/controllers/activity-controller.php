<?php
// ======= RUTAS CORRECTAS =======
// Usa la constante BASE_PATH que definimos en public/index.php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/app/models/entities/Activity.php';
require_once __DIR__ . '/app/models/entities/Request.php';

// ======= INICIAR SESIÓN =======
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// ======= PROCESAR POST =======
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $database = new Database();
    $db = $database->getConnection();

    // ======= CREAR PETICIÓN =======
    if (($_POST['type'] ?? '') === 'request' && ($_SESSION['rol'] ?? '') === 'participante') {

        $request = new Request($db);

        $data = [
            'participant_id' => $_SESSION['user_id'], 
            'category_id' => $_POST['category_id'] ?? null,
            'title' => htmlspecialchars($_POST['title'] ?? ''),
            'description' => htmlspecialchars($_POST['description'] ?? ''),
            'date' => $_POST['date'] ?? '',
            'time' => $_POST['time'] ?? '',
            'location' => $_POST['location'] ?? '',
            'current_registrations' => 0,
            'organizer_email' => $_SESSION['email'] ?? '',
            'transport_included' => isset($_POST['transport_included']) ? 1 : 0,
            'departure_city' => $_POST['departure_city'] ?? '',
            'language' => $_POST['language'] ?? '',
            'min_age' => $_POST['min_age'] ?? 0,
            'max_age' => null,
            'pets_allowed' => isset($_POST['pets_allowed']) ? 1 : 0,
            'dress_code' => $_POST['dress_code'] ?? '',
            'state' => 'pendiente'
        ];

        if ($request->createRequest($data)) {
            header("Location: ../views/control.php?status=request_created");
            exit;
        } else {
            echo "Error al crear la petición";
        }

    } else { // ======= CREAR ACTIVIDAD =======

        $activity = new Activity($db);

        // ======= SUBIDA DE IMAGEN =======
        $imagePath = null;
        if (isset($_FILES['image_file']) && $_FILES['image_file']['error'] === 0) {
            $file = $_FILES['image_file'];
            $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            $fileType = mime_content_type($file['tmp_name']);

            if (in_array($fileType, $allowedTypes) && $file['size'] <= 5 * 1024 * 1024) {
                
                // Crear directorio si no existe
                $uploadDir = BASE_PATH . '/public/uploads/activities/';
                if (!file_exists($uploadDir)) {
                    mkdir($uploadDir, 0755, true);
                }

                // Generar nombre único
                $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
                $fileName = 'activity_' . time() . '_' . uniqid() . '.' . $extension;
                $uploadPath = $uploadDir . $fileName;

                if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
                    // Ruta relativa para la web
                    $imagePath = 'uploads/activities/' . $fileName;
                }
            }
        }

        $data = [
            'offertant_id' => $_SESSION['user_id'] ?? 0,
            'category_id' => $_POST['category_id'] ?? null,
            'title' => htmlspecialchars($_POST['title'] ?? ''),
            'description' => htmlspecialchars($_POST['description'] ?? ''),
            'date' => $_POST['date'] ?? '',
            'time' => $_POST['time'] ?? '',
            'price' => $_POST['price'] ?? 0,
            'max_people' => $_POST['max_people'] ?? 0,
            'current_registrations' => 0,
            'organizer_email' => $_SESSION['email'] ?? '',
            'location' => $_POST['location'] ?? '',
            'transport_included' => isset($_POST['transport_included']) ? 1 : 0,
            'departure_city' => $_POST['departure_city'] ?? '',
            'language' => $_POST['language'] ?? '',
            'min_age' => $_POST['min_age'] ?? 0,
            'pets_allowed' => isset($_POST['pets_allowed']) ? 1 : 0,
            'dress_code' => $_POST['dress_code'] ?? '',
            'image_url' => $imagePath,
            'state' => 'pendiente'
        ];

        if ($activity->createActivity($data)) {
            header("Location: ../views/control.php?status=activity_created");
            exit;
        } else {
            echo "Error al crear la actividad";
        }
    }
}
?>

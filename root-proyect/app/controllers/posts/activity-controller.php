<?php
/**
 * Controlador para crear una actividad o una petición.
 *
 * Solo acepta peticiones POST. Valida los campos del formulario, gestiona
 * la subida de la imagen y, según el tipo ('request' o 'activity') y el rol
 * del usuario, inserta el registro en la base de datos.
 * Los errores de validación se almacenan en sesión y se redirige al formulario.
 */

// Cargar la conexión a la base de datos y los modelos necesarios
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../models/entities/Activity.php';
require_once __DIR__ . '/../../models/entities/Request.php';

// Iniciar sesión solo si no hay una activa
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Solo procesar peticiones POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // Instanciar la conexión a la base de datos
    $database = new Database();
    $db = $database->getConnection();

    // --- Recoger y sanear los campos del formulario ---
    $type = $_POST['type'] ?? '';
    $title = trim($_POST['title'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $category_id = $_POST['category_id'] ?? '';
    $location = trim($_POST['location'] ?? '');
    $date = $_POST['date'] ?? '';
    $time = $_POST['time'] ?? '';
    $price = $_POST['price'] ?? 0;
    $max_people = $_POST['max_people'] ?? 0;
    $transport_included = isset($_POST['transport_included']) ? 1 : 0; // Checkbox: 1 si marcado, 0 si no
    $departure_city = trim($_POST['departure_city'] ?? '');
    $language = $_POST['language'] ?? '';
    $min_age = $_POST['min_age'] ?? 0;
    $pets_allowed = isset($_POST['pets_allowed']) ? 1 : 0;       // Checkbox: 1 si marcado, 0 si no
    $dress_code = $_POST['dress_code'] ?? '';

    // --- Validaciones ---
    $errors = [];

    // Validar longitud del título
    if (strlen($title) < 5)
        $errors[] = "El título debe tener al menos 5 caracteres.";
    if (strlen($title) > 50)
        $errors[] = "El título debe tener menos de 50 caracteres.";

    // Validar longitud de la descripción
    if (strlen($description) < 15)
        $errors[] = "La descripción debe tener al menos 15 caracteres.";

    // Validar campos obligatorios
    if (empty($category_id))
        $errors[] = "Debes seleccionar una categoría.";
    if (empty($location))
        $errors[] = "La ubicación es obligatoria.";

    // Validar que la fecha no sea anterior a hoy
    if (!empty($date)) {
        $today = date('Y-m-d');
        if ($date < $today)
            $errors[] = "La fecha no puede ser anterior a hoy.";
    }

    // Validar que los valores numéricos sean positivos
    if ($price < 0)
        $errors[] = "El precio no puede ser negativo.";
    if ($max_people < 0)
        $errors[] = "La cantidad de usuarios debe ser al menos 1.";

    // Validar la imagen subida: tipo MIME y tamaño máximo (5MB)
    $imagePath = null;
    if (isset($_FILES['image_file']) && $_FILES['image_file']['error'] === 0) {
        $file = $_FILES['image_file'];
        $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        $fileType = mime_content_type($file['tmp_name']);
        if (!in_array($fileType, $allowedTypes))
            $errors[] = "Tipo de imagen no permitido.";
        if ($file['size'] > 5 * 1024 * 1024)
            $errors[] = "La imagen no puede superar 5MB.";
    } else {
        $errors[] = "Debes subir una imagen.";
    }

    // Si hay errores, guardarlos en sesión junto con los datos del formulario y redirigir
    if (!empty($errors)) {
        $_SESSION['form_errors'] = $errors;
        $_SESSION['form_old_data'] = $_POST;
        header("Location: " . $_SERVER['HTTP_REFERER']);
        exit;
    }

    // --- Subida de imagen al servidor ---
    if (isset($file) && $file['error'] === 0) {
        $uploadDir = __DIR__ . '/../../../public/uploads/activities/';

        // Crear el directorio de subida si no existe
        if (!file_exists($uploadDir))
            mkdir($uploadDir, 0755, true);

        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);

        // Generar un nombre único para evitar colisiones entre archivos
        $fileName = ($type === 'request' ? 'request_' : 'activity_') . time() . '_' . uniqid() . '.' . $extension;
        $uploadPath = $uploadDir . $fileName;

        if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
            $imagePath = 'uploads/activities/' . $fileName;
        }
    }

    // --- Insertar en la base de datos según tipo y rol ---

    if ($type === 'request' && $_SESSION['role'] === 'participante') {

        // El participante crea una petición de actividad
        $request = new Request($db);
        $data = [
            'participant_id' => $_SESSION['user_id'],
            'category_id' => $category_id,
            'title' => htmlspecialchars($title),       // Escapar para prevenir XSS
            'description' => htmlspecialchars($description), // Escapar para prevenir XSS
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
            'state' => 'pendiente' // Las peticiones se crean siempre como pendientes
        ];

        $result = $request->createRequest($data);

        // Si la inserción fue correcta (true, ID string o ID int), redirigir a mis actividades
        if ($result === true || is_string($result) || is_int($result)) {
            header("Location: index.php?accion=seeMyActivities");
            exit;
        }

        // Mapear el código de error devuelto por el modelo a un mensaje legible
        $errorMessages = [
            'conflict_request' => 'Ya tienes una petición ese día: "' . ($result['title'] ?? '') . '".',
            'conflict_activity' => 'Ya tienes una inscripción en una actividad ese día: "' . ($result['title'] ?? '') . '".',
            'insert_failed' => 'No se pudo crear la petición.',
            'exception' => 'Error del servidor.',
        ];

        $msg = is_array($result) && isset($result['error'])
            ? ($errorMessages[$result['error']] ?? 'Error al crear la petición.')
            : 'Error al crear la petición.';

        // Guardar el error en sesión y redirigir al formulario con los datos anteriores
        $_SESSION['form_errors'] = [$msg];
        $_SESSION['form_old_data'] = $_POST;
        header("Location: " . $_SERVER['HTTP_REFERER']);
        exit;

    } else {

        // El organizador (u otro rol) crea una actividad propia
        $activity = new Activity($db);
        $data = [
            'offertant_id' => $_SESSION['user_id'] ?? 0,
            'category_id' => $category_id,
            'title' => htmlspecialchars($title),       // Escapar para prevenir XSS
            'description' => htmlspecialchars($description), // Escapar para prevenir XSS
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
            'state' => 'pendiente' // Las actividades se crean siempre como pendientes
        ];

        $result = $activity->createActivity($data);

        // Si la inserción fue correcta (ID string o ID int), redirigir a mis actividades
        if (is_string($result) || is_int($result)) {
            header("Location: index.php?accion=seeMyActivities");
            exit;
        }

        // Mapear el código de error devuelto por el modelo a un mensaje legible
        $errorMessages = [
            'conflict_request' => 'Ya tienes una petición aceptada ese día: "' . ($result['title'] ?? '') . '".',
            'conflict_activity' => 'Ya tienes una actividad ese día: "' . ($result['title'] ?? '') . '".',
            'insert_failed' => 'No se pudo crear la actividad.',
            'exception' => 'Error del servidor.',
        ];

        $msg = is_array($result) && isset($result['error'])
            ? ($errorMessages[$result['error']] ?? 'Error al crear la actividad.')
            : 'Error al crear la actividad.';

        // Guardar el error en sesión y redirigir al formulario con los datos anteriores
        $_SESSION['form_errors'] = [$msg];
        $_SESSION['form_old_data'] = $_POST;
        header("Location: " . $_SERVER['HTTP_REFERER']);
        exit;
    }
}
?>
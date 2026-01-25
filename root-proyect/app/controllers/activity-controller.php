<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../models/entities/Activity.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $database = new Database();
    $db = $database->getConnection();
    $activity = new Activity($db);

    // Lógica para leer el archivo como binario
    $imageData = null;
    if (isset($_FILES['image_file']) && $_FILES['image_file']['error'] === 0) {
        // Leemos el contenido temporal del archivo
        $imageData = file_get_contents($_FILES['image_file']['tmp_name']);
    }

    $data = [
        'offertant_id'          => 1, // Ejemplo
        'category_id'           => $_POST['category_id'],
        'title'                 => htmlspecialchars($_POST['title']),
        'description'           => htmlspecialchars($_POST['description']),
        'date'                  => $_POST['date'],
        'time'                  => $_POST['time'],
        'price'                 => $_POST['price'],
        'max_people'            => $_POST['max_people'],
        'current_registrations' => 0,
        'organizer_email'       => 'test@test.com',
        'location'              => $_POST['location'],
        'transport_included'    => isset($_POST['transport_included']) ? 1 : 0,
        'departure_city'        => $_POST['departure_city'] ?? '',
        'language'              => $_POST['language'],
        'min_age'               => $_POST['min_age'],
        'pets_allowed'          => isset($_POST['pets_allowed']) ? 1 : 0,
        'dress_code'            => $_POST['dress_code'],
        'image_url'             => $imageData, // Aquí enviamos el chorro de bits
        'state'                 => 'pendiente'
    ];

    if ($activity->createActivity($data)) {
        header("Location: ../views/control.php?status=success");
    } else {
        echo "Error al guardar.";
    }
}
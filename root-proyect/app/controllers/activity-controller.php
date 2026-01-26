<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../models/entities/Activity.php';
require_once __DIR__ . '/../models/entities/Request.php';

session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $database = new Database();
    $db = $database->getConnection();

    if ($_POST['type'] === 'request' && $_SESSION['rol'] === 'participante') {

        $request = new Request($db);

        $data = [
            'participant_id'          => $_SESSION['user_id'], // importante
            'category_id'             => $_POST['category_id'],
            'title'                   => htmlspecialchars($_POST['title']),
            'description'             => htmlspecialchars($_POST['description']),
            'date'                    => $_POST['date'],
            'time'                    => $_POST['time'],
            'location'                => $_POST['location'],
            'current_registrations'   => 0,
            'organizer_email'         => $_SESSION['email'],
            'transport_included'      => isset($_POST['transport_included']) ? 1 : 0,
            'departure_city'          => $_POST['departure_city'] ?? '',
            'language'                => $_POST['language'],
            'min_age'                 => $_POST['min_age'],
            'max_age'                 => null,
            'pets_allowed'            => isset($_POST['pets_allowed']) ? 1 : 0,
            'dress_code'              => $_POST['dress_code'],
            'state'                   => 'pendiente'
        ];

        if ($request->createRequest($data)) {
            header("Location: ../views/control.php?status=request_created");
            exit;
        } else {
            echo "Error al crear la petición";
        }

    }else {

        $activity = new Activity($db);

        $imageData = null;
        if (isset($_FILES['image_file']) && $_FILES['image_file']['error'] === 0) {
            $imageData = file_get_contents($_FILES['image_file']['tmp_name']);
        }

        $data = [
            'offertant_id'          => $_SESSION['user_id'],
            'category_id'           => $_POST['category_id'],
            'title'                 => htmlspecialchars($_POST['title']),
            'description'           => htmlspecialchars($_POST['description']),
            'date'                  => $_POST['date'],
            'time'                  => $_POST['time'],
            'price'                 => $_POST['price'],
            'max_people'            => $_POST['max_people'],
            'current_registrations' => 0,
            'organizer_email'       => $_SESSION['email'],
            'location'              => $_POST['location'],
            'transport_included'    => isset($_POST['transport_included']) ? 1 : 0,
            'departure_city'        => $_POST['departure_city'] ?? '',
            'language'              => $_POST['language'],
            'min_age'               => $_POST['min_age'],
            'pets_allowed'          => isset($_POST['pets_allowed']) ? 1 : 0,
            'dress_code'            => $_POST['dress_code'],
            'image_url'             => $imageData,
            'state'                 => 'pendiente'
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
<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../models/entities/Activity.php';
require_once __DIR__ . '/../models/entities/Request.php';
require_once __DIR__ . '/../../config/database.php';

// Comprobar que el usuario está logueado
if (!isset($_SESSION['user_id'])) {
    header('Location: index.php?accion=loginView');
    exit;
}

try {
    // Conexión a la base de datos
    $database = new Database();
    $db = $database->getConnection();
    $activityModel = new Activity($db);
    $requestModel = new Request($db);

    $id = $_GET['id'] ?? null;

    if (!$id) {
        //Por si se borra de la url el id (comporbar que la actividad pertenece al usuario para evitar que pueda editar otras peticiones, si no es suya penalizar)
        die('ID publicación no recibida');
    }

    if($_SESSION['role'] == 'participante'){
        $publication = $requestModel->getRequestById($id);
        $typePublication = 'request';
    }else{
        $publication = $activityModel->getActivityById($id);
        $typePublication = 'activity';
    }

    // Obtener usuario actual
    if (!$publication) {
        die('Actividad no encontrada');
    }

    //Comprobar aqui si la actividad pertenece al usuario
    if($typePublication == 'activity'){
        if($publication['offertant_id'] != $_SESSION['user_id']){
            die('Esta actividad no te pertenece');
        }
    }else{
        if($publication['participant_id'] != $_SESSION['user_id']){
            die('esta petición no te pertenece');
        }
    }

    // ===========================
    // Si se envió el formulario
    // ===========================
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Recoger datos del formulario
        $title = trim($_POST['title'] ?? '');
        $description = trim($_POST['description'] ?? '');
        $category_id = $_POST['category_id'] ?? '';
        $location = trim($_POST['location'] ?? '');
        $date = $_POST['date'] ?? '';
        $time = $_POST['time'] ?? '';
        //si no es actividad no tiene precio nu cantidad maxima usuarios(posible error si no se trata)
        $price = $_POST['price'] ?? '';
        $max_people = $_POST['max_people'] ?? '';
        $language = trim($_POST['language'] ?? '');
        $min_age = $_POST['min_age'] ?? '';
        $dress_code = trim($_POST['dress_code'] ?? '');
        $transport_included = isset($_POST['transport_included']);
        $departure_city = trim($_POST['departure_city'] ?? '');
        $pets_allowed = isset($_POST['pets_allowed']);
        //url imagen falta por buscar como guardar

        // Validaciones básicas




        // Actualizar actividad en la base de datos
        if($_POST['type'] == 'request'){
            // $publication->
        }else{
            //Actividad
        }

        // Redirigir a la misma vista con parámetro de éxito
        header('Location: index.php?accion=seeMyActivities');
        exit;
    }

    // Si es GET, solo mostrar vista
    require __DIR__ . '/../views/edit-activity.php';

} catch (Exception $e) {
    http_response_code(500);
    echo 'Error del servidor: ' . htmlspecialchars($e->getMessage());
}

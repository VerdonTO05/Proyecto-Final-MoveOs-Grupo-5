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

    $id = $_GET['id'] ?? null;

    if (!$id) {
        die('ID actividad no recibido');
    }

    $publication = $activityModel->getActivityById($id);
    // Obtener usuario actual
    if (!$publication) {
        die('Actividad no encontrada');
    }

    // ===========================
    // Si se envió el formulario
    // ===========================
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Recoger datos del formulario


        // Validaciones básicas




        // Actualizar actividad en la base de datos


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

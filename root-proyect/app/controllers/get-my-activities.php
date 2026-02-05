<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../models/entities/Activity.php';
require_once __DIR__ . '/../models/entities/Request.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$database = new Database();
$db = $database->getConnection();
$activity = new Activity($db);
$request = new Request($db);

if (!isset($_SESSION['role'])) {
    echo json_encode([
        'success' => false,
        'message' => 'No autorizado'
    ]);
    exit;
}

// Obtener actividades aprobadas
if ($_SESSION['role'] == 'organizador') {
    $publics = $activity->getActivitiesByOffertantId($_SESSION['user_id']);
} elseif ($_SESSION['role'] == 'participante') {
    $publics = $request->getRequestsByParticipantId($_SESSION['user_id']);
}

// Agregar URL completa para las imágenes
if ($_SESSION['role'] == 'organizador') {
    foreach ($publics as &$public) {
        if ($public['image_url']) {
            // Construir ruta completa del archivo
            $fullPath = __DIR__ . $public['image_url'];

            // Verificar si el archivo existe
            if (file_exists($fullPath)) {
            } else {
                // Si no existe, usar placeholder
                $public['image_url'] = 'assets/img/default-activity.jpg';
            }
        } else {
            $public['image_url'] = 'assets/img/default-activity.jpg';
        }
    }
}

echo json_encode([
    'success' => true,
    'data' => $publics
]);
?>
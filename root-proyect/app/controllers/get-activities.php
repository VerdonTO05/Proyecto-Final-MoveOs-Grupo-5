<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../models/entities/Activity.php';

session_start();

$database = new Database();
$db = $database->getConnection();
$activity = new Activity($db);

// Obtener actividades aprobadas
$activities = $activity->getActivitiesByState('aprobada');

// Agregar URL completa para las imágenes
foreach ($activities as &$act) {
    if ($act['image_url']) {
        // Construir ruta completa del archivo
        $fullPath = __DIR__ . '/../../public/' . $act['image_url'];

        // Verificar si el archivo existe
        if (file_exists($fullPath)) {
            $act['image_url'] = '../../public/' . $act['image_url'];
        } else {
            // Si no existe, usar placeholder
            $act['image_url'] = '../../public/assets/img/default-activity.jpg';
        }
    } else {
        $act['image_url'] = '../../public/assets/img/default-activity.jpg';
    }
}

echo json_encode([
    'success' => true,
    'data' => $activities
]);
?>
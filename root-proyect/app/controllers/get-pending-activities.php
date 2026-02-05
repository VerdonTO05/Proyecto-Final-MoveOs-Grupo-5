<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../models/entities/Activity.php';
require_once __DIR__ . '/../models/entities/Request.php';

// Iniciar sesión si no está activa
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Logging para debug
error_log("User session role: " . ($_SESSION['role'] ?? 'not set'));

// Verificar que sea administrador
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'administrador') {
    echo json_encode([
        'success' => false,
        'message' => 'No autorizado. Debes iniciar sesión como administrador.',
        'debug' => [
            'session_exists' => isset($_SESSION['role']),
            'current_role' => $_SESSION['role'] ?? 'no role set'
        ]
    ]);
    exit;
}

$database = new Database();
$db = $database->getConnection();
$activity = new Activity($db);
$request = new Request($db);

// Obtener estadísticas
$statsActivities = $activity->getStats();
$statsRequests = $request->getStats();

$stats = [
    'activities' => $statsActivities,
    'requests' => $statsRequests
];

// Obtener actividades pendientes
$pendingActivities = $activity->getActivitiesByState('pendiente');

// Obtener peticiones pendientes
$pendingRequests = $request->getRequestsByState('pendiente');

// Agregar URL completa para las imágenes de actividades
foreach ($pendingActivities as &$act) {
    if ($act['image_url']) {
        // Construir ruta completa del archivo
        $fullPath = __DIR__ . '/../../public/' . $act['image_url'];

        // Verificar si el archivo existe
        if (file_exists($fullPath)) {

        } else {
            // Si no existe, usar placeholder
            $act['image_url'] = 'assets/img/default-activity.jpg';
        }
    } else {
        $act['image_url'] = 'assets/img/default-activity.jpg';
    }
}

echo json_encode([
    'success' => true,
    'stats' => $stats,
    'activities' => $pendingActivities,
    'requests' => $pendingRequests
]);
?>
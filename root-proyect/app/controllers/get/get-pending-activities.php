<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../models/entities/Activity.php';
require_once __DIR__ . '/../../models/entities/Request.php';

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

echo json_encode([
    'success' => true,
    'stats' => $stats,
    'activities' => $pendingActivities,
    'requests' => $pendingRequests
]);
?>
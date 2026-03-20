<?php
/**
 * Controlador para obtener los datos del panel de administración.
 *
 * Solo accesible por administradores. Devuelve las estadísticas globales
 * de actividades y peticiones, junto con los registros pendientes de revisión.
 */

// Establecer el tipo de respuesta como JSON
header('Content-Type: application/json');

// Cargar la conexión a la base de datos y los modelos necesarios
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../models/entities/Activity.php';
require_once __DIR__ . '/../../models/entities/Request.php';

// Iniciar sesión solo si no hay una activa
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Verificar que el usuario autenticado tiene rol de administrador
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'administrador') {
    echo json_encode([
        'success' => false,
        'message' => 'No autorizado'
    ]);
    exit;
}

try {
    // Instanciar la conexión y los modelos
    $database = new Database();
    $db = $database->getConnection();
    $activity = new Activity($db);
    $request = new Request($db);

    // Obtener estadísticas globales de actividades y peticiones
    $stats = [
        'activities' => $activity->getStats(),
        'requests' => $request->getStats()
    ];

    // Obtener actividades pendientes de revisión por el administrador
    $pendingActivities = $activity->getActivitiesByState('pendiente');

    // Obtener peticiones pendientes de revisión por el administrador
    $pendingRequests = $request->getRequestsByState('pendiente');

    echo json_encode([
        'success' => true,
        'stats' => $stats,
        'activities' => $pendingActivities,
        'requests' => $pendingRequests
    ]);

} catch (PDOException $e) {
    // Error específico de base de datos: registrar internamente sin exponer detalles
    error_log('[PDOException] getDashboardController: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error de base de datos. Inténtalo más tarde.'
    ]);
} catch (Exception $e) {
    // Error genérico inesperado: registrar internamente sin exponer detalles
    error_log('[Exception] getDashboardController: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error inesperado. Inténtalo más tarde.'
    ]);
}
?>
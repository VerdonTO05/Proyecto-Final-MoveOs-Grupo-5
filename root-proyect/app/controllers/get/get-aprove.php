<?php
/**
 * Controlador para obtener actividades o peticiones aprobadas.
 *
 * Según el rol del usuario autenticado, devuelve las peticiones
 * aprobadas (organizador) o las actividades aprobadas (resto de roles).
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

// Verificar que el usuario esté autenticado
if (!isset($_SESSION['role'])) {
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

    // Obtener los datos aprobados según el rol del usuario
    if ($_SESSION['role'] === 'organizador') {
        // El organizador solo ve sus peticiones aprobadas
        $data = $request->getRequestsByState('aprobada');
    } else {
        // El resto de roles ve las actividades aprobadas
        $data = $activity->getActivitiesByState('aprobada');

        // Filtrar actividades en las que el usuario ya está inscrito
        $userId = intval($_SESSION['user_id']);
        $data = array_values(array_filter($data, function ($act) use ($userId) {
            return !in_array($userId, $act['enrolled_user_ids'] ?? []);
        }));
    }

    echo json_encode([
        'success' => true,
        'data' => $data
    ]);

} catch (PDOException $e) {
    // Error específico de base de datos: registrar internamente sin exponer detalles
    error_log('[PDOException] getApprovedController: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error de base de datos. Inténtalo más tarde.'
    ]);
} catch (Exception $e) {
    // Error genérico inesperado: registrar internamente sin exponer detalles
    error_log('[Exception] getApprovedController: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error inesperado. Inténtalo más tarde.'
    ]);
}
?>
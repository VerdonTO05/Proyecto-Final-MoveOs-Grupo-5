<?php
/**
 * Controlador para obtener las actividades o peticiones del usuario autenticado.
 *
 * Según el rol, devuelve dos listados: los registros activos y los finalizados.
 * - Organizador: sus actividades como ofertante (activas y finalizadas).
 * - Participante: sus peticiones como participante (activas y finalizadas).
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
    $db       = $database->getConnection();
    $activity = new Activity($db);
    $request  = new Request($db);

    // Inicializar los listados como arrays vacíos por defecto
    // para evitar errores si el rol no coincide con ningún caso
    $active   = [];
    $finished = [];

    // Obtener los registros según el rol del usuario autenticado
    if ($_SESSION['role'] === 'organizador') {
        // El organizador ve las actividades que él mismo ha ofertado
        $active   = $activity->getActivitiesByOffertantId($_SESSION['user_id']);
        $finished = $activity->getActivitiesFinishedByOffertantId($_SESSION['user_id']);

    } elseif ($_SESSION['role'] === 'participante') {
        // El participante ve las peticiones en las que está inscrito
        $active   = $request->getRequestsByParticipantId($_SESSION['user_id']);
        $finished = $request->getRequestsFinishedByParticipantId($_SESSION['user_id']);
    }

    echo json_encode([
        'success' => true,
        'data'    => [
            'active'   => $active,
            'finished' => $finished
        ]
    ]);

} catch (PDOException $e) {
    // Error específico de base de datos: registrar internamente sin exponer detalles
    error_log('[PDOException] getUserDataController: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error de base de datos. Inténtalo más tarde.'
    ]);
} catch (Exception $e) {
    // Error genérico inesperado: registrar internamente sin exponer detalles
    error_log('[Exception] getUserDataController: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error inesperado. Inténtalo más tarde.'
    ]);
}
?>
<?php
/**
 * Controlador para obtener las actividades o peticiones aceptadas del usuario.
 *
 * Según el rol del usuario autenticado, devuelve dos listados:
 * - Organizador: peticiones aceptadas activas y finalizadas de su organización.
 * - Participante: actividades en las que está inscrito, activas y finalizadas.
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

// Verificar que el usuario esté autenticado y tenga ID y rol en sesión
if (!isset($_SESSION['user_id']) || !isset($_SESSION['role'])) {
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
    $request  = new Request($db);
    $activity = new Activity($db);

    // Leer los datos del usuario desde la sesión
    $user_id = $_SESSION['user_id'];
    $role    = $_SESSION['role'];

    // Inicializar los listados como arrays vacíos por defecto
    $active   = [];
    $finished = [];

    // Obtener los registros según el rol del usuario autenticado
    if ($role === 'organizador') {
        // El organizador ve las peticiones aceptadas de sus actividades
        $active   = $request->getAcceptedRequestsByOrganizerId($user_id, 'aprobada');
        $finished = $request->getAcceptedRequestsFinishedByOrganizerId($user_id);
    }

    if ($role === 'participante') {
        // El participante ve las actividades en las que está inscrito
        $active   = $activity->getActivitiesByParticipantId($user_id);
        $finished = $activity->getActivitiesFinishedByParticipantId($user_id);
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
    error_log('[PDOException] getAcceptedController: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error de base de datos. Inténtalo más tarde.'
    ]);
} catch (Exception $e) {
    // Error genérico inesperado: registrar internamente sin exponer detalles
    error_log('[Exception] getAcceptedController: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error inesperado. Inténtalo más tarde.'
    ]);
}
?>
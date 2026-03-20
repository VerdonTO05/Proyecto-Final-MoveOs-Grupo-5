<?php
/**
 * Controlador para obtener el listado de actividades.
 *
 * Verifica que el usuario esté autenticado y, según su rol,
 * recupera las actividades correspondientes. El administrador
 * obtiene todas las actividades; el resto solo las aprobadas.
 */

// Establecer el tipo de respuesta como JSON
header('Content-Type: application/json');

// Cargar la conexión a la base de datos y el modelo de actividades
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../models/entities/Activity.php';

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
    // Instanciar la conexión y el modelo de actividades
    $database = new Database();
    $db = $database->getConnection();
    $activity = new Activity($db);

    // Obtener actividades según el rol del usuario
    if ($_SESSION['role'] === 'administrador') {
        // El administrador obtiene todas las actividades sin filtro
        $activities = $activity->getActivities();
    }

    echo json_encode([
        'success' => true,
        'data' => $activities
    ]);

} catch (PDOException $e) {
    // Error específico de base de datos: registrar internamente sin exponer detalles
    error_log('[PDOException] getActivitiesController: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error de base de datos. Inténtalo más tarde.'
    ]);
} catch (Exception $e) {
    // Error genérico inesperado: registrar internamente sin exponer detalles
    error_log('[Exception] getActivitiesController: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error inesperado. Inténtalo más tarde.'
    ]);
}
?>
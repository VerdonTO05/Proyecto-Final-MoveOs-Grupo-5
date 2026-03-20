<?php
/**
 * Controlador para aceptar una petición de actividad.
 *
 * Verifica que el organizador esté autenticado, valida el ID de la petición
 * y delega la lógica de aceptación al modelo. Gestiona múltiples casos de
 * error devueltos por el modelo (conflictos de horario, petición ya aceptada, etc.).
 */

// Iniciar sesión solo si no hay una activa
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Cargar la conexión a la base de datos y el modelo de peticiones
require_once __DIR__ . '/../../models/entities/Request.php';
require_once __DIR__ . '/../../../config/database.php';

// Establecer el tipo de respuesta como JSON
header('Content-Type: application/json');

// Verificar que el usuario esté autenticado
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Debes iniciar sesión']);
    exit;
}

// Leer el cuerpo de la petición JSON solo si no fue cargado previamente
if (!isset($input) || empty($input)) {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
}

// Obtener el ID de la petición a aceptar y el ID del organizador desde la sesión
$id_request = $input['id_request'] ?? null;
$organizer_id = $_SESSION['user_id'];

// Validar que se haya proporcionado el ID de la petición
if (!$id_request) {
    echo json_encode(['success' => false, 'message' => 'Petición no recibida']);
    exit;
}

try {
    // Instanciar la conexión y el modelo de peticiones
    $database = new Database();
    $db = $database->getConnection();
    $requestModel = new Request($db);

    // Intentar aceptar la petición; el modelo puede devolver true o un array con error
    $result = $requestModel->acceptRequest($id_request, $organizer_id);

    if ($result === true) {
        // La petición fue aceptada correctamente
        echo json_encode([
            'success' => true,
            'message' => 'Petición aceptada correctamente'
        ]);

    } elseif (is_array($result) && isset($result['error'])) {
        // El modelo devolvió un error identificado; se mapea a un mensaje legible para el usuario
        $messages = [
            'request_not_found' => 'La solicitud no existe o ya fue aceptada.',
            'already_accepted' => 'La solicitud ya fue aceptada por otro organizador.',
            'conflict_request' => 'Ya aceptaste otra solicitud ese día: "' . ($result['title'] ?? '') . '".',
            'conflict_activity' => 'Tienes una actividad propia ese día: "' . ($result['title'] ?? '') . '".',
            'exception' => 'Error del servidor.',
        ];

        echo json_encode([
            'success' => false,
            // Si el código de error no está en el mapa, se usa un mensaje genérico
            'message' => $messages[$result['error']] ?? 'No se pudo aceptar la solicitud.'
        ]);

    } else {
        // El modelo devolvió un resultado inesperado distinto de true o array de error
        echo json_encode([
            'success' => false,
            'message' => 'No se pudo aceptar la solicitud.'
        ]);
    }

} catch (PDOException $e) {
    // Error específico de base de datos: registrar internamente sin exponer detalles
    error_log('[PDOException] acceptRequestController: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error de base de datos. Inténtalo más tarde.'
    ]);
} catch (Exception $e) {
    // Error genérico inesperado: registrar internamente sin exponer detalles
    error_log('[Exception] acceptRequestController: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor. Inténtalo más tarde.'
    ]);
}
?>
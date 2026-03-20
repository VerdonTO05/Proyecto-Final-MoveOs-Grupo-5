<?php
/**
 * Controlador para inscribir a un participante en una actividad.
 *
 * Verifica que el usuario esté autenticado, valida el ID de la actividad
 * y delega la lógica de inscripción al modelo. Gestiona múltiples casos
 * de error devueltos por el modelo (actividad completa, conflictos de
 * horario, ya inscrito, etc.).
 */

// Iniciar sesión solo si no hay una activa
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Cargar el modelo de inscripciones y la conexión a la base de datos
require_once __DIR__ . '/../../models/entities/Registration.php';
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

// Obtener el ID de la actividad y el ID del participante desde la sesión
$id_activity = $input['id_activity'] ?? null;
$participant_id = $_SESSION['user_id'];

// Validar que se haya proporcionado el ID de la actividad
if (!$id_activity) {
    echo json_encode(['success' => false, 'message' => 'Actividad no recibida']);
    exit;
}

try {
    // Instanciar la conexión y el modelo de inscripciones
    $database = new Database();
    $db = $database->getConnection();
    $registrationModel = new Registration($db);

    // Intentar crear la inscripción; el modelo puede devolver un ID o un array con error
    $result = $registrationModel->createRegistration($id_activity, $participant_id);

    if (is_int($result) || is_string($result)) {
        // La inscripción fue creada correctamente; $result contiene el ID generado
        echo json_encode([
            'success' => true,
            'message' => 'Inscripción realizada correctamente'
        ]);

    } elseif (is_array($result) && isset($result['error'])) {
        // El modelo devolvió un error identificado; se mapea a un mensaje legible para el usuario
        $messages = [
            'already_registered' => 'Ya estás inscrito en esta actividad.',
            'activity_not_found' => 'La actividad no existe.',
            'activity_completed' => 'La actividad ya está completa.',
            'activity_full' => 'No quedan plazas disponibles.',
            'conflict_activity' => 'Ya tienes una inscripción ese día: "' . ($result['title'] ?? '') . '".',
            'conflict_request' => 'Ya tienes una solicitud ese día: "' . ($result['title'] ?? '') . '".',
            'exception' => 'Error del servidor.',
        ];

        echo json_encode([
            'success' => false,
            // Si el código de error no está en el mapa, se usa un mensaje genérico
            'message' => $messages[$result['error']] ?? 'No se pudo completar la inscripción.'
        ]);

    } else {
        // El modelo devolvió un resultado inesperado distinto de ID o array de error
        echo json_encode([
            'success' => false,
            'message' => 'No se pudo completar la inscripción.'
        ]);
    }

} catch (PDOException $e) {
    // Error específico de base de datos: registrar internamente sin exponer detalles
    error_log('[PDOException] createRegistrationController: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error de base de datos. Inténtalo más tarde.'
    ]);
} catch (Exception $e) {
    // Error genérico inesperado: registrar internamente sin exponer detalles
    error_log('[Exception] createRegistrationController: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor. Inténtalo más tarde.'
    ]);
}
?>
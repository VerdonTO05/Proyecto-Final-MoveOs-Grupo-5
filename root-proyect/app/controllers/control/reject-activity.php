<?php
/**
 * Controlador para rechazar actividades o peticiones.
 *
 * Solo accesible por administradores. Recibe el ID y el tipo del elemento
 * a rechazar ('activity' o petición) y actualiza su estado a 'rechazada'
 * en la base de datos.
 */

// Establecer el tipo de respuesta como JSON
header('Content-Type: application/json');

// Cargar la conexión a la base de datos y los modelos necesarios
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../models/entities/Activity.php';
require_once __DIR__ . '/../../models/entities/Request.php';
require_once __DIR__ . '/../../models/entities/User.php';
require_once __DIR__ . '/../../services/EmailService.php';

// Iniciar sesión solo si no hay una activa
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Verificar que el usuario autenticado tiene rol de administrador
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'administrador') {
    echo json_encode(['success' => false, 'message' => 'No autorizado']);
    exit;
}

// Rechazar cualquier método HTTP que no sea POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

// Leer y decodificar el cuerpo de la petición JSON
$data = json_decode(file_get_contents('php://input'), true);

// Obtener el ID del elemento y el tipo ('activity' o petición)
$activityId = $data['id'] ?? null;
$type = $data['type'] ?? null;

// Validar que se haya proporcionado un ID
if (!$activityId) {
    echo json_encode(['success' => false, 'message' => 'ID no proporcionado']);
    exit;
}

try {
    // Instanciar la conexión y los modelos
    $database = new Database();
    $db = $database->getConnection();
    $activity = new Activity($db);
    $request = new Request($db);
    $userModel = new User($db);
    $emailService = new EmailService();

    // Actualizar el estado a 'rechazada' según el tipo recibido
    if ($type == 'activity') {
        // Rechazar una actividad
        if ($activity->updateState($activityId, 'rechazada')) {
            try {
                $publication = $activity->getActivityById($activityId);
                $user = $userModel->getUserById($publication['offertant_id']);
                $emailService->sendActivityRejected($publication['title'], $user);
            } catch (Exception $e) {
                error_log("Error enviando email: " . $e->getMessage());
            }
            echo json_encode(['success' => true, 'message' => 'Actividad rechazada']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al rechazar actividad']);
        }
    } else {
        // Rechazar una petición
        if ($request->updateState($activityId, 'rechazada')) {
            try {
                $publication = $request->getRequestById($activityId);
                $user = $userModel->getUserById($publication['participant_id']);
                $emailService->sendRequestRejected($publication['title'], $user);
            } catch (Exception $e) {
                error_log("Error enviando email: " . $e->getMessage());
            }
            echo json_encode(['success' => true, 'message' => 'Petición rechazada']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al rechazar petición']);
        }
    }

} catch (PDOException $e) {
    // Error específico de base de datos: registrar internamente sin exponer detalles
    error_log('[PDOException] rejectController: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error de base de datos. Inténtalo más tarde.'
    ]);
} catch (Exception $e) {
    // Error genérico inesperado: registrar internamente sin exponer detalles
    error_log('[Exception] rejectController: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error inesperado. Inténtalo más tarde.'
    ]);
}
?>
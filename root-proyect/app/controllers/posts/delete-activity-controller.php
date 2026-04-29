<?php
/**
 * Controlador para eliminar una publicación propia (actividad o petición).
 *
 * Verifica que el usuario esté autenticado y que la publicación le pertenezca
 * antes de eliminarla. Según el rol:
 * - Participante: elimina su petición.
 * - Otro rol (organizador): elimina su actividad.
 */

// Iniciar sesión solo si no hay una activa
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Cargar los modelos necesarios y la conexión a la base de datos
require_once __DIR__ . '/../../models/entities/Activity.php';
require_once __DIR__ . '/../../models/entities/Request.php';
require_once __DIR__ . '/../../models/entities/User.php';
require_once __DIR__ . '/../../models/entities/Registration.php';
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../services/EmailService.php';

// Establecer el tipo de respuesta como JSON
header('Content-Type: application/json');

// Verificar que el usuario esté autenticado
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Debes iniciar sesión'
    ]);
    exit;
}

// Leer y decodificar el cuerpo de la petición JSON
$input = json_decode(file_get_contents('php://input'), true) ?? [];
$id = $input['id'] ?? null;

// Validar que se haya proporcionado el ID de la publicación a eliminar
if (!$id) {
    echo json_encode([
        'success' => false,
        'message' => 'Publicación a eliminar no recibida'
    ]);
    exit;
}

try {
    // Instanciar la conexión y los modelos
    $database = new Database();
    $db = $database->getConnection();
    $activityModel = new Activity($db);
    $requestModel = new Request($db);
    $registrationModel = new Registration($db);
    $userModel = new User($db);
    $emailService = new EmailService();

    $role = $_SESSION['role'];

    // Obtener la publicación según el rol del usuario
    if ($role === 'participante') {
        // El participante trabaja con peticiones
        $publication = $requestModel->getRequestById($id);
        $typePublication = 'request';
    } else {
        // El organizador (u otro rol) trabaja con actividades
        $publication = $activityModel->getActivityById($id);
        $typePublication = 'activity';
    }

    // Verificar que la publicación existe en la base de datos
    if (!$publication) {
        echo json_encode([
            'success' => false,
            'message' => 'Publicación no encontrada'
        ]);
        exit;
    }

    // Verificar que la publicación pertenece al usuario autenticado
    if ($typePublication === 'activity' && $publication['offertant_id'] != $_SESSION['user_id']) {
        echo json_encode([
            'success' => false,
            'message' => 'Esta actividad no te pertenece'
        ]);
        exit;
    } elseif ($typePublication === 'request' && $publication['participant_id'] != $_SESSION['user_id']) {
        echo json_encode([
            'success' => false,
            'message' => 'Esta petición no te pertenece'
        ]);
        exit;
    }

    // Eliminar la publicación y preparar el mensaje de confirmación
    if ($typePublication === 'activity') {

        $registrations = $registrationModel->getRegistrationsByActivityId($id);

        // Guardas usuarios antes de borrar
        $usersToNotify = [];
        foreach ($registrations as $r) {
            $user = $userModel->getUserById($r['participant_id']);
            if ($user) {
                $usersToNotify[] = $user;
            }
        }
        $deleted = $activityModel->deleteActivity($id);

        if ($deleted) {
            foreach ($usersToNotify as $user) {
                try {
                    $emailService->sendActivityDeleted($publication['title'], $user);
                } catch (Exception $e) {
                    error_log("Error enviando email: " . $e->getMessage());
                }
            }

            $msg = 'Actividad eliminada correctamente';

        } else {
            echo json_encode([
                'success' => false,
                'message' => 'No se pudo eliminar la actividad'
            ]);
            exit;
        }

    } else {

        $user = $userModel->getUserById($publication['accepted_by']);
        $deleted = $requestModel->deleteRequest($id);

        if ($deleted) {
            if ($user != null) {
                try {
                    $emailService->sendRequestDeleted($publication['title'], $user);
                } catch (Exception $e) {
                    error_log("Error enviando email: " . $e->getMessage());
                }
            }

            $msg = 'Petición eliminada correctamente';

        } else {
            echo json_encode([
                'success' => false,
                'message' => 'No se pudo eliminar la petición'
            ]);
            exit;
        }
    }

    echo json_encode([
        'success' => true,
        'message' => $msg
    ]);

} catch (PDOException $e) {
    // Error específico de base de datos: registrar internamente sin exponer detalles
    error_log('[PDOException] deletePublicationController: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error de base de datos. Inténtalo más tarde.'
    ]);
} catch (Exception $e) {
    // Error genérico inesperado: registrar internamente sin exponer detalles
    error_log('[Exception] deletePublicationController: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor. Inténtalo más tarde.'
    ]);
}
?>
<?php
/**
 * Controlador para cancelar una inscripción o una petición aceptada.
 *
 * Compatible con dos flujos de respuesta:
 * - AJAX (fetch): devuelve JSON.
 * - Formulario tradicional: redirige con mensaje en sesión.
 *
 * Según el rol del usuario:
 * - Participante: elimina su inscripción en la actividad.
 * - Otro rol (organizador): desacepta la petición que había aceptado.
 */

// Iniciar sesión solo si no hay una activa
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Cargar los modelos necesarios y la conexión a la base de datos
require_once __DIR__ . '/../../models/entities/Registration.php';
require_once __DIR__ . '/../../models/entities/Request.php';
require_once __DIR__ . '/../../../config/database.php';

// Detectar si la petición proviene de una llamada AJAX (fetch con XMLHttpRequest)
$isAjax = !empty($_SERVER['HTTP_X_REQUESTED_WITH']) &&
    strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';

// Leer y decodificar el cuerpo JSON si la petición viene por fetch
$input = json_decode(file_get_contents('php://input'), true);

// Verificar que el usuario esté autenticado
if (!isset($_SESSION['user_id'])) {
    if ($isAjax) {
        // Respuesta JSON para llamadas AJAX
        echo json_encode(['success' => false, 'message' => 'No autenticado']);
        exit;
    }

    // Redirección para flujo tradicional
    $_SESSION['error'] = 'Debes iniciar sesión';
    header('Location: index.php?accion=loginView');
    exit;
}

try {
    // Instanciar la conexión y los modelos
    $database = new Database();
    $db = $database->getConnection();
    $registrationModel = new Registration($db);
    $requestModel = new Request($db);

    // Obtener el ID desde el cuerpo JSON o desde POST, y forzar tipo entero
    $id = $input['id'] ?? ($_POST['id'] ?? 0);
    $id = (int) $id;

    // Validar que el ID sea un entero positivo válido
    if ($id <= 0) {
        throw new Exception('ID inválido');
    }

    $success = false;

    // Ejecutar la lógica de cancelación según el rol del usuario
    if ($_SESSION['role'] === 'participante') {
        // El participante cancela su inscripción en la actividad
        $registration = $registrationModel->getRegistrationByActivityAndParticipant($id, $_SESSION['user_id']);

        if ($registration) {
            // Si existe la inscripción, eliminarla
            $success = $registrationModel->deleteRegistration($registration['id']);
        } else {
            // No se encontró inscripción asociada al participante
            $success = false;
        }
    } else {
        // El organizador desacepta una petición que había aceptado previamente
        $success = $requestModel->unacceptRequest($id, $_SESSION['user_id']);
    }

    // Responder según el tipo de petición
    if ($isAjax) {
        // Respuesta JSON para llamadas AJAX
        echo json_encode([
            'success' => $success,
            'message' => $success
                ? 'Cancelada correctamente'
                : 'No tienes permisos o falló la operación'
        ]);
        exit;
    }

    // Flujo tradicional: guardar mensaje en sesión y redirigir
    $_SESSION[$success ? 'success' : 'error'] = $success
        ? 'Operación realizada correctamente'
        : 'No tienes permisos o falló la operación';

    header('Location: index.php?accion=seeRegistrations');
    exit;

} catch (PDOException $e) {
    // Error específico de base de datos: registrar internamente sin exponer detalles
    error_log('[PDOException] cancelRegistrationController: ' . $e->getMessage());

    if ($isAjax) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error de base de datos. Inténtalo más tarde.']);
        exit;
    }

    http_response_code(500);
    echo 'Error de base de datos. Inténtalo más tarde.';

} catch (Exception $e) {
    // Error genérico: para 'ID inválido' u otros fallos inesperados
    error_log('[Exception] cancelRegistrationController: ' . $e->getMessage());

    if ($isAjax) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error del servidor. Inténtalo más tarde.']);
        exit;
    }

    http_response_code(500);
    echo 'Error del servidor. Inténtalo más tarde.';
}
?>
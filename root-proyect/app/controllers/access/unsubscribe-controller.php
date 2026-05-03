<?php
/**
 * @file        delete-account.controller.php
 * @brief       Controlador de eliminación de cuenta de usuario.
 *
 * Gestiona el proceso de baja de un usuario autenticado:
 * recopila los emails de notificación necesarios según el rol,
 * desactiva la cuenta en la base de datos y destruye la sesión activa.
 *
 * @package     App\Controllers\User
 * @author      MOVEos
 * @version     1.0.0
 *
 * @uses        Database        Clase de conexión a la base de datos.
 * @uses        User            Modelo de usuario.
 * @uses        Request         Modelo de solicitudes.
 * @uses        Activity        Modelo de actividades.
 * @uses        Registration    Modelo de inscripciones.
 * @uses        EmailService    Servicio de envío de correos electrónicos.
 *
 * Flujo esperado:
 *  1. Verifica que existe sesión activa (HTTP 401 si no).
 *  2. Según el rol del usuario, recopila los destinatarios de email:
 *     - 'participante': notifica a los organizadores de sus solicitudes aceptadas.
 *     - otros roles:    notifica a participantes inscritos en sus actividades
 *                       y a participantes con solicitudes aprobadas.
 *  3. Desactiva la cuenta con User::deactivateUser().
 *  4. Destruye la sesión activa.
 *  5. Devuelve JSON { success: true } o { success: false, message }.
 *
 * @throws \Exception   Error genérico no controlado (responde HTTP 500).
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Ocultar errores en pantalla pero registrarlos todos en el log del servidor
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Establecer el tipo de respuesta como JSON con codificación UTF-8
header('Content-Type: application/json; charset=utf-8');

// Cargar dependencias: conexión, modelos y servicio de email
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../models/entities/User.php';
require_once __DIR__ . '/../../models/entities/Request.php';
require_once __DIR__ . '/../../models/entities/Activity.php';
require_once __DIR__ . '/../../models/entities/Registration.php';
require_once __DIR__ . '/../../services/EmailService.php';

// Verificar que existe una sesión activa antes de continuar
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'No hay sesión activa'
    ]);
    exit;
}

/**
 * ID del usuario autenticado obtenido de la sesión activa.
 *
 * @var int $userId
 */
$userId = $_SESSION['user_id'];

/**
 * Rol del usuario autenticado; determina qué notificaciones se envían.
 * Valores esperados: 'participante' | 'organizador' | 'administrador'.
 *
 * @var string $role
 */
$role = $_SESSION['role'];

try {
    /**
     * Conexión activa a la base de datos.
     *
     * @var \PDO $db
     */
    $db = (new Database())->getConnection();

    /**
     * Modelo de usuario para consultas y desactivación de cuenta.
     *
     * @var User $userModel
     */
    $userModel = new User($db);

    /**
     * Modelo de solicitudes para obtener las del usuario.
     *
     * @var Request $requestModel
     */
    $requestModel = new Request($db);

    /**
     * Modelo de actividades para obtener las del usuario.
     *
     * @var Activity $activityModel
     */
    $activityModel = new Activity($db);

    /**
     * Modelo de inscripciones para obtener las asociadas a actividades.
     *
     * @var Registration $registrationModel
     */
    $registrationModel = new Registration($db);

    /**
     * Cola de notificaciones por email pendientes de envío.
     *
     * Cada elemento describe un correo a enviar tras la eliminación:
     *
     * @var array<int, array{
     *     type:  string,
     *     title: string,
     *     user:  array<string, mixed>
     * }> $emailsToSend
     */
    $emailsToSend = [];

    if ($role === 'participante') {
        /*
         * Si el usuario es participante: notificar a los organizadores
         * que habían aceptado alguna de sus solicitudes.
         */

        /**
         * Solicitudes realizadas por el participante que se da de baja.
         *
         * @var array<int, array<string, mixed>> $requests
         */
        $requests = $requestModel->getRequestsByParticipantId($userId);

        foreach ($requests as $r) {
            // Solo notificar si la solicitud tiene un organizador asignado
            if (!empty($r['accepted_by'])) {

                /**
                 * Datos del organizador que aceptó la solicitud, o null si no existe.
                 *
                 * @var array<string, mixed>|null $organizer
                 */
                $organizer = $userModel->getUserById($r['accepted_by']);

                if ($organizer) {
                    $emailsToSend[] = [
                        'type'  => 'request_deleted',
                        'title' => $r['title'],
                        'user'  => $organizer
                    ];
                }
            }
        }

    } else {
        /*
         * Si el usuario es organizador u otro rol:
         *  a) Notificar a participantes inscritos en sus actividades.
         *  b) Notificar a participantes con solicitudes aprobadas por él.
         */

        /**
         * Actividades publicadas por el usuario que se da de baja.
         *
         * @var array<int, array<string, mixed>> $activities
         */
        $activities = $activityModel->getActivitiesByOffertantId($userId);

        foreach ($activities as $a) {

            /**
             * Inscripciones registradas en esta actividad concreta.
             *
             * @var array<int, array<string, mixed>> $registrations
             */
            $registrations = $registrationModel->getRegistrationsByActivityId($a['id']);

            foreach ($registrations as $r) {

                /**
                 * Datos del participante inscrito, o null si no existe.
                 *
                 * @var array<string, mixed>|null $participant
                 */
                $participant = $userModel->getUserById($r['participant_id']);

                if ($participant) {
                    $emailsToSend[] = [
                        'type'  => 'activity_deleted',
                        'title' => $a['title'],
                        'user'  => $participant
                    ];
                }
            }
        }

        /**
         * Solicitudes aprobadas por el organizador que se da de baja.
         *
         * @var array<int, array<string, mixed>> $requests
         */
        $requests = $requestModel->getAcceptedRequestsByOrganizerId($userId, 'aprobada');

        foreach ($requests as $r) {

            /**
             * Datos del participante cuya solicitud fue aprobada, o null si no existe.
             *
             * @var array<string, mixed>|null $participant
             */
            $participant = $userModel->getUserById($r['participant_id']);

            if ($participant) {
                $emailsToSend[] = [
                    'type'  => 'request_unaccepted',
                    'title' => $r['title'],
                    'user'  => $participant
                ];
            }
        }
    }

    // Marcar la cuenta como inactiva; si falla, detener el proceso sin destruir la sesión
    if (!$userModel->deactivateUser($userId)) {
        echo json_encode([
            'success' => false,
            'message' => 'No se pudo eliminar la cuenta'
        ]);
        exit;
    }

    // Vaciar el array de sesión y destruir los datos en el servidor
    session_unset();
    session_destroy();

    echo json_encode([
        'success' => true,
        'message' => 'Cuenta eliminada correctamente'
    ]);
    exit;

} catch (Exception $e) {
    /**
     * Captura cualquier excepción no controlada durante el proceso.
     * Se responde con HTTP 500 sin exponer detalles internos del error.
     *
     * @var \Exception $e
     */
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor'
    ]);
    exit;
}
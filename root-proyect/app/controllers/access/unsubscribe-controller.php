<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../models/entities/User.php';
require_once __DIR__ . '/../../models/entities/Request.php';
require_once __DIR__ . '/../../models/entities/Activity.php';
require_once __DIR__ . '/../../models/entities/Registration.php';

// Verificar sesión
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'No hay sesión activa'
    ]);
    exit;
}

$userId = $_SESSION['user_id'];
$role = $_SESSION['role'];

try {
    $db = (new Database())->getConnection();
    $userModel = new User($db);
    $requestModel = new Request($db);


    $userNow = $userModel->getUserById($userId);
    
    if($role === 'participante'){
        $requests = $requestModel->getRequestsByParticipantId($userId);
        foreach($request as $r){
            //email al organizador, el usuario se ha dado de baja por tanto tal peticion ha sido cancelada
        }

        $registrations = $registrationModel->getActivitiesByParticipant($userId);
        //para cada actividad, ¿enviar email al propietario para informar?
    }else{
        // de sus actividades obtener a los participantes incritos y mandar un email a cada uno

        // si tiene alguna peticion aceptada, enviar email al propietario de la actividad
    }

    if ($userModel->deactivateUser($userId)) {

        // Cerrar sesión completamente
        session_unset();
        session_destroy();

        echo json_encode([
            'success' => true,
            'message' => 'Cuenta eliminada correctamente'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'No se pudo eliminar la cuenta'
        ]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor'
    ]);
}

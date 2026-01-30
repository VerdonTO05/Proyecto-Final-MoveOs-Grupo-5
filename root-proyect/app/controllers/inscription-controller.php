<?php
header('Content-Type: application/json');
// Iniciar sesión si no está activa
if (session_status() === PHP_SESSION_NONE) {
  session_start();
}

require_once '../models/Inscription.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($_SESSION['user_id'])) {
  echo json_encode([
    'success' => false,
    'message' => 'Debes iniciar sesión'
  ]);
  exit;
}

if (empty($data['activity_id'])) {
  echo json_encode([
    'success' => false,
    'message' => 'Actividad no válida'
  ]);
  exit;
}

$userId = $_SESSION['user_id'];
$activityId = (int)$data['activity_id'];

// $model = new Inscription();

try {
  $result = $model->createInscription($userId, $activityId);

  if ($result === true) {
    echo json_encode([
      'success' => true,
      'message' => 'Inscripción realizada correctamente'
    ]);
  } else {
    echo json_encode([
      'success' => false,
      'message' => $result // mensaje devuelto por el modelo
    ]);
  }

} catch (Exception $e) {
  echo json_encode([
    'success' => false,
    'message' => 'Error interno del servidor'
  ]);
}

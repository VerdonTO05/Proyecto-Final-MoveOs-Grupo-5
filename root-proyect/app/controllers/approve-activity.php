<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../models/entities/Activity.php';

// Iniciar sesión si no está activa
if (session_status() === PHP_SESSION_NONE) {
  session_start();
}

// Verificar que sea administrador
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'administrador') {
    echo json_encode(['success' => false, 'message' => 'No autorizado']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$activityId = $data['id'] ?? null;

if (!$activityId) {
    echo json_encode(['success' => false, 'message' => 'ID no proporcionado']);
    exit;
}

$database = new Database();
$db = $database->getConnection();
$activity = new Activity($db);

if ($activity->updateState($activityId, 'aprobada')) {
    echo json_encode(['success' => true, 'message' => 'Actividad aprobada']);
} else {
    echo json_encode(['success' => false, 'message' => 'Error al aprobar']);
}
?>
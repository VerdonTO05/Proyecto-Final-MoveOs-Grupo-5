<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../models/entities/Request.php';

if (session_status() === PHP_SESSION_NONE) {
  session_start();
}

$database = new Database();
$db = $database->getConnection();
$request = new Request($db);

if (!isset($_SESSION['role'])) {
    echo json_encode([
        'success' => false,
        'message' => 'No autorizado'
    ]);
    exit;
}

// Obtener actividades aprobadas
if($_SESSION['role'] == 'administrador'){
    $publics = $request->getRequests();
}

echo json_encode([
    'success' => true,
    'data' => $publics
]);
?>
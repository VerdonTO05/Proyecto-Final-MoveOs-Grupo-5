<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../models/entities/User.php';
if (session_status() === PHP_SESSION_NONE) {
  session_start();
}

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

if (!isset($_SESSION['role'])) {
    echo json_encode([
        'success' => false,
        'message' => 'No autorizado'
    ]);
    exit;
}

// Obtener todos los usuarios
if($_SESSION['role'] == 'administrador'){
    $users = $user->getUsers();
}

echo json_encode([
    'success' => true,
    'data' => $users
]);
?>
<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../models/entities/User.php';
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Solo administradores
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'administrador') {
    echo json_encode([
        'success' => false,
        'message' => 'No autorizado'
    ]);
    exit;
}

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

$action = $_GET['action'] ?? 'list';

// --- Cambiar estado de usuario ---
if ($action === 'toggle') {
    $id    = $_GET['id']    ?? null;
    $state = $_GET['state'] ?? null;

    if (!$id || !$state || !in_array($state, ['activa', 'inactiva'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Parámetros inválidos'
        ]);
        exit;
    }

    $result = $user->toggleUserState($id, $state);

    echo json_encode([
        'success' => $result,
        'message' => $result ? 'Estado actualizado correctamente' : 'Error al actualizar el estado'
    ]);
    exit;
}

// --- Listar todos los usuarios ---
$users = $user->getUsers();

echo json_encode([
    'success' => true,
    'data'    => $users
]);
?>
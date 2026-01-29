<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../models/entities/User.php';

// Leer JSON
$input = json_decode(file_get_contents('php://input'), true);

$username = trim($input['username'] ?? '');
$password = trim($input['password'] ?? '');

if ($username === '' || $password === '') {
    echo json_encode([
        'success' => false,
        'message' => 'Campos obligatorios'
    ]);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $userModel = new User($db);
    $user = $userModel->loginByUsername($username, $password);

    if (!$user) {
        echo json_encode([
            'success' => false,
            'message' => 'Credenciales inválidas'
        ]);
        exit;
    }

    // Guardar sesión
    session_regenerate_id(true);
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['role'] = $user['role_name'];

    echo json_encode([
        'success' => true,
        'redirect' => 'index.php?accion=seeActivities'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor'
    ]);
}

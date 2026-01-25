<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

require_once '../config/database.php'; // tu conexión PDO
require_once '../entities/User.php';

// Leer JSON del body
$input = json_decode(file_get_contents("php://input"), true);
$username = $input['username'] ?? '';
$password = $input['password'] ?? '';

if (!$username || !$password) {
    echo json_encode([
        'success' => false,
        'message' => 'Campos vacíos'
    ]);
    exit;
}

try {
    // Conexión
    $database = new Database();
    $db = $database->getConnection();

    // Entidad
    $userEntity = new User($db);

    // Login usando la entidad
    $user = $userEntity->loginByUsername($username, $password);

    if ($user) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role_name'];

        echo json_encode([
            'success' => true,
            'userData' => [
                'username' => $user['username'],
                'role' => $user['role_name']
            ]
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Usuario o contraseña incorrectos'
        ]);
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

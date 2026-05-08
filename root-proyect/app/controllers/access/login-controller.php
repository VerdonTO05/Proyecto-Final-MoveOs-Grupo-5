<?php

/**
 * login-controller.php
 *
 * Recibe username y password por POST (JSON), valida las credenciales
 * y devuelve una respuesta JSON con el resultado y la URL de redirección.
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../models/entities/User.php';

// Leer el cuerpo de la petición JSON
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

    /** @var array|false $user  Datos del usuario si las credenciales son correctas, false si no */
    $user = $userModel->loginByUsername($username, $password);

    if (!$user) {
        echo json_encode([
            'success' => false,
            'message' => 'Credenciales inválidas'
        ]);
        exit;
    }

    // Regenerar ID de sesión para evitar session fixation
    session_regenerate_id(true);

    // Guardar los datos del usuario en sesión
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['role'] = $user['role_name'];
    $_SESSION['email'] = $user['email'];
    $_SESSION['state'] = $user['state'];           // 'activa' | 'inactiva'
    $_SESSION['profile_image'] = $user['profile_image'] ?? null;

    // El administrador va a un panel distinto al del resto de usuarios
    $redirect = $user['role_name'] === 'administrador'
        ? 'index.php?accion=seeBoth'
        : 'index.php?accion=seeActivities';

    echo json_encode([
        'success' => true,
        'redirect' => $redirect
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor'
    ]);
}
<?php
// login.php

ob_start();
session_start();
header('Content-Type: application/json; charset=utf-8');

// Rutas relativas
$appPath  = dirname(__DIR__); // app/
$rootPath = dirname($appPath); // root-proyect/

// Archivos necesarios
$dbFile   = $rootPath . '/config/database.php';
$userFile = $appPath . '/models/entities/User.php';

if (!file_exists($dbFile)) {
    echo json_encode(['success' => false, 'message' => "No se encuentra database.php en: $dbFile"]);
    exit;
}

if (!file_exists($userFile)) {
    echo json_encode(['success' => false, 'message' => "No se encuentra User.php en: $userFile"]);
    exit;
}

require_once $dbFile;
require_once $userFile;

try {
    // Recibir JSON del frontend
    $jsonInput = file_get_contents("php://input");
    $input     = json_decode($jsonInput, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Formato JSON no válido');
    }

    $username = trim($input['username'] ?? '');
    $password = trim($input['password'] ?? '');

    if (empty($username) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Campos vacíos']);
        exit;
    }

    // Conexión a la base de datos
    $database = new Database();
    $db       = $database->getConnection();

    if (!$db) {
        throw new Exception('Error de conexión a BD');
    }

    $userEntity = new User($db);
    $user       = $userEntity->loginByUsername($username, $password);

    ob_clean(); // Limpiar salida accidental

    if ($user) {
        // Guardar solo lo esencial en la sesión
        $_SESSION['user_id']  = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role']     = $user['role_name'];

        // Regenerar ID de sesión para seguridad
        session_regenerate_id(true);

        echo json_encode([
            'success'  => true,
            'userData' => [
                'id'       => $user['id'],
                'username' => $user['username'],
                'role'     => $user['role_name']
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Credenciales inválidas']);
    }

} catch (Exception $e) {
    ob_clean();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

ob_end_flush();

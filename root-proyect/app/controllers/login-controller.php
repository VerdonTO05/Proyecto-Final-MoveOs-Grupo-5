<?php
//Login actualizado
ob_start();
session_start();
header('Content-Type: application/json; charset=utf-8');

// Obtenemos la ruta absoluta de la carpeta 'app'
$appPath = dirname(__DIR__); 
// Obtenemos la ruta absoluta de 'root-proyect'
$rootPath = dirname($appPath);

// Verificamos existencia antes de requerir (esto evitará el Fatal Error feo)
$dbFile = $rootPath . '/config/database.php';
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
    $jsonInput = file_get_contents("php://input");
    $input = json_decode($jsonInput, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Formato JSON no válido');
    }

    $username = $input['username'] ?? '';
    $password = $input['password'] ?? '';

    if (empty($username) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Campos vacíos']);
        exit;
    }

    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        throw new Exception('Error de conexión a BD');
    }

    $userEntity = new User($db);
    $user = $userEntity->loginByUsername($username, $password);

    ob_clean(); // Limpiamos cualquier salida accidental
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
        echo json_encode(['success' => false, 'message' => 'Credenciales inválidas']);
    }

} catch (Exception $e) {
    ob_clean();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
ob_end_flush();
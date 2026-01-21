<?php
// Es fundamental que session_start() esté al principio de todo
session_start();
header('Content-Type: application/json; charset=utf-8');

// Recibir datos JSON
$input = json_decode(file_get_contents("php://input"), true);
$username = $input['username'] ?? '';
$password = $input['password'] ?? '';

if (!$username || !$password) {
    echo json_encode(['success' => false, 'message' => 'Campos vacíos']);
    exit;
}

try {
    $pdo = new PDO('mysql:host=localhost;dbname=moveos;charset=utf8', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Consulta con JOIN para traer el nombre del rol directamente
    $sql = "SELECT u.id, u.username, u.password_hash, r.name as role_name 
            FROM users u 
            INNER JOIN roles r ON u.role_id = r.id 
            WHERE u.username = :username";

    $stmt = $pdo->prepare($sql);
    $stmt->execute(['username' => $username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Verificamos si existe el usuario y si la contraseña coincide con el hash
    if ($user && password_verify($password, $user['password_hash'])) {

        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role_name'];

        // Enviamos los datos de vuelta al JS para que los guarde en sessionStorage
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

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
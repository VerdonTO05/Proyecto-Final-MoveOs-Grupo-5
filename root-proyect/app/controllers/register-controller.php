<?php
// Iniciar sesión si no está activa
if (session_status() === PHP_SESSION_NONE) {
  session_start();
}
header('Content-Type: application/json; charset=utf-8');

$input = file_get_contents('php://input');
$data  = json_decode($input, true);

$fullname = trim($data['fullname'] ?? '');
$username = trim($data['username'] ?? '');
$email    = trim($data['email'] ?? '');
$rol      = $data['rol'] ?? 'participante'; // Valor por defecto
$password = $data['password'] ?? '';

if (empty($fullname) || empty($username) || empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios']);
    exit;
}

try {
    // Conexión PDO
    $bd = new PDO('mysql:host=localhost;dbname=moveos;charset=utf8', 'root', '');
    $bd->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Obtener ID y nombre del rol
    $consultaRol = $bd->prepare('SELECT id, name FROM roles WHERE name = ?');
    $consultaRol->execute([$rol]);
    $rolData = $consultaRol->fetch(PDO::FETCH_ASSOC);

    if (!$rolData) {
        echo json_encode(['success' => false, 'message' => 'El rol asignado no existe']);
        exit;
    }

    $idRol = $rolData['id'];
    $rolName = $rolData['name'];
    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    // Insertar usuario
    $insert = $bd->prepare('INSERT INTO users (full_name, email, username, password_hash, state ,role_id) VALUES (?, ?, ?, ? ,?, ?)');
    $insert->execute([$fullname, $email, $username, $password_hash, 'activa' ,$idRol]);

    if ($insert->rowCount() == 1) {
        $userId = $bd->lastInsertId();

        // Logueo automático
        $_SESSION['user_id']  = $userId;
        $_SESSION['username'] = $username;
        $_SESSION['role']     = $rolName;
        $_SESSION['email'] = $email;

        echo json_encode([
            'success'  => true,
            'message'  => 'Usuario registrado con éxito',
            'userData' => [
                'user_id'  => $userId,
                'username' => $username,
                'role'     => $rolName
            ]
        ]);
    }

} catch (PDOException $e) {
    if ($e->getCode() == 23000) {
        echo json_encode([
            'success' => false,
            'message' => 'El correo electrónico o el nombre de usuario ya están registrados.'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Error de base de datos: ' . $e->getMessage()
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error inesperado: ' . $e->getMessage()
    ]);
}

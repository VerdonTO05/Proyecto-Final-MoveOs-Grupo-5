<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

// 1. Recibir datos JSON
$input = file_get_contents('php://input');
$data = json_decode($input, true);

$fullname = $data['fullname'] ?? '';
$username = $data['username'] ?? '';
$email    = $data['email'] ?? '';
$rol      = $data['rol'] ?? 'participante'; // Valor por defecto
$password = $data['password'] ?? '';

// 2. Validar datos obligatorios
if (empty($fullname) || empty($username) || empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios']);
    exit;
}

try {
    // 3. Conexión (Ajusta credenciales si es necesario)
    $bd = new PDO('mysql:host=localhost;dbname=moveos;charset=utf8', 'root', '');
    $bd->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 4. Obtener ID del rol basado en el nombre (participante, organizador, etc.)
    $consultaIdRol = $bd->prepare('SELECT id FROM roles WHERE name = ?');
    $consultaIdRol->execute([$rol]);
    $datosID = $consultaIdRol->fetch(PDO::FETCH_ASSOC);

    if (!$datosID) {
        echo json_encode(['success' => false, 'message' => 'El rol asignado no existe en el sistema']);
        exit;
    }

    $idRol = $datosID['id'];
    // Encriptar contraseña
    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    // 5. Insertar usuario en la tabla 'users'
    $insert = $bd->prepare('INSERT INTO users (full_name, email, username, password_hash, role_id) VALUES (?, ?, ?, ?, ?)');
    $insert->execute([$fullname, $email, $username, $password_hash, $idRol]);

    if ($insert->rowCount() == 1) {
        $idUsuario = $bd->lastInsertId();
        
        // Iniciar sesión del usuario
        $_SESSION['user_id'] = $idUsuario;
        $_SESSION['username'] = $username;
        $_SESSION['rol'] = $rol;

        echo json_encode([
            'success' => true,
            'message' => 'Usuario registrado con éxito'
        ]);
    }

} catch (PDOException $e) {
    // Manejo específico de errores de duplicados (Error 23000)
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
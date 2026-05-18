<?php

/**
 * @file   register-controller.php
 * @brief  Endpoint de registro de nuevos usuarios.
 *
 * Recibe los datos del nuevo usuario por POST (JSON), valida que el rol
 * exista, inserta el usuario en la BD mediante `User::registerUser()`,
 * abre sesión automáticamente y envía un email de bienvenida con
 * `EmailService::sendWelcome()`.
 *
 * @package Access
 * @author  MOVEos Grupo 5
 * @version 1.0.0
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../models/entities/User.php';

// Leer y parsear el cuerpo de la petición
$input = file_get_contents('php://input');
$data = json_decode($input, true);
$fullname = trim($data['fullname'] ?? '');
$username = trim($data['username'] ?? '');
$email = trim($data['email'] ?? '');
$rol = $data['rol'] ?? '';
$password = $data['password'] ?? '';

if (empty($fullname) || empty($username) || empty($email) || empty($rol) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios']);
    exit;
}

try {
    $database = new Database();
    $bd = $database->getConnection();

    // Verificar que el rol recibido existe en la BD antes de asignarlo
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

    $insert = $bd->prepare(
        'INSERT INTO users (full_name, email, username, password_hash, state, role_id) VALUES (?, ?, ?, ?, ?, ?)'
    );
    $insert->execute([$fullname, $email, $username, $password_hash, 'activa', $idRol]);

    if ($insert->rowCount() == 1) {

        $userId = $bd->lastInsertId();

        session_regenerate_id(true);

        // Abrir sesión directamente tras el registro para no obligar al usuario a hacer login
        $_SESSION['user_id'] = $userId;
        $_SESSION['username'] = $username;
        $_SESSION['role'] = $rolName;
        $_SESSION['email'] = $email;
        $_SESSION['state'] = 'activa';

        // Intentar enviar el email de bienvenida; si falla, el registro sigue adelante
        try {
            require_once __DIR__ . '/../../services/EmailService.php';
            $emailService = new EmailService();
            $emailService->sendWelcome($email, $fullname);
        } catch (Exception $e) {
            error_log('Error enviando email de bienvenida: ' . $e->getMessage());
        }

        echo json_encode([
            'success' => true,
            'message' => 'Usuario registrado con éxito',
            'userData' => [
                'user_id' => $userId,
                'username' => $username,
                'role' => $rolName
            ]
        ]);
    }

} catch (PDOException $e) {
    // Código 23000 = violación de restricción UNIQUE (email o username duplicado)
    if ($e->getCode() == 23000) {
        echo json_encode([
            'success' => false,
            'message' => 'El correo electrónico o nombre de usuario ya están registrados.'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Error de base de datos. Inténtalo más tarde.'
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error inesperado. Inténtalo más tarde.'
    ]);
}
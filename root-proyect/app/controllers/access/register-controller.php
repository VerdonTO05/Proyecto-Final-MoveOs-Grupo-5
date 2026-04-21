<?php
/**
 * Controlador de registro de nuevos usuarios.
 *
 * Recibe los datos del formulario de registro en formato JSON, valida que
 * todos los campos estén presentes, verifica que el rol exista en la base
 * de datos, inserta el nuevo usuario con la contraseña hasheada e inicia
 * sesión automáticamente tras el registro exitoso.
 */

// Iniciar sesión solo si no hay una activa
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Establecer el tipo de respuesta como JSON con codificación UTF-8
header('Content-Type: application/json; charset=utf-8');

// Cargar la conexión a la base de datos y el modelo de usuario
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../models/entities/User.php';

// Leer y decodificar el cuerpo de la petición JSON
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Obtener y limpiar cada campo; usar string vacío si no existe en la petición
$fullname = trim($data['fullname'] ?? '');
$username = trim($data['username'] ?? '');
$email    = trim($data['email']    ?? '');
$rol      = $data['rol']      ?? '';
$password = $data['password'] ?? '';

// Validar que ningún campo obligatorio esté vacío antes de continuar
if (empty($fullname) || empty($username) || empty($email) || empty($rol) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios']);
    exit;
}

try {
    // Instanciar la conexión a la base de datos usando la clase del proyecto
    $database = new Database();
    $bd = $database->getConnection();

    // Verificar que el rol enviado existe en la tabla de roles y obtener su ID
    $consultaRol = $bd->prepare('SELECT id, name FROM roles WHERE name = ?');
    $consultaRol->execute([$rol]);
    $rolData = $consultaRol->fetch(PDO::FETCH_ASSOC);

    // Si el rol no existe en la BD, rechazar el registro
    if (!$rolData) {
        echo json_encode(['success' => false, 'message' => 'El rol asignado no existe']);
        exit;
    }

    $idRol   = $rolData['id'];
    $rolName = $rolData['name'];

    // Hashear la contraseña antes de almacenarla (nunca se guarda en texto plano)
    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    // Insertar el nuevo usuario con estado 'activa' por defecto
    $insert = $bd->prepare('INSERT INTO users (full_name, email, username, password_hash, state, role_id) VALUES (?, ?, ?, ?, ?, ?)');
    $insert->execute([$fullname, $email, $username, $password_hash, 'activa', $idRol]);

    // Confirmar que se insertó exactamente una fila
    if ($insert->rowCount() == 1) {
        $userId = $bd->lastInsertId();

        // Regenerar el ID de sesión para prevenir ataques de fijación de sesión
        session_regenerate_id(true);

        // Iniciar sesión automáticamente tras el registro exitoso
        $_SESSION['user_id']  = $userId;
        $_SESSION['username'] = $username;
        $_SESSION['role']     = $rolName;
        $_SESSION['email']    = $email;
        $_SESSION['state']    = 'activa'; // Estado por defecto al registrar

        // Enviar email de bienvenida (no bloquea el registro si falla)
        try {
            require_once __DIR__ . '/../../services/EmailService.php';
            $emailService = new EmailService();
            $emailService->sendWelcome($email, $fullname);
        } catch (Exception $e) {
            error_log("Error enviando email de bienvenida: " . $e->getMessage());
        }

        echo json_encode([
            'success' => true,
            'message' => 'Usuario registrado con éxito',
            'userData' => [
                'user_id'  => $userId,
                'username' => $username,
                'role'     => $rolName
            ]
        ]);
    }

} catch (PDOException $e) {
    // Código 23000: violación de restricción UNIQUE (email o username duplicado)
    if ($e->getCode() == 23000) {
        echo json_encode([
            'success' => false,
            'message' => 'El correo electrónico o nombre de usuario ya están registrados.'
        ]);
    } else {
        // Cualquier otro error de base de datos
        echo json_encode([
            'success' => false,
            'message' => 'Error de base de datos. Inténtalo más tarde.'
        ]);
    }
} catch (Exception $e) {
    // Error genérico no relacionado con la base de datos
    echo json_encode([
        'success' => false,
        'message' => 'Error inesperado. Inténtalo más tarde.'
    ]);
}
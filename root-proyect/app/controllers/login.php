<?php
// Iniciar sesión debe ser SIEMPRE la primera línea
session_start();
header('Content-Type: application/json; charset=utf-8');

// 1. Recibir datos
$input = file_get_contents('php://input');
$data = json_decode($input, true);

$username = $data['username'] ?? '';
$password = $data['password'] ?? '';

// 2. Validación básica
if(empty($username) || empty($password)){
    echo json_encode(['success' => false, 'message' => 'Faltan datos obligatorios']);
    exit; // <--- IMPORTANTE: Detener ejecución aquí
}

try {
    // 3. Conexión a BD
    $bd = new PDO('mysql:host=localhost;dbname=moveos;charset=utf8', 'root', '');
    // Configurar PDO para que lance excepciones en caso de error SQL
    $bd->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 4. Buscar usuario
    $consulta = $bd->prepare('SELECT * FROM users WHERE username = ? LIMIT 1');
    $consulta->execute([$username]);
    

    
    // Usamos FETCH_ASSOC para obtener un array asociativo limpio
    $datos = $consulta->fetch(PDO::FETCH_ASSOC);

    $idQuery = $bd->prepare('SELECT name FROM roles WHERE id = ?');
    $idQuery->execute([$datos['role_id']]);

    $datosID = $idQuery->fetch();

    $nombreRol = $datosID['name'];

    // 5. Verificación (Primero miramos si existe $datos, luego la contraseña)
    // Asegúrate que en tu BD la columna se llame 'password_hash'. Si se llama 'password', cámbialo aquí.
    if ($datos && password_verify($password, $datos['password_hash'])) {
        
        // --- ÉXITO ---
        $_SESSION['user_id'] = $datos['id']; // Recomendado guardar el ID también
        $_SESSION['username'] = $username;
        $_SESSION['rol'] = $nombreRol;

        // IMPORTANTE: Devolver JSON de éxito para que JS lo sepa
        echo json_encode([
            'success' => true, 
            'message' => 'Login correcto'
        ]);

    } else {
        // --- ERROR DE CREDENCIALES ---
        // Devolvemos JSON, nunca texto plano
        echo json_encode([
            'success' => false, 
            'message' => 'Usuario o contraseña incorrectos'
        ]);
    }

} catch(Exception $e) {
    // --- ERROR DE SISTEMA ---
    // No uses die() con texto, usa json_encode
    // En producción, no muestres $e->getMessage() al usuario por seguridad
    echo json_encode([
        'success' => false, 
        'message' => 'Error del servidor: ' . $e->getMessage()
    ]);
}
?>
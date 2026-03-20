<?php
/**
 * Controlador para obtener el listado de peticiones.
 *
 * Solo accesible por administradores. Recupera todas las peticiones
 * registradas en el sistema y las devuelve en formato JSON.
 */

// Establecer el tipo de respuesta como JSON
header('Content-Type: application/json');

// Cargar la conexión a la base de datos y el modelo de peticiones
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../models/entities/Request.php';

// Iniciar sesión solo si no hay una activa
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Verificar que el usuario autenticado tiene rol de administrador
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'administrador') {
    echo json_encode([
        'success' => false,
        'message' => 'No autorizado'
    ]);
    exit;
}

try {
    // Instanciar la conexión y el modelo de peticiones
    $database = new Database();
    $db       = $database->getConnection();
    $request  = new Request($db);

    // Obtener todas las peticiones del sistema
    $requests = $request->getRequests();

    echo json_encode([
        'success' => true,
        'data'    => $requests
    ]);

} catch (PDOException $e) {
    // Error específico de base de datos: registrar internamente sin exponer detalles
    error_log('[PDOException] getRequestsController: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error de base de datos. Inténtalo más tarde.'
    ]);
} catch (Exception $e) {
    // Error genérico inesperado: registrar internamente sin exponer detalles
    error_log('[Exception] getRequestsController: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error inesperado. Inténtalo más tarde.'
    ]);
}
?>
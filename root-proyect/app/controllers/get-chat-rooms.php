<?php
/**
 * Controlador: get-chat-rooms.php
 *
 * Endpoint exclusivo para el administrador.
 * Devuelve la lista de usuarios que tienen conversaciones abiertas en el chat admin,
 * ordenadas por el mensaje más reciente.
 *
 * Método: GET
 * Sin parámetros adicionales.
 *
 * Respuestas JSON:
 *   { success: true,  conversations: [...] }
 *   { success: false, message: "descripción del error" }
 */

header('Content-Type: application/json');

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../models/entities/ChatMessage.php';

// --- Solo el administrador puede acceder ---
if (!isAuthenticated() || !isAdmin()) {
    echo json_encode(['success' => false, 'message' => 'No autorizado']);
    exit;
}

// --- Conexión a la base de datos ---
$db          = (new Database())->getConnection();
$chatMessage = new ChatMessage($db);

// --- Obtener conversaciones activas ---
try {
    $conversations = $chatMessage->getAdminConversations();

    echo json_encode([
        'success'       => true,
        'conversations' => $conversations,
    ]);

} catch (Exception $e) {
    error_log('Error en get-chat-rooms.php: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Error al obtener las conversaciones']);
}
?>

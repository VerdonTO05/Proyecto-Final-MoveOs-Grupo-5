<?php
/**
 * @file   get-chat-rooms.php
 * @brief  Endpoint exclusivo para el administrador: lista de conversaciones de soporte.
 *
 * Devuelve los usuarios que tienen conversaciones abiertas en el chat admin,
 * ordenados por el mensaje más reciente. Solo accesible con rol `administrador`.
 *
 * @package Chat
 * @author  MOVEos Grupo 5
 * @version 1.0.0
 */

header('Content-Type: application/json');

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../models/entities/ChatMessage.php';

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
    echo json_encode([
    'success' => false,
    'message' => $e->getMessage()
]);
}
?>

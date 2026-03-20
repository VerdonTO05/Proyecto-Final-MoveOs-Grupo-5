<?php
/**
 * Controlador: get-messages.php
 *
 * Endpoint de polling para obtener mensajes nuevos de una sala de chat.
 * El cliente lo llama periódicamente (cada 3 s) enviando el ID del último
 * mensaje recibido para obtener únicamente los mensajes más recientes.
 *
 * Método: GET
 * Parámetros GET:
 *   - room_type  (string) 'activity' | 'admin'
 *   - room_id    (int)    ID de la actividad o del participante
 *   - after_id   (int)    ID del último mensaje conocido (0 = todos)
 *
 * Respuestas JSON:
 *   { success: true,  messages: [...], last_id: N }
 *   { success: false, message: "descripción del error" }
 */

header('Content-Type: application/json');

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../models/entities/ChatMessage.php';

// --- Autenticación ---
if (!isAuthenticated()) {
    echo json_encode(['success' => false, 'message' => 'No autorizado']);
    exit;
}

// --- Leer y validar parámetros GET ---
$roomType = $_GET['room_type'] ?? '';
$roomId = (int) ($_GET['room_id'] ?? 0);
$afterId = (int) ($_GET['after_id'] ?? 0);

$validRoomTypes = [ChatMessage::ROOM_ACTIVITY, ChatMessage::ROOM_ADMIN];

if (!in_array($roomType, $validRoomTypes) || $roomId <= 0) {
    echo json_encode(['success' => false, 'message' => 'Parámetros inválidos']);
    exit;
}

// --- Conexión a la base de datos ---
$db = (new Database())->getConnection();
$chatMessage = new ChatMessage($db);

// --- Datos del usuario actual (consistente con getCurrentUser()) ---
$currentUser = getCurrentUser();
$userId = (int) $currentUser['id'];
$role = $currentUser['role'];

if (!$chatMessage->canAccessRoom($userId, $role, $roomType, $roomId)) {
    echo json_encode(['success' => false, 'message' => 'No tienes acceso a esta sala']);
    exit;
}

// --- Obtener mensajes nuevos ---
try {
    $messages = $chatMessage->getMessages($roomType, $roomId, $afterId);
    $lastId = !empty($messages) ? (int) end($messages)['id'] : $afterId;

    echo json_encode([
        'success' => true,
        'messages' => $messages,
        'last_id' => $lastId,
    ]);

} catch (Exception $e) {
    error_log('Error en get-messages.php: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Error al obtener los mensajes']);
}
?>
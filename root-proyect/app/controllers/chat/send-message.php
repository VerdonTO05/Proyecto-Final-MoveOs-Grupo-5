<?php
/**
 * Controlador: send-message.php
 *
 * Endpoint para enviar (guardar) un nuevo mensaje en una sala de chat.
 *
 * Método: POST
 * Body JSON:
 *   - room_type  (string) 'activity' | 'admin'
 *   - room_id    (int)    ID de la actividad o del participante
 *   - message    (string) Texto del mensaje (max. 1000 caracteres)
 *
 * Respuestas JSON:
 *   { success: true,  message: { id, sender_id, sender_name, message, created_at } }
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

// --- Leer body JSON ---
// Evitar sobreescribir $input si ya fue parseado en index.php
if (!isset($input) || empty($input)) {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
}

$roomType      = $input['room_type'] ?? '';
$roomId        = (int) ($input['room_id'] ?? 0);
$rawMessage    = $input['message']   ?? '';

// --- Validar parámetros ---
$validRoomTypes = [ChatMessage::ROOM_ACTIVITY, ChatMessage::ROOM_ADMIN];

if (!in_array($roomType, $validRoomTypes) || $roomId <= 0) {
    echo json_encode(['success' => false, 'message' => 'Parámetros inválidos']);
    exit;
}

// Sanear y limitar longitud del mensaje
$cleanMessage = trim(htmlspecialchars($rawMessage, ENT_QUOTES, 'UTF-8'));

if ($cleanMessage === '' || mb_strlen($cleanMessage) > 1000) {
    echo json_encode(['success' => false, 'message' => 'El mensaje no puede estar vacío ni superar los 1000 caracteres']);
    exit;
}

// --- Conexión a la base de datos ---
$db          = (new Database())->getConnection();
$chatMessage = new ChatMessage($db);

// --- Verificar permisos de acceso a la sala ---
$userId   = (int) $_SESSION['user_id'];
$role     = $_SESSION['role'];
$username = $_SESSION['username'] ?? 'Usuario';

if (!$chatMessage->canAccessRoom($userId, $role, $roomType, $roomId)) {
    echo json_encode(['success' => false, 'message' => 'No tienes acceso a esta sala']);
    exit;
}

// --- Guardar el mensaje ---
try {
    $newId = $chatMessage->saveMessage($roomType, $roomId, $userId, $cleanMessage);

    if (!$newId) {
        throw new Exception('No se pudo insertar el mensaje en la base de datos.');
    }

    echo json_encode([
        'success' => true,
        'message' => [
            'id'          => $newId,
            'sender_id'   => $userId,
            'sender_name' => $username,
            'message'     => $cleanMessage,
            'created_at'  => date('Y-m-d H:i:s'),
        ],
    ]);

} catch (Exception $e) {
    error_log('Error en send-message.php: ' . $e->getMessage());
    // ENVIAR EL MENSAJE REAL DEL ERROR PARA DEPURACIÓN EN DESARROLLO
    echo json_encode(['success' => false, 'message' => 'Error BD: ' . $e->getMessage()]);
}
?>

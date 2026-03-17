<?php
/**
 * Controlador: get-chat-hub.php
 *
 * Endpoint para obtener la lista de conversaciones activas del usuario actual.
 * Devuelve:
 *  - Actividades en las que está inscrito o de las que es organizador.
 *  - Conversación privada con soporte (siempre disponible para participantes y organizadores).
 *
 * Método: GET
 *
 * Respuestas JSON:
 *   {
 *      success: true,
 *      support_room: { room_type: 'admin', room_id: N, last_message: '...', updated_at: '...' },
 *      activities: [
 *         { room_type: 'activity', room_id: X, title: '...', image_url: '...', last_message: '...', updated_at: '...' },
 *         ...
 *      ]
 *   }
 */

header('Content-Type: application/json');

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

// --- Autenticación ---
if (!isAuthenticated()) {
    echo json_encode(['success' => false, 'message' => 'No autorizado']);
    exit;
}

$currentUser = getCurrentUser();
$userId = (int) $currentUser['id'];
$role = $currentUser['role'];

// El administrador usa un panel distinto (adminChat), este Hub es principal para participantes y organizadores
if ($role === 'administrador') {
    echo json_encode([
        'success' => true,
        'support_room' => null,
        'activities' => [],
        'is_admin' => true
    ]);
    exit;
}

try {
    $db = (new Database())->getConnection();

    // 1. Obtener último mensaje de soporte
    $stmtSupport = $db->prepare("
        SELECT message as last_message, created_at as updated_at
        FROM chat_messages
        WHERE room_type = 'admin' AND room_id = :uid
        ORDER BY id DESC LIMIT 1
    ");
    $stmtSupport->execute(['uid' => $userId]);
    $supportLast = $stmtSupport->fetch(PDO::FETCH_ASSOC);

    $supportRoom = [
        'room_type'    => 'admin',
        'room_id'      => $userId,
        'last_message' => $supportLast ? $supportLast['last_message'] : 'Comunícate con nuestro equipo.',
        'updated_at'   => $supportLast ? $supportLast['updated_at'] : null
    ];

    // 2. Obtener actividades donde participa u organiza, con el último mensaje
    $sqlActivities = "
        SELECT 
            a.id AS room_id,
            a.title,
            a.image_url,
            latest.message AS last_message,
            latest.created_at AS updated_at
        FROM activities a
        LEFT JOIN registrations r ON r.activity_id = a.id AND r.participant_id = :uid1
        LEFT JOIN (
            SELECT room_id, message, created_at
            FROM chat_messages m1
            WHERE room_type = 'activity' AND id = (
                SELECT MAX(id) FROM chat_messages m2 
                WHERE m2.room_type = 'activity' AND m2.room_id = m1.room_id
            )
        ) latest ON latest.room_id = a.id
        WHERE a.offertant_id = :uid2 OR r.participant_id IS NOT NULL
        ORDER BY COALESCE(latest.created_at, a.created_at) DESC
    ";

    $stmtAct = $db->prepare($sqlActivities);
    $stmtAct->execute(['uid1' => $userId, 'uid2' => $userId]);
    
    $activities = $stmtAct->fetchAll(PDO::FETCH_ASSOC);

    // Formatear correctamente el array
    foreach ($activities as &$act) {
        $act['room_type'] = 'activity';
        if (!$act['last_message']) {
            $act['last_message'] = 'No hay mensajes aún.';
        }
    }

    echo json_encode([
        'success'      => true,
        'is_admin'     => false,
        'support_room' => $supportRoom,
        'activities'   => $activities
    ]);

} catch (Exception $e) {
    error_log('Error en get-chat-hub.php: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Error al cargar las conversaciones']);
}
?>

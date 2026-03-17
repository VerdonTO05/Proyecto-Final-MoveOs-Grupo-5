<?php
/**
 * Clase ChatMessage
 *
 * Gestiona los mensajes de chat del sistema.
 * Soporta dos tipos de sala:
 *  - 'activity': sala grupal asociada a una actividad (room_id = activity_id)
 *  - 'admin':    conversación privada entre el admin y un usuario (room_id = user_id del participante)
 */
class ChatMessage
{
    /** @var PDO Conexión a la base de datos */
    private $conn;

    /** @var string Nombre de la tabla en la base de datos */
    private $table_name = 'chat_messages';

    /** Tipos de sala permitidos */
    const ROOM_ACTIVITY = 'activity';
    const ROOM_ADMIN    = 'admin';

    /**
     * Constructor
     * @param PDO $db Conexión activa a la base de datos
     */
    public function __construct($db)
    {
        $this->conn = $db;
    }

    /* =========================
       CONSULTAS
       ========================= */

    /**
     * Obtener mensajes de una sala a partir de un ID determinado (para polling incremental).
     * Devuelve únicamente los mensajes con id > $afterId para evitar reenviar mensajes ya cargados.
     *
     * @param string   $roomType Tipo de sala ('activity' | 'admin')
     * @param int      $roomId   ID de la actividad o del participante (según roomType)
     * @param int      $afterId  ID del último mensaje ya conocido por el cliente (0 = todos)
     * @return array   Lista de mensajes con datos del remitente
     */
    public function getMessages(string $roomType, int $roomId, int $afterId): array
    {
        $sql = "SELECT
                    m.id,
                    m.sender_id,
                    u.username    AS sender_name,
                    m.message,
                    m.created_at
                FROM {$this->table_name} m
                JOIN users u ON m.sender_id = u.id
                WHERE m.room_type = :room_type
                  AND m.room_id   = :room_id
                  AND m.id        > :after_id
                ORDER BY m.id ASC
                LIMIT 50";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            'room_type' => $roomType,
            'room_id'   => $roomId,
            'after_id'  => $afterId,
        ]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Guardar un nuevo mensaje en la base de datos.
     *
     * @param string $roomType  Tipo de sala ('activity' | 'admin')
     * @param int    $roomId    ID de la actividad o del participante
     * @param int    $senderId  ID del usuario que envía el mensaje
     * @param string $message   Texto del mensaje (ya saneado en el controlador)
     * @return int|false        ID del mensaje insertado, o false si falla
     */
    public function saveMessage(string $roomType, int $roomId, int $senderId, string $message)
    {
        $sql = "INSERT INTO {$this->table_name} (room_type, room_id, sender_id, message)
                VALUES (:room_type, :room_id, :sender_id, :message)";

        $stmt = $this->conn->prepare($sql);

        $ok = $stmt->execute([
            'room_type' => $roomType,
            'room_id'   => $roomId,
            'sender_id' => $senderId,
            'message'   => $message,
        ]);

        return $ok ? (int) $this->conn->lastInsertId() : false;
    }

    /**
     * Obtener la lista de usuarios que tienen conversación abierta con el admin.
     * Se usa en el panel admin para mostrar la bandeja de entrada del chat.
     *
     * @return array Lista de usuarios con su último mensaje y fecha
     */
    public function getAdminConversations(): array
    {
        // Devuelve TODOS los usuarios (excepto administradores) con su último mensaje si existe.
        // Así el admin puede iniciar conversación con cualquier usuario.
        $sql = "SELECT
                    u.id          AS user_id,
                    u.username    AS user_name,
                    u.full_name,
                    r.name        AS role,
                    latest.message      AS last_message,
                    latest.created_at   AS last_message_at
                FROM users u
                JOIN roles r ON u.role_id = r.id
                LEFT JOIN (
                    SELECT
                        room_id,
                        message,
                        created_at
                    FROM {$this->table_name}
                    WHERE room_type = 'admin'
                      AND id IN (
                          SELECT MAX(id)
                          FROM {$this->table_name}
                          WHERE room_type = 'admin'
                          GROUP BY room_id
                      )
                ) AS latest ON latest.room_id = u.id
                WHERE r.name != 'administrador'
                ORDER BY latest.created_at DESC, u.full_name ASC";

        $stmt = $this->conn->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /* =========================
       AUTORIZACIÓN
       ========================= */

    /**
     * Verificar si un usuario tiene permiso para acceder a una sala de chat.
     *
     * Reglas de acceso:
     *  - Administrador: accede a todas las salas.
     *  - Sala 'activity': el usuario debe estar inscrito en la actividad
     *                     O ser el organizador de la misma.
     *  - Sala 'admin': solo el propio usuario (room_id = su user_id) o el administrador.
     *
     * @param int    $userId   ID del usuario que solicita acceso
     * @param string $role     Rol del usuario ('administrador', 'organizador', 'participante')
     * @param string $roomType Tipo de sala ('activity' | 'admin')
     * @param int    $roomId   ID de la actividad o del participante
     * @return bool  True si tiene acceso, false en caso contrario
     */
    public function canAccessRoom(int $userId, string $role, string $roomType, int $roomId): bool
    {
        // El administrador accede a cualquier sala
        if ($role === 'administrador') {
            return true;
        }

        if ($roomType === self::ROOM_ACTIVITY) {
            return $this->isEnrolledOrOrganizer($userId, $roomId);
        }

        if ($roomType === self::ROOM_ADMIN) {
            // Solo el propio usuario puede acceder a su sala admin
            // Usamos == en lugar de === porque $userId puede venir como string desde la sesión
            return (int) $userId === (int) $roomId;
        }

        return false;
    }

    /**
     * Verificar si el usuario está inscrito en la actividad o es su organizador.
     *
     * @param int $userId     ID del usuario
     * @param int $activityId ID de la actividad
     * @return bool
     */
    private function isEnrolledOrOrganizer(int $userId, int $activityId): bool
    {
        $sql = "SELECT 1
                FROM activities a
                LEFT JOIN registrations r ON r.activity_id = a.id AND r.participant_id = :uid1
                WHERE a.id = :activity_id
                  AND (a.offertant_id = :uid2 OR r.participant_id IS NOT NULL)
                LIMIT 1";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            'uid1'        => $userId,
            'uid2'        => $userId,
            'activity_id' => $activityId,
        ]);

        return (bool) $stmt->fetch();
    }
}
?>

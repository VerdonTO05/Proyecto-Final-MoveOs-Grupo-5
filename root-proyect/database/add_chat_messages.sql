-- --------------------------------------------------------
-- Chat Migration
-- Ejecutar en phpMyAdmin sobre la base de datos 'moveos'
-- --------------------------------------------------------

USE moveos;

-- Tabla de mensajes de chat
-- room_type: 'activity' para salas grupales de actividades
--            'admin'    para conversaciones privadas admin <-> usuario
-- room_id:   activity_id cuando room_type = 'activity'
--            user_id del participante cuando room_type = 'admin'

CREATE TABLE IF NOT EXISTS chat_messages (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    room_type  ENUM('activity', 'admin') NOT NULL,
    room_id    INT           DEFAULT NULL,
    sender_id  INT           NOT NULL,
    message    TEXT          NOT NULL,
    created_at DATETIME      DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chat_messages_ibfk_1
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices para acelerar las consultas de polling
CREATE INDEX idx_chat_room    ON chat_messages (room_type, room_id);
CREATE INDEX idx_chat_created ON chat_messages (created_at);

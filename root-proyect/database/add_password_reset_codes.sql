-- Agregar tabla para códigos de verificación de recuperación de contraseña
CREATE TABLE IF NOT EXISTS password_reset_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    used TINYINT(1) DEFAULT 0,
    CONSTRAINT password_reset_codes_ibfk_1
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índice para mejorar rendimiento en búsquedas
CREATE INDEX idx_user_code ON password_reset_codes(user_id, code);
CREATE INDEX idx_expires_at ON password_reset_codes(expires_at);

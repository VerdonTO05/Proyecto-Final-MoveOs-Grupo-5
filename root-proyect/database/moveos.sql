-- phpMyAdmin SQL Dump
-- Server version: 10.4.32-MariaDB

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";
SET NAMES utf8mb4;

-- --------------------------------------------------------
-- Database
-- --------------------------------------------------------

DROP DATABASE IF EXISTS moveos;
CREATE DATABASE moveos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE moveos;

-- --------------------------------------------------------
-- Table: roles
-- --------------------------------------------------------

CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO roles (id, name) VALUES
(1, 'participante'),
(2, 'organizador'),
(3, 'administrador');

-- --------------------------------------------------------
-- Table: users
-- --------------------------------------------------------

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  state VARCHAR(255) NOT NULL DEFAULT 'activa',
  role_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT users_ibfk_1
    FOREIGN KEY (role_id)
    REFERENCES roles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: password_reset_codes
-- --------------------------------------------------------

CREATE TABLE password_reset_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at DATETIME NOT NULL,
  used TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT password_reset_codes_ibfk_1
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_reset_user ON password_reset_codes(user_id);
CREATE INDEX idx_reset_code ON password_reset_codes(code);

-- --------------------------------------------------------
-- Table: categories
-- --------------------------------------------------------

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO categories (code, name) VALUES
('workshop', 'Taller'),
('class', 'Clase'),
('event', 'Evento'),
('excursion', 'Excursión'),
('training', 'Formación técnica'),
('conference', 'Conferencia'),
('meeting', 'Reunión'),
('experience', 'Experiencia'),
('tour', 'Tour'),
('competition', 'Competición'),
('social', 'Evento social');

-- --------------------------------------------------------
-- Table: audit_logs
-- --------------------------------------------------------

CREATE TABLE audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  table_name VARCHAR(50) NOT NULL,
  action_type VARCHAR(20) NOT NULL,
  record_id INT NOT NULL,
  old_values LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(old_values)),
  new_values LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(new_values)),
  changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  db_user VARCHAR(100) DEFAULT CURRENT_USER()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: activities
-- offertant_id permite NULL y usa ON DELETE SET NULL
-- --------------------------------------------------------

CREATE TABLE activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  offertant_id INT NULL,
  category_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  date DATE,
  time TIME,
  price DECIMAL(10,2),
  max_people INT,
  current_registrations INT DEFAULT 0,
  organizer_email VARCHAR(255),
  location VARCHAR(255),
  transport_included TINYINT(1) DEFAULT 0,
  departure_city VARCHAR(150),
  language VARCHAR(50),
  min_age INT,
  pets_allowed TINYINT(1) DEFAULT 0,
  dress_code VARCHAR(100),
  image_url VARCHAR(255),
  is_completed TINYINT(1) DEFAULT 0,
  is_finished TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  state VARCHAR(32) NOT NULL DEFAULT 'pendiente',
  CONSTRAINT activities_ibfk_1
    FOREIGN KEY (offertant_id)
    REFERENCES users(id)
    ON DELETE SET NULL,
  CONSTRAINT activities_ibfk_2
    FOREIGN KEY (category_id)
    REFERENCES categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: registrations
-- --------------------------------------------------------

CREATE TABLE registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  activity_id INT NOT NULL,
  participant_id INT NOT NULL,
  registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY activity_participant (activity_id, participant_id),
  CONSTRAINT registrations_ibfk_1
    FOREIGN KEY (activity_id)
    REFERENCES activities(id)
    ON DELETE CASCADE,
  CONSTRAINT registrations_ibfk_2
    FOREIGN KEY (participant_id)
    REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: requests
-- accepted_by usa ON DELETE SET NULL
-- --------------------------------------------------------

CREATE TABLE requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  participant_id INT NOT NULL,
  category_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  date DATE,
  time TIME,
  location VARCHAR(255),
  current_registrations INT DEFAULT 0,
  organizer_email VARCHAR(255),
  transport_included TINYINT(1) DEFAULT 0,
  departure_city VARCHAR(150),
  language VARCHAR(50),
  min_age INT,
  pets_allowed TINYINT(1) DEFAULT 0,
  dress_code VARCHAR(100),
  image_url VARCHAR(255),
  is_accepted TINYINT(1) DEFAULT 0,
  accepted_by INT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  state VARCHAR(32) NOT NULL DEFAULT 'pendiente',
  CONSTRAINT requests_ibfk_1
    FOREIGN KEY (participant_id)
    REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT requests_ibfk_2
    FOREIGN KEY (accepted_by)
    REFERENCES users(id)
    ON DELETE SET NULL,
  CONSTRAINT requests_ibfk_3
    FOREIGN KEY (category_id)
    REFERENCES categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: chat_messages
-- room_type: 'activity' → sala grupal (room_id = activity_id)
--            'admin'    → conversación privada (room_id = user_id del participante)
-- sender_id usa ON DELETE CASCADE: si el usuario se borra, sus mensajes también
-- --------------------------------------------------------

CREATE TABLE chat_messages (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  room_type ENUM('activity', 'admin') NOT NULL,
  room_id   INT      DEFAULT NULL,
  sender_id INT      NOT NULL,
  message   TEXT     NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chat_messages_ibfk_1
    FOREIGN KEY (sender_id)
    REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_chat_room    ON chat_messages (room_type, room_id);
CREATE INDEX idx_chat_created ON chat_messages (created_at);

-- --------------------------------------------------------
-- Insert users de ejemplo
-- --------------------------------------------------------

INSERT INTO `users` (`id`, `full_name`, `email`, `username`, `password_hash`, `state`, `role_id`, `created_at`) VALUES
(1, 'Irene Osuna',          'irene@gmail.com',     'ireneosuna',    '$2y$10$b5ViZkLR4zFSXlVaawLEMOXAh7HyCMdMN39ANbItbDJlLqoC1CNve', 'activa', 2, '2026-01-26 17:29:15'),
(2, 'Manuel Verdon',        'manuel@gmail.com',    'manuelverdon',  '$2y$10$MNF.N94OmKc9D0YQ4rK2XewgRBVjNXGoaRSym8R53XdLtk9lZM6ki', 'activa', 2, '2026-01-26 17:29:51'),
(3, 'Alejandro Montesinos', 'alejandro@gmail.com', 'alejandrom',    '$2y$10$TfJ05ZNAR6VcI5OF/ZdmsOJ3KH4xua03MtJvn9fFiY6nYQOkwCfeu', 'activa', 1, '2026-01-26 17:30:28'),
(4, 'Admin 1',              'admin@gmail.com',     'admin',         '$2y$10$khd15J.3JvRGtkKn4A3z7O1u4SmzyJVT37ZEWGzLFnjRR45ZkUeau', 'activa', 3, '2026-01-26 17:32:00');

-- --------------------------------------------------------
-- TRIGGERS
-- --------------------------------------------------------

DELIMITER $$

CREATE TRIGGER registrations_after_insert
AFTER INSERT ON registrations
FOR EACH ROW
BEGIN
  UPDATE activities
  SET current_registrations = current_registrations + 1
  WHERE id = NEW.activity_id;
END$$

CREATE TRIGGER registrations_after_delete
AFTER DELETE ON registrations
FOR EACH ROW
BEGIN
  UPDATE activities
  SET current_registrations = current_registrations - 1
  WHERE id = OLD.activity_id;
END$$

CREATE TRIGGER audit_activities_insert
AFTER INSERT ON activities
FOR EACH ROW
BEGIN
  INSERT INTO audit_logs (table_name, action_type, record_id, new_values)
  VALUES ('activities', 'INSERT', NEW.id,
    JSON_OBJECT('title', NEW.title, 'offertant_id', NEW.offertant_id));
END$$

CREATE TRIGGER audit_activities_update
AFTER UPDATE ON activities
FOR EACH ROW
BEGIN
  INSERT INTO audit_logs (table_name, action_type, record_id, old_values, new_values)
  VALUES ('activities', 'UPDATE', NEW.id,
    JSON_OBJECT('title', OLD.title),
    JSON_OBJECT('title', NEW.title));
END$$

CREATE TRIGGER audit_activities_delete
BEFORE DELETE ON activities
FOR EACH ROW
BEGIN
  INSERT INTO audit_logs (table_name, action_type, record_id, old_values)
  VALUES ('activities', 'DELETE', OLD.id,
    JSON_OBJECT('title', OLD.title));
END$$

CREATE TRIGGER audit_requests_insert
AFTER INSERT ON requests
FOR EACH ROW
BEGIN
  INSERT INTO audit_logs (table_name, action_type, record_id, new_values)
  VALUES ('requests', 'INSERT', NEW.id,
    JSON_OBJECT('title', NEW.title));
END$$

CREATE TRIGGER audit_requests_update
AFTER UPDATE ON requests
FOR EACH ROW
BEGIN
  INSERT INTO audit_logs (table_name, action_type, record_id, old_values, new_values)
  VALUES ('requests', 'UPDATE', NEW.id,
    JSON_OBJECT('is_accepted', OLD.is_accepted),
    JSON_OBJECT('is_accepted', NEW.is_accepted));
END$$

CREATE TRIGGER audit_requests_delete
BEFORE DELETE ON requests
FOR EACH ROW
BEGIN
  INSERT INTO audit_logs (table_name, action_type, record_id, old_values)
  VALUES ('requests', 'DELETE', OLD.id,
    JSON_OBJECT('title', OLD.title));
END$$

DELIMITER ;

-- --------------------------------------------------------
-- PROCEDIMIENTO: deactivate_user
-- --------------------------------------------------------

DELIMITER $$

CREATE PROCEDURE deactivate_user(IN p_user_id INT)
BEGIN
  UPDATE activities
  SET is_finished = 1,
      state       = 'finalizada'
  WHERE offertant_id = p_user_id
    AND is_finished  = 0;

  UPDATE requests
  SET state = 'finalizada'
  WHERE participant_id = p_user_id
    AND state         != 'finalizada';

  DELETE FROM users WHERE id = p_user_id;
END$$

DELIMITER ;

COMMIT;

-- --------------------------------------------------------
-- EVENT PARA FINALIZAR ACTIVIDADES Y REQUESTS
-- --------------------------------------------------------

SET GLOBAL event_scheduler = ON;

DELIMITER $$

CREATE EVENT finalizar_actividades_requests
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_DATE + INTERVAL 1 DAY
DO
BEGIN
  UPDATE activities
  SET is_finished = 1, state = 'finalizada'
  WHERE date < CURDATE() AND is_finished = 0;

  UPDATE requests
  SET state = 'finalizada'
  WHERE date < CURDATE() AND state != 'finalizada';
END$$

DELIMITER ;
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
  role_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT users_ibfk_1 FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: categories (NORMALIZED)
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
-- --------------------------------------------------------

CREATE TABLE activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  offertant_id INT NOT NULL,
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

  CONSTRAINT activities_ibfk_1 FOREIGN KEY (offertant_id) REFERENCES users(id),
  CONSTRAINT activities_ibfk_2 FOREIGN KEY (category_id) REFERENCES categories(id)
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
  CONSTRAINT registrations_ibfk_1 FOREIGN KEY (activity_id) REFERENCES activities(id),
  CONSTRAINT registrations_ibfk_2 FOREIGN KEY (participant_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: requests
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
  max_age INT,
  pets_allowed TINYINT(1) DEFAULT 0,
  dress_code VARCHAR(100),

  is_accepted TINYINT(1) DEFAULT 0,
  accepted_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  state VARCHAR(32) NOT NULL DEFAULT 'pendiente',

  CONSTRAINT requests_ibfk_1 FOREIGN KEY (participant_id) REFERENCES users(id),
  CONSTRAINT requests_ibfk_2 FOREIGN KEY (accepted_by) REFERENCES users(id),
  CONSTRAINT requests_ibfk_3 FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`id`, `full_name`, `email`, `username`, `password_hash`, `role_id`, `created_at`) VALUES
(1, 'Irene Osuna', 'irene@gmail.com', 'ireneosuna', '$2y$10$b5ViZkLR4zFSXlVaawLEMOXAh7HyCMdMN39ANbItbDJlLqoC1CNve', 2, '2026-01-26 17:29:15'),
(2, 'Manuel Verdon', 'manuel@gmail.com', 'manuelverdon', '$2y$10$MNF.N94OmKc9D0YQ4rK2XewgRBVjNXGoaRSym8R53XdLtk9lZM6ki', 2, '2026-01-26 17:29:51'),
(3, 'Alejandro Montesinos', 'alejandro@gmail.com', 'alejandrom', '$2y$10$TfJ05ZNAR6VcI5OF/ZdmsOJ3KH4xua03MtJvn9fFiY6nYQOkwCfeu', 1, '2026-01-26 17:30:28'),
(4, 'Admin 1', 'admin@gmail.com', 'admin', '$2y$10$khd15J.3JvRGtkKn4A3z7O1u4SmzyJVT37ZEWGzLFnjRR45ZkUeau', 3, '2026-01-26 17:32:00');

INSERT INTO activities (
  offertant_id,
  category_id,
  title,
  description,
  date,
  time,
  price,
  max_people,
  location,
  language,
  image_url,
  state
) VALUES

-- =========================
-- ACTIVIDADES DE IRENE (id 1)
-- =========================

(
  1,
  (SELECT id FROM categories WHERE code = 'excursion'),
  'Ruta de Senderismo en la Sierra de Guadarrama',
  'Descubre la naturaleza en esta impresionante ruta por la Sierra de Guadarrama.',
  '2026-11-25',
  '10:00:00',
  35.00,
  10,
  'Madrid',
  'Español',
  'ruta.jpg',
  'aprobada'
),

(
  1,
  (SELECT id FROM categories WHERE code = 'class'),
  'Clase de Yoga',
  'Sesión de yoga para principiantes impartida por un instructor especializado.',
  '2026-11-25',
  '10:00:00',
  20.00,
  15,
  'Barcelona',
  'Español',
  'yoga.jpg',
  'aprobada'
),

(
  1,
  (SELECT id FROM categories WHERE code = 'workshop'),
  'Taller de Fotografía Urbana',
  'Aprende a capturar la esencia de la ciudad con tu cámara o móvil en este taller práctico por las calles de Madrid.',
  '2026-11-25',
  '10:00:00',
  30.00,
  12,
  'Madrid',
  'Español',
  'fotografia.jpg',
  'pendiente'
),

-- =========================
-- ACTIVIDADES DE MANUEL (id 2)
-- =========================

(
  2,
  (SELECT id FROM categories WHERE code = 'experience'),
  'Cata de Vinos',
  'Disfruta de una experiencia sensorial con una selección de vinos locales y aprende sobre maridaje y cata profesional.',
  '2026-11-25',
  '10:00:00',
  45.00,
  8,
  'La Rioja',
  'Español',
  'vinos.jpg',
  'pendiente'
),

(
  2,
  (SELECT id FROM categories WHERE code = 'class'),
  'Clase de Cocina Mediterránea',
  'Prepara platos típicos mediterráneos con un chef experto y descubre los secretos de esta cocina saludable y deliciosa.',
  '2026-11-25',
  '10:00:00',
  40.00,
  10,
  'Valencia',
  'Español',
  'cocina.jpg',
  'aprobada'
),

(
  2,
  (SELECT id FROM categories WHERE code = 'excursion'),
  'Ruta en Bicicleta por la Costa',
  'Explora la costa con una ruta guiada en bicicleta, perfecta para disfrutar del mar y el aire libre con amigos.',
  '2026-11-25',
  '10:00:00',
  25.00,
  20,
  'Málaga',
  'Español',
  'bicicleta.jpg',
  'aprobada'
);

INSERT INTO requests (
  participant_id,
  category_id,
  title,
  description,
  date,
  time,
  location,
  language,
  min_age,
  max_age,
  pets_allowed,
  dress_code,
  state
) VALUES

(
  3,
  (SELECT id FROM categories WHERE code = 'conference'),
  'Charla sobre vida saludable y bienestar',
  'Me gustaría asistir a una charla divulgativa sobre hábitos saludables, gestión del estrés y bienestar físico y mental.',
  '2025-12-02',
  '17:30:00',
  'Madrid',
  'Español',
  18,
  70,
  0,
  'Casual',
  'pendiente'
),

(
  3,
  (SELECT id FROM categories WHERE code = 'training'),
  'Curso básico de primeros auxilios',
  'Petición de formación práctica en primeros auxilios y actuación en emergencias cotidianas.',
  '2025-12-05',
  '16:00:00',
  'Valencia',
  'Español',
  18,
  65,
  0,
  'Ropa cómoda',
  'pendiente'
),

(
  3,
  (SELECT id FROM categories WHERE code = 'social'),
  'Encuentro social para conocer gente nueva',
  'Busco un evento social distendido para conocer personas con intereses culturales y actividades al aire libre.',
  '2025-12-08',
  '19:00:00',
  'Sevilla',
  'Español',
  21,
  55,
  0,
  'Casual',
  'pendiente'
),

(
  3,
  (SELECT id FROM categories WHERE code = 'tour'),
  'Tour histórico por el casco antiguo',
  'Me interesa un recorrido guiado por el centro histórico con explicaciones culturales y anécdotas locales.',
  '2025-12-10',
  '11:00:00',
  'Toledo',
  'Español',
  16,
  75,
  0,
  'Calzado cómodo',
  'aceptada'
),

(
  3,
  (SELECT id FROM categories WHERE code = 'meeting'),
  'Grupo de planificación de actividades al aire libre',
  'Reunión para organizar futuras excursiones y actividades en grupo durante los próximos meses.',
  '2025-12-12',
  '18:30:00',
  'Online',
  'Español',
  18,
  60,
  0,
  'Libre',
  'pendiente'
);

UPDATE activities 
SET image_url = NULL 
WHERE image_url IN ('ruta.jpg', 'yoga.jpg', 'fotografia.jpg', 'vinos.jpg', 'cocina.jpg', 'bicicleta.jpg');

-- Verificar los resultados
SELECT id, title, image_url, state FROM activities;


-- --------------------------------------------------------
-- TRIGGERS: sync current_registrations
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

-- --------------------------------------------------------
-- AUDIT TRIGGERS
-- --------------------------------------------------------

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

COMMIT;

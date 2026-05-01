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
  profile_image VARCHAR(255) DEFAULT NULL,
  role_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT users_ibfk_1
    FOREIGN KEY (role_id)
    REFERENCES roles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`id`, `full_name`, `email`, `username`, `password_hash`, `state`, `profile_image`, `role_id`, `created_at`) VALUES
(1,  'Irene Osuna',          'ireneod20@gmail.com',        'ireneosuna',    '$2y$10$b5ViZkLR4zFSXlVaawLEMOXAh7HyCMdMN39ANbItbDJlLqoC1CNve', 'activa',   'uploads/avatars/avatar_1.jpg',  2, '2026-01-26 17:29:15'),
(2,  'Manuel Verdon',        'verdontorres2005@gmail.com', 'manuelverdon',  '$2y$10$MNF.N94OmKc9D0YQ4rK2XewgRBVjNXGoaRSym8R53XdLtk9lZM6ki', 'activa',   'uploads/avatars/avatar_2.jpg',  2, '2026-01-26 17:29:51'),
(3,  'Alejandro Montesinos', 'alejandro@gmail.com',        'alejandrom',    '$2y$10$TfJ05ZNAR6VcI5OF/ZdmsOJ3KH4xua03MtJvn9fFiY6nYQOkwCfeu', 'inactiva', NULL,                            1, '2026-01-26 17:30:28'),
(4,  'Admin 1',              'admin@gmail.com',            'admin',         '$2y$10$khd15J.3JvRGtkKn4A3z7O1u4SmzyJVT37ZEWGzLFnjRR45ZkUeau', 'activa',   NULL,                            3, '2026-01-26 17:32:00'),
(5,  'Francisco Pino',       'fran@gmail.com',             'fran_pino',     '$2y$10$7qLJYqybIMNdpxPsCnRl0.eU0..7.O45eQw1m/aespYD7i47xSjJm', 'activa',   'uploads/avatars/avatar_5.jpg',  1, '2026-04-28 12:50:53'),
(6,  'Sandra Osuna',         'sandraosuna@gmail.com',      'sandraosuna',   '$2y$10$RkPqOOtbVLGMgA8fsMITgeHAVgMps7pX/cW49l5vAJdhoOu2wuq8u', 'activa',   'uploads/avatars/avatar_6.jpg',  1, '2026-04-28 12:51:28'),
(7,  'Carmen Mei',           'carmen@gmail.com',           'carmenmei',     '$2y$10$UnOxbzNJszl0K6hFxKYJnOq3OSHzPDMtO7/w7CV2hy5aF9/22MPvu', 'activa',   'uploads/avatars/avatar_7.jpg',  1, '2026-04-28 12:52:04'),
(8,  'Mario Cisneros',       'mario@gmail.com',            'mariocismen',   '$2y$10$GL6mQF6QrX8PUbSxArMOheLuIXDnOSxN9bzQ7xfswMvPgKYGFebB6', 'activa',   'uploads/avatars/avatar_8.jpg',  1, '2026-04-28 12:53:30'),
(9,  'Rocío López',          'rocio@gmail.com',            'rociolopez',    '$2y$10$SWxJUnKlcYrXtrRgn7A/VeTKlSIM.6eLqx1bB/FWON8OoCGPC1bBu', 'activa',   'uploads/avatars/avatar_9.webp', 1, '2026-04-28 12:54:08'),
(10, 'María Cadenas',        'maria@gmail.com',            'mariacadenas',  '$2y$10$JREOOxmsAXI0gx4z.6DzNuO/QYZKDtT5vVae1Q6XVsK.4W7mz4e.S', 'activa',   'uploads/avatars/avatar_10.jpg', 2, '2026-04-28 13:13:03');

ALTER TABLE users AUTO_INCREMENT = 11;

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

INSERT INTO categories (id, code, name) VALUES
(1,  'workshop',    'Taller'),
(2,  'class',       'Clase'),
(3,  'event',       'Evento'),
(4,  'excursion',   'Excursión'),
(5,  'training',    'Formación técnica'),
(6,  'conference',  'Conferencia'),
(7,  'meeting',     'Reunión'),
(8,  'experience',  'Experiencia'),
(9,  'tour',        'Tour'),
(10, 'competition', 'Competición'),
(11, 'social',      'Evento social');

ALTER TABLE categories AUTO_INCREMENT = 12;

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

INSERT INTO `activities` (`id`, `offertant_id`, `category_id`, `title`, `description`, `date`, `time`, `price`, `max_people`, `current_registrations`, `organizer_email`, `location`, `transport_included`, `departure_city`, `language`, `min_age`, `pets_allowed`, `dress_code`, `image_url`, `is_completed`, `is_finished`, `created_at`, `state`) VALUES
(1,  1,  1,  'Taller de cerámica creativa: da forma a tus ideas', 'Sumérgete en el mundo de la cerámica artesanal en este taller práctico donde aprenderás técnicas básicas de modelado, texturizado y esmaltado. No necesitas experiencia previa, solo ganas de experimentar y ensuciarte las manos. Durante la sesión crearás tus propias piezas únicas mientras recibes orientación personalizada. Ideal para desconectar, estimular la creatividad y llevarte a casa una obra hecha por ti.', '2026-06-19', '09:00:00', 10.00,  5,  3, 'ireneod20@gmail.com',        'Sevilla',  0, '',       'Español',  16, 1, 'Casual',   'assets/img/activities/activity_69f0a4e405dd11.59394266.png',  0, 0, '2026-04-28 13:30:32', 'aprobada'),
(2,  1,  2,  'Yoga para principiantes',                           'Clase diseñada para quienes desean iniciarse en el yoga, combinando ejercicios de respiración, estiramientos y posturas básicas. Se trabaja la relajación mental y el fortalecimiento físico en un ambiente tranquilo, con explicaciones claras y adaptaciones para todos los niveles.',                                                                                                                                       '2026-07-23', '09:00:00', 15.00,  5,  4, 'ireneod20@gmail.com',        'Huelva',   0, '',       'Español',  16, 0, 'Deportiva','uploads/activities/activity_1777390210_69f0d28226996.png',      0, 0, '2026-04-28 17:30:10', 'aprobada'),
(3,  1,  3,  'Festival gastronómico local',                       'Evento que reúne a diferentes restaurantes y productores locales para ofrecer una amplia variedad de platos tradicionales y modernos. Incluye música en directo, actividades culturales y espacios para degustación, creando una experiencia completa para los amantes de la gastronomía.',                                                                                                                          '2026-09-16', '09:00:00',  0.00,  5,  5, 'ireneod20@gmail.com',        'Cádiz',    1, 'Sevilla','Español',  12, 0, 'Casual',   'uploads/activities/activity_1777390665_69f0d4495ddca.png',      1, 0, '2026-04-28 17:37:45', 'aprobada'),
(4,  1,  4,  'Senderismo en montaña guiado',                      'Excursión de día completo por rutas naturales de montaña, acompañada por un guía experimentado. Se realizarán paradas para disfrutar del paisaje, aprender sobre el entorno y descansar. Ideal para desconectar de la rutina y conectar con la naturaleza de forma segura.',                                                                                                                                      '2026-05-09', '09:00:00',  0.00,  5,  1, 'ireneod20@gmail.com',        'Córdoba',  1, 'Sevilla','Italiano', 14, 1, 'Deportiva','uploads/activities/activity_1777390832_69f0d4f0532cb.jpg',      0, 0, '2026-04-28 17:40:32', 'aprobada'),
(5,  2,  5,  'Introducción al desarrollo web',                    'Curso intensivo enfocado en los fundamentos del desarrollo web, donde aprenderás a crear páginas utilizando HTML, CSS y conceptos básicos de JavaScript. Incluye ejercicios prácticos y pequeños proyectos para aplicar los conocimientos adquiridos.',                                                                                                                                                           '2026-05-10', '09:00:00',100.00,  5,  4, 'verdontorres2005@gmail.com', 'Madrid',   1, 'Sevilla','Inglés',   16, 0, 'Casual',   'uploads/activities/activity_1777390973_69f0d57d6b4fe.jpg',      0, 0, '2026-04-28 17:42:53', 'aprobada'),
(6,  2,  6,  'Tendencias en inteligencia artificial',             'Conferencia impartida por profesionales del sector tecnológico en la que se abordan los avances más recientes en inteligencia artificial, sus aplicaciones en la vida cotidiana y los retos éticos y laborales que plantea su desarrollo.',                                                                                                                                                                       '2026-07-03', '09:00:00',  0.00,  5,  0, 'verdontorres2005@gmail.com', 'Málaga',   0, '',       'Español',  18, 0, 'Elegante', 'uploads/activities/activity_1777391056_69f0d5d010485.jpg',      0, 0, '2026-04-28 17:44:16', 'rechazada'),
(7,  2,  7,  'Encuentro de emprendedores',                        'Reunión orientada a conectar emprendedores, compartir experiencias y generar oportunidades de colaboración. Incluye presentaciones breves, dinámicas de networking y espacio abierto para intercambio de ideas y proyectos.',                                                                                                                                                                                     '2026-07-07', '11:00:00',  0.00,  5,  4, 'verdontorres2005@gmail.com', 'Sevilla',  0, '',       'Español',  18, 0, 'Elegante', 'uploads/activities/activity_1777391149_69f0d62dd0377.jpg',      1, 0, '2026-04-28 17:45:49', 'aprobada'),
(8,  2,  8,  'Cata de vinos guiada',                              'Experiencia sensorial en la que se degustarán distintos tipos de vino bajo la guía de un experto. Se explicarán sus características, procesos de elaboración y combinaciones gastronómicas, fomentando el aprendizaje en un ambiente relajado.',                                                                                                                                                                  '2026-07-01', '09:00:00',  0.00,  5,  4, 'verdontorres2005@gmail.com', 'Almería',  0, '',       'Español',  18, 0, 'Casual',   'uploads/activities/activity_1777391225_69f0d67938487.png',      0, 0, '2026-04-28 17:47:05', 'aprobada'),
(9,  10, 9,  'Recorrido histórico urbano',                        'Tour guiado por los puntos más emblemáticos de la ciudad, con explicaciones detalladas sobre su historia, arquitectura y curiosidades. Ideal para conocer el patrimonio cultural de forma entretenida y enriquecedora.',                                                                                                                                                                                          '2026-07-31', '10:30:00',  0.00,  5,  5, 'maria@gmail.com',            'Sevilla',  1, 'Málaga', 'Español',  16, 0, 'Casual',   'uploads/activities/activity_1777391335_69f0d6e7df9f8.jpg',      1, 0, '2026-04-28 17:48:55', 'aprobada'),
(10, 10, 10, 'Torneo de fútbol amateur',                          'Competición deportiva organizada para equipos aficionados, con partidos dinámicos y ambiente competitivo pero amistoso. Incluye árbitros, sistema de clasificación y premios para los equipos destacados.',                                                                                                                                                                                                      '2026-09-05', '17:00:00',  0.00, 10,  0, 'maria@gmail.com',            'Valencia', 0, '',       'Español',  18, 0, 'Deportiva','uploads/activities/activity_1777391434_69f0d74af0439.jpg',      0, 0, '2026-04-28 17:50:34', 'rechazada'),
(11, 10, 11, 'Cena temática internacional',                       'Evento social en el que los asistentes podrán disfrutar de un menú inspirado en diferentes culturas del mundo. La velada incluye ambientación musical, decoración temática y espacios para interactuar y conocer a nuevas personas.',                                                                                                                                                                            '2026-05-09', '21:00:00', 35.00,  5,  3, 'maria@gmail.com',            'Sevilla',  0, '',       'Español',  18, 0, 'Elegante', 'uploads/activities/activity_1777391510_69f0d796e0b10.jpg',      0, 0, '2026-04-28 17:51:50', 'aprobada');

ALTER TABLE activities AUTO_INCREMENT = 12;

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

INSERT INTO `registrations` (`id`, `activity_id`, `participant_id`, `registration_date`) VALUES
(1,  11, 5, '2026-04-28 18:02:01'),
(2,  9,  5, '2026-04-28 18:02:03'),
(3,  8,  5, '2026-04-28 18:02:05'),
(4,  7,  5, '2026-04-28 18:02:07'),
(5,  5,  5, '2026-04-28 18:02:08'),
(6,  3,  5, '2026-04-28 18:02:16'),
(7,  2,  5, '2026-04-28 18:02:18'),
(8,  1,  5, '2026-04-28 18:02:20'),
(9,  4,  6, '2026-04-28 18:02:59'),
(10, 3,  6, '2026-04-28 18:03:01'),
(11, 9,  6, '2026-04-28 18:03:09'),
(12, 8,  6, '2026-04-28 18:03:10'),
(13, 7,  6, '2026-04-28 18:03:12'),
(14, 5,  6, '2026-04-28 18:03:13'),
(15, 2,  6, '2026-04-28 18:03:15'),
(16, 1,  6, '2026-04-28 18:03:20'),
(17, 11, 9, '2026-04-28 18:03:42'),
(18, 9,  9, '2026-04-28 18:03:44'),
(19, 8,  9, '2026-04-28 18:03:46'),
(20, 7,  9, '2026-04-28 18:03:49'),
(21, 3,  9, '2026-04-28 18:03:52'),
(22, 2,  9, '2026-04-28 18:03:56'),
(23, 9,  7, '2026-04-28 18:04:15'),
(24, 8,  7, '2026-04-28 18:04:17'),
(25, 7,  7, '2026-04-28 18:04:18'),
(26, 5,  7, '2026-04-28 18:04:20'),
(27, 3,  7, '2026-04-28 18:04:25'),
(28, 2,  7, '2026-04-28 18:04:27'),
(29, 9,  8, '2026-04-28 18:05:00'),
(31, 11, 8, '2026-04-28 18:05:06'),
(32, 3,  8, '2026-04-28 18:05:23'),
(33, 5,  8, '2026-04-28 18:05:27'),
(34, 1,  3, '2026-04-28 18:07:51');

ALTER TABLE registrations AUTO_INCREMENT = 35;

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

INSERT INTO `requests` (`id`, `participant_id`, `category_id`, `title`, `description`, `date`, `time`, `location`, `current_registrations`, `organizer_email`, `transport_included`, `departure_city`, `language`, `min_age`, `pets_allowed`, `dress_code`, `image_url`, `is_accepted`, `accepted_by`, `created_at`, `state`) VALUES
(1,  5, 1, 'Taller de fotografía urbana',         'Busco un taller práctico enfocado en fotografía urbana donde aprender a capturar escenas cotidianas con creatividad. Me interesa conocer técnicas de composición, uso de la luz natural y edición básica. La idea es realizar una salida por la ciudad con un profesional que pueda guiar y dar feedback en tiempo real.',                              '2026-06-04', '09:00:00', 'Sevilla',              0, 'fran@gmail.com',   0, '',       'Español', 16, 1, 'Casual',   'uploads/activities/request_1777392717_69f0dc4d65621.jpg',  0, NULL, '2026-04-28 18:11:57', 'pendiente'),
(2,  5, 2, 'Clases de baile latino',              'Me gustaría asistir a clases de baile latino, especialmente salsa y bachata, orientadas a principiantes. Busco un ambiente dinámico y divertido donde aprender pasos básicos, coordinación y ritmo, con la posibilidad de practicar en grupo y mejorar progresivamente.',                                                                         '2026-06-18', '09:00:00', 'Madrid',               0, 'fran@gmail.com',   0, '',       'Ruso',    18, 0, 'Casual',   'uploads/activities/request_1777392812_69f0dcacbef39.jpg',  1, 1,    '2026-04-28 18:13:32', 'aprobada'),
(3,  6, 3, 'Organización de evento cultural',     'Estoy interesado en participar en la organización de un evento cultural que incluya música, arte y actividades interactivas. Busco un equipo o persona que pueda coordinar la logística, artistas y espacios, creando una experiencia atractiva para todo tipo de público.',                                                                       '2026-05-07', '09:00:00', 'Cádiz',                0, 'sandraosuna@gmail.com', 0, '', 'Español', 16, 0, 'Casual',   'uploads/activities/request_1777392891_69f0dcfb49e25.jpg',  0, NULL, '2026-04-28 18:14:51', 'aprobada'),
(4,  6, 4, 'Excursión de senderismo natural',     'Me gustaría unirme a una excursión de senderismo por un entorno natural cercano, preferiblemente con guía. Busco una actividad que combine ejercicio moderado con disfrute del paisaje, incluyendo paradas explicativas sobre flora, fauna y puntos de interés.',                                                                                 '2026-05-23', '11:00:00', 'Córdoba',              0, 'sandraosuna@gmail.com', 1, 'Sevilla', 'Español', 18, 1, 'Deportiva','uploads/activities/request_1777393015_69f0dd776ad6a.jpg',  1, 2,    '2026-04-28 18:16:55', 'aprobada'),
(5,  7, 5, 'Curso básico de programación',        'Busco una formación técnica introductoria en programación, centrada en conceptos básicos y ejercicios prácticos. Me interesa aprender desde cero, con ejemplos claros y acompañamiento, para poder desarrollar pequeños proyectos y entender la lógica del desarrollo de software.',                                                              '2026-07-02', '10:00:00', 'Dos Hermanas',         0, 'carmen@gmail.com', 0, '',       'Español', 16, 0, 'Casual',   'uploads/activities/request_1777393145_69f0ddf99f58d.jpg',  0, NULL, '2026-04-28 18:19:05', 'rechazada'),
(6,  7, 6, 'Charla sobre innovación tecnológica', 'Me gustaría asistir a una conferencia o charla donde se traten temas de innovación tecnológica, tendencias digitales y nuevas herramientas. Busco un enfoque divulgativo pero profundo, con ejemplos reales y espacio para preguntas.',                                                                                                           '2026-07-03', '13:00:00', 'Valencia',             0, 'carmen@gmail.com', 0, '',       'Español', 18, 0, 'Casual',   'uploads/activities/request_1777393913_69f0e0f998ff9.jpg',  0, NULL, '2026-04-28 18:31:53', 'aprobada'),
(7,  9, 7, 'Reunión de networking profesional',   'Estoy interesado en participar en una reunión orientada al networking profesional, donde conocer personas del mismo sector o con intereses similares. Me gustaría que incluya dinámicas para facilitar la interacción y el intercambio de contactos.',                                                                                            '2026-05-08', '10:00:00', 'Barcelona',            0, 'rocio@gmail.com',  0, '',       'Español', 18, 0, 'Elegante', 'uploads/activities/request_1777394015_69f0e15f394af.png',  1, 1,    '2026-04-28 18:33:35', 'aprobada'),
(8,  9, 8, 'Experiencia gastronómica guiada',     'Busco una experiencia gastronómica donde poder degustar diferentes platos o productos bajo la guía de un experto. Me interesa aprender sobre sabores, ingredientes y combinaciones, en un ambiente relajado y social.',                                                                                                                            '2026-06-04', '09:00:00', 'Lucena',               0, 'rocio@gmail.com',  0, '',       'Español', 18, 0, 'Casual',   'uploads/activities/request_1777394078_69f0e19ed16e1.jpg',  0, NULL, '2026-04-28 18:34:38', 'aprobada'),
(9,  8, 1, 'Taller de escritura creativa',        'Me gustaría participar en un taller enfocado en desarrollar la creatividad a través de la escritura. Busco aprender técnicas narrativas, construcción de personajes y desarrollo de historias, con ejercicios prácticos y retroalimentación por parte del instructor.',                                                                           '2026-06-25', '09:00:00', 'Fuentes de Andalucía', 0, 'mario@gmail.com',  0, '',       'Español', 18, 0, 'Casual',   'uploads/activities/request_1777394377_69f0e2c984d3e.jpeg', 1, 1,    '2026-04-28 18:39:37', 'aprobada'),
(10, 8, 2, 'Clases de cocina saludable',          'Estoy interesado en clases donde aprender a preparar recetas saludables y equilibradas. Me gustaría conocer técnicas de cocina, combinación de ingredientes y consejos nutricionales para mejorar mis hábitos alimenticios de forma práctica.',                                                                                                   '2026-04-29', '10:00:00', 'Sevilla',              0, 'mario@gmail.com',  0, '',       'Japonés', 18, 0, 'Casual',   'uploads/activities/request_1777394444_69f0e30c32730.jpg',  0, NULL, '2026-04-28 18:40:44', 'pendiente');

ALTER TABLE requests AUTO_INCREMENT = 11;

-- --------------------------------------------------------
-- Table: chat_messages
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

CREATE TABLE activity_events (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    event_type  ENUM('created', 'updated', 'deleted') NOT NULL,
    activity_id INT NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created_at (created_at)
);

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
      state = 'finalizada'
  WHERE offertant_id = p_user_id
    AND date >= CURDATE();

  UPDATE requests
  SET accepted_by = NULL
  WHERE accepted_by = p_user_id;

  DELETE FROM registrations
  WHERE participant_id = p_user_id;

  DELETE FROM requests
  WHERE participant_id = p_user_id;

  DELETE FROM users WHERE id = p_user_id;
END$$

DELIMITER ;

-- --------------------------------------------------------
-- EVENTO: finalizar actividades y requests pasadas
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

COMMIT;
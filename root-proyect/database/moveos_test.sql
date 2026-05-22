-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 22-05-2026 a las 17:47:35
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `moveos_test`
--

DELIMITER $$
--
-- Procedimientos
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `deactivate_user` (IN `p_user_id` INT)   BEGIN

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

--
-- Estructura de tabla para la tabla `activities`
--

CREATE TABLE `activities` (
  `id` int(11) NOT NULL,
  `offertant_id` int(11) DEFAULT NULL,
  `category_id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `date` date DEFAULT NULL,
  `time` time DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `max_people` int(11) DEFAULT NULL,
  `current_registrations` int(11) DEFAULT 0,
  `organizer_email` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `transport_included` tinyint(1) DEFAULT 0,
  `departure_city` varchar(150) DEFAULT NULL,
  `language` varchar(50) DEFAULT NULL,
  `min_age` int(11) DEFAULT NULL,
  `pets_allowed` tinyint(1) DEFAULT 0,
  `dress_code` varchar(100) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_completed` tinyint(1) DEFAULT 0,
  `is_finished` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `state` varchar(32) NOT NULL DEFAULT 'pendiente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Disparadores `activities`
--
DELIMITER $$
CREATE TRIGGER `audit_activities_delete` BEFORE DELETE ON `activities` FOR EACH ROW INSERT INTO audit_logs (table_name, action_type, record_id, old_values)

VALUES ('activities', 'DELETE', OLD.id,

  JSON_OBJECT('title', OLD.title))
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `audit_activities_insert` AFTER INSERT ON `activities` FOR EACH ROW INSERT INTO audit_logs (table_name, action_type, record_id, new_values)

VALUES ('activities', 'INSERT', NEW.id,

  JSON_OBJECT('title', NEW.title, 'offertant_id', NEW.offertant_id))
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `audit_activities_update` AFTER UPDATE ON `activities` FOR EACH ROW INSERT INTO audit_logs (table_name, action_type, record_id, old_values, new_values)

VALUES ('activities', 'UPDATE', NEW.id,

  JSON_OBJECT('title', OLD.title),

  JSON_OBJECT('title', NEW.title))
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `activity_events`
--

CREATE TABLE `activity_events` (
  `id` int(11) NOT NULL,
  `event_type` enum('created','updated','deleted') NOT NULL,
  `activity_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL,
  `table_name` varchar(50) NOT NULL,
  `action_type` varchar(20) NOT NULL,
  `record_id` int(11) NOT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `changed_at` datetime DEFAULT current_timestamp(),
  `db_user` varchar(100) DEFAULT current_user()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `table_name`, `action_type`, `record_id`, `old_values`, `new_values`, `changed_at`, `db_user`) VALUES
(3, 'activities', 'INSERT', 12, NULL, '{\"title\": \"Excursión test\", \"offertant_id\": 11}', '2026-05-18 01:12:10', 'root@localhost'),
(4, 'activities', 'DELETE', 12, '{\"title\": \"Excursión test\"}', NULL, '2026-05-18 01:12:10', 'root@localhost'),
(5, 'requests', 'INSERT', 11, NULL, '{\"title\": \"Petición test\"}', '2026-05-18 01:12:10', 'root@localhost'),
(6, 'activities', 'INSERT', 13, NULL, '{\"title\": \"Excursión test\", \"offertant_id\": 20}', '2026-05-18 01:12:18', 'root@localhost'),
(7, 'activities', 'DELETE', 13, '{\"title\": \"Excursión test\"}', NULL, '2026-05-18 01:12:18', 'root@localhost'),
(8, 'requests', 'INSERT', 12, NULL, '{\"title\": \"Petición test\"}', '2026-05-18 01:12:18', 'root@localhost'),
(9, 'activities', 'INSERT', 14, NULL, '{\"title\": \"Excursión test\", \"offertant_id\": 29}', '2026-05-18 01:15:38', 'root@localhost'),
(10, 'activities', 'DELETE', 14, '{\"title\": \"Excursión test\"}', NULL, '2026-05-18 01:15:38', 'root@localhost'),
(11, 'requests', 'INSERT', 13, NULL, '{\"title\": \"Petición test\"}', '2026-05-18 01:15:38', 'root@localhost'),
(12, 'activities', 'INSERT', 15, NULL, '{\"title\": \"Excursión test\", \"offertant_id\": 38}', '2026-05-18 01:16:42', 'root@localhost'),
(13, 'activities', 'DELETE', 15, '{\"title\": \"Excursión test\"}', NULL, '2026-05-18 01:16:42', 'root@localhost'),
(14, 'requests', 'INSERT', 14, NULL, '{\"title\": \"Petición test\"}', '2026-05-18 01:16:42', 'root@localhost'),
(15, 'activities', 'INSERT', 16, NULL, '{\"title\": \"Excursión test\", \"offertant_id\": 47}', '2026-05-18 12:03:10', 'root@localhost'),
(16, 'activities', 'DELETE', 16, '{\"title\": \"Excursión test\"}', NULL, '2026-05-18 12:03:10', 'root@localhost'),
(17, 'requests', 'INSERT', 15, NULL, '{\"title\": \"Petición test\"}', '2026-05-18 12:03:11', 'root@localhost'),
(18, 'activities', 'INSERT', 17, NULL, '{\"title\": \"Excursión test\", \"offertant_id\": 56}', '2026-05-18 12:03:12', 'root@localhost'),
(19, 'activities', 'DELETE', 17, '{\"title\": \"Excursión test\"}', NULL, '2026-05-18 12:03:12', 'root@localhost'),
(20, 'requests', 'INSERT', 16, NULL, '{\"title\": \"Petición test\"}', '2026-05-18 12:03:12', 'root@localhost'),
(21, 'activities', 'INSERT', 18, NULL, '{\"title\": \"Excursión test\", \"offertant_id\": 87}', '2026-05-18 12:46:52', 'root@localhost'),
(22, 'activities', 'DELETE', 18, '{\"title\": \"Excursión test\"}', NULL, '2026-05-18 12:46:52', 'root@localhost'),
(23, 'requests', 'INSERT', 17, NULL, '{\"title\": \"Petición test\"}', '2026-05-18 12:46:52', 'root@localhost'),
(24, 'activities', 'INSERT', 19, NULL, '{\"title\": \"Excursión test\", \"offertant_id\": 114}', '2026-05-18 12:47:13', 'root@localhost'),
(25, 'activities', 'DELETE', 19, '{\"title\": \"Excursión test\"}', NULL, '2026-05-18 12:47:13', 'root@localhost'),
(26, 'requests', 'INSERT', 18, NULL, '{\"title\": \"Petición test\"}', '2026-05-18 12:47:13', 'root@localhost'),
(27, 'activities', 'INSERT', 20, NULL, '{\"title\": \"Excursión test\", \"offertant_id\": 141}', '2026-05-18 12:47:39', 'root@localhost'),
(28, 'activities', 'DELETE', 20, '{\"title\": \"Excursión test\"}', NULL, '2026-05-18 12:47:39', 'root@localhost'),
(29, 'requests', 'INSERT', 19, NULL, '{\"title\": \"Petición test\"}', '2026-05-18 12:47:39', 'root@localhost'),
(30, 'activities', 'INSERT', 21, NULL, '{\"title\": \"Excursión test\", \"offertant_id\": 186}', '2026-05-18 12:50:40', 'root@localhost'),
(31, 'activities', 'DELETE', 21, '{\"title\": \"Excursión test\"}', NULL, '2026-05-18 12:50:40', 'root@localhost'),
(32, 'requests', 'INSERT', 20, NULL, '{\"title\": \"Petición test\"}', '2026-05-18 12:50:40', 'root@localhost'),
(33, 'activities', 'INSERT', 22, NULL, '{\"title\": \"Excursión test\", \"offertant_id\": 238}', '2026-05-18 13:06:17', 'root@localhost'),
(34, 'activities', 'DELETE', 22, '{\"title\": \"Excursión test\"}', NULL, '2026-05-18 13:06:17', 'root@localhost'),
(35, 'requests', 'INSERT', 21, NULL, '{\"title\": \"Petición test\"}', '2026-05-18 13:06:17', 'root@localhost'),
(36, 'activities', 'INSERT', 23, NULL, '{\"title\": \"Excursión test\", \"offertant_id\": 258}', '2026-05-22 17:41:15', 'root@localhost'),
(37, 'activities', 'DELETE', 23, '{\"title\": \"Excursión test\"}', NULL, '2026-05-22 17:41:16', 'root@localhost'),
(38, 'requests', 'INSERT', 22, NULL, '{\"title\": \"Petición test\"}', '2026-05-22 17:41:16', 'root@localhost'),
(39, 'activities', 'INSERT', 24, NULL, '{\"title\": \"Excursión test\", \"offertant_id\": 303}', '2026-05-22 17:43:54', 'root@localhost'),
(40, 'activities', 'DELETE', 24, '{\"title\": \"Excursión test\"}', NULL, '2026-05-22 17:43:54', 'root@localhost'),
(41, 'requests', 'INSERT', 23, NULL, '{\"title\": \"Petición test\"}', '2026-05-22 17:43:54', 'root@localhost');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `categories`
--

INSERT INTO `categories` (`id`, `code`, `name`) VALUES
(1, 'workshop', 'Taller'),
(2, 'class', 'Clase'),
(3, 'event', 'Evento'),
(4, 'excursion', 'Excursi?n'),
(5, 'training', 'Formaci?n t?cnica'),
(6, 'conference', 'Conferencia'),
(7, 'meeting', 'Reuni?n'),
(8, 'experience', 'Experiencia'),
(9, 'tour', 'Tour'),
(10, 'competition', 'Competici?n'),
(11, 'social', 'Evento social');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `chat_messages`
--

CREATE TABLE `chat_messages` (
  `id` int(11) NOT NULL,
  `room_type` enum('activity','admin') NOT NULL,
  `room_id` int(11) DEFAULT NULL,
  `sender_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `password_reset_codes`
--

CREATE TABLE `password_reset_codes` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `code` varchar(6) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registrations`
--

CREATE TABLE `registrations` (
  `id` int(11) NOT NULL,
  `activity_id` int(11) NOT NULL,
  `participant_id` int(11) NOT NULL,
  `registration_date` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Disparadores `registrations`
--
DELIMITER $$
CREATE TRIGGER `registrations_after_delete` AFTER DELETE ON `registrations` FOR EACH ROW UPDATE activities

SET current_registrations = current_registrations - 1

WHERE id = OLD.activity_id
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `registrations_after_insert` AFTER INSERT ON `registrations` FOR EACH ROW UPDATE activities

SET current_registrations = current_registrations + 1

WHERE id = NEW.activity_id
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `requests`
--

CREATE TABLE `requests` (
  `id` int(11) NOT NULL,
  `participant_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `date` date DEFAULT NULL,
  `time` time DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `current_registrations` int(11) DEFAULT 0,
  `organizer_email` varchar(255) DEFAULT NULL,
  `transport_included` tinyint(1) DEFAULT 0,
  `departure_city` varchar(150) DEFAULT NULL,
  `language` varchar(50) DEFAULT NULL,
  `min_age` int(11) DEFAULT NULL,
  `pets_allowed` tinyint(1) DEFAULT 0,
  `dress_code` varchar(100) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_accepted` tinyint(1) DEFAULT 0,
  `accepted_by` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `state` varchar(32) NOT NULL DEFAULT 'pendiente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Disparadores `requests`
--
DELIMITER $$
CREATE TRIGGER `audit_requests_delete` BEFORE DELETE ON `requests` FOR EACH ROW INSERT INTO audit_logs (table_name, action_type, record_id, old_values)

VALUES ('requests', 'DELETE', OLD.id,

  JSON_OBJECT('title', OLD.title))
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `audit_requests_insert` AFTER INSERT ON `requests` FOR EACH ROW INSERT INTO audit_logs (table_name, action_type, record_id, new_values)

VALUES ('requests', 'INSERT', NEW.id,

  JSON_OBJECT('title', NEW.title))
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `audit_requests_update` AFTER UPDATE ON `requests` FOR EACH ROW INSERT INTO audit_logs (table_name, action_type, record_id, old_values, new_values)

VALUES ('requests', 'UPDATE', NEW.id,

  JSON_OBJECT('is_accepted', OLD.is_accepted),

  JSON_OBJECT('is_accepted', NEW.is_accepted))
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id`, `name`) VALUES
(3, 'administrador'),
(2, 'organizador'),
(1, 'participante');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `state` varchar(255) NOT NULL DEFAULT 'activa',
  `profile_image` varchar(255) DEFAULT NULL,
  `role_id` int(11) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `full_name`, `email`, `username`, `password_hash`, `state`, `profile_image`, `role_id`, `created_at`) VALUES
(329, 'Usuario Prueba', 'legitimo@example.com', 'usuarioprueba', '$2y$10$YN42YjqNvQOb50Nn0Ig01ejuD5.1WhQ4ONnhBeY3BCgPmK6Z3fr4y', 'activa', NULL, 1, '2026-05-22 17:43:56');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `activities`
--
ALTER TABLE `activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `activities_ibfk_1` (`offertant_id`),
  ADD KEY `activities_ibfk_2` (`category_id`);

--
-- Indices de la tabla `activity_events`
--
ALTER TABLE `activity_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indices de la tabla `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indices de la tabla `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `chat_messages_ibfk_1` (`sender_id`),
  ADD KEY `idx_chat_room` (`room_type`,`room_id`),
  ADD KEY `idx_chat_created` (`created_at`);

--
-- Indices de la tabla `password_reset_codes`
--
ALTER TABLE `password_reset_codes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_reset_user` (`user_id`),
  ADD KEY `idx_reset_code` (`code`);

--
-- Indices de la tabla `registrations`
--
ALTER TABLE `registrations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `activity_participant` (`activity_id`,`participant_id`),
  ADD KEY `registrations_ibfk_2` (`participant_id`);

--
-- Indices de la tabla `requests`
--
ALTER TABLE `requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `requests_ibfk_1` (`participant_id`),
  ADD KEY `requests_ibfk_2` (`accepted_by`),
  ADD KEY `requests_ibfk_3` (`category_id`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `users_ibfk_1` (`role_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `activities`
--
ALTER TABLE `activities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT de la tabla `activity_events`
--
ALTER TABLE `activity_events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT de la tabla `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `chat_messages`
--
ALTER TABLE `chat_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `password_reset_codes`
--
ALTER TABLE `password_reset_codes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `registrations`
--
ALTER TABLE `registrations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT de la tabla `requests`
--
ALTER TABLE `requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=330;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `activities`
--
ALTER TABLE `activities`
  ADD CONSTRAINT `activities_ibfk_1` FOREIGN KEY (`offertant_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `activities_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);

--
-- Filtros para la tabla `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD CONSTRAINT `chat_messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `password_reset_codes`
--
ALTER TABLE `password_reset_codes`
  ADD CONSTRAINT `password_reset_codes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `registrations`
--
ALTER TABLE `registrations`
  ADD CONSTRAINT `registrations_ibfk_1` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `registrations_ibfk_2` FOREIGN KEY (`participant_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `requests`
--
ALTER TABLE `requests`
  ADD CONSTRAINT `requests_ibfk_1` FOREIGN KEY (`participant_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `requests_ibfk_2` FOREIGN KEY (`accepted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `requests_ibfk_3` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);

--
-- Filtros para la tabla `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`);

DELIMITER $$
--
-- Eventos
--
CREATE DEFINER=`root`@`localhost` EVENT `finalizar_actividades_requests` ON SCHEDULE EVERY 1 DAY STARTS '2026-05-18 00:00:00' ON COMPLETION NOT PRESERVE ENABLE DO BEGIN

  UPDATE activities

  SET is_finished = 1, state = 'finalizada'

  WHERE date < CURDATE() AND is_finished = 0;



  UPDATE requests

  SET state = 'finalizada'

  WHERE date < CURDATE() AND state != 'finalizada';

END$$

DELIMITER ;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

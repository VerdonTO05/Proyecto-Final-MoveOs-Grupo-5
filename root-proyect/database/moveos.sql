-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 28-11-2025 a las 12:33:00
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `moveos`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `activities`
--

CREATE TABLE `activities` (
  `id` int(11) NOT NULL,
  `offertant_id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `date` date DEFAULT NULL,
  `time` time DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `max_people` int(11) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
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
CREATE TRIGGER `audit_activities_delete` BEFORE DELETE ON `activities` FOR EACH ROW BEGIN
    INSERT INTO audit_logs (table_name, action_type, record_id, old_values)
    VALUES ('activities', 'DELETE', OLD.id, 
    JSON_OBJECT('title', OLD.title, 'offertant_id', OLD.offertant_id));
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `audit_activities_insert` AFTER INSERT ON `activities` FOR EACH ROW BEGIN
    INSERT INTO audit_logs (table_name, action_type, record_id, new_values)
    VALUES ('activities', 'INSERT', NEW.id, 
    JSON_OBJECT('title', NEW.title, 'offertant_id', NEW.offertant_id, 'price', NEW.price));
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `audit_activities_update` AFTER UPDATE ON `activities` FOR EACH ROW BEGIN
    INSERT INTO audit_logs (table_name, action_type, record_id, old_values, new_values)
    VALUES ('activities', 'UPDATE', NEW.id, 
    JSON_OBJECT('title', OLD.title, 'price', OLD.price, 'is_completed', OLD.is_completed),
    JSON_OBJECT('title', NEW.title, 'price', NEW.price, 'is_completed', NEW.is_completed));
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL,
  `table_name` varchar(50) NOT NULL,
  `action_type` varchar(20) NOT NULL,
  `record_id` int(11) NOT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`)),
  `changed_at` datetime DEFAULT current_timestamp(),
  `db_user` varchar(100) DEFAULT current_user()
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
CREATE TRIGGER `audit_registrations_delete` BEFORE DELETE ON `registrations` FOR EACH ROW BEGIN
    INSERT INTO audit_logs (table_name, action_type, record_id, old_values)
    VALUES ('registrations', 'DELETE', OLD.id, 
    JSON_OBJECT('activity_id', OLD.activity_id, 'participant_id', OLD.participant_id));
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `audit_registrations_insert` AFTER INSERT ON `registrations` FOR EACH ROW BEGIN
    INSERT INTO audit_logs (table_name, action_type, record_id, new_values)
    VALUES ('registrations', 'INSERT', NEW.id, 
    JSON_OBJECT('activity_id', NEW.activity_id, 'participant_id', NEW.participant_id));
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `requests`
--

CREATE TABLE `requests` (
  `id` int(11) NOT NULL,
  `participant_id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `date` date DEFAULT NULL,
  `time` time DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `is_accepted` tinyint(1) DEFAULT 0,
  `accepted_by` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `state` varchar(32) NOT NULL DEFAULT 'pendiente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Disparadores `requests`
--
DELIMITER $$
CREATE TRIGGER `audit_requests_delete` BEFORE DELETE ON `requests` FOR EACH ROW BEGIN
    INSERT INTO audit_logs (table_name, action_type, record_id, old_values)
    VALUES ('requests', 'DELETE', OLD.id, 
    JSON_OBJECT('title', OLD.title, 'participant_id', OLD.participant_id));
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `audit_requests_insert` AFTER INSERT ON `requests` FOR EACH ROW BEGIN
    INSERT INTO audit_logs (table_name, action_type, record_id, new_values)
    VALUES ('requests', 'INSERT', NEW.id, 
    JSON_OBJECT('title', NEW.title, 'participant_id', NEW.participant_id));
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `audit_requests_update` AFTER UPDATE ON `requests` FOR EACH ROW BEGIN
    INSERT INTO audit_logs (table_name, action_type, record_id, old_values, new_values)
    VALUES ('requests', 'UPDATE', NEW.id, 
    JSON_OBJECT('is_accepted', OLD.is_accepted, 'accepted_by', OLD.accepted_by),
    JSON_OBJECT('is_accepted', NEW.is_accepted, 'accepted_by', NEW.accepted_by));
END
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
(2, 'ofertante'),
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
  `role_id` int(11) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Disparadores `users`
--
DELIMITER $$
CREATE TRIGGER `audit_users_delete` BEFORE DELETE ON `users` FOR EACH ROW BEGIN
    INSERT INTO audit_logs (table_name, action_type, record_id, old_values)
    VALUES ('users', 'DELETE', OLD.id, 
    JSON_OBJECT('username', OLD.username, 'email', OLD.email));
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `audit_users_insert` AFTER INSERT ON `users` FOR EACH ROW BEGIN
    INSERT INTO audit_logs (table_name, action_type, record_id, new_values)
    VALUES ('users', 'INSERT', NEW.id, 
    JSON_OBJECT('username', NEW.username, 'email', NEW.email, 'role_id', NEW.role_id));
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `audit_users_update` AFTER UPDATE ON `users` FOR EACH ROW BEGIN
    INSERT INTO audit_logs (table_name, action_type, record_id, old_values, new_values)
    VALUES ('users', 'UPDATE', NEW.id, 
    JSON_OBJECT('username', OLD.username, 'email', OLD.email, 'role_id', OLD.role_id),
    JSON_OBJECT('username', NEW.username, 'email', NEW.email, 'role_id', NEW.role_id));
END
$$
DELIMITER ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `activities`
--
ALTER TABLE `activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `offertant_id` (`offertant_id`);

--
-- Indices de la tabla `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `registrations`
--
ALTER TABLE `registrations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `activity_id` (`activity_id`,`participant_id`),
  ADD KEY `participant_id` (`participant_id`);

--
-- Indices de la tabla `requests`
--
ALTER TABLE `requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `participant_id` (`participant_id`),
  ADD KEY `accepted_by` (`accepted_by`);

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
  ADD KEY `role_id` (`role_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `activities`
--
ALTER TABLE `activities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `registrations`
--
ALTER TABLE `registrations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `requests`
--
ALTER TABLE `requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `activities`
--
ALTER TABLE `activities`
  ADD CONSTRAINT `activities_ibfk_1` FOREIGN KEY (`offertant_id`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `registrations`
--
ALTER TABLE `registrations`
  ADD CONSTRAINT `registrations_ibfk_1` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`),
  ADD CONSTRAINT `registrations_ibfk_2` FOREIGN KEY (`participant_id`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `requests`
--
ALTER TABLE `requests`
  ADD CONSTRAINT `requests_ibfk_1` FOREIGN KEY (`participant_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `requests_ibfk_2` FOREIGN KEY (`accepted_by`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

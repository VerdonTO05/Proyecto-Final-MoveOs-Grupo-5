<?php

/**
 * @file   logout.php
 * @brief  Endpoint de cierre de sesión.
 *
 * Destruye la sesión activa del usuario y redirige a la página de inicio.
 *
 * @package Access
 * @author  MOVEos Grupo 5
 * @version 1.0.0
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$_SESSION = [];
session_destroy();

header('Location: index.php');
exit;
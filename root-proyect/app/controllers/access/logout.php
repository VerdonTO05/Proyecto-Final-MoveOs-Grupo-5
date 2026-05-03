<?php
/**
 * @file        logout.controller.php
 * @brief       Controlador de cierre de sesión.
 *
 * Destruye completamente la sesión activa del usuario
 * (datos en memoria + cookie de sesión) y lo redirige
 * a la página principal.
 *
 * @package     App\Controllers\Auth
 * @author      MOVEos
 * @version     1.0.0
 *
 * Flujo:
 *  1. Inicia la sesión si no estaba activa (para poder acceder a ella).
 *  2. Vacía el array superglobal $_SESSION.
 *  3. Destruye los datos de sesión en el servidor.
 *  4. Redirige a index.php con HTTP 302.
 */

// Iniciar sesión solo si no hay una activa (necesario para poder destruirla)
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Eliminar todos los datos almacenados en la sesión
$_SESSION = [];

// Destruir la sesión en el servidor
session_destroy();

// Redirigir al usuario a la página de inicio
header('Location: index.php');
exit;
?>
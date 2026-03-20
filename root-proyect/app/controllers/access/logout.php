<?php
/**
 * Controlador de cierre de sesión.
 *
 * Destruye la sesión activa del usuario y lo redirige
 * a la página principal.
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
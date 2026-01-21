<?php
session_start();
session_unset();   // Quita todas las variables de sesión
session_destroy(); // Destruye la sesión
header('Location: ../views/landing.php'); // Redirige al inicio
exit();
<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
require_once __DIR__ . '/../middleware/auth.php';
requireAuth(); // Debe estar logueado para ver esta página

$username = $_SESSION['username'] ?? 'Usuario';
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cuenta Inactiva - MOVEos</title>
    <link rel="stylesheet" href="assets/css/main.css">
    <link rel="icon" type="image/png" href="assets/img/ico/icono.svg">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <script src="assets/js/theme-init.js"></script>
</head>

<body>
    <div class="inactive-page">
        <div class="inactive-card">
            <div class="inactive-icon">
                <i class="fas fa-user-slash" aria-hidden="true"></i>
            </div>

            <h1>Cuenta Inactiva</h1>
            <p class="subtitle">
                Hola, <span class="username"><?= htmlspecialchars($username) ?></span>.
            </p>
            <p class="subtitle">Tu cuenta ha sido desactivada por un administrador.</p>

            <div class="info-box">
                <i class="fas fa-exclamation-circle"></i>
                Mientras tu cuenta esté inactiva, no podrás acceder a las funcionalidades
                de la plataforma: ver actividades, crear publicaciones ni gestionar inscripciones.
                <br><br>
                Si crees que esto es un error, contacta con el administrador de la plataforma.
            </div>

            <div class="inactive-actions">
                <a href="index.php?accion=logout" class="btn-inactive-logout btn-logout">
                    <i class="fas fa-sign-out-alt"></i> Cerrar sesión
                </a>
                <button class="btn-inactive-logout btn-profile" disabled title="Próximamente disponible">
                    <i class="fas fa-comments"></i> Hablar con un administrador
                </button>
            </div>
        </div>
    </div>
</body>

</html>

<!DOCTYPE html>
<html lang="es">
<?php
// Iniciar sesión si no está activa
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../middleware/auth.php';
requireAuth();

?>

<script>
  window.CURRENT_USER = <?= json_encode($user ?? null); ?>;
</script>


<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ver información - MOVEos</title>
    <script src="assets/js/theme-init.js"></script>
    <script src="assets/js/main.js"></script>
    <link rel="stylesheet" href="assets/css/main.css">
    <link rel="icon" type="image/ico" href="assets/img/ico/icono.svg" id="icon.ico">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <script src="assets/js/controllers/see-info-controller.js"></script>
</head>

<body>
    <!-- Switch del tema -->
    <div class="icons">
        <label class="switch top-right">
            <input type="checkbox" id="theme-toggle" role="swicth" aria-checked="false"
                aria-label="Cambiar tema claro/oscuro">
            <span class="slider"></span>
        </label>
    </div>
    <!-- Contenedor principal -->
    <div class="first register">
        <div class="container">
            <button class="close-btn" type="button" aria-label="Cerrar formulario">&times;</button>

            <header class="header-form">
                <h1>Ver datos</h1>
                <p>Puedes visualizar tu información aquí</p>
            </header>

            <div class="register-form">
                <label for="fullname">Nombre Completo</label>
                <div class="input-group">
                    <i class="fas fa-user icon" aria-hidden="true"></i>
                    <p><?= htmlspecialchars($user['full_name']) ?? "" ?></p>
                </div>

                <label for="username">Nombre de Usuario</label>
                <div class="input-group">
                    <i class="fas fa-user icon" aria-hidden="true"></i>
                    <p><?= htmlspecialchars($user['username']) ?? "" ?></p>
                </div>

                <label for="email">Correo Electrónico</label>
                <div class="input-group">
                    <i class="fas fa-envelope icon" aria-hidden="true"></i>
                    <p><?= htmlspecialchars($user['email']) ?? "" ?></p>
                </div>

                <label for="rol">Rol</label>
                <div class="input-group">
                    <i class="fas fa-users icon" aria-hidden="true"></i>
                    <p><?= htmlspecialchars($user['role']) ?? "" ?></p>
                </div>

                <div class="links">
                    <i class="fas fa-link" aria-hidden="true"></i> 
                    <a href="index.php?accion=editUser" aria-label="Editar">Editar</a>
                </div>
            </div>
        </div>
    </div>
</body>

</html>
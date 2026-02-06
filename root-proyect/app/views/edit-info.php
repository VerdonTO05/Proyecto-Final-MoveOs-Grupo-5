<!-- EN PROCESO DE REAJUSTE, OBTENER LOS DATOS DEL USUARIO POR FECTH PARA PODER MOSTRARLOS EN LOS VALUE DE LOS INPUT -->
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

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Editar información - MOVEos</title>
    <script src="assets/js/theme-init.js"></script>
    <script src="assets/js/main.js"></script>
    <link rel="stylesheet" href="assets/css/main.css">
    <link rel="icon" type="image/ico" href="assets/img/ico/icono.svg" id="icon.ico">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <script src="assets/js/controllers/edit-info-controller.js"></script>
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
                <h1>Editar datos</h1>
                <p>Puedes modificar tu información aquí</p>
            </header>

            <!-- Formulario -->
            <form id="edit-form" class="register-form" action="index.php?accion=editUser" method="post">

                <label for="fullname">Nombre Completo</label>
                <div class="input-group">
                    <i class="fas fa-user icon" aria-hidden="true"></i>
                    <input type="text" id="fullname" name="fullname" required aria-required="true" value="<?= htmlspecialchars($user['full_name']) ?? "" ?>">
                </div>

                <label for="username">Nombre de Usuario</label>
                <div class="input-group">
                    <i class="fas fa-user icon" aria-hidden="true"></i>
                    <input type="text" id="username" name="username" required aria-required="true" value="<?= htmlspecialchars($user['username']) ?? "" ?>">
                </div>

                <label for="email">Correo Electrónico</label>
                <div class="input-group">
                    <i class="fas fa-envelope icon" aria-hidden="true"></i>
                    <input type="email" id="email" name="email" required aria-required="true" value="<?= htmlspecialchars($user['email']) ?? "" ?>">
                </div>

                <label>
                    <input type="checkbox" id="changePassword">
                    Cambiar contraseña
                </label>

                <div id="passwordFields">
                    <label for="current_password">Contraseña actual</label>
                    <div class="input-group">
                        <input type="password" id="current_password" name="current_password" placeholder="••••••••">
                    </div>
                    <label for="new_password">Nueva contraseña</label>
                    <div class="input-group">
                        <input type="password" id="new_password" name="new_password" placeholder="••••••••">
                    </div>
                </div>

                <input type="submit" class="submit-btn" name="edit" value="Editar" aria-label="Editar">

                <div class="links">
                    <i class="fas fa-link" aria-hidden="true"></i> 
                    <a href="index.php?accion=viewInfo" aria-label="Ver datos">Ver datos</a>
                </div>
            </form>

        </div>
    </div>
</body>

</html>
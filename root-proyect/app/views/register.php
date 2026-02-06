<!DOCTYPE html>
<html lang="es">

<?php
if(isset($_SESSION['user_id'])){
    header("Location: index.php");
    exit;
}
?>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registrarse - MOVEos</title>
    <script src="assets/js/theme-init.js"></script>
    <script src="assets/js/main.js"></script>
    <link rel="stylesheet" href="assets/css/main.css">
    <link rel="icon" type="image/ico" href="assets/img/ico/icono.svg" id="icon.ico">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <script src="assets/js/controllers/register-controller.js"></script>
</head>

<body>
    <!-- Switch del tema -->
    <div class="icons">
        <label class="switch top-right">
            <input type="checkbox" id="theme-toggle" role="swicth" aria-checked="false" aria-label="Cambiar tema claro/oscuro">
            <span class="slider"></span>
        </label>
    </div>
    <!-- Contenedor principal -->
    <div class="first register">
        <div class="container">
            <button class="close-btn" type="button" aria-label="Cerrar formulario">&times;</button>

            <header class="header-form">
                <h1>BIENVENIDO a MOVEos</h1>
                <p>Crea una cuenta para comenzar tu aventura</p>
            </header>

            <div class="tab-switch" role="tablist">
                <a class="tab-btn" href="index.php?accion=loginView" role="tab" aria-selected="false" tabindex="0">Iniciar sesión</a>
                <a href="#" class="tab-btn active" role="tab" aria-selected="true" tabindex="0">Registrarse</a>
            </div>
            <!-- Formulario -->
            <form id="register-form" class="register-form">

                <label for="fullname">Nombre Completo *</label>
                <div class="input-group">
                    <i class="fas fa-user icon" aria-hidden="true"></i>
                    <input type="text" id="fullname" name="fullname" placeholder="Juan Pérez García" required aria-required="true">
                </div>

                <label for="username">Nombre de Usuario *</label>
                <div class="input-group">
                    <i class="fas fa-user icon" aria-hidden="true"></i>
                    <input type="text" id="username" name="username" placeholder="juanperez" required aria-required="true">
                </div>

                <label for="email">Correo Electrónico *</label>
                <div class="input-group">
                    <i class="fas fa-envelope icon" aria-hidden="true"></i>
                    <input type="email" id="email" name="email" placeholder="juan@email.com" required aria-required="true">
                </div>

                <label for="password">Contraseña *</label>
                <div class="input-group">
                    <input type="password" id="password" name="password" placeholder="••••••••" required aria-required="true" >
                </div>

                <fieldset class="user-type-group" role="radiogroup" aria-labelledby="user-type-label">
                    <div class="option">
                        <input type="radio" id="participante" name="type" value="participante" required aria-required="true" role="radio">
                        <label for="participante" class="user-type-card">
                            <i class="fas fa-users icon" aria-hidden="true"></i>
                            <h3>Participante</h3>
                            <p>Buscar e inscribirse en actividades</p>
                        </label>
                    </div>

                    <div class="option">
                        <input type="radio" id="organizador" name="type" value="organizador" role="radio">
                        <label for="organizador" class="user-type-card">
                            <i class="fas fa-user-cog icon" aria-hidden="true"></i>
                            <h3>Organizador</h3>
                            <p>Publicar y gestionar actividades</p>
                        </label>
                    </div>
                </fieldset>

                <input type="submit" class="submit-btn" name="registrarse" value="Registrarse" aria-label="Registrarse">

            </form>

        </div>
    </div>
</body>

</html>
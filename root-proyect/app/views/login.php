<!DOCTYPE html>
<html lang="es">

<?php
if (isset($_SESSION['user_id'])) {
    header("Location: index.php");
    exit;
}
?>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iniciar Sesión - MOVEos</title>
    <link rel="stylesheet" href="assets/css/main.css">
    <link rel="icon" type="image/ico" href="assets/img/ico/icono.svg" id="icon.ico">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <script src="assets/js/theme-init.js"></script>
    <script src="assets/js/main.js"></script>
    <script type="module" src="assets/js/controllers/login-controller.js"></script>

</head>

<body>
    <!-- Switch del tema -->
    <div class="icons">
        <label class="switch top-right">
            <input type="checkbox" id="theme-toggle" role="switch" aria-checked="false"
                aria-label="Cambiar tema claro/oscuro">
            <span class="slider"></span>
        </label>
    </div>
    <!-- Contenedor principal -->
    <main class="first">
        <div class="container">
            <button class="close-btn" aria-label="Cerrar formulario" type="button">&times;</button>
            <header class="header-form">
                <h1>BIENVENIDO a MOVEos</h1>
                <p>Inicia sesión para continuar tu aventura</p>
            </header>

            <div class="tab-switch" role="tablist">
                <a href="#" class="tab-btn active" role="tab" aria-selected="true">Iniciar Sesión</a>
                <a class="tab-btn" href="index.php?accion=register" role="tab" aria-selected="false">Registrarse</a>
            </div>

            <!-- Formulario -->
            <form id="login-form" class="login-form">
                <input type="hidden" name="accion" value="login">

                <label for="username">Nombre de Usuario</label>
                <div class="input-group">
                    <i class="fas fa-user icon" aria-hidden="true"></i>
                    <input type="text" id="username" name="username" placeholder="tu_usuario" required
                        aria-required="true">
                </div>

                <label for="password">Contraseña</label>
                <div class="input-group">
                    <i class="fas fa-lock icon" aria-hidden="true"></i>
                    <input type="password" id="password" name="password" placeholder="••••••••" required
                        aria-required="true">
                </div>

                <a href="index.php?accion=forgot-password" class="forgot-password" role="button" tabindex="0">¿Olvidaste
                    tu contraseña?</a>

                <input type="submit" class="submit-btn" name="login" value="Iniciar Sesión" aria-label="Iniciar sesión">
            </form>
        </div>
    </main>
</body>

</html>
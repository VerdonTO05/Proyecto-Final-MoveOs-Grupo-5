<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iniciar Sesión - MOVEos</title>

    <link rel="stylesheet" href="../../public/assets/css/main.css">


    <link rel="icon" type="image/ico" href="../../public/assets/img/ico/icono.svg" id="icon.ico">

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">

    <script src="../../public/assets/js/theme-init.js"></script>
    <script src="../../public/assets/js/main.js"></script>



</head>

<body>
    <!-- Switch del tema -->
    <div class="icons">
        <label class="switch top-right">
            <input type="checkbox" id="theme-toggle">
            <span class="slider"></span>
        </label>
    </div>
    <!-- Contenedor principal -->
    <div class="first">
        <div class="container">
            <button class="close-btn">&times;</button>
            <header class="header-form">
                <h1>BIENVENIDO a MOVEos</h1>
                <p>Inicia sesión para continuar tu aventura</p>
            </header>

            <div class="tab-switch">
                <button class="tab-btn active">Iniciar Sesión</button>
                <a href="register.php">
                    <button class="tab-btn">Registrarse</button>
                </a>
            </div>

            <!-- Formulario -->
            <form id="login-form" class="login-form" action="../controllers/login-controller.php">

                <label for="username">Nombre de Usuario</label>
                <div class="input-group">
                    <i class="fas fa-user icon"></i> <input type="text" id="username" name="username"
                        placeholder="tu_usuario" required>
                </div>

                <label for="password">Contraseña</label>
                <div class="input-group">
                    <i class="fas fa-lock icon"></i> <input type="password" id="password" name="password"
                        placeholder="••••••••" required>
                </div>

                <a href="#" class="forgot-password">¿Olvidaste tu contraseña?</a>

                <input type="submit" class="submit-btn" name="login" value="Iniciar Sesión">



            </form>
            <script src="../../public/assets/js/controllers/login-controller.js"></script>
        </div>
    </div>
</body>

</html>
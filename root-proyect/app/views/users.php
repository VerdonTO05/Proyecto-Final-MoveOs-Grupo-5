<!-- Ventana de prueba, se usará para el rol administrador, no en el usuario normal -->
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lista de Usuarios - MOVEos</title>

    <script src="../../public/assets/js/theme-init.js"></script>
    <script src="../../public/assets/js/main.js"></script>

    <script src="../controllers/users-controller.js"></script>

    <link rel="stylesheet" href="../../public/assets/css/main.css">
    <link rel="icon" type="image/ico" href="../../public/assets/img/ico/icono.svg" id="icon.ico">
    
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>

<body>
    <div class="icons">
        <label class="switch">
            <input type="checkbox" id="theme-toggle">
            <span class="slider"></span>
        </label>
    </div>
    <!-- Visualizacion de usuarios registrados en LocalStorage -->
    <div class="container">
        <header class="header">
            <h1>USUARIOS REGISTRADOS</h1>
            <p>Esta es la lista de usuarios guardados.</p>
        </header>
        <ul id="listaUsuarios" class="user-list"></ul>
        <a href="register-controller.php">
            <button class="submit-btn">
                Volver al Registro
            </button>
        </a>
    </div>
</body>

</html>
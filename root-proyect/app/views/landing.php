<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MOVEos - Descubre y comparte experiencias únicas</title>

    <script src="../models/header-footer.js"></script>
    <script src="../models/steps.js"></script>
    <script src="../models/how-it-works.js"></script>
    <script src="../../public/assets/js/controllers/landing-controller.js"></script>

    <script src="../../public/assets/js/theme-init.js"></script>
    <script src="../../public/assets/js/main.js"></script>

    <link rel="stylesheet" href="../../public/assets/css/main.css">

    <link rel="icon" type="image/png" href="../../public/assets/img/ico/icono.svg">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>

<body>
    <div id="alert-container"></div>
    <!-- Encabezado -->
    <div id="header"></div>

    <!-- Contenido principal -->
    <main>

        <!-- Sección principal -->
        <section>
            <div class="slogan">
                <i class="fas fa-star"></i>
                <p>Dinamismo · Cambio · Participación Activa</p>
            </div>

            <h1>Descubre y comparte experiencias únicas</h1>
            <p>
                MOVEos conecta personas con actividades extraordinarias.
                Desde excursiones en naturaleza hasta talleres creativos,
                encuentra tu próxima aventura.
            </p>

            <div class="options">
                <?php
                session_start();
                if (isset($_SESSION['role']) && $_SESSION['role'] == 'organizador') {
                    echo '<a id="a-explore" href="home.php">';
                    echo '<button id="button-explore">Explorar Peticiones</button></a>';
                    echo '<button id="button-post">Publicar Actividad</button>';
                } else {
                    echo '<a id="a-explore" href="home.php">';
                    echo '<button id="button-explore">Explorar Actividades</button></a>';
                    echo '<button id="button-post">Publicar Petición</button>';
                } ?>
            </div>
        </section>

        <!-- Características principales -->
        <section class="features">
            <div class="feature-card">
                <div class="icon-circle">
                    <i class="fas fa-calendar-alt"></i>
                </div>
                <h3>Variedad de Actividades</h3>
                <p>Excursiones, clases, talleres y eventos para todos los gustos e intereses</p>
            </div>

            <div class="feature-card">
                <div class="icon-circle">
                    <i class="fas fa-users"></i>
                </div>
                <h3>Comunidad Activa</h3>
                <p>Conecta con organizadores apasionados y participantes entusiastas</p>
            </div>

            <div class="feature-card">
                <div class="icon-circle">
                    <i class="fas fa-shield-alt"></i>
                </div>
                <h3>Contenido Verificado</h3>
                <p>Todas las actividades son revisadas para garantizar calidad y seguridad</p>
            </div>
        </section>

        <!-- Estadísticas -->
        <section>
            <div>
                <h2>500+</h2>
                <p>Actividades</p>
            </div>
            <div>
                <h2>2.5k+</h2>
                <p>Participantes</p>
            </div>
            <div>
                <h2>150+</h2>
                <p>Organizadores</p>
            </div>
            <div>
                <h2>4.8</h2>
                <p>Valoración Media</p>
            </div>
        </section>

        <div id="tutorial-container"></div>

    </main>

    <!-- Pie de página -->
    <div id="footer"></div>

</body>

</html>
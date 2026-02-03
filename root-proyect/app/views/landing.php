<!DOCTYPE html>
<html lang="es">
<?php
// Iniciar sesión si no está activa
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../middleware/auth.php';

$role = $_SESSION['role'] ?? null;
$user = getCurrentUser();
?>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MOVEos - Descubre y comparte experiencias únicas</title>

    <script src="../app/models/header-footer.js"></script>
    <script src="../app/models/steps.js"></script>
    <script src="../app/models/how-it-works.js"></script>

    <script src="assets/js/theme-init.js"></script>
    <script src="assets/js/main.js"></script>

    <link rel="stylesheet" href="assets/css/main.css">

    <script>
        // Definir usuario ANTES de cargar landing-controller.js
        window.CURRENT_USER = <?= json_encode($user ?: null); ?>;
    </script>
    <script>
        // Verificar si se creó una actividad exitosamente
        document.addEventListener('DOMContentLoaded', () => {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('status') === 'activity_created') {
                alert('¡Actividad creada con éxito! Tu actividad ha sido enviada y está esperando la aprobación del administrador.');
                // Limpiar el parámetro de la URL
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        });
    </script>

    <!-- Cargar landing-controller.js DESPUÉS de definir CURRENT_USER -->
    <script src="assets/js/controllers/landing-controller.js"></script>

    <link rel="icon" type="image/png" href="assets/img/ico/icono.svg">
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
                $textoExplorar = ($role === 'organizador') ? 'Explorar Peticiones' : 'Explorar Actividades';
                $textoBoton = ($role === 'organizador') ? 'Publicar Actividad' : 'Publicar Petición';

                echo '<a id="a-explore" href="index.php?accion=seeActivities">
                <button id="button-explore">' . $textoExplorar . '</button></a>';

                if ($role) {
                    echo '<button id="button-post">'.$textoBoton.'</button>';
                } 
                ?>
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

        <!-- Añadir video tutorial -->
    </main>

    <!-- Pie de página -->
    <div id="footer"></div>

</body>

</html>
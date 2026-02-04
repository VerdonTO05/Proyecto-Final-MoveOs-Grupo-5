<!DOCTYPE html>
<html lang="es">
<?php
// Iniciar sesión si no está activa
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Proteger la página - solo administradores
require_once __DIR__ . '/../middleware/auth.php';
requireRole('administrador');

$user = getCurrentUser();
?>
<script>
    window.CURRENT_USER = <?= json_encode($user ?: null); ?>;
</script>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MOVEos - Explora Actividades</title>
    <script src="../app/models/header-footer.js"></script>
    <script src="assets/js/theme-init.js"></script>
    <script src="assets/js/main.js"></script>

    <link rel="stylesheet" href="assets/css/main.css">

    <link rel="icon" type="image/png" href="assets/img/ico/icono.svg" if="icon.ico">

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <script src="assets/js/controllers/all-post-controller.js"></script>
</head>

<body>
    <div id="alert-container"></div>
    <!-- Encabezado -->
    <div id="header"></div>

    <section class="tab-switch">
        <button class="tab-btn control active" data-type="activities">
            Actividades
        </button>
        <button class="tab-btn control" data-type="requests">
            Peticiones
        </button>
    </section>


    <!-- Contenido principal -->
    <main class="main-content container-home">
        <section class="explore">
            <h1 id="view-title">Explora Actividades</h1>
            <p id="view-subtitle">Los organizadores han añadido actividades para los próximos días</p>

            <div class="filters">
                <input id="searchInput" type="text" placeholder="Buscar actividades..." />
                <select>
                    <option>Todas las ubicaciones</option>
                </select>
                <button class="btn-filters">Más Filtros</button>
            </div>

            <section class="grid-activities" id="gridActivities"></section>
        </section>
    </main>
</body>

</html>
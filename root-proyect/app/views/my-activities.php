<!DOCTYPE html>
<html lang="es">
<?php
// Iniciar sesión si no está activa
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Proteger la página - solo administradores
require_once __DIR__ . '/../middleware/auth.php';
requireAnyRole(['organizador', 'participante']);

$user = getCurrentUser();
?>
<script>
    window.CURRENT_USER = <?= json_encode($user ?: null); ?>;
</script>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MOVEos - Explora <?= $user['role'] == 'organizador' ? 'Mis Actividades' : 'Mis Peticiones' ?></title>
    <script src="../app/models/header-footer.js"></script>
    <script src="assets/js/theme-init.js"></script>
    <script src="assets/js/main.js"></script>
    <link rel="stylesheet" href="assets/css/main.css">
    <link rel="icon" type="image/png" href="assets/img/ico/icono.svg" if="icon.ico">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <script src="assets/js/controllers/my-activities-controller.js"></script>
</head>

<body>
    <div id="alert-container" aria-live="polite"></div>
    <!-- Encabezado -->
    <div id="header"></div>
    <!-- Contenido principal -->
    <main class="main-content container-home" aria-labelledby="view-title">
        <section class="explore" aria-labelledby="view-title">
            <h1 id="view-title">
                <?php if ($user['role'] == 'organizador') {
                    echo 'Mis Actividades';
                } else {
                    echo 'Mis Peticiones';
                } ?></h1>
            <p id="view-subtitle">Ajusta tus publicaciones para llamar la atención de más usuarios</p>

            <div class="filters" role="region" aria-label="Filtros de búsqueda">
                <input id="searchInput" type="text" placeholder="Buscar actividades..." />
                <select>
                    <option>Todas las ubicaciones</option>
                </select>
                <button class="btn-filters" aria-label="Más filtros">Más Filtros</button>
            </div>

            <section class="grid-activities" id="gridActivities" aria-live="polite" aria-label="<?= $user['role'] == 'organizador' ? 'Listado de mis actividades' : 'Listado de mis peticiones' ?>"></section>
        </section>
    </main>
    <div id="footer"></div>
    <div id="modal-container"></div>
</body>

</html>
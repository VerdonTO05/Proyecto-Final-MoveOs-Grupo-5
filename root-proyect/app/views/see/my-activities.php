<!DOCTYPE html>
<html lang="es">
<?php
// Iniciar sesión si no está activa
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Proteger la página - solo administradores
require_once __DIR__ . '/../../middleware/auth.php';
requireActiveUser();
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
    <script src="assets/js/utils.js"></script>
    <script src="assets/js/utils/header-footer.js"></script>
    <script src="assets/js/theme-init.js"></script>
    <script src="assets/js/main.js"></script>
    <link rel="stylesheet" href="assets/css/main.css">
    <link rel="icon" type="image/png" href="assets/img/ico/icono.svg" if="icon.ico">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <script src="assets/js/controllers/see/my-activities-controller.js"></script>
    <script src="assets/js/controllers/chat/chat-controller.js"></script>
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
                } ?>
            </h1>
            <p id="view-subtitle">Ajusta tus publicaciones para llamar la atención de más usuarios</p>

            <div class="filters">
                <div id="filterInput">
                    <input type="text" id="filterValue" placeholder="Buscar..." />
                </div>
                <select name="filterType" id="filterType">
                    <option value="title">Título</option>
                    <option value="date">Fecha</option>
                    <option value="category">Categoría</option>
                </select>
            </div>

            <div class="grid-activities" id="gridActivities" aria-live="polite"
                aria-label="<?= $user['role'] == 'organizador' ? 'Listado de mis actividades' : 'Listado de mis peticiones' ?>">
            </div>
            <button id="toggleFinished" class="btn">
                <?php
                if ($user['role'] == 'organizador') {
                    echo 'Ver actividades terminadas';
                } else {
                    echo 'Ver peticiones terminadas';
                }
                ?>
            </button>
            <div class="grid-activities" id="gridActivitiesFinished" aria-live="polite"
                aria-label="<?= $user['role'] == 'organizador' ? 'Listado de mis actividades terminadas' : 'Listado de mis peticiones terminadas' ?>">
            </div>
        </section>

    </main>
    <div id="footer"></div>
    <div id="modal-container"></div>
</body>

</html>
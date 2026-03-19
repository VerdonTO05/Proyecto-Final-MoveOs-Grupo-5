<!DOCTYPE html>
<html lang="es">
<?php
// Iniciar sesión si no está activa
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

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
    <script src="assets/js/utils/header-footer.js"></script>
    <script src="assets/js/theme-init.js"></script>
    <script src="assets/js/main.js"></script>
    <link rel="stylesheet" href="assets/css/main.css">
    <link rel="icon" type="image/png" href="assets/img/ico/icono.svg" if="icon.ico">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <script src="assets/js/utils.js"></script>
    <script src="assets/js/controllers/my-registrations-controller.js"></script>
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
                    echo 'Mis Peticiones pendientes';
                } else {
                    echo 'Mis Inscripciones';
                } ?>
            </h1>
            <p id="view-subtitle">Organizate y no te pierdas ninguna de tus actividades</p>

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

            <div class="grid-activities" id="gridRegistrations" aria-live="polite"
                aria-label="<?= $user['role'] == 'organizador' ? 'Listado de mis peticiones pendientes' : 'Listado de mis inscripciones' ?>">
            </div>
            <button id="toggleFinished" class="btn">
                <?php
                if ($user['role'] == 'organizador') {
                    echo 'Ver peticiones terminadas';
                } else {
                    echo 'Ver inscripciones terminadas';
                }
                ?>
            </button>
            <div class="grid-activities" id="gridRegistrationsFinished" aria-live="polite"
                aria-label="<?= $user['role'] == 'organizador' ? 'Listado de mis peticiones terminadas' : 'Listado de mis inscripciones terminadas' ?>">
            </div>
        </section>
        <div id="activityModal" class="modalHome">
            <div class="modal-content">
                <span class="modal-close">&times;</span>

                <!-- Cabecera con título y categoría -->
                <div class="modal-header">
                    <h2 class="modal-title"></h2>
                    <span class="category"></span>
                </div>

                <!-- Tabs -->
                <div class="modal-tabs">
                    <button class="tab-btn active" data-tab="details">Detalles</button>
                    <button class="tab-btn" data-tab="chat">Chat Grupal</button>
                </div>

                <!-- Cuerpo del modal -->
                <div class="modal-body">
                    <div class="modal-image"></div>
                    <div class="modal-description"></div>
                    <div class="modal-info"></div>
                    <div class="modal-info-aditional"></div>
                </div>
            </div>
        </div>
    </main>
    <div id="footer"></div>
    <div id="modal-container"></div>
</body>

</html>
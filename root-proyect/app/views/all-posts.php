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
    <title>MOVEos - Explorar </title>
    <script type="module" src="../app/models/header-footer.js"></script>
    <script src="assets/js/theme-init.js"></script>
    <script src="assets/js/main.js"></script>
    <link rel="stylesheet" href="assets/css/main.css">
    <link rel="icon" type="image/png" href="assets/img/ico/icono.svg" if="icon.ico">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <script type="module" src="assets/js/controllers/all-post-controller.js"></script>
</head>

<body>
    <div id="alert-container" aria-live="polite"></div>
    <!-- Encabezado -->
    <div id="header"></div>

    <section class="tab-switch-home" role="tablist" aria-label="Opciones de vista">
        <button class="tab-btn control active" data-type="activities" role="tab" aria-selected="true" tabindex="0">
            Actividades
        </button>
        <button class="tab-btn control" data-type="requests" role="tab" aria-selected="false" tabindex="0">
            Peticiones
        </button>
    </section>


    <!-- Contenido principal -->
    <main class="main-content container-home">
        <section class="explore" aria-labelledby="view-title">
            <h1 id="view-title">Explora Actividades</h1>
            <p id="view-subtitle">Los organizadores han añadido actividades para los próximos días</p>

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

            <div class="grid-activities" id="gridActivities" aria-live="polite" aria-label="Listado de actividades">
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
</body>

</html>
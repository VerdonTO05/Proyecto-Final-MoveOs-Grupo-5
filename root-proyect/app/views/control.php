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
    <title>Panel de Administrador</title>
    <link rel="icon" type="image/png" href="assets/img/ico/icono.svg">

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">

    <script src="assets/js/theme-init.js"></script>
    <script src="assets/js/main.js"></script>
    <script src="assets/js/alerts.js"></script>
    <script src="assets/js/controllers/control-controller.js"></script>
    <link rel="stylesheet" href="assets/css/main.css">
</head>

<body>
    <div id="header"></div>

    <div class="container-control">

        <!-- Header -->
        <header class="header">
            <div class="header-icon">
                <i class="fas fa-shield-alt"></i>
            </div>
            <div class="header-content">
                <h1>Panel de Administrador</h1>
                <p>Gestiona y modera las actividades de la plataforma</p>
            </div>
        </header>


        <!-- Stats - Se llenarán dinámicamente -->
        <section class="stats">
            <div class="card pending">
                <i class="fas fa-clock icon"></i>
                <h2>...</h2>
                <p>Pendientes</p>
                <small>Requieren revisión</small>
            </div>

            <div class="card approved">
                <i class="fas fa-check-circle icon"></i>
                <h2>...</h2>
                <p>Aprobadas</p>
                <small>Activas en la plataforma</small>
            </div>

            <div class="card rejected">
                <i class="fas fa-times-circle icon"></i>
                <h2>...</h2>
                <p>Rechazadas</p>
                <small>No cumplen requisitos</small>
            </div>

            <div class="card total">
                <i class="fas fa-circle-info icon"></i>
                <h2>...</h2>
                <p>Total</p>
                <small>Todas las actividades</small>
            </div>
        </section>

        <!-- Tabs -->
        <section class="tab-switch">
            <button class="tab-btn control active">Actividades <span>...</span></button>
            <button class="tab-btn control">Peticiones <span>...</span></button>
        </section>

        <!-- Activity Cards - Se llenarán dinámicamente -->
        <div class="activities">
            <p style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                <i class="fas fa-spinner fa-spin"></i> Cargando actividades pendientes...
            </p>
        </div>
    </div>
    <!-- Contenedor de modal -->
    <div id="modal-container"></div>
    <div id="footer"></div>
</body>

</html>
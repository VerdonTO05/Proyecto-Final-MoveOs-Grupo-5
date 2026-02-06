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
    <script src="../app/models/header-footer.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <script src="assets/js/theme-init.js"></script>
    <script src="assets/js/main.js"></script>
    <script src="assets/js/controllers/control-controller.js"></script>
    <link rel="stylesheet" href="assets/css/main.css">
</head>

<body>
    <div id="header"></div>

    <div class="container-control">

        <!-- Header -->
        <header class="header">
            <div class="header-icon" aria-hidden="true">
                <i class="fas fa-shield-alt"></i>
            </div>
            <div class="header-content">
                <h1>Panel de Administrador</h1>
                <p>Gestiona y modera las actividades de la plataforma</p>
            </div>
        </header>


        <!-- Stats - Se llenarán dinámicamente -->
        <section class="stats" aria-label="Resumen de actividades">
            <div class="card pending" role="region" aria-labelledby="pending-title">
                <i class="fas fa-clock icon" aria-hidden="true"></i>
                <h2>...</h2>
                <p>Pendientes</p>
                <small>Requieren revisión</small>
            </div>

            <div class="card approved" role="region" aria-labelledby="approved-title">
                <i class="fas fa-check-circle icon" aria-hidden="true"></i>
                <h2>...</h2>
                <p>Aprobadas</p>
                <small>Activas en la plataforma</small>
            </div>

            <div class="card rejected" role="region" aria-labelledby="rejected-title">
                <i class="fas fa-times-circle icon" aria-hidden="true"></i>
                <h2>...</h2>
                <p>Rechazadas</p>
                <small>No cumplen requisitos</small>
            </div>

            <div class="card total" role="region" aria-labelledby="total-title">
                <i class="fas fa-circle-info icon" aria-hidden="true"></i>
                <h2>...</h2>
                <p>Total</p>
                <small>Todas las actividades</small>
            </div>
        </section>

        <!-- Tabs -->
        <section class="tab-switch" role="tablist" aria-label="Opciones de vista de actividades">
            <button class="tab-btn control active" role="tab" aria-selected="true" tabindex="0">Actividades <span aria-hidden="true">...</span></button>
            <button class="tab-btn control" role="tab" aria-selected="false" tabindex="0">Peticiones <span aria-hidden="true">...</span></button>
        </section>

        <!-- Activity Cards - Se llenarán dinámicamente -->
        <div class="activities" aria-live="polite" aria-label="Lista de publicaciones pendientes">
            <p role="status"><i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Cargando actividades pendientes...</p>
        </div>
    </div>
    <!-- Contenedor de modal -->
    <div id="modal-container"></div>
</body>

</html>
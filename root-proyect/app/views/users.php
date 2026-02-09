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
$role = $_SESSION['role'] ?? null;
$user = getCurrentUser();
?>
<script>
    window.CURRENT_USER = <?= json_encode($user ?: null); ?>;
</script>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lista de Usuarios - MOVEos</title>
    <script src="../app/models/header-footer.js"></script>
    <script src="assets/js/controllers/users-controller.js"></script>
    <script src="assets/js/theme-init.js"></script>
    <script src="assets/js/main.js"></script>
    <link rel="stylesheet" href="assets/css/main.css">
    <link rel="icon" type="image/png" href="assets/img/ico/icono.svg">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>

<body>
    <div id="header"></div>

    <div class="container-control">
        <!-- Header -->
        <header class="header">
            <div class="header-icon" aria-hidden="true">
                <i class="fas fa-users" aria-hidden="true"></i>
            </div>
            <div class="header-content">
                <h1>Panel de Usuarios</h1>
                <p>Gestión y moderación de la información de usuarios.</p>
            </div>
        </header>

        <!-- User Cards - Se llenarán dinámicamente -->
        <div class="users" aria-live="polite" aria-label="Lista de usuarios registardos">
            <p role="status"><i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Cargando usuarios registrados...
            </p>
        </div>
    </div>
    <!-- Contenedor de modal -->
    <div id="modal-container"></div>
</body>


</html>
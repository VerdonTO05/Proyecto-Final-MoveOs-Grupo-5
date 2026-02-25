<!DOCTYPE html>
<html lang="es">
<?php
// Iniciar sesión si no está activa
if (session_status() === PHP_SESSION_NONE) {
  session_start();
}

require_once __DIR__ . '/../middleware/auth.php';
requireAuth();

$role = $_SESSION['role'] ?? null;
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
  <script src="assets/js/controllers/home-controller.js"></script>
</head>

<body>
  <div id="alert-container" aria-live="polite"></div>
  <!-- Encabezado -->
  <div id="header"></div>

  <!-- Contenido principal -->
  <main class="main-content container-home">
    <section class="explore" aria-labelledby="explore-title">
      <?php if ($role == 'participante') { ?>
        <h1>Explora Actividades</h1>
        <p>Descubre experiencias únicas cerca de ti</p>
      <?php } else { ?>
        <h1>Explora Peticiones</h1>
        <p>Cumple el sueño de otras personas</p>
      <?php } ?>

      <!-- Filtros -->
      <div class="filters">
        <?php if ($role == 'participante') { ?>
          <input type="text" placeholder="Buscar actividades..." />
        <?php } else { ?>
          <input type="text" placeholder="Buscar peticiones..." />
        <?php } ?>
        <select>
          <option>Todas las ubicaciones</option>
        </select>
        <button class="btn-filters" aria-label="Más filtros">Más Filtros</button>
      </div>
      <!-- Actividades -->
      <section class="grid-activities" id="gridActivities" aria-live="polite"
        aria-label="<?= $role == 'participante' ? 'Listado de actividades' : 'Listado de peticiones' ?>">
        <button id="btn-activities" class="close-btn" aria-label="Obtener actividades" type="button">Obtener
          actividades</button>
      </section>
      </div>
    </section>
    <div id="activityModal" class="modal">
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

</body>

</html>
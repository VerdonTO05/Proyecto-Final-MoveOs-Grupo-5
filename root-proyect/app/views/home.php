<!DOCTYPE html>
<html lang="es">
<?php
// Iniciar sesión si no está activa
if (session_status() === PHP_SESSION_NONE) {
  session_start();
}

require_once __DIR__ . '/../middleware/auth.php';
requireAuth('/app/views/login.php');

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
  <script src="../models/header-footer.js"></script>
  <script src="../../public/assets/js/theme-init.js"></script>
  <script src="../../public/assets/js/main.js"></script>

  <link rel="stylesheet" href="../../public/assets/css/main.css">

  <link rel="icon" type="image/png" href="../../public/assets/img/ico/icono.svg" if="icon.ico">

  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">

  <script src="../models/activities.js"></script>
  <script src="../models/activity.js"></script>


  <script src="../../public/assets/js/controllers/landing-controller.js"></script>
</head>

<body>
  <div id="alert-container"></div>
  <!-- Encabezado -->
  <div id="header"></div>

  <!-- Contenido principal -->
  <main class="main-content container-home">
    <section class="explore">
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
        <button class="btn-filters">Más Filtros</button>
      </div>
      <!-- Actividades -->
      <section class="grid-activities" id="gridActivities"></section>
      </div>
    </section>
  </main>

</body>

</html>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MOVEos - Explora Actividades</title>
  <!-- Archivos necesarios -->
  <script src="../../models/header-footer.js"></script>
  <script src="../js/theme-init.js"></script>
  <script src="../js/main.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
  <link rel="stylesheet" href="../css/home.css">
  <link rel="icon" type="image/ico" href="../ico/icono.png" id="icon.ico">
  <script src="../../models/activity.js"></script>
  <script src="../../models/activities.js"></script>
  <script src="../../controllers/home-controller.js"></script>
</head>

<body>
  <!-- Encabezado -->
  <div id="header"></div>

  <!-- Contenido principal -->
  <main class="main-content container">
    <section class="explore">
      <h1>Explora Actividades</h1>
      <p>Descubre experiencias únicas cerca de ti</p>

      <!-- Filtros -->
      <div class="filters">
        <input type="text" placeholder="Buscar actividades..." />
        <select>
          <option>Todas las ubicaciones</option>
        </select>
        <button class="btn-filters">Más Filtros</button>
      </div>
      <!-- Actividades -->
      <section class="grid-activities" id="gridActivities"></section>
      </div>
    </section>
    <div>
      <button id="btn_users">Mostrar Usuarios</button>
    </div>
  </main>

  <!-- Pie de página -->
  <div id="footer"></div>
</body>

</html>
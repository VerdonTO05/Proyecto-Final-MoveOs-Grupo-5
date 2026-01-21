<!DOCTYPE html>
<html lang="es">

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


  <!-- <script src="../controllers/home-controller.js"></script> -->
</head>

<body>
  <div id="alert-container"></div>
  <!-- Encabezado -->
  <div id="header"></div>

  <!-- Contenido principal -->
  <main class="main-content container-home">
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
    <?php
    session_start();
    if (isset($_SESSION['rol']) and $_SESSION['rol'] === 'administrador') {

      ?>

      <div>
        <button id="btn_users" onclick="window.location.href = '../controllers/users-list.php'">Mostrar Usuarios</button>
      </div>
      <?php

    }


    ?>

  </main>

</body>

</html>
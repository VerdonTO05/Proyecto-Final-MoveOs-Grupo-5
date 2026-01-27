<?php
// Script para actualizar las rutas de imágenes en la base de datos
// Ejecutar este archivo navegando a: 
// http://localhost/Proyecto_MOVEos/Proyecto-Final-MoveOs-Grupo-5/root-proyect/database/fix-images.php

require_once __DIR__ . '/../config/database.php';

echo "<h1>Actualizando rutas de imágenes...</h1>";

try {
    $database = new Database();
    $db = $database->getConnection();

    // Actualizar actividad de senderismo
    $stmt = $db->prepare("UPDATE activities SET image_url = 'uploads/activities/ruta.jpg' WHERE title LIKE '%Senderismo%'");
    $stmt->execute();
    echo "<p>✅ Actualizada: Ruta de Senderismo</p>";

    // Actualizar actividad de yoga
    $stmt = $db->prepare("UPDATE activities SET image_url = 'uploads/activities/yoga.jpg' WHERE title LIKE '%Yoga%'");
    $stmt->execute();
    echo "<p>✅ Actualizada: Clase de Yoga</p>";

    // Actualizar actividad de cocina
    $stmt = $db->prepare("UPDATE activities SET image_url = 'uploads/activities/cocina.jpg' WHERE title LIKE '%Cocina%'");
    $stmt->execute();
    echo "<p>✅ Actualizada: Clase de Cocina</p>";

    // Actualizar actividad de bicicleta
    $stmt = $db->prepare("UPDATE activities SET image_url = 'uploads/activities/bicicleta.jpg' WHERE title LIKE '%Bicicleta%'");
    $stmt->execute();
    echo "<p>✅ Actualizada: Ruta en Bicicleta</p>";

    // Actualizar actividades pendientes sin imagen
    $stmt = $db->prepare("UPDATE activities SET image_url = NULL WHERE image_url IN ('fotografia.jpg', 'vinos.jpg')");
    $stmt->execute();
    echo "<p>✅ Actividades pendientes configuradas para usar placeholder</p>";

    // Mostrar resultados
    echo "<h2>Resultados:</h2>";
    echo "<table border='1' cellpadding='10'>";
    echo "<tr><th>ID</th><th>Título</th><th>Imagen</th><th>Estado</th></tr>";

    $stmt = $db->query("SELECT id, title, image_url, state FROM activities ORDER BY id");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "<tr>";
        echo "<td>{$row['id']}</td>";
        echo "<td>{$row['title']}</td>";
        echo "<td>" . ($row['image_url'] ? $row['image_url'] : 'NULL (usará placeholder)') . "</td>";
        echo "<td>{$row['state']}</td>";
        echo "</tr>";
    }
    echo "</table>";

    echo "<h2 style='color: green;'>✅ Actualización completada!</h2>";
    echo "<p><strong>Ahora recarga la página home.php para ver los cambios.</strong></p>";
    echo "<p><a href='../views/home.php'>Ir a Home</a></p>";

} catch (PDOException $e) {
    echo "<h2 style='color: red;'>❌ Error:</h2>";
    echo "<p>" . $e->getMessage() . "</p>";
}
?>
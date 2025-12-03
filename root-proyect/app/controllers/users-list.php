<?php
try {
    $bd = new PDO('mysql:host=localhost;dbname=moveos;charset=utf8', 'root', '');
    // Configuramos para que PDO lance excepciones en caso de error SQL
    $bd->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $consulta = $bd->prepare('SELECT * FROM users');
    $consulta->execute();

    $datos = $consulta->fetchAll(PDO::FETCH_ASSOC); // Usamos FETCH_ASSOC para asegurar indices por nombre

    echo "<table border=1>";
    echo "<tr>";
    echo "<th>ID</th>";
    echo "<th>Nombre completo</th>";
    echo "<th>Email</th>";
    echo "<th>Username</th>";
    echo "<th>Password_HASH</th>"; // Ojo: Por seguridad, usualmente no se muestra esto
    echo "<th>ROL</th>";
    echo "<th>FECHA DE CREACION</th>";
    echo "</tr>";

    // EL CAMBIO IMPORTANTE ESTÁ AQUÍ ABAJO:
    foreach ($datos as $dato) {
        echo "<tr>";
        // Usamos $dato (singular) en lugar de $datos (plural)
        echo "<td>" . $dato['id'] . "</td>";
        echo "<td>" . $dato['full_name'] . "</td>";
        echo "<td>" . $dato['email'] . "</td>";
        echo "<td>" . $dato['username'] . "</td>";
        echo "<td>" . $dato['password_hash'] . "</td>";
        echo "<td>" . $dato['role_id'] . "</td>"; // Asegúrate que en la BD se llame role_id
        echo "<td>" . $dato['created_at'] . "</td>";
        echo "</tr>";
    }
    echo "</table>";

} catch (Exception $e) {
    // Agregué 'echo' para que puedas ver el error si ocurre
    echo "Error: " . $e->getMessage();
}
?>
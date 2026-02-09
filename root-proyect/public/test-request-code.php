<?php
/**
 * Script de prueba para verificar el endpoint de request-code
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Prueba de Envío de Código</h1>";

// Simular POST como si viniera del formulario
$_POST['accion'] = 'requestCode';
$_POST['email'] = 'irene@gmail.com'; // Cambia por un email que exista en tu BD

echo "<h2>Datos enviados:</h2>";
echo "Email: " . $_POST['email'] . "<br>";

echo "<h2>Respuesta del servidor:</h2>";

// Incluir el controlador
ob_start();
include __DIR__ . '/../app/controllers/request-code-controller.php';
$output = ob_get_clean();

echo "<pre>";
echo htmlspecialchars($output);
echo "</pre>";

echo "<h2>Análisis:</h2>";
$json = json_decode($output, true);
if ($json) {
    if ($json['success']) {
        echo "✅ Código enviado exitosamente<br>";
        echo "Mensaje: " . $json['message'] . "<br>";
    } else {
        echo "❌ Error al enviar código<br>";
        echo "Mensaje: " . $json['message'] . "<br>";
    }
} else {
    echo "❌ Respuesta no es JSON válido<br>";
    echo "Posibles errores de PHP arriba ^<br>";
}

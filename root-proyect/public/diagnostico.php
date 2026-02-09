<?php
/**
 * Script de diagnóstico para verificar configuración
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Diagnóstico del Sistema</h1>";

// 1. Verificar autoload de Composer
echo "<h2>1. PHPMailer</h2>";
if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    require_once __DIR__ . '/../vendor/autoload.php';
    echo "✅ Autoload encontrado<br>";

    if (class_exists('PHPMailer\PHPMailer\PHPMailer')) {
        echo "✅ PHPMailer disponible<br>";
    } else {
        echo "❌ PHPMailer NO disponible<br>";
    }
} else {
    echo "❌ Autoload NO encontrado<br>";
}

// 2. Verificar conexión a base de datos
echo "<h2>2. Base de Datos</h2>";
try {
    require_once __DIR__ . '/../config/database.php';
    $database = new Database();
    $pdo = $database->getConnection();
    echo "✅ Conexión a BD exitosa<br>";

    // 3. Verificar tabla password_reset_codes
    echo "<h2>3. Tabla password_reset_codes</h2>";
    $stmt = $pdo->query("SHOW TABLES LIKE 'password_reset_codes'");
    if ($stmt->rowCount() > 0) {
        echo "✅ Tabla password_reset_codes existe<br>";

        // Mostrar estructura
        $cols = $pdo->query("DESCRIBE password_reset_codes");
        echo "<table border='1'><tr><th>Campo</th><th>Tipo</th></tr>";
        while ($col = $cols->fetch(PDO::FETCH_ASSOC)) {
            echo "<tr><td>{$col['Field']}</td><td>{$col['Type']}</td></tr>";
        }
        echo "</table>";
    } else {
        echo "❌ Tabla password_reset_codes NO existe<br>";
        echo "<strong>Solución:</strong> Ejecuta el archivo add_password_reset_codes.sql en phpMyAdmin<br>";
    }

    // 4. Verificar usuarios
    echo "<h2>4. Usuarios de Prueba</h2>";
    $users = $pdo->query("SELECT id, email, full_name FROM users LIMIT 5");
    echo "<table border='1'><tr><th>ID</th><th>Email</th><th>Nombre</th></tr>";
    while ($user = $users->fetch(PDO::FETCH_ASSOC)) {
        echo "<tr><td>{$user['id']}</td><td>{$user['email']}</td><td>{$user['full_name']}</td></tr>";
    }
    echo "</table>";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "<br>";
}

// 5. Verificar configuración de email
echo "<h2>5. Configuración de Email</h2>";
if (file_exists(__DIR__ . '/../config/email-config.php')) {
    $emailConfig = require __DIR__ . '/../config/email-config.php';
    echo "✅ Archivo de configuración encontrado<br>";
    echo "Host: {$emailConfig['smtp_host']}<br>";
    echo "Usuario: {$emailConfig['smtp_username']}<br>";
    echo "Puerto: {$emailConfig['smtp_port']}<br>";
} else {
    echo "❌ Archivo de configuración NO encontrado<br>";
}

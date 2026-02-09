<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ver Códigos de Verificación</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background-color: #f5f5f5;
        }

        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
        }

        .log-content {
            background: #2c3e50;
            color: #0f0;
            padding: 20px;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
            white-space: pre-wrap;
            max-height: 500px;
            overflow-y: auto;
        }

        .info {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }

        .btn {
            background: #3498db;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 10px;
        }

        .btn:hover {
            background: #2980b9;
        }

        .empty {
            color: #888;
            font-style: italic;
            text-align: center;
            padding: 40px;
        }
    </style>
</head>

<body>
    <div class="container">
        <h1>📧 Códigos de Verificación (Modo Desarrollo)</h1>

        <div class="info">
            <strong>ℹ️ Información:</strong>
            <p>En modo desarrollo, los códigos de verificación se guardan aquí en lugar de enviarse por email.</p>
            <p>Ruta del archivo: <code>logs/verification_codes.log</code></p>
        </div>

        <button class="btn" onclick="location.reload()">🔄 Actualizar</button>

        <h2>Códigos Registrados:</h2>
        <div class="log-content">
            <?php
            $logFile = __DIR__ . '/../logs/verification_codes.log';

            if (file_exists($logFile)) {
                $content = file_get_contents($logFile);
                if (empty(trim($content))) {
                    echo '<div class="empty">No hay códigos registrados aún.</div>';
                } else {
                    echo htmlspecialchars($content);
                }
            } else {
                echo '<div class="empty">El archivo de log no existe. Se creará cuando solicites el primer código.</div>';
            }
            ?>
        </div>

        <div style="margin-top: 20px; text-align: center;">
            <a href="index.php?accion=forgot-password" class="btn">← Volver a Recuperar Contraseña</a>
        </div>
    </div>
</body>

</html>
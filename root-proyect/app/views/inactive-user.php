<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
require_once __DIR__ . '/../middleware/auth.php';
requireAuth(); // Debe estar logueado para ver esta página

$username = $_SESSION['username'] ?? 'Usuario';
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cuenta Inactiva - MOVEos</title>
    <link rel="stylesheet" href="assets/css/main.css">
    <link rel="icon" type="image/png" href="assets/img/ico/icono.svg">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>
        .inactive-page {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            text-align: center;
            background: var(--bg-primary, #f5f5f5);
        }

        .inactive-card {
            background: var(--bg-card, #fff);
            border-radius: 1.5rem;
            padding: 3rem 2.5rem;
            max-width: 520px;
            width: 100%;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
            animation: fadeInUp 0.5s ease;
        }

        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to   { opacity: 1; transform: translateY(0); }
        }

        .inactive-icon {
            font-size: 4rem;
            color: #e74c3c;
            margin-bottom: 1.5rem;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50%       { transform: scale(1.08); }
        }

        .inactive-card h1 {
            font-size: 1.8rem;
            font-weight: 700;
            color: var(--text-primary, #1a1a2e);
            margin-bottom: 0.75rem;
        }

        .inactive-card .subtitle {
            font-size: 1rem;
            color: var(--text-secondary, #666);
            margin-bottom: 0.5rem;
        }

        .inactive-card .username {
            font-weight: 600;
            color: #e74c3c;
        }

        .inactive-card .info-box {
            background: #fff4f4;
            border: 1px solid #f5c6c6;
            border-radius: 0.75rem;
            padding: 1rem 1.25rem;
            margin: 1.5rem 0;
            color: #c0392b;
            font-size: 0.95rem;
            line-height: 1.6;
        }

        .inactive-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
            margin-top: 1.5rem;
        }

        .btn-inactive-logout {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            border-radius: 0.75rem;
            font-size: 0.95rem;
            font-weight: 600;
            cursor: pointer;
            border: none;
            text-decoration: none;
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .btn-inactive-logout:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .btn-logout {
            background: #e74c3c;
            color: #fff;
        }

        .btn-profile {
            background: var(--bg-card, #eee);
            color: var(--text-primary, #333);
            border: 1px solid var(--border, #ddd);
        }
    </style>
    <script src="assets/js/theme-init.js"></script>
</head>

<body>
    <div class="inactive-page">
        <div class="inactive-card">
            <div class="inactive-icon">
                <i class="fas fa-user-slash" aria-hidden="true"></i>
            </div>

            <h1>Cuenta Inactiva</h1>
            <p class="subtitle">
                Hola, <span class="username"><?= htmlspecialchars($username) ?></span>.
            </p>
            <p class="subtitle">Tu cuenta ha sido desactivada por un administrador.</p>

            <div class="info-box">
                <i class="fas fa-exclamation-circle"></i>
                Mientras tu cuenta esté inactiva, no podrás acceder a las funcionalidades
                de la plataforma: ver actividades, crear publicaciones ni gestionar inscripciones.
                <br><br>
                Si crees que esto es un error, contacta con el administrador de la plataforma.
            </div>

            <div class="inactive-actions">
                <a href="index.php?accion=logout" class="btn-inactive-logout btn-logout">
                    <i class="fas fa-sign-out-alt"></i> Cerrar sesión
                </a>
                <button class="btn-inactive-logout btn-profile" disabled title="Próximamente disponible">
                    <i class="fas fa-comments"></i> Hablar con un administrador
                </button>
            </div>
        </div>
    </div>
</body>

</html>

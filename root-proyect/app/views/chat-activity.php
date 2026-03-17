<!DOCTYPE html>
<html lang="es">
<?php
// ── Seguridad ────────────────────────────────────────────────────────────────
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../middleware/auth.php';
requireActiveUser();
requireAnyRole(['organizador', 'participante', 'administrador']);

// ── Parámetros de la sala ────────────────────────────────────────────────────
$activityId = (int) ($_GET['activity_id'] ?? 0);

if ($activityId <= 0) {
    header('Location: index.php');
    exit;
}

// ── Obtener nombre de la actividad para mostrarlo como título ────────────────
require_once __DIR__ . '/../../config/database.php';
$db   = (new Database())->getConnection();
$stmt = $db->prepare("SELECT id, title, offertant_id FROM activities WHERE id = :id LIMIT 1");
$stmt->execute(['id' => $activityId]);
$activity = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$activity) {
    header('Location: index.php');
    exit;
}

$currentUser   = getCurrentUser();
$activityTitle = htmlspecialchars($activity['title']);

// ── Verificar acceso a la sala ───────────────────────────────────────────────
// El administrador siempre tiene acceso.
// El organizador de la actividad tiene acceso.
// Un participante solo si está inscrito.
if ($currentUser['role'] !== 'administrador') {
    $isOrganizer = (int) $currentUser['id'] === (int) $activity['offertant_id'];

    if (!$isOrganizer) {
        $stmtCheck = $db->prepare(
            "SELECT 1 FROM registrations
             WHERE activity_id = :aid AND participant_id = :uid LIMIT 1"
        );
        $stmtCheck->execute(['aid' => $activityId, 'uid' => $currentUser['id']]);
        $isEnrolled = (bool) $stmtCheck->fetch();

        if (!$isEnrolled) {
            // No tiene acceso: redirigir con mensaje
            $_SESSION['error'] = 'Debes estar inscrito en la actividad para acceder al chat.';
            header('Location: index.php?accion=seeActivities');
            exit;
        }
    }
}
?>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat – <?= $activityTitle ?> | MOVEos</title>

    <script src="../app/models/header-footer.js"></script>
    <script src="assets/js/theme-init.js"></script>
    <script src="assets/js/main.js"></script>
    <link rel="stylesheet" href="assets/css/main.css">
    <link rel="icon" type="image/png" href="assets/img/ico/icono.svg">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>

<body>
    <!-- Datos de sesión disponibles para el script JS -->
    <script>
        window.CURRENT_USER    = <?= json_encode($currentUser) ?>;
        window.CHAT_ROOM_TYPE  = 'activity';
        window.CHAT_ROOM_ID    = <?= $activityId ?>;
    </script>

    <div id="header"></div>

    <main class="main-content container-home chat-page" aria-labelledby="chat-title">

        <!-- Cabecera del chat -->
        <div class="chat-header">
            <button class="chat-back-btn" onclick="history.back()" aria-label="Volver atrás">
                <i class="fas fa-arrow-left"></i>
            </button>
            <div class="chat-header-info">
                <h1 id="chat-title"><i class="fas fa-users"></i> <?= $activityTitle ?></h1>
                <span class="chat-subtitle">Chat grupal de la actividad</span>
            </div>
        </div>

        <!-- Área de mensajes -->
        <div class="chat-messages-area" id="chatMessagesArea" aria-live="polite" aria-label="Mensajes del chat">
            <p class="chat-empty-state" id="chatEmptyState">
                <i class="fas fa-comment-dots"></i> Sé el primero en escribir algo...
            </p>
        </div>

        <!-- Input de envío -->
        <form class="chat-input-area" id="chatForm" aria-label="Enviar mensaje" autocomplete="off">
            <input
                type="text"
                id="chatInput"
                class="chat-input"
                placeholder="Escribe un mensaje..."
                maxlength="1000"
                aria-label="Texto del mensaje"
                required
            >
            <button type="submit" class="chat-send-btn" id="chatSendBtn" aria-label="Enviar">
                <i class="fas fa-paper-plane"></i>
            </button>
        </form>

    </main>

    <div id="footer"></div>

    <!-- Controlador de chat -->
    <script type="module" src="assets/js/controllers/chat-controller.js"></script>
</body>
</html>

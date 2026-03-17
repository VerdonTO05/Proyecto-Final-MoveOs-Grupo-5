<!DOCTYPE html>
<html lang="es">
<?php
// ── Vista: Chat con el administrador (para participantes y organizadores) ─────
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../middleware/auth.php';
requireActiveUser();
requireAnyRole(['participante', 'organizador']);

$currentUser = getCurrentUser();
// La sala admin = room_id es el propio user_id del participante
$roomId      = $currentUser['id'];
?>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat con soporte | MOVEos</title>
    <script src="assets/js/utils/header-footer.js"></script>
    <script src="assets/js/theme-init.js"></script>
    <script src="assets/js/main.js"></script>
    <link rel="stylesheet" href="assets/css/main.css">
    <link rel="icon" type="image/png" href="assets/img/ico/icono.svg">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>

<body>
    <script>
        window.CURRENT_USER   = <?= json_encode($currentUser) ?>;
        window.CHAT_ROOM_TYPE = 'admin';
        window.CHAT_ROOM_ID   = <?= $roomId ?>;
    </script>

    <div id="header"></div>

    <main class="main-content container-home chat-page" aria-labelledby="userchat-title">

        <!-- Cabecera del chat -->
        <div class="chat-header">
            <button class="chat-back-btn" onclick="history.back()" aria-label="Volver atrás">
                <i class="fas fa-arrow-left"></i>
            </button>
            <div class="chat-header-info">
                <h1 id="userchat-title"><i class="fas fa-headset"></i> Chat con soporte</h1>
                <span class="chat-subtitle">Comunícate con el equipo de administración</span>
            </div>
        </div>

        <!-- Área de mensajes -->
        <div class="chat-messages-area" id="chatMessagesArea"
             aria-live="polite" aria-label="Mensajes con el administrador">
            <p class="chat-empty-state" id="chatEmptyState">
                <i class="fas fa-comment-dots"></i> Escribe el primer mensaje al administrador...
            </p>
        </div>

        <!-- Input de envío -->
        <form class="chat-input-area" id="chatForm"
              aria-label="Enviar mensaje" autocomplete="off">
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

    <script type="module" src="assets/js/controllers/chat-controller.js"></script>
</body>
</html>

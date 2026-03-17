<!DOCTYPE html>
<html lang="es">
<?php
// ── Seguridad ────────────────────────────────────────────────────────────────
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../middleware/auth.php';
requireActiveUser();
requireRole('administrador'); // Solo administradores

$currentUser      = getCurrentUser();
// Opcionalmente se puede pre-seleccionar un usuario al llegar desde la lista de usuarios
$preselectUserId  = (int) ($_GET['user_id'] ?? 0);
?>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat Admin | MOVEos</title>

    <script src="assets/js/utils/header-footer.js"></script>
    <script src="assets/js/theme-init.js"></script>
    <script src="assets/js/main.js"></script>
    <link rel="stylesheet" href="assets/css/main.css">
    <link rel="icon" type="image/png" href="assets/img/ico/icono.svg">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>

<body>
    <!-- Datos de sesión disponibles para el script JS -->
    <script>
        window.CURRENT_USER           = <?= json_encode($currentUser) ?>;
        window.CHAT_ADMIN_MODE        = true;
        window.CHAT_ROOM_TYPE         = 'admin';
        window.CHAT_ROOM_ID           = null;
        window.CHAT_PRESELECT_USER_ID = <?= $preselectUserId ?: 'null' ?>;
    </script>

    <div id="header"></div>

    <main class="main-content container-home chat-page" aria-labelledby="admin-chat-title">

        <h1 id="admin-chat-title" class="chat-admin-title">
            <i class="fas fa-headset"></i> Mensajes de usuarios
        </h1>

        <div class="chat-admin-layout">

            <!-- ── Columna izquierda: lista de usuarios ── -->
            <aside class="chat-user-list-panel" aria-label="Lista de usuarios">
                <div class="chat-user-list-header">
                    <span>Usuarios</span>
                </div>

                <!-- La lista se rellena dinámicamente desde chat-controller.js -->
                <ul class="chat-user-list" id="chatUserList" role="list">
                    <li class="chat-user-list-empty" id="chatUserListEmpty">
                        <i class="fas fa-spinner fa-spin"></i> Cargando...
                    </li>
                </ul>
            </aside>

            <!-- ── Columna derecha: mensajes de la conversación activa ── -->
            <section class="chat-conversation-panel" aria-label="Conversación activa">

                <!-- Estado inicial: ningún usuario seleccionado -->
                <div class="chat-no-selection" id="chatNoSelection">
                    <i class="fas fa-comments"></i>
                    <p>Selecciona un usuario para ver la conversación</p>
                </div>

                <!-- Cabecera de la conversación activa (oculta hasta seleccionar) -->
                <div class="chat-header chat-header--hidden" id="chatConversationHeader">
                    <div class="chat-header-info">
                        <span class="chat-subtitle" id="chatSelectedUserName">—</span>
                    </div>
                </div>

                <!-- Área de mensajes -->
                <div class="chat-messages-area chat-messages-area--hidden" id="chatMessagesArea"
                    aria-live="polite" aria-label="Mensajes">
                    <p class="chat-empty-state" id="chatEmptyState">
                        <i class="fas fa-comment-dots"></i> No hay mensajes aún...
                    </p>
                </div>

                <!-- Input de envío -->
                <form class="chat-input-area chat-input-area--hidden" id="chatForm"
                    aria-label="Enviar mensaje" autocomplete="off">
                    <input
                        type="text"
                        id="chatInput"
                        class="chat-input"
                        placeholder="Escribe un mensaje al usuario..."
                        maxlength="1000"
                        aria-label="Texto del mensaje"
                        required
                    >
                    <button type="submit" class="chat-send-btn" id="chatSendBtn" aria-label="Enviar">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </form>

            </section>
        </div>
    </main>

    <div id="footer"></div>

    <!-- Controlador de chat admin -->
    <script type="module" src="assets/js/controllers/chat-controller.js"></script>
</body>
</html>

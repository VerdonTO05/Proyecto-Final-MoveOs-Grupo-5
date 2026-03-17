<!DOCTYPE html>
<html lang="es">
<?php
// ── Seguridad ────────────────────────────────────────────────────────────────
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../middleware/auth.php';
requireActiveUser();

$currentUser = getCurrentUser();

// Si es administrador, este panel no aplica, se redirige al panel adminChat
if ($currentUser['role'] === 'administrador') {
    header('Location: index.php?accion=adminChat');
    exit;
}
?>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mis Conversaciones | MOVEos</title>

    <script src="assets/js/utils/header-footer.js"></script>
    <script src="assets/js/theme-init.js"></script>
    <script src="assets/js/main.js"></script>
    <link rel="stylesheet" href="assets/css/main.css">
    <link rel="icon" type="image/png" href="assets/img/ico/icono.svg">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <!-- Estilo específico para la galería de chats -->
    <style>
        .chat-hub-page {
            max-width: 900px;
            margin: 0 auto;
            padding: 2rem 1rem;
        }

        .chat-hub-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 2rem;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 1rem;
        }

        .chat-hub-header i {
            font-size: 2rem;
            color: var(--brand-primary);
        }

        .chat-hub-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1.5rem;
        }

        .chat-card {
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            text-decoration: none;
            color: var(--text-primary);
            transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
        }

        .chat-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.05);
            border-color: var(--brand-primary);
        }

        .chat-card--support {
            background: rgba(140, 30, 50, 0.05);
            border: 1px solid rgba(140, 30, 50, 0.3);
        }

        .chat-card__header {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1.2rem;
            border-bottom: 1px solid var(--border-color);
            background: var(--bg-main);
        }

        .chat-card--support .chat-card__header {
            background: rgba(140, 30, 50, 0.05);
        }

        .chat-card__icon {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: var(--brand-primary);
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            flex-shrink: 0;
        }

        .chat-card__img {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            object-fit: cover;
            flex-shrink: 0;
            border: 2px solid var(--bg-surface);
        }

        .chat-card__title {
            font-size: 1.1rem;
            font-weight: 700;
            margin: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .chat-card__type {
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--text-secondary);
        }

        .chat-card--support .chat-card__type {
            color: var(--brand-primary);
        }

        .chat-card__body {
            padding: 1.2rem;
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            gap: 1rem;
        }

        .chat-card__preview {
            font-size: 0.9rem;
            color: var(--text-secondary);
            display: -webkit-box;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            margin: 0;
            line-height: 1.4;
        }

        .chat-card__time {
            font-size: 0.75rem;
            color: var(--text-secondary);
            opacity: 0.8;
            align-self: flex-end;
        }

        .chat-hub-loading {
            text-align: center;
            padding: 4rem 1rem;
            color: var(--text-secondary);
            font-size: 1.1rem;
        }

        .chat-hub-loading i {
            font-size: 2rem;
            margin-bottom: 1rem;
            color: var(--brand-primary);
        }
    </style>
</head>

<body>
    <!-- Configuración global para JS -->
    <script>
        window.CURRENT_USER = <?= json_encode($currentUser) ?>;
    </script>

    <div id="header"></div>

    <main class="main-content chat-hub-page" aria-labelledby="hub-title">
        
        <div class="chat-hub-header">
            <i class="fas fa-comments"></i>
            <div>
                <h1 id="hub-title" style="margin: 0;">Mis Conversaciones</h1>
                <p class="chat-subtitle" style="margin-top: 5px;">Chats grupales y soporte</p>
            </div>
        </div>

        <!-- Contenedor dinámico -->
        <div id="chatHubGrid" class="chat-hub-grid">
            <div class="chat-hub-loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Cargando conversaciones...</p>
            </div>
        </div>

    </main>

    <div id="footer"></div>

    <script>
        document.addEventListener('DOMContentLoaded', async () => {
            const grid = document.getElementById('chatHubGrid');
            
            try {
                const response = await fetch('index.php?accion=getChatHub');
                const data = await response.json();

                if (!data.success) {
                    throw new Error(data.message || 'Error al cargar contenido');
                }

                grid.innerHTML = '';

                // Fragmento para construir el DOM
                const fragment = document.createDocumentFragment();

                // 1. Añadir chat de soporte
                if (data.support_room) {
                    const supportHTML = `
                        <a href="index.php?accion=userAdminChat" class="chat-card chat-card--support">
                            <div class="chat-card__header">
                                <div class="chat-card__icon"><i class="fas fa-headset"></i></div>
                                <div>
                                    <h2 class="chat-card__title">Soporte MOVEos</h2>
                                    <span class="chat-card__type">Chat con administración</span>
                                </div>
                            </div>
                            <div class="chat-card__body">
                                <p class="chat-card__preview">"${escapeHtml(data.support_room.last_message)}"</p>
                                ${data.support_room.updated_at ? `<span class="chat-card__time"><i class="far fa-clock"></i> ${formatTime(data.support_room.updated_at)}</span>` : ''}
                            </div>
                        </a>
                    `;
                    const template = document.createElement('template');
                    template.innerHTML = supportHTML.trim();
                    fragment.appendChild(template.content.firstChild);
                }

                // 2. Añadir chats de actividades
                if (data.activities && data.activities.length > 0) {
                    data.activities.forEach(act => {
                        const fallbackImg = 'assets/img/default-activity.jpg';
                        const imageHtml = act.image_url 
                            ? `<img src="${act.image_url}" class="chat-card__img" alt="${escapeHtml(act.title)}" onerror="this.src='${fallbackImg}'">`
                            : `<div class="chat-card__icon"><i class="fas fa-users"></i></div>`;

                        const actHTML = `
                            <a href="index.php?accion=chatActivity&activity_id=${act.room_id}" class="chat-card">
                                <div class="chat-card__header">
                                    ${imageHtml}
                                    <div style="min-width: 0;">
                                        <h2 class="chat-card__title" title="${escapeHtml(act.title)}">${escapeHtml(act.title)}</h2>
                                        <span class="chat-card__type">Grupo de Actividad</span>
                                    </div>
                                </div>
                                <div class="chat-card__body">
                                    <p class="chat-card__preview">"${escapeHtml(act.last_message)}"</p>
                                    ${act.updated_at ? `<span class="chat-card__time"><i class="far fa-clock"></i> ${formatTime(act.updated_at)}</span>` : ''}
                                </div>
                            </a>
                        `;
                        const template = document.createElement('template');
                        template.innerHTML = actHTML.trim();
                        fragment.appendChild(template.content.firstChild);
                    });
                }

                grid.appendChild(fragment);

            } catch (error) {
                console.error(error);
                grid.innerHTML = `
                    <div style="text-align: center; color: var(--brand-primary); padding: 2rem; grid-column: 1/-1;">
                        <i class="fas fa-exclamation-circle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                        <p>No se pudieron cargar las conversaciones.</p>
                    </div>
                `;
            }
        });

        // Utilidades JS en la vista (simples)
        function escapeHtml(str) {
            if (!str) return '';
            return String(str).replace(/[&<>"']/g, function(match) {
                const escape = {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#039;'
                };
                return escape[match];
            });
        }

        function formatTime(dateStr) {
            const date = new Date(dateStr.replace(' ', 'T'));
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString();
        }
    </script>
</body>
</html>

/**
 * chat-controller.js
 *
 * Módulo de chat basado en AJAX polling.
 * Se usa tanto para la vista de chat de actividad como para el panel admin.
 *
 * Variables globales esperadas (inyectadas por la vista PHP):
 *   window.CURRENT_USER     - { id, name, role }
 *   window.CHAT_ROOM_TYPE   - 'activity' | 'admin'
 *   window.CHAT_ROOM_ID     - number | null (null en modo admin hasta seleccionar)
 *   window.CHAT_ADMIN_MODE  - boolean (true solo en admin-chat.php)
 */

// ── Constantes ───────────────────────────────────────────────────────────────

/** Intervalo de polling en milisegundos */
const POLLING_INTERVAL_MS = 3000;

/** Máximo de mensajes visibles antes de scroll automático */
const SCROLL_THRESHOLD_PX = 100;

// ── Estado del módulo ────────────────────────────────────────────────────────

/** ID del último mensaje cargado (evita re-renderizar mensajes ya mostrados) */
let lastMessageId = 0;

/** Referencia al setInterval del polling */
let pollingTimer = null;

/** Sala activa actual */
let activeRoomType = window.CHAT_ROOM_TYPE ?? null;
let activeRoomId   = window.CHAT_ROOM_ID   ?? null;

// ── Elementos del DOM ────────────────────────────────────────────────────────

const messagesArea = document.getElementById('chatMessagesArea');
const chatForm     = document.getElementById('chatForm');
const chatInput    = document.getElementById('chatInput');
const emptyState   = document.getElementById('chatEmptyState');

// ── Inicialización ───────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    if (window.CHAT_ADMIN_MODE) {
        initAdminMode();
    } else {
        // Modo sala de actividad: arrancar polling directamente
        startPolling(activeRoomType, activeRoomId);
    }

    // Listener del formulario de envío
    chatForm.addEventListener('submit', handleSendMessage);

    // Detener polling al salir de la página
    window.addEventListener('beforeunload', stopPolling);
});

// ── Polling ──────────────────────────────────────────────────────────────────

/**
 * Arrancar el polling para una sala determinada.
 * Si ya había un polling activo, lo detiene primero.
 *
 * @param {string} roomType - 'activity' | 'admin'
 * @param {number} roomId   - ID de la sala
 */
function startPolling(roomType, roomId) {
    stopPolling();

    activeRoomType = roomType;
    activeRoomId   = roomId;
    lastMessageId  = 0;

    // Primera carga inmediata
    fetchNewMessages();

    // Polling periódico
    pollingTimer = setInterval(fetchNewMessages, POLLING_INTERVAL_MS);
}

/**
 * Detener el polling activo.
 */
function stopPolling() {
    if (pollingTimer !== null) {
        clearInterval(pollingTimer);
        pollingTimer = null;
    }
}

/**
 * Solicitar mensajes nuevos al servidor (desde el último ID conocido).
 * Si la respuesta contiene mensajes, los renderiza y actualiza lastMessageId.
 */
async function fetchNewMessages() {
    if (!activeRoomId) return;

    const url = new URL('index.php', window.location.origin + window.location.pathname.replace('index.php', ''));
    url.searchParams.set('accion',    'getMessages');
    url.searchParams.set('room_type', activeRoomType);
    url.searchParams.set('room_id',   activeRoomId);
    url.searchParams.set('after_id',  lastMessageId);

    try {
        const response = await fetch(url.toString());
        const data     = await response.json();

        if (!data.success) {
            console.error('[Chat] Error al obtener mensajes:', data.message);
            return;
        }

        if (data.messages.length > 0) {
            renderMessages(data.messages);
            lastMessageId = data.last_id;
            hideEmptyState();
        }

    } catch (error) {
        console.error('[Chat] Error de red en fetchNewMessages:', error);
    }
}

// ── Envío de mensajes ────────────────────────────────────────────────────────

/**
 * Manejar el evento de envío del formulario.
 * Envía el mensaje al servidor y lo agrega optimistamente al DOM.
 *
 * @param {Event} event
 */
async function handleSendMessage(event) {
    event.preventDefault();

    const text = chatInput.value.trim();
    if (!text || !activeRoomId) return;

    // Deshabilitar input mientras se envía
    chatInput.disabled  = true;

    try {
        const response = await fetch('index.php?accion=sendMessage', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                room_type: activeRoomType,
                room_id:   activeRoomId,
                message:   text,
            }),
        });

        const data = await response.json();

        if (data.success) {
            // Añadir el mensaje propio al DOM de forma optimista
            renderMessages([data.message]);
            lastMessageId = data.message.id;
            hideEmptyState();
            chatInput.value = '';
        } else {
            console.error('[Chat] Error al enviar mensaje:', data.message);
            alert('No se pudo enviar el mensaje. Inténtalo de nuevo.');
        }

    } catch (error) {
        console.error('[Chat] Error de red al enviar:', error);
    } finally {
        chatInput.disabled = false;
        chatInput.focus();
    }
}

// ── Renderizado ──────────────────────────────────────────────────────────────

/**
 * Renderizar un array de mensajes en el área de chat.
 * Solo añade mensajes nuevos; no re-renderiza los ya existentes.
 *
 * @param {Array<{id, sender_id, sender_name, message, created_at}>} messages
 */
function renderMessages(messages) {
    const currentUserId = window.CURRENT_USER?.id;
    const fragment      = document.createDocumentFragment();

    messages.forEach(msg => {
        // Evitar duplicados si el mensaje ya está en el DOM
        if (document.getElementById(`chat-msg-${msg.id}`)) return;

        const isOwn   = parseInt(msg.sender_id) === parseInt(currentUserId);
        const bubble  = buildMessageBubble(msg, isOwn);
        fragment.appendChild(bubble);
    });

    messagesArea.appendChild(fragment);
    scrollToBottomIfNeeded();
}

/**
 * Construir el elemento DOM de una burbuja de mensaje.
 *
 * @param {{id, sender_name, message, created_at}} msg
 * @param {boolean} isOwn - true si el mensaje es del usuario actual
 * @returns {HTMLElement}
 */
function buildMessageBubble(msg, isOwn) {
    const wrapper = document.createElement('div');
    wrapper.id        = `chat-msg-${msg.id}`;
    wrapper.className = `chat-bubble ${isOwn ? 'chat-bubble--own' : 'chat-bubble--other'}`;

    const senderEl  = document.createElement('span');
    senderEl.className   = 'chat-bubble__sender';
    senderEl.textContent = isOwn ? 'Tú' : msg.sender_name;

    const textEl    = document.createElement('p');
    textEl.className   = 'chat-bubble__text';
    textEl.textContent = msg.message;

    const timeEl    = document.createElement('time');
    timeEl.className   = 'chat-bubble__time';
    timeEl.textContent = formatTime(msg.created_at);

    wrapper.appendChild(senderEl);
    wrapper.appendChild(textEl);
    wrapper.appendChild(timeEl);

    return wrapper;
}

/**
 * Formatear una fecha ISO a "HH:MM".
 *
 * @param {string} dateStr - Fecha en formato 'YYYY-MM-DD HH:MM:SS'
 * @returns {string}
 */
function formatTime(dateStr) {
    const date = new Date(dateStr.replace(' ', 'T'));
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Hacer scroll al fondo del área de mensajes solo si el usuario
 * ya estaba cerca del fondo (no interrumpir si está leyendo arriba).
 */
function scrollToBottomIfNeeded() {
    const distanceFromBottom = messagesArea.scrollHeight - messagesArea.scrollTop - messagesArea.clientHeight;
    if (distanceFromBottom <= SCROLL_THRESHOLD_PX) {
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }
}

/**
 * Ocultar el mensaje de estado vacío.
 */
function hideEmptyState() {
    if (emptyState) emptyState.style.display = 'none';
}

// ── Modo Admin ───────────────────────────────────────────────────────────────

/**
 * Inicializar el panel de chat del administrador:
 * carga la lista de conversaciones y configura los listeners de selección.
 */
async function initAdminMode() {
    await loadAdminConversations();

    // Si se llega con un user_id pre-seleccionado (desde el botón Chat de users),
    // abrir esa conversación automáticamente.
    if (window.CHAT_PRESELECT_USER_ID) {
        const targetItem = document.querySelector(`[data-user-id="${window.CHAT_PRESELECT_USER_ID}"]`);
        if (targetItem) {
            const fullName = targetItem.querySelector('.chat-user-item__name')?.textContent || 'Usuario';
            openAdminConversation(window.CHAT_PRESELECT_USER_ID, fullName);
        }
    }

    // Recargar la lista de conversaciones periódicamente
    setInterval(loadAdminConversations, 10000);
}

/**
 * Cargar la lista de conversaciones activas del admin desde el servidor.
 */
async function loadAdminConversations() {
    try {
        const response = await fetch('index.php?accion=getChatRooms');
        const data     = await response.json();

        if (!data.success) {
            console.error('[Chat Admin] Error al cargar conversaciones:', data.message);
            return;
        }

        renderConversationList(data.conversations);

    } catch (error) {
        console.error('[Chat Admin] Error de red:', error);
    }
}

/**
 * Renderizar la lista de usuarios en el panel izquierdo.
 *
 * @param {Array<{user_id, user_name, full_name, last_message, last_message_at}>} conversations
 */
function renderConversationList(conversations) {
    const list      = document.getElementById('chatUserList');
    const emptyItem = document.getElementById('chatUserListEmpty');

    if (!list) return;

    if (conversations.length === 0) {
        if (emptyItem) emptyItem.style.display = 'flex';
        return;
    }

    if (emptyItem) emptyItem.style.display = 'none';

    // Hacer un mapa de user_ids ya renderizados
    const existingIds = new Set(
        [...list.querySelectorAll('[data-user-id]')].map(el => el.dataset.userId)
    );

    conversations.forEach(conv => {
        const strId = String(conv.user_id);

        if (!existingIds.has(strId)) {
            // Nuevo: añadir al DOM
            const item = buildConversationItem(conv);
            list.appendChild(item);
        } else {
            // Existente: actualizar el preview del último mensaje
            const existingItem = list.querySelector(`[data-user-id="${strId}"]`);
            if (existingItem && conv.last_message) {
                const preview = existingItem.querySelector('.chat-user-item__preview');
                if (preview) preview.textContent = conv.last_message;
            }
        }
    });
}

/**
 * Construir un elemento de lista para una conversación del admin.
 *
 * @param {{user_id, user_name, full_name, last_message, last_message_at}} conv
 * @returns {HTMLLIElement}
 */
function buildConversationItem(conv) {
    const li = document.createElement('li');
    li.className        = 'chat-user-item';
    li.dataset.userId   = conv.user_id;
    li.setAttribute('role', 'button');
    li.setAttribute('tabindex', '0');
    li.setAttribute('aria-label', `Chat con ${conv.full_name}`);

    li.innerHTML = `
        <div class="chat-user-item__info">
            <strong class="chat-user-item__name">${escapeHtml(conv.full_name)}</strong>
            <span class="chat-user-item__preview">${escapeHtml(conv.last_message ?? '')}</span>
        </div>
        <time class="chat-user-item__time">${conv.last_message_at ? formatTime(conv.last_message_at) : ''}</time>
    `;

    // Seleccionar conversación al hacer clic o pulsar Enter
    const selectConversation = () => openAdminConversation(conv.user_id, conv.full_name);
    li.addEventListener('click',   selectConversation);
    li.addEventListener('keydown', (e) => { if (e.key === 'Enter') selectConversation(); });

    return li;
}

/**
 * Abrir la conversación de un usuario en el panel derecho.
 * Marca el ítem seleccionado, muestra los controles y arranca el polling.
 *
 * @param {number} userId    - ID del usuario participante
 * @param {string} fullName  - Nombre completo del usuario
 */
function openAdminConversation(userId, fullName) {
    // Marcar el ítem activo
    document.querySelectorAll('.chat-user-item').forEach(el => el.classList.remove('chat-user-item--active'));
    const activeItem = document.querySelector(`[data-user-id="${userId}"]`);
    if (activeItem) activeItem.classList.add('chat-user-item--active');

    // Mostrar el nombre del usuario en la cabecera
    const nameEl = document.getElementById('chatSelectedUserName');
    if (nameEl) nameEl.textContent = fullName;

    // Limpiar mensajes anteriores y mostrar los controles
    messagesArea.innerHTML = '';
    showConversationPanel();

    // Arrancar polling para la sala admin de ese usuario
    startPolling('admin', userId);
}

/**
 * Mostrar los elementos del panel derecho que están ocultos hasta seleccionar usuario.
 */
function showConversationPanel() {
    const noSelection = document.getElementById('chatNoSelection');
    const header      = document.getElementById('chatConversationHeader');
    const form        = document.getElementById('chatForm');

    if (noSelection) noSelection.style.display    = 'none';
    if (header)      header.classList.remove('chat-header--hidden');
    if (messagesArea) messagesArea.classList.remove('chat-messages-area--hidden');
    if (form)        form.classList.remove('chat-input-area--hidden');
}

// ── Utilidades ───────────────────────────────────────────────────────────────

/**
 * Escapar HTML para evitar XSS al insertar texto en innerHTML.
 *
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

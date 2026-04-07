/**
 * chat-controller.js
 */

// ── Constantes ───────────────────────────────────────────────────────────────

const POLLING_INTERVAL_MS = 3000;
const SCROLL_THRESHOLD_PX = 100;

// ── Estado del módulo ────────────────────────────────────────────────────────

let lastMessageId = 0;
let pollingTimer = null;
let activeRoomType = window.CHAT_ROOM_TYPE ?? null;
let activeRoomId = window.CHAT_ROOM_ID ?? null;

// ── Getters dinámicos (el DOM puede recrearse en el modal) ───────────────────

const getMessagesArea = () => document.getElementById('chatMessagesArea');
const getChatForm     = () => document.getElementById('chatForm');
const getChatInput    = () => document.getElementById('chatInput');
const getEmptyState   = () => document.getElementById('chatEmptyState');

// ── Inicialización ───────────────────────────────────────────────────────────

function init() {
    const form  = getChatForm();
    const input = getChatInput();

    if (!form || !input) {
        return;
    }

    // Actualizar sala activa por si cambió (caso modal)
    activeRoomType = window.CHAT_ROOM_TYPE ?? activeRoomType;
    activeRoomId   = window.CHAT_ROOM_ID   ?? activeRoomId;

    if (window.CHAT_ADMIN_MODE) {
        initAdminMode();
    } else {
        startPolling(activeRoomType, activeRoomId);
    }

    form.addEventListener('submit', handleSendMessage);
    window.addEventListener('beforeunload', stopPolling);
}

// Soporte doble: carga normal con página y carga dinámica desde modal
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

window.initChatController = init;

// ── Polling ──────────────────────────────────────────────────────────────────

function startPolling(roomType, roomId) {
    stopPolling();

    activeRoomType = roomType;
    activeRoomId   = roomId;
    lastMessageId  = 0;

    fetchNewMessages();
    pollingTimer = setInterval(fetchNewMessages, POLLING_INTERVAL_MS);
}

function stopPolling() {
    if (pollingTimer !== null) {
        clearInterval(pollingTimer);
        pollingTimer = null;
    }
}

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
            return;
        }

        if (data.messages.length > 0) {
            renderMessages(data.messages);
            lastMessageId = data.last_id;
            hideEmptyState();
        }

    } catch (error) {
        showAlert('Error de red', 'Se ha producido un error', 'error');
    }
}

// ── Envío de mensajes ────────────────────────────────────────────────────────

async function handleSendMessage(event) {
    event.preventDefault();

    const input = getChatInput();
    if (!input) return;

    const text = input.value.trim();
    if (!text || !activeRoomId) return;

    input.disabled = true;

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
            renderMessages([data.message]);
            lastMessageId = data.message.id;
            hideEmptyState();
            input.value = '';
        } else {
            showAlert('Error', 'No se pudo enviar el mensaje. Inténtalo de nuevo.', 'error');
        }

    } catch (error) {
        showAlert('Error de red', 'Se ha producido un error', 'error');
    } finally {
        input.disabled = false;
        input.focus();
    }
}

// ── Renderizado ──────────────────────────────────────────────────────────────

function renderMessages(messages) {
    const area = getMessagesArea();
    if (!area) return;

    const currentUserId = window.CURRENT_USER?.id;
    const fragment      = document.createDocumentFragment();

    messages.forEach(msg => {
        if (document.getElementById(`chat-msg-${msg.id}`)) return;

        const isOwn = parseInt(msg.sender_id) === parseInt(currentUserId);
        fragment.appendChild(buildMessageBubble(msg, isOwn));
    });

    area.appendChild(fragment);
    scrollToBottomIfNeeded();
}

function buildMessageBubble(msg, isOwn) {
    const wrapper = document.createElement('div');
    wrapper.id        = `chat-msg-${msg.id}`;
    wrapper.className = `chat-bubble ${isOwn ? 'chat-bubble--own' : 'chat-bubble--other'}`;

    const senderEl = document.createElement('span');
    senderEl.className   = 'chat-bubble__sender';
    senderEl.textContent = isOwn ? 'Tú' : msg.sender_name;

    const textEl = document.createElement('p');
    textEl.className   = 'chat-bubble__text';
    textEl.textContent = msg.message;

    const timeEl = document.createElement('time');
    timeEl.className   = 'chat-bubble__time';
    timeEl.textContent = formatTime(msg.created_at);

    // ← nuevo contenedor
    const bodyEl = document.createElement('div');
    bodyEl.className = 'chat-bubble__body';
    bodyEl.appendChild(textEl);
    bodyEl.appendChild(timeEl);

    wrapper.appendChild(senderEl);
    wrapper.appendChild(bodyEl); // ← body en lugar de text+time sueltos

    return wrapper;
}

function formatTime(dateStr) {
    const date = new Date(dateStr.replace(' ', 'T'));
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function scrollToBottomIfNeeded() {
    const area = getMessagesArea();
    if (!area) return;

    const distanceFromBottom = area.scrollHeight - area.scrollTop - area.clientHeight;
    if (distanceFromBottom <= SCROLL_THRESHOLD_PX) {
        area.scrollTop = area.scrollHeight;
    }
}

function hideEmptyState() {
    const el = getEmptyState();
    if (el) el.style.display = 'none';
}

// ── Modo Admin ───────────────────────────────────────────────────────────────

async function initAdminMode() {
    await loadAdminConversations();

    if (window.CHAT_PRESELECT_USER_ID) {
        const targetItem = document.querySelector(`[data-user-id="${window.CHAT_PRESELECT_USER_ID}"]`);
        if (targetItem) {
            const fullName = targetItem.querySelector('.chat-user-item__name')?.textContent || 'Usuario';
            openAdminConversation(window.CHAT_PRESELECT_USER_ID, fullName);
        }
    }

    setInterval(loadAdminConversations, 10000);
}

async function loadAdminConversations() {
    try {
        const response = await fetch('index.php?accion=getChatRooms');
        const data     = await response.json();

        if (!data.success) {
            showAlert('Error', 'No se pudo cargar las conversaciones correctamente.', 'error');
            return;
        }

        renderConversationList(data.conversations);

    } catch (error) {
        showAlert('Error de red', 'Se ha producido un error', 'error');
    }
}

function renderConversationList(conversations) {
    const list      = document.getElementById('chatUserList');
    const emptyItem = document.getElementById('chatUserListEmpty');

    if (!list) return;

    if (conversations.length === 0) {
        if (emptyItem) emptyItem.style.display = 'flex';
        return;
    }

    if (emptyItem) emptyItem.style.display = 'none';

    const existingIds = new Set(
        [...list.querySelectorAll('[data-user-id]')].map(el => el.dataset.userId)
    );

    conversations.forEach(conv => {
        const strId = String(conv.user_id);

        if (!existingIds.has(strId)) {
            list.appendChild(buildConversationItem(conv));
        } else {
            const existingItem = list.querySelector(`[data-user-id="${strId}"]`);
            if (existingItem && conv.last_message) {
                const preview = existingItem.querySelector('.chat-user-item__preview');
                if (preview) preview.textContent = conv.last_message;
            }
        }
    });
}

function buildConversationItem(conv) {
    const li = document.createElement('li');
    li.className = 'chat-user-item';
    li.dataset.userId = conv.user_id;
    li.setAttribute('role',       'button');
    li.setAttribute('tabindex',   '0');
    li.setAttribute('aria-label', `Chat con ${conv.full_name}`);

    li.innerHTML = `
        <div class="chat-user-item__info">
            <strong class="chat-user-item__name">${escapeHtml(conv.full_name)}</strong>
            <span class="chat-user-item__preview">${escapeHtml(conv.last_message ?? '')}</span>
        </div>
        <time class="chat-user-item__time">${conv.last_message_at ? formatTime(conv.last_message_at) : ''}</time>
    `;

    const selectConversation = () => openAdminConversation(conv.user_id, conv.full_name);
    li.addEventListener('click', selectConversation);
    li.addEventListener('keydown', (e) => { if (e.key === 'Enter') selectConversation(); });

    return li;
}

function openAdminConversation(userId, fullName) {
    document.querySelectorAll('.chat-user-item').forEach(el => el.classList.remove('chat-user-item--active'));

    const activeItem = document.querySelector(`[data-user-id="${userId}"]`);
    if (activeItem) activeItem.classList.add('chat-user-item--active');

    const nameEl = document.getElementById('chatSelectedUserName');
    if (nameEl) nameEl.textContent = fullName;

    const area = getMessagesArea();
    if (area) area.innerHTML = '';

    showConversationPanel();
    startPolling('admin', userId);
}

function showConversationPanel() {
    const noSelection = document.getElementById('chatNoSelection');
    const header      = document.getElementById('chatConversationHeader');
    const form        = getChatForm();
    const area        = getMessagesArea();

    if (noSelection) noSelection.style.display  = 'none';
    if (header)      header.classList.remove('chat-header--hidden');
    if (area)        area.classList.remove('chat-messages-area--hidden');
    if (form)        form.classList.remove('chat-input-area--hidden');
}

// ── Utilidades ───────────────────────────────────────────────────────────────

function escapeHtml(str) {
    return String(str)
        .replace(/&/g,  '&amp;')
        .replace(/</g,  '&lt;')
        .replace(/>/g,  '&gt;')
        .replace(/"/g,  '&quot;')
        .replace(/'/g,  '&#039;');
}
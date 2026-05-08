/**
 * Layouts
 * Controlador global del layout (header y footer).
 * Maneja:
 * - Inyección del header y footer en el DOM
 * - Carga dinámica del modal de autenticación
 * - Menú de usuario (autenticado / no autenticado)
 * - Dropdown de chat con carga y refresco automático
 * - Tema claro / oscuro persistido en localStorage
 * - Sidebar de usuario
 * - Baja de cuenta
 * - Modal de redes sociales
 * - Dropdown de documentación
 */

const headerHTML = `
<header>
  <nav>
    <div class="logo-container">
      <a href="index.php">
        <img src="assets/img/ico/icono.svg" alt="Logo MOVEos">
        <span>MOVEos</span>
      </a>
    </div>

    <button class="menu-toggle" aria-label="Abrir menú">
      <i class="fa-solid fa-bars"></i>
    </button>

    <ul id="list">
      <li><a href="index.php">Inicio</a></li>
      <li id="how"><a href="index.php#how-tutorial">Cómo Funciona</a></li>
      <li class="docs-menu-container">
        <button id="docs-btn">
          <i class="fas fa-file-alt docs"></i>
        </button>
        <div id="docs-dropdown" class="invisible">
          <a href="index.php?accion=docsJS" target="_blank">JSDoc</a>
          <a href="index.php?accion=docsPHP" target="_blank">PHPDoc</a>
        </div>
      </li>
    </ul>

    <div class="icons">
      <!-- Theme switch -->
      <label class="switch">
        <input type="checkbox" id="theme-toggle">
        <span class="slider"></span>
      </label>

      <div class="chat-menu-container">
        <button id="chat-btn"><i class="fa-solid fa-bell"></i></button>
        <div id="chat-dropdown" class="invisible">
          <div class="chat-hub-page-select" id="chatHubContainer">
            <div class="chat-hub-loading">
              <i class="fas fa-spinner fa-spin"></i>
              <p>Cargando conversaciones...</p>
            </div>
          </div>
        </div>
      </div>

      <div class="user-menu-container" id="user-menu-area">
        <!-- Se rellena dinámicamente según sesión -->
      </div>
    </div>

    <div id="userSidebar" class="sidebar">
      <span class="closebtn">&times;</span>
      <a href="index.php?accion=viewInfo">Ver datos usuario</a>
      <a href="index.php?accion=editUser">Editar datos</a>
      <a href="index.php?accion=forgot-password">Recuperar contraseña</a>
      <a href="index.php?accion=chatHub" id="sidebarChatLink">Mis conversaciones</a>
      <a href="#" id="social-link">Redes sociales</a>
      <a href="#" id="unsubscribeBtn">Dar de baja</a>
    </div>
  </nav>
</header>
<div id="social-modal" class="modal-social invisible">
  <div class="modal-content">
    <div class="social-links">
      <a href="#" data-app="instagram"><img src="assets/img/social/instagram.png" alt="Instagram"></a>
      <a href="#" data-app="twitter"><img src="assets/img/social/x.png" alt="X"></a>
      <a href="#" data-app="facebook"><img src="assets/img/social/facebook.png" alt="Facebook"></a>
    </div>
  </div>
</div>
`;

const footerHTML = `
<footer>
  <section>
    <div class="logo-container">
      <a href="#">
        <img src="assets/img/ico/icono.svg" alt="Logo MOVEos">
        <span>MOVEos</span>
      </a>
      <p>Dinamismo, cambio y participación activa en cada experiencia.</p>
    </div>
    <div>
      <h4>Plataforma</h4>
      <ul>
        <li><a href="index.php?accion=seeActivities">Explorar</a></li>
        <li><a href="index.php">Cómo Funciona</a></li>
      </ul>
    </div>
    <div>
      <h4>Soporte</h4>
      <ul>
        <li><a href="#">Contacto</a></li>
        <li><a href="#">Privacidad</a></li>
      </ul>
    </div>
  </section>
  <p>© 2025 MOVEos. Todos los derechos reservados.</p>
</footer>
`;

document.addEventListener("DOMContentLoaded", () => {
  loadAuthModal();
  injectLayout();
  initThemeLogic();
  initUserLogic();
  initSidebarLogic();
  initChatLogic();
  initDocsLogic();
  initUnsubscribeLogic();
  initSocialModal();
});

/**
 * Carga `auth-modal.js` dinámicamente si aún no está disponible en el contexto global.
 * Evita duplicar la carga si `window.openAuthModal` ya existe.
 */
function loadAuthModal() {
  if (window.openAuthModal) return;
  const script = document.createElement('script');
  script.src = 'assets/js/utils/auth-modal.js';
  document.head.appendChild(script);
}

/**
 * Inyecta el HTML del header y el footer en sus contenedores del DOM.
 * Espera que existan elementos con id `header` y `footer` en la página.
 */
function injectLayout() {
  document.getElementById('header')?.insertAdjacentHTML('afterbegin', headerHTML);
  document.getElementById('footer')?.insertAdjacentHTML('afterbegin', footerHTML);
}

/**
 * Inicializa el área de usuario en el header según el estado de sesión.
 * - Sin sesión: muestra botones de login y registro que abren el modal.
 * - Con sesión: muestra el avatar, dropdown con nombre y enlace de logout.
 * Depende de `window.CURRENT_USER` para determinar el estado.
 */
function initUserLogic() {
  const userMenuArea = document.getElementById('user-menu-area');
  const user = window.CURRENT_USER || null;

  if (!userMenuArea) return;

  if (!user) {
    // Sin sesión: botones de acceso rápido al modal
    userMenuArea.innerHTML = `
      <div class="auth-header-btns">
        <button id="header-login-btn" class="btn-header-login"><i class="fa-solid fa-right-to-bracket"></i></button>
        <button id="header-register-btn" class="btn-header-register"><i class="fa-solid fa-user-plus"></i></button>
      </div>`;

    document.getElementById('header-login-btn')?.addEventListener('click', () => {
      if (window.openAuthModal) openAuthModal('login');
      else window.location.href = 'index.php?accion=loginView';
    });

    document.getElementById('header-register-btn')?.addEventListener('click', () => {
      if (window.openAuthModal) openAuthModal('register');
      else window.location.href = 'index.php?accion=register';
    });

    return;
  }

  // Con sesión: avatar + dropdown con nombre y logout
  userMenuArea.innerHTML = `
    <button id="user-btn"><img id="nav-avatar" class="nav-avatar" src="assets/img/default-avatar.png" alt="Avatar"></button>
    <div id="user-dropdown" class="invisible">
      <span id="display-username"></span>
      <a href="#" id="logout-link">Cerrar sesión</a>
    </div>`;

  const userBtn = document.getElementById('user-btn');
  const userDropdown = document.getElementById('user-dropdown');
  const logoutLink = document.getElementById('logout-link');
  const displayUsername = document.getElementById('display-username');

  // Aplicar avatar personalizado si el usuario tiene imagen de perfil
  const navAvatar = document.getElementById('nav-avatar');
  if (navAvatar && user.profile_image) {
    navAvatar.src = user.profile_image + '?t=' + Date.now();
  }

  userBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (displayUsername) displayUsername.innerText = user.name || 'Usuario';
    hideElement(document.getElementById('chat-dropdown'));
    toggleVisibility(userDropdown);
  });

  logoutLink?.addEventListener('click', (e) => {
    e.preventDefault();
    hideElement(userDropdown);
    window.location.href = 'index.php?accion=logout';
  });
}

/**
 * Inicializa el dropdown de chat en el header.
 * Carga las conversaciones del usuario al abrir y las refresca cada 5 segundos.
 * Distingue entre vistas de administrador y usuario normal.
 * Si no hay sesión, redirige al modal de login al hacer clic.
 */
function initChatLogic() {
  const chatBtn = document.getElementById('chat-btn');
  const chatDropdown = document.getElementById('chat-dropdown');
  const chatHubContainer = document.getElementById('chatHubContainer');
  const user = window.CURRENT_USER || null;

  if (!chatBtn || !chatDropdown || !chatHubContainer) return;

  let lastChatState = null;
  let isLoading = false;

  /**
   * Renderiza la lista de conversaciones en el dropdown.
   * Construye las tarjetas con `DocumentFragment` para minimizar reflows.
   *
   * @param {Object} data - Datos de conversaciones devueltos por el servidor
   * @param {boolean} data.is_admin - Si el usuario es administrador
   * @param {Object} [data.support_room] - Sala de soporte (solo usuarios no admin)
   * @param {Array}  [data.activities]   - Actividades con chat (solo usuarios no admin)
   * @param {Array}  [data.user_conversations] - Conversaciones de usuarios (solo admin)
   */
  async function renderChats(data) {
    chatHubContainer.innerHTML = '';
    const fragment = document.createDocumentFragment();

    // Chat de soporte MOVEos (solo usuarios no administradores)
    if (data.support_room && !data.is_admin) {
      const supportDiv = document.createElement('a');
      supportDiv.href = "index.php?accion=userAdminChat";
      supportDiv.className = "chat-card chat-card--support";
      supportDiv.innerHTML = `
        <div class="chat-card__header">
          <div class="chat-card__icon">
            <img src="assets/img/perfilAdmin.png" alt="Admin">
          </div>
          <div>
            <h2 class="chat-card__title">Soporte MOVEos</h2>
            <span class="chat-card__type">Chat con administración</span>
          </div>
        </div>
      `;
      fragment.appendChild(supportDiv);
    }

    // Chats de actividades (solo usuarios no administradores)
    if (!data.is_admin && data.activities?.length) {
      data.activities.forEach(act => {
        const chatDiv = document.createElement('a');
        chatDiv.href = `index.php?accion=chatActivity&activity_id=${act.room_id}`;
        chatDiv.className = "chat-card";

        const imgHtml = act.image_url
          ? `<img src="${act.image_url}" class="chat-card__img" alt="${escapeHtml(act.title)}" onerror="this.src='assets/img/default-activity.jpg'">`
          : `<div class="chat-card__icon"><i class="fas fa-users"></i></div>`;

        chatDiv.innerHTML = `
          <div class="chat-card__header">
            ${imgHtml}
            <div style="min-width:0">
              <h2 class="chat-card__title" title="${escapeHtml(act.title)}">
                ${escapeHtml(act.title)}
              </h2>
              <span class="chat-card__type">Grupo de Actividad</span>
            </div>
          </div>
        `;
        fragment.appendChild(chatDiv);
      });
    }

    // Conversaciones con usuarios (solo administradores)
    if (data.is_admin) {
      if (data.user_conversations?.length) {
        data.user_conversations.forEach(conv => {
          const convDiv = document.createElement('a');
          convDiv.href = `index.php?accion=chatHub`;
          convDiv.className = "chat-card";

          const imgHtml = conv.profile_image
            ? `<img src="${conv.profile_image}" class="chat-card__img"
                 alt="${escapeHtml(conv.full_name)}"
                 onerror="this.src='assets/img/perfilAdmin.png'">`
            : `<div class="chat-card__icon"><i class="fas fa-user"></i></div>`;

          convDiv.innerHTML = `
            <div class="chat-card__header">
              ${imgHtml}
              <div style="min-width:0">
                <h2 class="chat-card__title">${escapeHtml(conv.full_name)}</h2>
                <span class="chat-card__type">@${escapeHtml(conv.username)}</span>
              </div>
            </div>
          `;
          fragment.appendChild(convDiv);
        });
      } else {
        const empty = document.createElement('p');
        empty.className = 'no-activities';
        empty.textContent = 'No hay conversaciones aún.';
        fragment.appendChild(empty);
      }
    }

    // Estado vacío para usuario normal sin conversaciones
    if (!data.is_admin && !data.activities?.length && !data.support_room) {
      const empty = document.createElement('p');
      empty.className = 'no-activities';
      empty.textContent = 'No hay conversaciones aún.';
      fragment.appendChild(empty);
    }

    chatHubContainer.appendChild(fragment);
  }

  /**
   * Obtiene las conversaciones del servidor y actualiza el dropdown
   * solo si los datos han cambiado respecto al último estado conocido.
   * Evita peticiones simultáneas con la bandera `isLoading`.
   *
   * @returns {Promise<void>}
   */
  async function loadChats() {
    if (isLoading) return;
    isLoading = true;

    try {
      const res = await fetch('index.php?accion=getChatHub');
      const data = await res.json();

      if (!data.success) return;

      const currentState = JSON.stringify(data);
      if (currentState !== lastChatState) {
        lastChatState = currentState;
        renderChats(data);
      }
    } finally {
      isLoading = false;
    }
  }

  chatBtn.addEventListener('click', async (e) => {
    e.stopPropagation();

    // Sin sesión: abrir modal de login en lugar del dropdown
    if (!user) {
      if (window.openAuthModal) return openAuthModal('login');
      return window.location.href = 'index.php?accion=loginView';
    }

    hideElement(document.getElementById('user-dropdown'));
    toggleVisibility(chatDropdown);

    // Mostrar spinner solo en la primera carga
    if (!lastChatState) {
      chatHubContainer.innerHTML = `
        <div class="chat-hub-loading">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Cargando conversaciones...</p>
        </div>
      `;
    }

    try {
      await loadChats();
    } catch {
      chatHubContainer.innerHTML = `<p class="no-activities">No se pudieron cargar los chats.</p>`;
    }
  });

  // Refresco automático cada 5 segundos mientras hay sesión activa
  setInterval(() => {
    if (!window.CURRENT_USER) return;
    loadChats().catch(e => console.error("Error actualizando chats", e));
  }, 5000);
}

/**
 * Inicializa el toggle de tema claro/oscuro.
 * Lee el modo guardado en `localStorage` y lo aplica al cargar.
 * Persiste el nuevo modo al cambiar el toggle.
 */
function initThemeLogic() {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;

  document.body.classList.toggle('dark-mode', localStorage.getItem('mode') === 'dark');
  themeToggle.checked = document.body.classList.contains('dark-mode');

  themeToggle.addEventListener('change', () => {
    const isDark = themeToggle.checked;
    document.body.classList.toggle('dark-mode', isDark);
    localStorage.setItem('mode', isDark ? 'dark' : 'light');
  });
}

/**
 * Inicializa el sidebar deslizante de opciones del usuario.
 * - Se abre al hacer clic sobre el nombre de usuario en el dropdown.
 * - Muestra el enlace al chat solo para participantes y organizadores.
 * - Se cierra con el botón ×, o al hacer clic fuera del sidebar.
 */
function initSidebarLogic() {
  const displayUsername = document.getElementById('display-username');
  const userDropdown = document.getElementById('user-dropdown');
  const sidebar = document.getElementById('userSidebar');
  const closeBtn = sidebar?.querySelector('.closebtn');
  if (!sidebar) return;

  displayUsername?.addEventListener('click', () => sidebar.style.width = '250px');

  // El enlace al chat solo es visible para roles no administrador
  const user = window.CURRENT_USER;
  const chatLink = document.getElementById('sidebarChatLink');
  if (user && user.role !== 'administrador' && chatLink) {
    chatLink.style.display = 'block';
  }

  closeBtn?.addEventListener('click', () => sidebar.style.width = '0');

  window.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && e.target !== displayUsername) {
      sidebar.style.width = '0';
    }
    hideElement(userDropdown);
  });
}

/**
 * Inicializa el botón de baja de cuenta.
 * Muestra una confirmación antes de enviar la petición al servidor.
 * Si el servidor confirma la baja, redirige a la página de inicio.
 */
function initUnsubscribeLogic() {
  const unsubscribeLink = document.getElementById("unsubscribeBtn");
  if (!unsubscribeLink) return;

  unsubscribeLink.addEventListener("click", async (e) => {
    e.preventDefault();

    const confirmed = await showConfirm({
      title: "Dar de baja su cuenta",
      message: "Esta acción es irreversible.\n¿Deseas continuar?"
    });

    if (!confirmed) return;

    try {
      const res = await fetch("index.php?accion=unsubscribe", {
        method: "POST",
        headers: { "Accept": "application/json" }
      });
      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("El servidor no devolvió JSON válido");
      }

      if (data.success) {
        await showAlert("Cuenta eliminada", data.message, 'info', 1500);
        window.location.href = "index.php";
        return;
      }

      showAlert("Error", "No se pudo eliminar");
    } catch (err) {
      console.error(err);
      showAlert("Error", "Error al eliminar la cuenta");
    }
  });
}

/**
 * Inicializa el modal de redes sociales del sidebar.
 * Al abrirse, cierra el sidebar para evitar solapamiento.
 * Cierra el modal con su botón, o al hacer clic fuera del contenido.
 * Delega la apertura de cada red a `openSocial`.
 */
function initSocialModal() {
  const link = document.getElementById('social-link');
  const modal = document.getElementById('social-modal');
  const closeBtn = modal?.querySelector('.close-modal');

  if (!link || !modal) return;

  link.addEventListener('click', (e) => {
    e.preventDefault();
    const sidebar = document.getElementById('userSidebar');
    if (sidebar) sidebar.style.width = '0';
    modal.classList.remove('invisible');
    modal.classList.add('visible');
  });

  closeBtn?.addEventListener('click', () => {
    modal.classList.remove('visible');
    modal.classList.add('invisible');
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('visible');
      modal.classList.add('invisible');
    }
  });

  modal.querySelectorAll('.social-links a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      openSocial(link.dataset.app);
    });
  });
}

/**
 * Inicializa el dropdown de acceso a la documentación (JSDoc / PHPDoc).
 * Cierra los demás dropdowns al abrirse.
 * Se cierra al hacer clic en cualquier parte fuera de él.
 */
function initDocsLogic() {
  const docsBtn = document.getElementById('docs-btn');
  const docsDropdown = document.getElementById('docs-dropdown');

  if (!docsBtn || !docsDropdown) return;

  docsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    hideElement(document.getElementById('user-dropdown'));
    hideElement(document.getElementById('chat-dropdown'));
    toggleVisibility(docsDropdown);
  });

  window.addEventListener('click', () => hideElement(docsDropdown));
}

/**
 * Intenta abrir la app nativa de la red social en móvil.
 * Si no está instalada, redirige al login web tras 800ms.
 * En escritorio abre directamente el login web en nueva pestaña.
 *
 * @param {'instagram'|'twitter'|'facebook'} app - Identificador de la red social
 */
function openSocial(app) {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const urls = {
    instagram: { app: "instagram://", web: "https://www.instagram.com/move.os.web/" },
    twitter: { app: "twitter://", web: "https://twitter.com/login" },
    facebook: { app: "fb://", web: "https://www.facebook.com/login" }
  };

  const selected = urls[app];
  if (!selected) return;

  if (isMobile) {
    window.location.href = selected.app;
    // Si la app no está instalada, el fallback redirige al navegador
    setTimeout(() => { window.location.href = selected.web; }, 800);
  } else {
    window.open(selected.web, "_blank");
  }
}

/**
 * Alterna las clases `visible` / `invisible` de un elemento.
 *
 * @param {HTMLElement} el - Elemento a alternar
 */
function toggleVisibility(el) {
  el.classList.toggle('visible');
  el.classList.toggle('invisible');
}

/**
 * Oculta un elemento añadiendo `invisible` y quitando `visible`.
 * No lanza error si el elemento no existe.
 *
 * @param {HTMLElement|null} el - Elemento a ocultar
 */
function hideElement(el) {
  if (!el) return;
  el.classList.remove('visible');
  el.classList.add('invisible');
}
/* =========================
   HEADER Y FOOTER HTML
   ========================= */
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
      <li><a href="index.php?accion=docs" target="_blank"><i class="fas fa-file-alt docs"></i></a></li>
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
          <div class="chat-hub-page" id="chatHubContainer">
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
      <a href="#">Redes sociales</a>
      <a href="index.php?accion=unsubscribe">Dar de baja</a>
    </div>
  </nav>
</header>
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

/* =========================
   INICIALIZADOR PRINCIPAL
   ========================= */
document.addEventListener("DOMContentLoaded", () => {
  loadAuthModal();
  injectLayout();
  initThemeLogic();
  initUserLogic();
  initSidebarLogic();
  initChatLogic();
  initUnsubscribeLogic();
});

/**
 * Carga auth-modal.js dinámicamente si no está ya en el DOM
 */
function loadAuthModal() {
  if (window.openAuthModal) return; // ya cargado
  const script = document.createElement('script');
  script.src = 'assets/js/utils/auth-modal.js';
  document.head.appendChild(script);
}

/* =========================
   LAYOUT
   ========================= */
function injectLayout() {
  document.getElementById('header')?.insertAdjacentHTML('afterbegin', headerHTML);
  document.getElementById('footer')?.insertAdjacentHTML('afterbegin', footerHTML);
}

/* =========================
   USUARIO: DROPDOWN Y LOGOUT
   ========================= */
function initUserLogic() {
  const userMenuArea = document.getElementById('user-menu-area');
  const user = window.CURRENT_USER || null;

  if (!userMenuArea) return;

  if (!user) {
    // Usuario NO autenticado → mostrar botones de acceso
    userMenuArea.innerHTML = `
      <div class="auth-header-btns">
        <button id="header-login-btn" class="btn-header-login">Iniciar sesión</button>
        <button id="header-register-btn" class="btn-header-register">Registrarse</button>
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

  // Usuario autenticado → mostrar avatar + dropdown
  userMenuArea.innerHTML = `
    <button id="user-btn"><img id="nav-avatar" class="nav-avatar" src="assets/img/default-avatar.png" alt="Avatar"></button>
    <div id="user-dropdown" class="invisible">
      <span id="display-username"></span>
      <a href="#" id="logout-link">Cerrar sesión</a>
    </div>`;

  const userBtn      = document.getElementById('user-btn');
  const userDropdown = document.getElementById('user-dropdown');
  const logoutLink   = document.getElementById('logout-link');
  const displayUsername = document.getElementById('display-username');

  // Actualizar avatar
  const navAvatar = document.getElementById('nav-avatar');
  if (navAvatar && user.profile_image) {
    navAvatar.src = user.profile_image + '?t=' + Date.now();
  }

  userBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    displayUsername && (displayUsername.innerText = user.name || 'Usuario');
    hideElement(document.getElementById('chat-dropdown'));
    toggleVisibility(userDropdown);
  });

  logoutLink?.addEventListener('click', (e) => {
    e.preventDefault();
    hideElement(userDropdown);
    window.location.href = 'index.php?accion=logout';
  });
}

function initChatLogic() {
  const chatBtn = document.getElementById('chat-btn');
  const chatDropdown = document.getElementById('chat-dropdown');
  const chatHubContainer = document.getElementById('chatHubContainer');
  const user = window.CURRENT_USER || null;

  if (!chatBtn || !chatDropdown || !chatHubContainer) return;

  chatBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (!user) {
      if (window.openAuthModal) return openAuthModal('login');
      return window.location.href = 'index.php?accion=loginView';
    }

    hideElement(document.getElementById('user-dropdown'));
    toggleVisibility(chatDropdown);

    chatHubContainer.innerHTML = `
      <div class="chat-hub-loading">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Cargando conversaciones...</p>
      </div>
    `;

    try {
      const response = await fetch('index.php?accion=getChatHub');
      const data = await response.json();

      if (!data.success) throw new Error(data.message || 'Error al cargar chats');

      chatHubContainer.innerHTML = '';
      const fragment = document.createDocumentFragment();

      // Chat soporte (solo para no administradores)
      if (data.support_room && !data.is_admin) {
        const supportDiv = document.createElement('a');
        supportDiv.href = "index.php?accion=userAdminChat";
        supportDiv.className = "chat-card chat-card--support";
        supportDiv.innerHTML = `
          <div class="chat-card__header">
            <div class="chat-card__icon"><img src="assets/img/perfilAdmin.png" alt="Admin"></div>
            <div>
              <h2 class="chat-card__title">Soporte MOVEos</h2>
              <span class="chat-card__type">Chat con administración</span>
            </div>
          </div>
        `;
        fragment.appendChild(supportDiv);
      }

      // Chats de actividades (para no administradores)
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
                <h2 class="chat-card__title" title="${escapeHtml(act.title)}">${escapeHtml(act.title)}</h2>
                <span class="chat-card__type">Grupo de Actividad</span>
              </div>
            </div>
          `;
          fragment.appendChild(chatDiv);
        });
      }

      // Conversaciones con usuarios (solo administrador)
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

      // Mensaje si no hay nada para no administradores
      if (!data.is_admin && !data.activities?.length && !data.support_room) {
        const empty = document.createElement('p');
        empty.className = 'no-activities';
        empty.textContent = 'No hay conversaciones aún.';
        fragment.appendChild(empty);
      }

      chatHubContainer.appendChild(fragment);

    } catch (err) {
      chatHubContainer.innerHTML = `
        <p class="no-activities">
          No se pudieron cargar los chats.
        </p>
      `;
    }
  });
}

/* =========================
   TEMA CLARO / OSCURO
   ========================= */
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

/* =========================
   SIDEBAR USUARIO
   ========================= */
function initSidebarLogic() {
  const displayUsername = document.getElementById('display-username');
  const userDropdown = document.getElementById('user-dropdown');
  const sidebar = document.getElementById('userSidebar');
  const closeBtn = sidebar?.querySelector('.closebtn');
  if (!sidebar) return;

  // Abrir sidebar
  displayUsername?.addEventListener('click', () => sidebar.style.width = '250px');

  // Mostrar link de chat solo para participantes y organizadores
  const user = window.CURRENT_USER;
  const chatLink = document.getElementById('sidebarChatLink');

  if (user && user.role !== 'administrador') {
    if (chatLink) chatLink.style.display = 'block';
  }

  // Cerrar sidebar
  closeBtn?.addEventListener('click', () => sidebar.style.width = '0');

  // Cerrar al hacer click fuera
  window.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && e.target !== displayUsername) sidebar.style.width = '0';
    hideElement(userDropdown);
  });
}

/* =========================
   DAR DE BAJA (UNSUBSCRIBE)
   ========================= */
function initUnsubscribeLogic() {
  const unsubscribeLink = document.querySelector('a[href="index.php?accion=unsubscribe"]');
  if (!unsubscribeLink) return;

  unsubscribeLink.addEventListener("click", async (e) => {
    e.preventDefault();

    const confirmDelete = await showConfirm({
      title: "Dar de baja su cuenta",
      message: "Esta acción es irreversible.\nSe eliminará tu cuenta y todos tus datos.\n¿Deseas continuar?"
    });

    if (!confirmDelete) return;

    try {
      const res = await fetch("index.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "unsubscribe" })
      });

      const data = await res.json();

      if (data.success) {
        showAlert({
          title: "Cuenta eliminada",
          message: "Tu cuenta se eliminó correctamente"
        });

        setTimeout(() => {
          window.location.href = "index.php";
        }, 1200);
      } else {
        showAlert({
          title: "Error",
          message: data.message || "No se pudo eliminar la cuenta"
        });
      }
    } catch (err) {
      showAlert({
        title: "Error",
        message: "Error al eliminar la cuenta"
      });
    }
  });
}

/* =========================
   HELPERS
   ========================= */
function toggleVisibility(el) {
  el.classList.toggle('visible');
  el.classList.toggle('invisible');
}

function hideElement(el) {
  if (!el) return;
  el.classList.remove('visible');
  el.classList.add('invisible');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
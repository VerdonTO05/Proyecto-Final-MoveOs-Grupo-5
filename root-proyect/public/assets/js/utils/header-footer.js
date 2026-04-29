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
  initDocsLogic();
  initUnsubscribeLogic();
  initSocialModal();
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

  // Usuario autenticado → mostrar avatar + dropdown
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
  const unsubscribeLink = document.getElementById("unsubscribeBtn");

  if (!unsubscribeLink) {
    console.warn("unsubscribeBtn no encontrado");
    return;
  }

  console.log("unsubscribe init cargado");

  unsubscribeLink.addEventListener("click", async (e) => {
    e.preventDefault();

    const confirmDelete = await showConfirm({
      title: "Dar de baja su cuenta",
      message: "Esta acción es irreversible.\n¿Deseas continuar?"
    });

    if (!confirmDelete) return;

    try {
      const res = await fetch("index.php?accion=unsubscribe", {
        method: "POST",
        headers: {
          "Accept": "application/json"
        }
      });

      const text = await res.text(); // 👈 DEBUG CLAVE

      console.log("RESPUESTA RAW:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
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

      showAlert(
        "Error",
        "Error al eliminar la cuenta"
      );
    }
  });
}

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

  // Cerrar modal
  closeBtn?.addEventListener('click', () => {
    modal.classList.remove('visible');
    modal.classList.add('invisible');
  });

  // Click fuera
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('visible');
      modal.classList.add('invisible');
    }
  });

  // Links redes
  modal.querySelectorAll('.social-links a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      const app = link.dataset.app;
      openSocial(app);
    });
  });
}

function initDocsLogic() {
  const docsBtn = document.getElementById('docs-btn');
  const docsDropdown = document.getElementById('docs-dropdown');

  if (!docsBtn || !docsDropdown) return;

  docsBtn.addEventListener('click', (e) => {
    e.stopPropagation();

    // cerrar otros dropdowns
    hideElement(document.getElementById('user-dropdown'));
    hideElement(document.getElementById('chat-dropdown'));

    toggleVisibility(docsDropdown);
  });

  // cerrar al hacer click fuera
  window.addEventListener('click', () => {
    hideElement(docsDropdown);
  });
}

function openSocial(app) {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const urls = {
    instagram: {
      app: "instagram://",
      web: "https://www.instagram.com/accounts/login/"
    },
    twitter: {
      app: "twitter://",
      web: "https://twitter.com/login"
    },
    facebook: {
      app: "fb://",
      web: "https://www.facebook.com/login"
    }
  };

  const selected = urls[app];
  if (!selected) return;

  if (isMobile) {
    // Intentar abrir app
    window.location.href = selected.app;

    // Fallback a web si no abre
    setTimeout(() => {
      window.location.href = selected.web;
    }, 800);
  } else {
    // Desktop → directo a login web
    window.open(selected.web, "_blank");
  }
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
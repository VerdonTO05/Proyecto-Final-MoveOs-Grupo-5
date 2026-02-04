/**
 * HTML del header principal de la aplicación
 * @type {string}
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
      <li id="how"><a href="#">Cómo Funciona</a></li>
    </ul>

    <div class="icons">
      <!-- Theme switch -->
      <label class="switch">
        <input type="checkbox" id="theme-toggle">
        <span class="slider"></span>
      </label>

      <div class="user-menu-container">
        <button id="user-btn">
          <i class="fas fa-user"></i>
        </button>

        <div id="user-dropdown" class="invisible">
          <span id="display-username"></span>
          <a href="#" id="logout-link">Cerrar sesión</a>
        </div>
      </div>
    </div>

    <div id="userSidebar" class="sidebar">
      <span class="closebtn">&times;</span>
      <a href="#">Ver datos usuario</a>
      <a href="#">Editar datos</a>
      <a href="#">Dar de baja</a>
    </div>
  </nav>
</header>
`;

/**
 * HTML del footer principal de la aplicación
 * @type {string}
 */
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

/**
 * Punto de entrada principal de la aplicación.
 * Inserta header y footer e inicializa las lógicas principales.
 */
document.addEventListener("DOMContentLoaded", () => {
  injectLayout();
  initThemeLogic();
  initUserLogic();
  initSidebarLogic();
});

/**
 * Inserta dinámicamente el header y el footer en el DOM
 */
function injectLayout() {
  const headerEl = document.getElementById('header');
  const footerEl = document.getElementById('footer');

  if (headerEl) headerEl.innerHTML = headerHTML;
  if (footerEl) footerEl.innerHTML = footerHTML;
}

/**
 * Gestiona la lógica del usuario:
 * - Mostrar dropdown
 * - Redirección a login si no hay sesión
 * - Logout
 */
function initUserLogic() {
  const userBtn = document.getElementById('user-btn');
  const userDropdown = document.getElementById('user-dropdown');
  const logoutLink = document.getElementById('logout-link');
  const displayUsername = document.getElementById('display-username');

  /** @type {{ name?: string } | null} */
  const user = window.CURRENT_USER || null;

  if (!userBtn || !userDropdown) return;

  // Toggle del dropdown de usuario
  userBtn.addEventListener('click', (e) => {
    e.stopPropagation();

    if (!user) {
      window.location.href = 'index.php?accion=loginView';
      return;
    }

    if (displayUsername) {
      displayUsername.innerText = user.name || 'Usuario';
    }

    toggleVisibility(userDropdown);
  });

  // Logout
  logoutLink?.addEventListener('click', (e) => {
    e.preventDefault();
    hideElement(userDropdown);
    window.location.href = 'index.php?accion=logout';
  });
}

/**
 * Gestiona el modo claro / oscuro de la aplicación.
 * El estado se guarda en localStorage.
 */
function initThemeLogic() {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;

  const savedTheme = localStorage.getItem('mode');

  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.checked = true;
  }

  themeToggle.addEventListener('change', () => {
    const isDark = themeToggle.checked;
    document.body.classList.toggle('dark-mode', isDark);
    localStorage.setItem('mode', isDark ? 'dark' : 'light');
  });
}

/**
 * Gestiona la apertura y cierre del sidebar de usuario
 */
function initSidebarLogic() {
  const displayUsername = document.getElementById('display-username');
  const userDropdown = document.getElementById('user-dropdown');
  const sidebar = document.getElementById('userSidebar');
  const closeBtn = sidebar?.querySelector('.closebtn');

  if (!sidebar) return;

  // Abrir sidebar
  displayUsername?.addEventListener('click', () => {
    sidebar.style.width = '250px';
  });

  // Cerrar sidebar
  closeBtn?.addEventListener('click', () => {
    sidebar.style.width = '0';
  });

  // Cerrar sidebar y dropdown al hacer clic fuera
  window.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && e.target !== displayUsername) {
      sidebar.style.width = '0';
    }
    hideElement(userDropdown);
  });
}

/* =========================
   Helpers reutilizables
   ========================= */

/**
 * Alterna las clases visible / invisible de un elemento
 * @param {HTMLElement} element
 */
function toggleVisibility(element) {
  element.classList.toggle('visible');
  element.classList.toggle('invisible');
}

/**
 * Oculta un elemento aplicando la clase invisible
 * @param {HTMLElement | null} element
 */
function hideElement(element) {
  if (!element) return;
  element.classList.remove('visible');
  element.classList.add('invisible');
}

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

// Estructura footer
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

// Ejecución principal al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
    const headerEl = document.getElementById('header');
    const footerEl = document.getElementById('footer');

    if (headerEl) headerEl.innerHTML = headerHTML;
    if (footerEl) footerEl.innerHTML = footerHTML;

    // Inicializar lógicas
    initThemeLogic();
    initUserLogic();
    initSidebarLogic();
});

/**
 * Gestiona el clic en el icono de usuario y el logout
 */
function initUserLogic() {
    const userBtn = document.getElementById('user-btn');
    const userDropdown = document.getElementById('user-dropdown');
    const logoutLink = document.getElementById('logout-link');
    const displayUsername = document.getElementById('display-username');

    const user = window.CURRENT_USER || null;

    // Dropdown toggle
    if (userBtn) {
        userBtn.addEventListener('click', (e) => {
            e.stopPropagation();

            if (!user) {
                window.location.href = 'index.php?accion=loginView';
                return;
            }

            if (displayUsername) displayUsername.innerText = user.name || "Usuario";

            userDropdown.classList.toggle('invisible');
            userDropdown.classList.toggle('visible');
        });
    }

    // 🔹 Logout
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();

            // Cerrar dropdown
            if (userDropdown) {
                userDropdown.classList.remove('visible');
                userDropdown.classList.add('invisible');
            }
            // Redirigir al logout
            window.location.href = 'index.php?accion=logout';
        });
    }
}


/**
 * Gestiona el modo claro / oscuro
 */
function initThemeLogic() {
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('mode');

    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeToggle) themeToggle.checked = true;
    }

    if (themeToggle) {
        themeToggle.addEventListener('change', () => {
            if (themeToggle.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('mode', 'dark');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('mode', 'light');
            }
        });
    }
}

// Inicializar lógica del sidebar
function initSidebarLogic() {
    const displayUsername = document.getElementById('display-username');
    const userDropdown = document.getElementById('user-dropdown');
    const sidebar = document.getElementById('userSidebar');
    const closeBtn = sidebar.querySelector('.closebtn');

    // Abrir sidebar al pulsar el nombre
    displayUsername?.addEventListener('click', () => {
        sidebar.style.width = '250px';
    });

    // Cerrar sidebar
    closeBtn?.addEventListener('click', () => {
        sidebar.style.width = '0';
    });

    // Cerrar si se hace clic fuera
    window.addEventListener('click', (e) => {
        if (sidebar && !sidebar.contains(e.target) && e.target !== displayUsername) {
            sidebar.style.width = '0';
        }
        if (userDropdown) {
            userDropdown.classList.remove('visible');
            userDropdown.classList.add('invisible');
        }
    });
}

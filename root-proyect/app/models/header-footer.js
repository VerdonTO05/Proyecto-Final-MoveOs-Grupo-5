const headerHTML = `
<header>
  <nav>
    <!-- Logo -->
    <div class="logo-container">
      <a href="landing.php">
        <img src="assets/img/ico/icono.svg" alt="Logo MOVEos">
        <span>MOVEos</span>
      </a>
    </div>

    <!-- Botón hamburguesa (solo móvil) -->
    <button class="menu-toggle" aria-label="Abrir menú">
      <i class="fa-solid fa-bars"></i>
    </button>

    <!-- Menú -->
    <ul id="list">
      <li><a href="index.php">Inicio</a></li>
      <li id="how"><a href="#">Cómo Funciona</a></li>
    </ul>

    <!-- Iconos / Usuario -->
    <div class="icons">
      <!-- Theme switch -->
      <label class="switch">
        <input type="checkbox" id="theme-toggle">
        <span class="slider"></span>
      </label>

      <!-- Usuario -->
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
                <li><a href="#">Cómo Funciona</a></li>
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

    if (userBtn) {
        userBtn.addEventListener('click', (e) => {
            e.stopPropagation();

            if (!user) {
                window.location.href = 'index.php?accion=login';
                return;
            }

            if (displayUsername) displayUsername.innerText = user || "Usuario";

            if (userDropdown.classList.contains("invisible")) {
                userDropdown.remove.classList('invisible');
                userDropdown.add.classList('visible');
            }else{
                userDropdown.remove.classList('visible');
                userDropdown.add.classList('invisible');
            }
        });
    }

    // window.addEventListener('click', () => {
    //     if (userDropdown && userDropdown.style.display === 'flex') {
    //         userDropdown.style.display = 'none';
    //     }
    // });

    // Logout seguro
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '../controllers/logout.php';
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

{//HAY QUE CREAR LA PAGINA DE MI PERFIL PARA EL DESPLEGABLE DEL HEADER
    // 1. Definición de la estructura del Header
    const headerHTML = `
    <header>
        <nav>
            <div class="logo-container">
                <a href="landing.php">
                    <img src="../../public/assets/img/ico/icono.svg" alt="Logo MOVEos">
                    <span>MOVEos</span>
                </a>
            </div>
            <ul id="list">
                <li><a href="landing.php">Inicio</a></li>
                <li id="how"><a href="#">Cómo Funciona</a></li>
            </ul>
            <div class="icons">
                <label class="switch">
                    <input type="checkbox" id="theme-toggle">
                    <span class="slider"></span>
                </label>
                
                <div class="user-menu-container" style="position: relative; display: inline-block;">
                    <button id="user-btn" style="background:none; border:none; cursor:pointer; color:inherit; font-size:1.2rem; padding: 5px;">
                        <i class="fas fa-user"></i>
                    </button>
                    
                    <div id="user-dropdown" style="display: none; position: absolute; right: 0; top: 100%; background: white; min-width: 180px; box-shadow: 0px 4px 12px rgba(0,0,0,0.15); border-radius: 8px; z-index: 9999; flex-direction: column; text-align: left; padding: 8px 0;">
                        <div style="padding: 10px 15px; font-size: 0.85rem; color: #666; border-bottom: 1px solid #eee;">
                            Hola, <strong id="display-username">Usuario</strong>
                        </div>
                        <a href="users.php" style="display: block; padding: 10px 15px; text-decoration: none; color: #333; font-size: 0.9rem;">Mi Perfil</a>
                        <a href="control.php" style="display: block; padding: 10px 15px; text-decoration: none; color: #333; font-size: 0.9rem;">Panel de Control</a>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 8px 0;">
                        <a href="#" id="logout-link" style="display: block; padding: 10px 15px; text-decoration: none; color: #e74c3c; font-size: 0.9rem;">Cerrar Sesión</a>
                    </div>
                </div>
            </div>
        </nav>
    </header>`;

    // 2. Definición de la estructura del Footer
    const footerHTML = `
    <footer>
        <section>
            <div class="logo-container">
                <a href="#">
                    <img src="../../public/assets/img/ico/icono.svg" alt="Logo MOVEos">
                    <span>MOVEos</span>
                </a>
                <p>Dinamismo, cambio y participación activa en cada experiencia.</p>
            </div>
            <div>
                <h4>Plataforma</h4>
                <ul>
                    <li><a href="home.php">Explorar</a></li>
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
    </footer>`;

    // 3. Ejecución principal al cargar el DOM
    document.addEventListener("DOMContentLoaded", () => {
        const headerEl = document.getElementById('header');
        const footerEl = document.getElementById('footer');

        // Inyectar HTML en los contenedores
        if (headerEl) headerEl.innerHTML = headerHTML;
        if (footerEl) footerEl.innerHTML = footerHTML;

        // Inicializar lógicas
        initUserLogic();
        initThemeLogic();
    });

    /**
     * Gestiona el clic en el icono de usuario y el logout
     */
    function initUserLogic() {
        const userBtn = document.getElementById('user-btn');
        const userDropdown = document.getElementById('user-dropdown');
        const logoutLink = document.getElementById('logout-link');
        const displayUsername = document.getElementById('display-username');

        const usuarioLogueado = sessionStorage.getItem('usuario');

        if (userBtn) {
            userBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (usuarioLogueado) {
                    // Si hay sesión: Alternar visibilidad del menú
                    if (displayUsername) displayUsername.innerText = usuarioLogueado;
                    const isVisible = userDropdown.style.display === 'flex';
                    userDropdown.style.display = isVisible ? 'none' : 'flex';
                } else {
                    // Si NO hay sesión: Redirigir a registro
                    window.location.href = 'login.php';
                }
            });
        }

        // Cerrar menú al hacer clic fuera de él
        window.addEventListener('click', () => {
            if (userDropdown) userDropdown.style.display = 'none';
        });

        // Evento Cerrar Sesión
        if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                sessionStorage.clear();
                window.location.href = '../controllers/logout.php';
            });
        }
    }

    /**
     * Gestiona el modo claro / oscuro
     */
    function initThemeLogic() {
        const themeToggle = document.getElementById('theme-toggle');
        const currentTheme = localStorage.getItem('theme');

        // Aplicar tema guardado al cargar
        if (currentTheme === 'dark') {
            document.body.classList.add('dark-mode');
            if (themeToggle) themeToggle.checked = true;
        }

        // Escuchar el cambio en el switch
        if (themeToggle) {
            themeToggle.addEventListener('change', () => {
                if (themeToggle.checked) {
                    document.body.classList.add('dark-mode');
                    localStorage.setItem('theme', 'dark');
                } else {
                    document.body.classList.remove('dark-mode');
                    localStorage.setItem('theme', 'light');
                }
            });
        }
    }
}
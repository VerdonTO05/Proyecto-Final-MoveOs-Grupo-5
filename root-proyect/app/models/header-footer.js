//js refactorizado 12/03/2026
import { showConfirm, showAlert } from "../../public/assets/js/controllers/shared.js";

/* =========================
   HEADER Y FOOTER HTML
   ========================= */

/** HTML del header de la plataforma */
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
        <button id="user-btn"><i class="fas fa-user"></i></button>
        <div id="user-dropdown" class="invisible">
          <span id="display-username"></span>
          <a href="#" id="logout-link">Cerrar sesión</a>
        </div>
      </div>
    </div>

    <div id="userSidebar" class="sidebar">
      <span class="closebtn">&times;</span>
      <a href="index.php?accion=viewInfo">Ver datos usuario</a>
      <a href="index.php?accion=editUser">Editar datos</a>
      <a href="index.php?accion=forgot-password">Recuperar contraseña</a>
      <a href="#">Redes sociales</a>
      <a href="#">Contáctanos</a>
      <a href="index.php?accion=unsubscribe">Dar de baja</a>
    </div>
  </nav>
</header>
`;

/** HTML del footer de la plataforma */
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

/** Inicializa la interfaz: header, footer, tema, usuario, sidebar y baja de cuenta */
document.addEventListener("DOMContentLoaded", () => {
  injectLayout();       
  initThemeLogic();     
  initUserLogic();      
  initSidebarLogic();  
  initUnsubscribeLogic();
});

/** Inserta el header y footer en el DOM */
function injectLayout() {
  document.getElementById('header')?.insertAdjacentHTML('afterbegin', headerHTML);
  document.getElementById('footer')?.insertAdjacentHTML('afterbegin', footerHTML);
}

/**
 * Inicializa el dropdown del usuario y el logout
 */
function initUserLogic() {
  const userBtn = document.getElementById('user-btn');
  const userDropdown = document.getElementById('user-dropdown');
  const logoutLink = document.getElementById('logout-link');
  const displayUsername = document.getElementById('display-username');

  const user = window.CURRENT_USER || null;
  if (!userBtn || !userDropdown) return;

  // Mostrar u ocultar el dropdown de usuario al hacer click
  userBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!user) return window.location.href = 'index.php?accion=loginView';
    if (displayUsername) displayUsername.innerText = user.name || 'Usuario';
    toggleVisibility(userDropdown);
  });

  // Logout: redirige a logout y oculta dropdown
  logoutLink?.addEventListener('click', (e) => {
    e.preventDefault();
    hideElement(userDropdown);
    window.location.href = 'index.php?accion=logout';
  });
}

/**
 * Inicializa el toggle del tema claro/oscuro
 */
function initThemeLogic() {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;

  const isDark = localStorage.getItem('mode') === 'dark';
  document.body.classList.toggle('dark-mode', isDark);
  themeToggle.checked = isDark;

  // Cambiar tema al alternar checkbox
  themeToggle.addEventListener('change', () => {
    const dark = themeToggle.checked;
    document.body.classList.toggle('dark-mode', dark);
    localStorage.setItem('mode', dark ? 'dark' : 'light');
  });
}

/**
 * Inicializa la lógica del sidebar del usuario
 */
function initSidebarLogic() {
  const displayUsername = document.getElementById('display-username');
  const userDropdown = document.getElementById('user-dropdown');
  const sidebar = document.getElementById('userSidebar');
  const closeBtn = sidebar?.querySelector('.closebtn');
  if (!sidebar) return;

  // Abrir sidebar al hacer click en el nombre del usuario
  displayUsername?.addEventListener('click', () => sidebar.style.width = '250px');

  // Cerrar sidebar al hacer click en la X
  closeBtn?.addEventListener('click', () => sidebar.style.width = '0');

  // Cerrar sidebar al hacer click fuera y ocultar dropdown
  window.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && e.target !== displayUsername) sidebar.style.width = '0';
    hideElement(userDropdown);
  });
}

/**
 * Inicializa la acción de dar de baja la cuenta del usuario
 */
function initUnsubscribeLogic() {
  const unsubscribeLink = document.querySelector('a[href="index.php?accion=unsubscribe"]');
  if (!unsubscribeLink) return;

  unsubscribeLink.addEventListener("click", async (e) => {
    e.preventDefault();

    // Confirmación del usuario antes de borrar la cuenta
    const confirmDelete = await showConfirm(
      "Dar de baja su cuenta",
      "Esta acción es irreversible.\nSe eliminará tu cuenta y todos tus datos.\n¿Deseas continuar?"
    );

    if (!confirmDelete) return;

    try {
      // Solicitud POST para eliminar la cuenta
      const res = await fetch("index.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "unsubscribe" })
      });

      const data = await res.json();

      if (data.success) {
        // Mostrar alerta de éxito y redirigir
        showAlert(
          "Cuenta eliminada",
          "Tu cuenta se eliminó correctamente"
        );
        setTimeout(() => window.location.href = "index.php", 3000);
      } else {
        // Mostrar error si falla
        showAlert(
          "Error",
          data.message || "No se pudo eliminar la cuenta"
        );
      }
    } catch (err) {
      // Error en la petición
      showAlert(
        "Error",
        "Error al eliminar la cuenta"
      );
    }
  });
}

/**
 * Alterna clases 'visible' e 'invisible' de un elemento
 * @param {HTMLElement} el - Elemento a mostrar/ocultar
 */
function toggleVisibility(el) {
  el.classList.toggle('visible');
  el.classList.toggle('invisible');
}

/**
 * Oculta un elemento añadiendo clase 'invisible' y quitando 'visible'
 * @param {HTMLElement} el - Elemento a ocultar
 */
function hideElement(el) {
  if (!el) return;
  el.classList.remove('visible');
  el.classList.add('invisible');
}
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
  injectLayout();
  initThemeLogic();
  initUserLogic();
  initSidebarLogic();
  initUnsubscribeLogic();
});

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
  const userBtn = document.getElementById('user-btn');
  const userDropdown = document.getElementById('user-dropdown');
  const logoutLink = document.getElementById('logout-link');
  const displayUsername = document.getElementById('display-username');

  const user = window.CURRENT_USER || null;
  if (!userBtn || !userDropdown) return;

  // Mostrar/ocultar dropdown
  userBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!user) return window.location.href = 'index.php?accion=loginView';
    displayUsername && (displayUsername.innerText = user.name || 'Usuario');
    toggleVisibility(userDropdown);
  });

  // Logout
  logoutLink?.addEventListener('click', (e) => {
    e.preventDefault();
    hideElement(userDropdown);
    window.location.href = 'index.php?accion=logout';
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
      console.error(err);
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

/* =========================
   MODALES DINÁMICOS (CONFIRM y ALERT)
   ========================= */
window.showConfirm = function(optionsOrTitle, message = "") {
  const options = typeof optionsOrTitle === "string"
    ? { title: optionsOrTitle, message }
    : optionsOrTitle;

  const { title = "Confirmar", message: msg = "", confirmText = "Aceptar", cancelText = "Cancelar" } = options;

  // Crear modalContainer si no existe
  let modalContainer = document.getElementById("modal-container");
  if (!modalContainer) {
    modalContainer = document.createElement("div");
    modalContainer.id = "modal-container";
    document.body.appendChild(modalContainer);
  }

  return new Promise((resolve) => {
    const modal = document.createElement("div");
    modal.className = "modal";

    modal.innerHTML = `
      <div class="modal-header">${title}</div>
      <div class="modal-body">${msg}</div>
      <div class="modal-actions">
        <button class="cancel">${cancelText}</button>
        <button class="confirm">${confirmText}</button>
      </div>
    `;

    modalContainer.appendChild(modal);
    modalContainer.classList.add("active");

    const close = () => {
      modal.style.animation = "fadeOut 0.25s forwards";
      setTimeout(() => {
        modal.remove();
        modalContainer.classList.remove("active");
      }, 250);
    };

    modal.querySelector(".cancel").addEventListener("click", () => { close(); resolve(false); });
    modal.querySelector(".confirm").addEventListener("click", () => { close(); resolve(true); });
  });
};

window.showAlert = function({ title = "Aviso", message = "", buttonText = "Aceptar" }) {
  let modalContainer = document.getElementById("modal-container");
  if (!modalContainer) {
    modalContainer = document.createElement("div");
    modalContainer.id = "modal-container";
    document.body.appendChild(modalContainer);
  }

  const modal = document.createElement("div");
  modal.className = "modal";

  modal.innerHTML = `
    <div class="modal-header">${title}</div>
    <div class="modal-body">${message}</div>
    <div class="modal-actions">
      <button class="confirm">${buttonText}</button>
    </div>
  `;

  modalContainer.appendChild(modal);
  modalContainer.classList.add("active");

  const close = () => {
    modal.style.animation = "fadeOut 0.25s forwards";
    setTimeout(() => {
      modal.remove();
      modalContainer.classList.remove("active");
    }, 250);
  };

  modal.querySelector(".confirm").addEventListener("click", close);
};

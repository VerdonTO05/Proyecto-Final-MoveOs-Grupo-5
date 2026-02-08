/* =========================
   HEADER Y FOOTER HTML
   ========================= */

/** HTML del header dinámico */
const headerHTML = `...`; // contenido idéntico al tuyo

/** HTML del footer dinámico */
const footerHTML = `...`; // contenido idéntico al tuyo

/* =========================
   INICIALIZADOR PRINCIPAL
   ========================= */

/**
 * Función principal que se ejecuta al cargar el DOM
 * - Inyecta header y footer
 * - Inicializa tema
 * - Inicializa lógica de usuario y sidebar
 * - Inicializa lógica de baja de cuenta
 */
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

/**
 * Inserta dinámicamente header y footer en la página
 */
function injectLayout() {
  document.getElementById('header')?.insertAdjacentHTML('afterbegin', headerHTML);
  document.getElementById('footer')?.insertAdjacentHTML('afterbegin', footerHTML);
}

/* =========================
   USUARIO: DROPDOWN Y LOGOUT
   ========================= */

/**
 * Inicializa la lógica del menú de usuario:
 * - Mostrar/ocultar dropdown
 * - Logout redirigiendo a index.php
 */
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

/**
 * Inicializa el toggle de tema claro/oscuro
 * - Aplica la clase correspondiente al body
 * - Guarda la preferencia en localStorage
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

/* =========================
   SIDEBAR USUARIO
   ========================= */

/**
 * Inicializa la lógica del sidebar del usuario:
 * - Abrir/cerrar sidebar
 * - Cerrar al hacer click fuera del sidebar
 */
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

/**
 * Inicializa la lógica de dar de baja la cuenta
 * - Muestra confirmación antes de eliminar
 * - Llama a API para eliminar la cuenta
 * - Redirige al home tras eliminación
 */
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

        setTimeout(() => window.location.href = "index.php", 1200);
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

/**
 * Alterna clases 'visible'/'invisible' en un elemento
 * @param {HTMLElement} el - Elemento a alternar
 */
function toggleVisibility(el) {
  el.classList.toggle('visible');
  el.classList.toggle('invisible');
}

/**
 * Oculta un elemento agregando clase 'invisible'
 * @param {HTMLElement} el - Elemento a ocultar
 */
function hideElement(el) {
  if (!el) return;
  el.classList.remove('visible');
  el.classList.add('invisible');
}

/* =========================
   MODALES DINÁMICOS (CONFIRM y ALERT)
   ========================= */

/**
 * Muestra un modal de confirmación
 * @param {Object|string} optionsOrTitle - Opciones del modal o título
 * @param {string} [message=""] - Mensaje del modal si se pasa el título como string
 * @returns {Promise<boolean>} Resuelve true si se confirma, false si se cancela
 */
window.showConfirm = function(optionsOrTitle, message = "") {
  const options = typeof optionsOrTitle === "string"
    ? { title: optionsOrTitle, message }
    : optionsOrTitle;

  const { title = "Confirmar", message: msg = "", confirmText = "Aceptar", cancelText = "Cancelar" } = options;

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

/**
 * Muestra un modal de alerta
 * @param {Object} options - Opciones del modal
 * @param {string} [options.title="Aviso"] - Título del modal
 * @param {string} [options.message=""] - Mensaje del modal
 * @param {string} [options.buttonText="Aceptar"] - Texto del botón
 */
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

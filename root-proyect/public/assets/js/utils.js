window.showAlert = function(title, message, type = 'info', duration = 2500) {
    const overlay = document.createElement('div');
    overlay.classList.add('alert-overlay', type);

    const alertBox = document.createElement('div');
    alertBox.classList.add('alert-box');
    alertBox.innerHTML = `
        <div class="alert-header">${title}</div>
        <div class="alert-body">${message}</div>
    `;

    overlay.appendChild(alertBox);
    document.body.appendChild(overlay);

    const closeAlert = () => {
        alertBox.style.animation = 'fadeOut 0.3s forwards';
        overlay.classList.remove('active');
        setTimeout(() => document.body.removeChild(overlay), 300);
    };
    setTimeout(closeAlert, duration);
    requestAnimationFrame(() => {
        overlay.classList.add('active');
        alertBox.style.animation = 'fadeIn 0.3s forwards';
    });
}

/**
 * Alterna la visibilidad de la contraseña y cambia el icono.
 *
 * @param {HTMLInputElement} passwordInput - Campo de contraseña
 * @param {HTMLElement} toggleButton - Botón para mostrar/ocultar contraseña
 */
window.setupPasswordToggle = function(passwordInput, toggleButton) {
  const icon = toggleButton.querySelector("i");

  toggleButton.addEventListener("click", (e) => {
    e.preventDefault();

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    } else {
      passwordInput.type = "password";
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
    }
  });
}

window.showConfirm = function (optionsOrTitle, message = "") {
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
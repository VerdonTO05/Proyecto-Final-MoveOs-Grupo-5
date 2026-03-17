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
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector(".login-form");
  if (!loginForm) return;

  // Toggle contraseña con icono Font Awesome
  const passwordInput = document.getElementById("password");
  const toggleButton = document.getElementById("toggle-password");

  if (passwordInput && toggleButton) {
    const icon = toggleButton.querySelector("i");

    toggleButton.addEventListener("click", (e) => {
      e.preventDefault(); // evita que el botón envíe el formulario
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

  // Manejo del submit
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      showAlert('¡Ojo!', 'Completa todos los campos', 'info');
      return;
    }

    try {
      const response = await fetch("index.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "login", username, password }),
      });

      const text = await response.text();
      if (!text) throw new Error("Respuesta vacía del servidor");

      const data = JSON.parse(text);
      if (response.ok && data.success) {
        window.location.href = data.redirect;
      } else {
        showAlert('Error al iniciar sesión', 'Credenciales incorrectas', 'info');
      }
    } catch (error) {
      showAlert('Error al iniciar sesión', 'Error en el servidor', 'error');
    }
  });
});


function showAlert(title, message, type = 'info', duration = 2500) {
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
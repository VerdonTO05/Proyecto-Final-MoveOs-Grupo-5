/**
 * Script de login.
 * Maneja:
 * - Mostrar/ocultar contraseña
 * - Validación básica del formulario
 * - Envío de credenciales al servidor
 * - Redirección si el login es correcto
 */
document.addEventListener("DOMContentLoaded", init);

/**
 * Inicializa los eventos del login
 */
function init() {
  const loginForm = document.querySelector(".login-form");
  if (!loginForm) return;

  const passwordInput = document.getElementById("password");
  const toggleButton = document.getElementById("toggle-password");

  if (passwordInput && toggleButton) {
    setupPasswordToggle(passwordInput, toggleButton);
  }

  loginForm.addEventListener("submit", handleLoginSubmit);
}

/**
 * Alterna la visibilidad de la contraseña y cambia el icono.
 *
 * @param {HTMLInputElement} passwordInput - Campo de contraseña
 * @param {HTMLElement} toggleButton - Botón para mostrar/ocultar contraseña
 */
function setupPasswordToggle(passwordInput, toggleButton) {
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

/**
 * Maneja el envío del formulario de login.
 * Valida los campos y envía la petición al servidor.
 *
 * @param {SubmitEvent} event - Evento de envío del formulario
 * @returns {Promise<void>}
 */
async function handleLoginSubmit(event) {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const passwordInput = document.getElementById("password");
  const password = passwordInput.value.trim();

  if (!username || !password) {
    showAlert("¡Ojo!", "Completa todos los campos", "info");
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
      showAlert("Error al iniciar sesión", "Credenciales incorrectas", "info");
    }
  } catch (error) {
    showAlert("Error al iniciar sesión", "Error en el servidor", "error");
  }
}
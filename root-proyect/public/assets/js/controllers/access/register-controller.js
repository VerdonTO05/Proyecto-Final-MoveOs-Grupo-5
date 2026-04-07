/**
 * Script de registro.
 * Maneja:
 * - Mostrar/ocultar contraseña
 * - Validación de formulario
 * - Envío de datos al servidor
 * - Redirección tras registro exitoso
 */
document.addEventListener("DOMContentLoaded", init);

/**
 * Inicializa los eventos del formulario de registro
 */
function init() {
  const registerForm = document.querySelector(".register-form");
  if (!registerForm) return;

  const passwordInput = document.getElementById("password");
  const toggleButton = document.getElementById("toggle-password");

  if (passwordInput && toggleButton) {
    setupPasswordToggle(passwordInput, toggleButton);
  }

  registerForm.addEventListener("submit", handleRegisterSubmit);
}

/**
 * Maneja el envío del formulario de registro
 *
 * @param {SubmitEvent} event
 * @returns {Promise<void>}
 */
async function handleRegisterSubmit(event) {
  event.preventDefault();

  const fullname = document.getElementById("fullname").value.trim();
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const passwordInput = document.getElementById("password");
  const password = passwordInput.value;
  const rolInput = document.querySelector('input[name="type"]:checked');

  let errors = [];

  // Validaciones
  if (!validateFullName(fullname)) {
    errors.push("Introduce nombre y apellido.");
  }

  if (!username) {
    errors.push("El nombre de usuario es obligatorio.");
  }

  if (!validateEmail(email)) {
    errors.push("El formato del correo electrónico no es válido.");
  }

  if (!validatePassword(password)) {
    errors.push("La contraseña debe tener al menos 8 caracteres.");
  }

  if (!rolInput) {
    errors.push("Debes seleccionar un rol.");
  }

  // Muestra los errores
  if (errors.length > 0) {
    return showAlert(
      "Errores en el formulario:",
      `<ul>${errors.map(err => `<li>${err}</li>`).join('')}</ul>`,
      "error"
    );
  }

  // Envia la información
  const rol = rolInput.value;

  try {
    const response = await fetch("index.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        accion: "registerUser",
        fullname,
        username,
        email,
        password,
        rol
      })
    });

    const result = await response.json();

    if (response.ok && result.success) {
      showAlert("¡Registro exitoso!", `Bienvenido, ${username}.`, "success"); 
      window.location.href = "index.php?accion=seeActivities";
    } else {
      showAlert("Error en el registro", result.message, "error");
    }

  } catch (error) {
    showAlert("Error en el servidor", "No se pudo conectar con el servidor.", "error");
  }
}

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

  if (!validateFullName(fullname)) { return showAlert("Información incompleta", "Por favor, introduce nombre y apellido.", "info");  }
  if (!username) { return showAlert("Información incompleta", "El nombre de usuario es obligatorio.", "info");  }
  if (!validateEmail(email)) { return showAlert("Información incompleta", "El formato del correo electrónico no es válido.", "info"); }
  if (!validatePassword(password)) { return showAlert("Información incompleta", "La contraseña debe tener al menos 8 caracteres.", "info"); }
  if (!rolInput) { return showAlert("Información incompleta", "Debes seleccionar un rol.", "info");  }

  const rol = rolInput.value;
  try {
    const response = await fetch("index.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ accion: "registerUser", fullname, username, email, password, rol } )
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

/**
 * Valida que el nombre tenga al menos nombre y apellido
 *
 * @param {string} name
 * @returns {boolean}
 */
function validateFullName(name) {
  return name.trim().split(" ").filter(p => p.length > 0).length >= 2;
}

/**
 * Valida el formato del correo electrónico
 *
 * @param {string} email
 * @returns {boolean}
 */
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase());
}

/**
 * Valida la contraseña
 *
 * @param {string} password
 * @returns {boolean}
 */
function validatePassword(password) {
  return password.length >= 8;
}
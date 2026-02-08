document.addEventListener("DOMContentLoaded", () => {

  /** @type {HTMLFormElement|null} Formulario de edición de usuario */
  const editForm = document.getElementById("edit-form");

  /** @type {HTMLElement|null} Botón de cierre */
  const closeBtn = document.querySelector('.close-btn');

  // ---------------------
  // Botón cerrar
  // ---------------------
  if (closeBtn) {
    /**
     * Evento click del botón de cierre.
     * Redirige al usuario a la página principal (index.php).
     * @event click
     */
    closeBtn.addEventListener('click', () => {
      window.location.href = "index.php";
    });
  }

  // ---------------------
  // Funciones de validación
  // ---------------------
  /** @type {function(string): boolean} Valida que el nombre completo tenga al menos nombre y apellido */
  const validateFullName = (name) => name.trim().split(' ').filter(p => p.length > 0).length >= 2;

  /** @type {function(string): boolean} Valida que el nombre de usuario no esté vacío */
  const validateUsername = (username) => username.trim().length > 0;

  /** @type {function(string): boolean} Valida el formato del email */
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());

  /** @type {function(string): boolean} Valida que la contraseña tenga al menos 8 caracteres */
  const validatePassword = (password) => password.length >= 8;

  // ---------------------
  // Campos de contraseña opcionales
  // ---------------------
  /** @type {HTMLInputElement|null} Checkbox para cambiar contraseña */
  const changePasswordCheckbox = document.getElementById('changePassword');

  /** @type {HTMLElement|null} Contenedor de campos de contraseña */
  const passwordFields = document.getElementById('passwordFields');

  /** @type {HTMLInputElement|null} Campo de contraseña actual */
  const currentPassword = document.getElementById('current_password');

  /** @type {HTMLInputElement|null} Campo de nueva contraseña */
  const newPassword = document.getElementById('new_password');

  if (changePasswordCheckbox && passwordFields) {
    passwordFields.style.display = 'none';
    /**
     * Muestra u oculta los campos de contraseña según el checkbox.
     * @event change
     */
    changePasswordCheckbox.addEventListener('change', () => {
      passwordFields.style.display = changePasswordCheckbox.checked ? 'block' : 'none';

      // Limpiar campos si se desmarca
      if (!changePasswordCheckbox.checked) {
        currentPassword.value = '';
        newPassword.value = '';
      }
    });
  }

  // ---------------------
  // Validación del formulario
  // ---------------------
  if (editForm) {
    /**
     * Evento submit del formulario de edición.
     * Valida los campos obligatorios y la contraseña si se cambia.
     * @param {Event} event Evento submit
     */
    editForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const fullname = document.getElementById("fullname").value.trim();
      const username = document.getElementById("username").value.trim();
      const email = document.getElementById("email").value.trim();

      // Validaciones generales
      if (!validateFullName(fullname)) {
        alert("Por favor, introduce nombre y apellido.");
        return;
      }
      if (!validateUsername(username)) {
        alert("El nombre de usuario es obligatorio.");
        return;
      }
      if (!validateEmail(email)) {
        alert("El formato del correo electrónico no es válido.");
        return;
      }

      // Validaciones de contraseña solo si el usuario quiere cambiarla
      if (changePasswordCheckbox && changePasswordCheckbox.checked) {
        if (!currentPassword.value) {
          alert("Debes introducir tu contraseña actual.");
          return;
        }
        if (!newPassword.value) {
          alert("Debes introducir la nueva contraseña.");
          return;
        }
        if (!validatePassword(newPassword.value)) {
          alert("La nueva contraseña debe tener al menos 8 caracteres.");
          return;
        }
      }

      // Enviar formulario si todo es correcto
      editForm.submit();
    });
  }

});

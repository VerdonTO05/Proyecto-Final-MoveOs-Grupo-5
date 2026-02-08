document.addEventListener("DOMContentLoaded", () => {
  const editForm = document.getElementById("edit-form");
  const closeBtn = document.querySelector('.close-btn');

  // Botón cerrar
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      window.location.href = "index.php";
    });
  }

  // Validaciones simples
  const validateFullName = (name) => name.trim().split(' ').filter(p => p.length > 0).length >= 2;
  const validateUsername = (username) => username.trim().length > 0;
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
  const validatePassword = (password) => password.length >= 8;

  // Campos de contraseña opcionales
  const changePasswordCheckbox = document.getElementById('changePassword');
  const passwordFields = document.getElementById('passwordFields');
  const currentPassword = document.getElementById('current_password');
  const newPassword = document.getElementById('new_password');

  if (changePasswordCheckbox && passwordFields) {
    passwordFields.style.display = 'none';
    changePasswordCheckbox.addEventListener('change', () => {
      passwordFields.style.display = changePasswordCheckbox.checked ? 'block' : 'none';

      // Limpiar campos si se desmarca
      if (!changePasswordCheckbox.checked) {
        currentPassword.value = '';
        newPassword.value = '';
      }
    });
  }

  // Validación del formulario
  if (editForm) {
    editForm.addEventListener("submit", (event) => {
      // Evitar envío si hay errores
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

      editForm.submit();
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const editForm = document.getElementById("edit-form");
  const closeBtn = document.querySelector('.close-btn');

  // Botón cerrar
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      window.location.href = "index.php";
    });
  }

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

  // --- Toggle ver/ocultar contraseña ---
  const toggleButtons = document.querySelectorAll(".toggle-password");
  toggleButtons.forEach((button) => {
    const input = button.closest(".div-password").querySelector("input");
    const icon = button.querySelector("i");

    button.addEventListener("click", (e) => {
      e.preventDefault();
      if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
      } else {
        input.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
      }
    });
  });

  // Validación del formulario
  if (editForm) {
    if (editForm) {
      editForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const fullname = document.getElementById("fullname").value.trim();
        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();

        let errors = [];

        // ===== VALIDACIONES GENERALES =====
        if (!validateFullName(fullname)) {
          errors.push("Por favor, introduce nombre y apellido.");
        }

        if (username.trim().length < 0) {
          errors.push("El nombre de usuario es obligatorio.");
        }

        if (!validateEmail(email)) {
          errors.push("El formato del correo electrónico no es válido.");
        }

        // ===== CONTRASEÑA (OPCIONAL) =====
        if (changePasswordCheckbox && changePasswordCheckbox.checked) {
          if (!currentPassword.value) {
            errors.push("Debes introducir tu contraseña actual.");
          }

          if (!newPassword.value) {
            errors.push("Debes introducir la nueva contraseña.");
          }

          if (newPassword.value && !validatePassword(newPassword.value)) {
            errors.push("La nueva contraseña debe tener al menos 8 caracteres.");
          }
        }

        // ===== MOSTRAR ERRORES =====
        if (errors.length > 0) {
          return showAlert(
            "Errores en el formulario:",
            `<ul>${errors.map(err => `<li>${err}</li>`).join('')}</ul>`,
            "error"
          );
        }

        // ===== ENVIAR SI TODO OK =====
        editForm.submit();
      });
    }
  }
});
document.addEventListener("DOMContentLoaded", () => {

  // ===== ERRORES DESDE PHP =====
  const phpErrors = window.__PHP_FORM_ERRORS__ ?? [];
  if (phpErrors.length > 0) {
    showAlert(
      "Errores en el formulario:",
      `<ul>${phpErrors.map(err => `<li>${err}</li>`).join('')}</ul>`,
      "error",
      4000
    );
  }

  const editForm = document.getElementById("edit-form");
  const closeBtn = document.querySelector('.close-btn');

  // Botón cerrar
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      window.location.href = "index.php";
    });
  }

  // ===== AVATAR UPLOAD =====
  const avatarWrapper = document.getElementById('avatarWrapper');
  const avatarInput   = document.getElementById('avatarInput');
  const profileAvatar = document.getElementById('profileAvatar');

  if (avatarWrapper && avatarInput) {
    // Clic en el avatar abre el selector de archivos
    avatarWrapper.addEventListener('click', () => avatarInput.click());

    avatarInput.addEventListener('change', async () => {
      const file = avatarInput.files[0];
      if (!file) return;

      // Validar tamaño (2 MB)
      if (file.size > 2 * 1024 * 1024) {
        showAlert('Error', 'La imagen no puede superar los 2 MB.', 'error');
        return;
      }

      // Previsualizar la imagen inmediatamente
      const reader = new FileReader();
      reader.onload = (e) => { profileAvatar.src = e.target.result; };
      reader.readAsDataURL(file);

      // Subir vía AJAX
      const formData = new FormData();
      formData.append('avatar', file);

      try {
        const response = await fetch('index.php?accion=uploadAvatar', {
          method: 'POST',
          body: formData
        });
        const result = await response.json();

        if (result.success) {
          showAlert('¡Listo!', result.message, 'success');
          // Actualizar también el avatar del navbar
          const navAvatar = document.getElementById('nav-avatar');
          if (navAvatar) {
            navAvatar.src = result.image_url + '?t=' + Date.now();
          }
        } else {
          showAlert('Error', result.message, 'error');
        }
      } catch (err) {
        console.error(err);
        showAlert('Error', 'No se pudo subir la imagen.', 'error');
      }
    });
  }

  // Campos de contraseña opcionales
  const changePasswordCheckbox = document.getElementById('changePassword');
  const passwordFields = document.getElementById('passwordFields');
  const currentPassword = document.getElementById('current_password');
  const newPassword = document.getElementById('new_password');

  if (changePasswordCheckbox && passwordFields) {
    passwordFields.style.display = 'none';

    // Si volvemos con error y el checkbox estaba marcado, mostramos los campos
    if (changePasswordCheckbox.checked) {
      passwordFields.style.display = 'block';
    }

    changePasswordCheckbox.addEventListener('change', () => {
      passwordFields.style.display = changePasswordCheckbox.checked ? 'block' : 'none';

      if (!changePasswordCheckbox.checked) {
        currentPassword.value = '';
        newPassword.value = '';
      }
    });
  }

  // Toggle ver/ocultar contraseña
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
    editForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const fullname = document.getElementById("fullname").value.trim();
      const username = document.getElementById("username").value.trim();
      const email    = document.getElementById("email").value.trim();

      let errors = [];

      if (!validateFullName(fullname)) {
        errors.push("Por favor, introduce nombre y apellido.");
      }

      // Corregido: era < 0, nunca se cumplía
      if (username.length < 3) {
        errors.push("El nombre de usuario debe tener al menos 3 caracteres.");
      }

      if (!validateEmail(email)) {
        errors.push("El formato del correo electrónico no es válido.");
      }

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

      if (errors.length > 0) {
        return showAlert(
          "Errores en el formulario:",
          `<ul>${errors.map(err => `<li>${err}</li>`).join('')}</ul>`,
          "error",
          4000
        );
      }

      editForm.submit();
    });
  }
});
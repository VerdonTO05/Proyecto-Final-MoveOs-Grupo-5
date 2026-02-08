document.addEventListener("DOMContentLoaded", () => {

  /** @type {HTMLFormElement|null} Formulario de registro */
  const registerForm = document.querySelector(".register-form");

  /** @type {HTMLElement|null} Botón de cierre */
  const closeBtn = document.querySelector('.close-btn');

  // Botón cerrar: redirige al home si existe
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

  /**
   * Valida que el nombre completo tenga al menos dos palabras.
   * @param {string} name Nombre completo
   * @returns {boolean} True si es válido
   */
  const validateFullName = (name) => name.trim().split(' ').filter(p => p.length > 0).length >= 2;

  /**
   * Valida el formato de correo electrónico.
   * @param {string} email Correo a validar
   * @returns {boolean} True si es un email válido
   */
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());

  /**
   * Valida que la contraseña tenga al menos 8 caracteres.
   * @param {string} password Contraseña a validar
   * @returns {boolean} True si cumple la longitud mínima
   */
  const validatePassword = (password) => password.length >= 8;

  // ---------------------
  // Manejo del submit del formulario
  // ---------------------
  if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const fullname = document.getElementById("fullname").value.trim();
      const username = document.getElementById("username").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const rolInput = document.querySelector('input[name="type"]:checked');

      // Validaciones simples
      if (!validateFullName(fullname)) return alert("Por favor, introduce nombre y apellido.");
      if (!username) return alert("El nombre de usuario es obligatorio.");
      if (!validateEmail(email)) return alert("El formato del correo electrónico no es válido.");
      if (!validatePassword(password)) return alert("La contraseña debe tener al menos 8 caracteres.");
      if (!rolInput) return alert("Debes seleccionar un rol.");

      const rol = rolInput.value;

      /** @type {{accion: string, fullname: string, username: string, email: string, password: string, rol: string}} */
      const userData = { accion: 'registerUser', fullname, username, email, password, rol };

      try {
        const response = await fetch('index.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });

        /** @type {{success: boolean, message?: string}} */
        const result = await response.json();

        if (result.success) {
          // Registro exitoso
          alert(`¡Registro exitoso! Bienvenido, ${username}.`);

          // Redirección al home
          window.location.href = 'index.php?accion=seeActivities';

        } else {
          alert("Error en el registro: " + result.message);
        }

      } catch (error) {
        console.error("Error en la comunicación:", error);
        alert("No se pudo conectar con el servidor.");
      }
    });
  }

});

document.addEventListener("DOMContentLoaded", () => {

  /** @type {HTMLFormElement|null} Formulario de inicio de sesión */
  const loginForm = document.querySelector(".login-form");

  /** @type {HTMLElement|null} Botón de cierre */
  const closeBtn = document.querySelector(".close-btn");

  // Botón cerrar: redirige al home si existe
  if (closeBtn) {
    /**
     * Evento click del botón de cierre.
     * Redirige al usuario a la página principal (index.php).
     * @event click
     */
    closeBtn.addEventListener("click", () => {
      window.location.href = "index.php";
    });
  }

  if (!loginForm) return;

  /**
   * Evento submit del formulario de login.
   * Valida los campos y envía los datos al servidor mediante fetch.
   * @param {Event} event Evento submit
   */
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    /** @type {string} Nombre de usuario ingresado */
    const username = document.getElementById("username").value.trim();

    /** @type {string} Contraseña ingresada */
    const password = document.getElementById("password").value.trim();

    // Validación básica
    if (!username || !password) {
      alert("Completa todos los campos");
      return;
    }

    try {
      const response = await fetch("index.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accion: "login",
          username,
          password,
        }),
      });

      const text = await response.text();

      if (!text) {
        throw new Error("Respuesta vacía del servidor");
      }

      /** @type {{success: boolean, redirect?: string, message?: string}} */
      const data = JSON.parse(text);

      if (response.ok && data.success) {
        // Redirección exitosa
        window.location.href = data.redirect;
      } else {
        alert(data.message || "Credenciales incorrectas");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al iniciar sesión");
    }
  });

});

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector(".login-form");
  const closeBtn = document.querySelector(".close-btn");

  // Botón cerrar
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      window.location.href = "../../app/views/landing.php";
    });
  }

  if (!loginForm) return;

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
      alert("Completa todos los campos");
      return;
    }

    try {
      const response = await fetch("../../app/controllers/login-controller.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const responseText = await response.text();

      if (!responseText) {
        throw new Error("El servidor envió una respuesta vacía (revisa logs de PHP).");
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Respuesta no válida del servidor:", responseText);
        throw new Error("La respuesta del servidor no tiene formato JSON válido.");
      }

      if (response.ok && data.success) {
        // Login correcto
        alert("Login correcto");

        // Redirigir al home
        window.location.href = "../../app/views/home.php";

      } else {
        // Mostrar error de credenciales
        alert(data.message || "Credenciales incorrectas");
      }

    } catch (error) {
      console.error("Error capturado:", error);
      alert("Ocurrió un error al intentar iniciar sesión: " + error.message);
    }
  });
});

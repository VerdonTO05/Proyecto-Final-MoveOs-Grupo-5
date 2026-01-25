document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector(".login-form");
  const closeBtn = document.querySelector(".close-btn");

  // Manejo del botón cerrar
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
      alert("⚠️ Completa todos los campos");
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

      // PASO 1: Obtener la respuesta como texto primero
      const responseText = await response.text();

      // PASO 2: Verificar si la respuesta está vacía (esto evita el error que tenías)
      if (!responseText) {
        throw new Error("El servidor envió una respuesta vacía (Check PHP logs).");
      }

      // PASO 3: Intentar parsear el JSON manualmente
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Respuesta no válida del servidor:", responseText);
        throw new Error("La respuesta del servidor no tiene un formato JSON válido.");
      }

      // PASO 4: Manejar la lógica de éxito o error de credenciales
      if (response.ok && data.success) {
        // Guardar datos en sessionStorage
        sessionStorage.setItem("usuario", data.userData.username);
        sessionStorage.setItem("rol", data.userData.role);

        alert("Login correcto ✅");
        window.location.href = "../../app/views/home.php";
      } else {
        // Mostrar el mensaje que viene del PHP o uno por defecto
        alert(data.message || "❌ Credenciales incorrectas");
      }

    } catch (error) {
      // Este bloque captura errores de red, de parseo o el Error lanzado arriba
      console.error("Error capturado:", error);
      alert("Ocurrió un error al intentar iniciar sesión: " + error.message);
    }
  });
});
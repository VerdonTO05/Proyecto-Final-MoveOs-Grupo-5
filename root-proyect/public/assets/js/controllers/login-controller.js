document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector(".login-form");
  if (!loginForm) return;

  // Toggle contraseña con icono Font Awesome
  const passwordInput = document.getElementById("password");
  const toggleButton = document.getElementById("toggle-password");

  if (passwordInput && toggleButton) {
    const icon = toggleButton.querySelector("i");

    toggleButton.addEventListener("click", (e) => {
      e.preventDefault(); // evita que el botón envíe el formulario
      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
      } else {
        passwordInput.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
      }
    });
  }

  // Manejo del submit
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      alert("Completa todos los campos");
      return;
    }

    try {
      const response = await fetch("index.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "login", username, password }),
      });

      const text = await response.text();
      if (!text) throw new Error("Respuesta vacía del servidor");

      const data = JSON.parse(text);
      if (response.ok && data.success) {
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
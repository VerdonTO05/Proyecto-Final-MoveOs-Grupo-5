document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector(".login-form");
  const closeBtn = document.querySelector(".close-btn");

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      window.location.href = "index.php";
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

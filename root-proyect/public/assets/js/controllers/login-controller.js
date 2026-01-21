document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector(".login-form");

  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();

      try {
        const response = await fetch(
          "../../app/controllers/login-controller.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
          },
        );

        const data = await response.json();

        if (data.success) {
          // GUARDAR EN SESSION STORAGE
          // Convertimos el objeto a texto (JSON) porque sessionStorage solo guarda texto
          sessionStorage.setItem("usuario", data.userData.username);
          sessionStorage.setItem("rol", data.userData.role);

          alert("Login correcto ✅");
          window.location.href = "../../app/views/home.php";
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Error crítico de conexión");
      }
    });
  }
});

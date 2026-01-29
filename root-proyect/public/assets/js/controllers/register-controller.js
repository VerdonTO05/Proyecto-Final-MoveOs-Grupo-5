document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.querySelector(".register-form");
  const closeBtn = document.querySelector('.close-btn');

  // Botón cerrar
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      window.location.href = "index.php";
    });
  }

  // Validaciones simples
  const validateFullName = (name) => name.trim().split(' ').filter(p => p.length > 0).length >= 2;
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
  const validatePassword = (password) => password.length >= 8;

  if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const fullname = document.getElementById("fullname").value.trim();
      const username = document.getElementById("username").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const rolInput = document.querySelector('input[name="type"]:checked');

      if (!validateFullName(fullname)) return alert("Por favor, introduce nombre y apellido.");
      if (!username) return alert("El nombre de usuario es obligatorio.");
      if (!validateEmail(email)) return alert("El formato del correo electrónico no es válido.");
      if (!validatePassword(password)) return alert("La contraseña debe tener al menos 8 caracteres.");
      if (!rolInput) return alert("Debes seleccionar un rol.");

      const rol = rolInput.value;

      const userData = { fullname, username, email, password, rol };

      try {
        const response = await fetch('../../app/controllers/register-controller.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });

        const result = await response.json();

        if (result.success) {
          // Registro exitoso
          alert(`¡Registro exitoso! Bienvenido, ${username}.`);

          // Redirección al home
          window.location.href = '../../app/views/home.php';

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

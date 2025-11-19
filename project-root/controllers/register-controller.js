document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.querySelector(".register-form");

    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            window.location.href = 'landing.html'; 
        });
    }

  if (registerForm) {
    // --- FUNCIONES DE VALIDACIÓN ---

    // Valida nombre completo (mínimo 2 palabras)
    const validateFullName = (name) => {
      const parts = name.split(' ');
      // Filtra partes vacías (por si hay doble espacio) y cuenta
      return parts.filter(part => part.length > 0).length >= 2;
    };

    // Valida formato de email
    const validateEmail = (email) => {
      // Expresión regular simple para validar email
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(String(email).toLowerCase());
    };

    // Valida contraseña (mínimo 8 caracteres)
    const validatePassword = (password) => {
      return password.length >= 8;
    };

    // Verifica si el usuario ya existe en localStorage
    const userExists = (email, username) => {
      const usuarios = JSON.parse(localStorage.getItem('usuariosGuardados')) || [];
      // Comprueba si algún usuario en el array tiene el mismo email O username
      return usuarios.some(user => user.email === email || user.username === username);
    };

    // --- EVENT LISTENER ÚNICO ---

    registerForm.addEventListener("submit", (event) => {
      event.preventDefault(); // Evita el envío automático del formulario

      // 1. Obtener y limpiar los valores
      const fullname = document.getElementById("fullname").value.trim();
      const username = document.getElementById("username").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value; // No se suele hacer trim a la contraseña

      // 2. Ejecutar Validaciones
      // Si alguna falla, muestra alerta y detiene la ejecución con 'return'
      if (!validateFullName(fullname)) {
        alert("Por favor, introduce tu nombre completo (mínimo nombre y apellido).");
        return;
      }

      if (username.length === 0) {
        alert("Por favor, introduce un nombre de usuario.");
        return;
      }

      if (!validateEmail(email)) {
        alert("Introduce un correo electrónico válido.");
        return;
      }

      if (!validatePassword(password)) {
        alert("La contraseña debe tener al menos 8 caracteres.");
        return;
      }

      // 3. Validar existencia (solo después de que el formato sea correcto)
      if (userExists(email, username)) {
        alert("El usuario o correo ya está registrado.");
        return;
      }

      // --- Si TODAS las validaciones pasan ---

      // 4. Crear el objeto usuario
      const newUser = {
        fullname,
        username,
        email,
        password, // En una app real, esto debería ir cifrado
      };

      // 5. Guardar en localStorage
      let usuarios = JSON.parse(localStorage.getItem('usuariosGuardados')) || [];
      usuarios.push(newUser);
      localStorage.setItem('usuariosGuardados', JSON.stringify(usuarios));

      // 6. Informar al usuario y limpiar
      alert('¡Usuario "' + username + '" registrado con éxito!');
      registerForm.reset();

      sessionStorage.setItem('currentUser', JSON.stringify(newUser)); //Hace el login directamente
      // Redirige a home.html
      window.location.href = "../views/home.html";
    });
  }
});
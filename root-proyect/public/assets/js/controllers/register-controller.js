document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.querySelector(".register-form");

  const closeBtn = document.querySelector('.close-btn');
  if (closeBtn) {
      closeBtn.addEventListener('click', () => {
          window.location.href = '../../app/views/landing.php'; // landing.php a través del router
      });
  }

  if (registerForm) {
    const validateFullName = (name) => name.split(' ').filter(p => p.length > 0).length >= 2;
    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
    const validatePassword = (password) => password.length >= 8;
    const userExists = (email, username) => {
      const usuarios = JSON.parse(localStorage.getItem('usuariosGuardados')) || [];
      return usuarios.some(user => user.email === email || user.username === username);
    };

    registerForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const fullname = document.getElementById("fullname").value.trim();
      const username = document.getElementById("username").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;

      if (!validateFullName(fullname)) { alert("Introduce tu nombre completo."); return; }
      if (!username) { alert("Introduce un nombre de usuario."); return; }
      if (!validateEmail(email)) { alert("Correo inválido."); return; }
      if (!validatePassword(password)) { alert("Contraseña mínimo 8 caracteres."); return; }
      if (userExists(email, username)) { alert("Usuario ya registrado."); return; }

      const newUser = { fullname, username, email, password };
      let usuarios = JSON.parse(localStorage.getItem('usuariosGuardados')) || [];
      usuarios.push(newUser);
      localStorage.setItem('usuariosGuardados', JSON.stringify(usuarios));

      alert(`¡Usuario "${username}" registrado con éxito!`);
      registerForm.reset();
      sessionStorage.setItem('currentUser', JSON.stringify(newUser));

      window.location.href = '../../app/views/home.php'; // Redirige al home.php vía router
    });
  }
});

/* CONTROLLER POR TERMINAR --CONEXION PHP-- */
// document.addEventListener("DOMContentLoaded", () => {
    
//     // 1. Seleccionamos el formulario y el botón de cierre
//     // Es mejor usar getElementById si tu form tiene id="register-form"
//     const registerForm = document.getElementById('register-form'); 
//     const closeBtn = document.querySelector('.close-btn');

//     // Lógica del botón cerrar
//     if(closeBtn){
//         closeBtn.addEventListener('click', () => {
//             window.location.href = '../views/landing.php';
//         });
//     }

//     // 2. Si el formulario existe, agregamos el evento SUBMIT
//     if(registerForm){

//         registerForm.addEventListener('submit', function(e){
//             e.preventDefault(); // Detenemos el envío tradicional

//             // --- DEFINICIÓN DE FUNCIONES DE VALIDACIÓN ---
            
//             const validateFullName = (name) => {
//                 const parts = name.split(' ');
//                 // Corregido: .length en lugar de ,length
//                 return parts.filter(part => part.length > 0).length >= 2;
//             }

//             const validateEmail = (email) => {
//                 const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//                 return re.test(String(email).toLowerCase());
//             };

//             const validatePassword = (pass) => {
//                 return pass.length >= 8;
//             };

//             const validateRol = (rol) => {
//                 // Asumimos que es un <select>, verificamos que tenga valor
//                 return rol !== "" && rol !== null && rol !== "seleccione"; 
//             }

//             // --- RECOGIDA DE DATOS ---
//             // IMPORTANTE: Esto debe hacerse DENTRO del evento submit para obtener lo que el usuario escribió
            
//             const fullnameInput = document.getElementById('fullname');
//             const usernameInput = document.getElementById('username');
//             const emailInput = document.getElementById('email');
//             const passwordInput = document.getElementById('password');
//             const rolInput = document.getElementById('participante'); // Asegúrate que este ID exista en tu HTML

//             // Extraemos los valores (.value)
//             const fullname = fullnameInput.value.trim();
//             const username = usernameInput.value.trim();
//             const email = emailInput.value.trim();
//             const password = passwordInput.value; // Contraseña no solemos hacer trim por si incluye espacios intencionales, pero depende de tu lógica
//             const rol = rolInput ? rolInput.value : null;

//             // --- EJECUCIÓN DE VALIDACIONES ---

//             if (!validateFullName(fullname)) {
//                 alert("Por favor, introduce tu nombre completo (mínimo nombre y apellido).");
//                 return; // Detiene la ejecución
//             }

//             if (username.length === 0) {
//                 alert("Por favor, introduce un nombre de usuario.");
//                 return;
//             }

//             if (!validateEmail(email)) {
//                 alert("Introduce un correo electrónico válido.");
//                 return;
//             }

//             if (!validatePassword(password)) {
//                 alert("La contraseña debe tener al menos 8 caracteres.");
//                 return;
//             }

//             if(!validateRol(rol)){
//                 alert('Debes seleccionar un rol válido');
//                 return;
//             }

//             // --- SI TODO ES CORRECTO, GUARDAMOS ---

//             const newUser = {
//                 fullname,
//                 username,
//                 email,
//                 password,
//                 rol
//             };

//             // Guardar en LocalStorage
//             let usuarios = JSON.parse(localStorage.getItem('usuariosGuardados')) || [];
            
//             // Opcional: Verificar si el usuario ya existe antes de guardar
//             const userExists = usuarios.some(user => user.email === email || user.username === username);
//             if(userExists) {
//                 alert('El usuario o correo ya está registrado.');
//                 return;
//             }

//             usuarios.push(newUser);
//             localStorage.setItem('usuariosGuardados', JSON.stringify(usuarios));

//             alert('¡Usuario "' + username + '" registrado con éxito!');
//             registerForm.reset();

//             // Login automático
//             sessionStorage.setItem('currentUser', JSON.stringify(newUser));
            
//             // Redirección
//             window.location.href = "../views/home.php";
//         });
//     }
// });
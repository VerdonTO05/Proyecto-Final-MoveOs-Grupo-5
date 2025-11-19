document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('.login-form');

    // Cierre de la "x" (para ir a landing.html)
    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            window.location.href = 'landing.html'; 
        });
    }

    // Manejo del formulario de login
    loginForm.addEventListener('submit', (event) => {
        // Evita que el formulario se envíe (ESTO PREVIENE EL ERROR 405)
        event.preventDefault();

        // 1. Obtener los valores de los campos
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        // 2. Validaciones básicas
        if (!username || !password) {
            alert('Por favor, introduce tu nombre de usuario y contraseña.');
            return;
        }

        // 3. Obtenemos los usuarios desde localStorage
        // localStorage solo guarda texto, así que convertimos el texto (JSON) a un array
        const usersJSON = localStorage.getItem('usuariosGuardados');
        const users = usersJSON ? JSON.parse(usersJSON) : []; // Si está vacío, usa un array vacío

        // 4. Buscamos coincidencia
        const userFound = users.find(
            (u) => u.username === username && u.password === password
        );

        if (userFound) {
            alert(`¡Bienvenido de nuevo, ${userFound.fullname}!`);
            console.log("Inicio de sesión exitoso:", userFound);
            
            sessionStorage.setItem('currentUser', JSON.stringify(userFound));

            // Redirige a home.html
            window.location.href = "../views/home.html";

        } else {
            alert("Usuario o contraseña incorrectos.");
        }
    });
});
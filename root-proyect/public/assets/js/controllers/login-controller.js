document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('.login-form');

    // Cierre de la "x" (para ir a landing.html)
    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            window.location.href = '../../app/views/landing.php'; 
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
            window.location.href = "../../app/views/home.php";

        } else {
            alert("Usuario o contraseña incorrectos.");
        }
    });
});

/* CONTROLLER POR TERMINAR --CONEXION PHP-- */
// document.getElementById('login-form').addEventListener('submit', function(e){
//     e.preventDefault();
    
//     // 1º.  Obtenemos los valores del formulario
//     const username = document.getElementById('username').value.trim();
//     const password = document.getElementById('password').value.trim();
    
//     // 2º Validaciones frontend
//     let isValid = true;


//     if(username === ''){
//         // Añado un consolelog para debuguear y añadir el mensaje de error luego
//         console.log('Nombre de usuario no valido');
//         isValid = false;
//     }

//     if(password.length < 8){
//         // Añado un consolelog para debuguear y añadir el mensaje de error luego
//         console.log('Contraseña no valida');
//         isValid = false;
//     }

//     console.log('Username: '+username+'  Password: '+password);
//     if(!isValid) return;
    
//     const userData = {
//         username: username,
//         password: password
//     };
    
//     fetch('../../app/controllers/login.php', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(userData)
//     })
//     .then(response => response.text()) 
//     .then(texto => {
//         console.log('LO QUE PHP DEVOLVIÓ:', texto);

//         try {
//             // Intentamos convertirlo a JSON manualmente
//             const data = JSON.parse(texto);
            
//             if(data.success){
//                 console.log('DATOS VALIDOS');
//                 // window.location.href = ... 
//             } else {
//                 console.log('DATOS NO VALIDOS:', data.message);
//                 alert(data.message);
//             }
//         } catch (error) {
//             // Si falla aquí, es que PHP devolvió HTML o error y no JSON
//             console.error('El servidor devolvió un error (no es JSON):', error);
//             alert('Error técnico: Revisa la consola (F12) para ver la respuesta del servidor.');
//         }
//     })
//     .catch(error => {
//         console.error('Error de red:', error);
//     });
// });
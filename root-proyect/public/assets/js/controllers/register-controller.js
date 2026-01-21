document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.querySelector(".register-form");

    // Botón de cerrar / volver
    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            window.location.href = '../../app/views/landing.php';
        });
    }

    // --- FUNCIONES DE VALIDACIÓN ---
    const validateFullName = (name) => name.trim().split(' ').filter(p => p.length > 0).length >= 2;
    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
    const validatePassword = (password) => password.length >= 8;

    if (registerForm) {
        registerForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            // Captura de datos
            const fullname = document.getElementById("fullname").value.trim();
            const username = document.getElementById("username").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;
            
            // "participante" es el nombre exacto en tu tabla 'roles'
            const rol = "participante"; 

            // Validaciones básicas en cliente
            if (!validateFullName(fullname)) { 
                alert("Por favor, introduce nombre y apellido."); 
                return; 
            }
            if (!username) { 
                alert("El nombre de usuario es obligatorio."); 
                return; 
            }
            if (!validateEmail(email)) { 
                alert("El formato del correo electrónico no es válido."); 
                return; 
            }
            if (!validatePassword(password)) { 
                alert("La contraseña debe tener al menos 8 caracteres."); 
                return; 
            }

            const userData = { fullname, username, email, password, rol };

            try {
                // Realizar la petición al PHP
                const response = await fetch('../../app/controllers/register-controller.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userData)
                });

                // Verificamos si la respuesta es JSON válido
                const result = await response.json();

                if (result.success) {
                    alert(`¡Registro exitoso! Bienvenido, ${username}.`);
                    registerForm.reset();
                    // Guardar datos básicos en sesión de navegador si es necesario
                    sessionStorage.setItem('currentUser', JSON.stringify({ username, fullname }));
                    window.location.href = '../../app/views/home.php';
                } else {
                    // Mostrar error enviado desde PHP (ej. usuario duplicado)
                    alert("Error en el registro: " + result.message);
                }

            } catch (error) {
                console.error("Error en la comunicación:", error);
                alert("No se pudo conectar con el servidor. Inténtalo más tarde.");
            }
        });
    }
});
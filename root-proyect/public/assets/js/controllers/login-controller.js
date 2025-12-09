document.getElementById('login-form').addEventListener('submit', function(e){
    e.preventDefault();
    alert('He entrado');
    // 1º.  Obtenemos los valores del formulario
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    // 2º Validaciones frontend
    let isValid = true;

    // Validar email con formato regex

    if(username === ''){
        // Añado un consolelog para debuguear y añadir el mensaje de error luego
        console.log('Nombre de usuario no valido');
        isValid = false;
    }

    if(password.length < 8){
        // Añado un consolelog para debuguear y añadir el mensaje de error luego
        console.log('Contraseña no valida');
        isValid = false;
    }

    console.log('Username: '+username+'  Password: '+password);
    if(!isValid) return;

    // ... (el código anterior sigue igual) ...
    
    const userData = {
        username: username,
        password: password
    };
    
    // INICIO DEL CAMBIO
    fetch('../../app/controllers/login.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
    .then(response => response.text()) // <--- CAMBIO CLAVE: Recibimos texto, no JSON
    .then(texto => {
        console.log('LO QUE PHP DEVOLVIÓ:', texto); // <--- MIRA ESTO EN LA CONSOLA

        try {
            // Intentamos convertirlo a JSON manualmente
            const data = JSON.parse(texto);
            
            if(data.success){
                console.log('DATOS VALIDOS');
                // window.location.href = ... 
            } else {
                console.log('DATOS NO VALIDOS:', data.message);
                alert(data.message);
            }
        } catch (error) {
            // Si falla aquí, es que PHP devolvió HTML o error y no JSON
            console.error('El servidor devolvió un error (no es JSON):', error);
            alert('Error técnico: Revisa la consola (F12) para ver la respuesta del servidor.');
        }
    })
    .catch(error => {
        console.error('Error de red:', error);
    });
});
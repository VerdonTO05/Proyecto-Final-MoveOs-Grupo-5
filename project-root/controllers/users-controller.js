document.addEventListener('DOMContentLoaded', () => {

    // 1. Seleccionamos el <ul> donde pondremos la lista
    const listaUL = document.getElementById('listaUsuarios');

    // 2. Obtenemos los datos (en formato texto/JSON) desde localStorage
    const usuariosGuardadosJSON = localStorage.getItem('usuariosGuardados');

    // 3. Verificamos si hay algo guardado
    if (usuariosGuardadosJSON) {
        
        // 4. Convertimos el texto JSON de vuelta a un array de objetos
        const usuarios = JSON.parse(usuariosGuardadosJSON);

        // 5. Verificamos si el array tiene usuarios
        if (usuarios.length > 0) {
            
            // 6. Recorremos el array y creamos un <li> por cada usuario
            usuarios.forEach(usuario => {
                const li = document.createElement('li');
                
                // Creamos el texto para mostrar los datos del usuario
                li.innerHTML = `
                    <strong>Usuario:</strong> ${usuario.username} <br>
                    <strong>Nombre:</strong> ${usuario.fullname} <br>
                    <strong>Email:</strong> ${usuario.email}
                    
                `;
                
                // Añadimos el <li> al <ul>
                listaUL.appendChild(li);    
            });
            

        } else {
            // El array existe pero está vacío
            listaUL.innerHTML = '<li>No hay usuarios registrados todavía.</li>';
        }

    } else {
        // No se encontró la 'key' en localStorage
        listaUL.innerHTML = '<li>No hay usuarios registrados todavía.</li>';
    }
});
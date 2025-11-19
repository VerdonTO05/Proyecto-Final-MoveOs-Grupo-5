document.addEventListener("DOMContentLoaded", () => {
    const currentUser = sessionStorage.getItem('currentUser');
    const buttonExplore = document.getElementById("button-explore");
    const buttonPost = document.getElementById("button-post");
    
    /* Si el usuario esta logeado */
    if (currentUser) {
        //Se añade el enlace a home en el header de la página
        const ul = document.getElementById("list");

        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = 'home.html';
        a.textContent = 'Explorar Actividades';

        li.appendChild(a);
        ul.appendChild(li);

        const aExplore = document.getElementById("a-explore");     
        aExplore.href = 'home.html';
    }

    // Si `pulsa el boton de Explorar actividades muestra aletar y lo redirige al formulario de login
    buttonExplore.addEventListener("click",()=>{
        if(!currentUser){
            alert("Debes iniciar sesión o registrarte para explorar actividades");
            window.location.href="login.html";
        }
    });

    // Si pulsa el boton de publicar activiades, muestra alerta de que la funcionalidad no esta desarrollada
    buttonPost.addEventListener("click",()=>{
        console.log("Pulsando este botón se abrirá un formulario con el que podrán crear actividades.");
        alert("La funcionalidad 'Publicar Actividad' está en desarrollo");
    });

    

    




});
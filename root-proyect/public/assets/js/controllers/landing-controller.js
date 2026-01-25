document.addEventListener("DOMContentLoaded", () => {
    const currentUser = sessionStorage.getItem('usuario');
    const rol = sessionStorage.getItem('rol');
    const buttonExplore = document.getElementById("button-explore");
    const buttonPost = document.getElementById("button-post");

    /* Si el usuario está logeado */
    if (currentUser) {
        const ul = document.getElementById("list");

        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = 'home.php';
        if(rol == 'participante'){
            a.textContent = 'Explorar Actividades';
        }else{
            a.textContent = 'Explorar Peticiones';
        }
        
        li.appendChild(a);
        ul.appendChild(li);

        const aExplore = document.getElementById("a-explore");
        aExplore.href = 'home.php';
    }

    // Si pulsa el botón de Explorar actividades
    buttonExplore.addEventListener("click", () => {
        if (!currentUser) {
            alert("Debes iniciar sesión o registrarte para explorar actividades");
            window.location.href = "login.php";
        }
    });

    // ============================
    // POPUP BOM PARA PUBLICAR ACTIVIDAD
    // ============================
    buttonPost.addEventListener("click", () => {

        window.location.href = '../../app/views/create-activity.php';

    });

    //Boton hamburguesa
    const toggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector("header nav");

    toggle.addEventListener("click", () => {
        nav.classList.toggle("open");
        toggle.innerHTML = nav.classList.contains("open")
            ? '<i class="fa-solid fa-xmark"></i>'
            : '<i class="fa-solid fa-bars"></i>';
    });

});

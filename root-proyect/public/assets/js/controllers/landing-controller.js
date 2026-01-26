document.addEventListener("DOMContentLoaded", () => {
    const currentUser = sessionStorage.getItem('username');
    const rol = sessionStorage.getItem('role');
    const buttonExplore = document.getElementById("button-explore");
    const buttonPost = document.getElementById("button-post");

    // Si pulsa el botón de Explorar actividades
    buttonExplore.addEventListener("click", () => {
        if (!rol) {
            alert("Debes iniciar sesión o registrarte para explorar actividades");
            window.location.href = "login.php";
        }
    });

    // ============================
    // POPUP BOM PARA PUBLICAR ACTIVIDAD
    // ============================
    buttonPost.addEventListener("click", () => {
        window.location.href = 'create-activity.php';
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

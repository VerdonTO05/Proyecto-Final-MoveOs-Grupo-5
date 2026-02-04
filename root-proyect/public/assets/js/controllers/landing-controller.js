document.addEventListener("DOMContentLoaded", () => {
  const currentUser = window.CURRENT_USER;
  const buttonExplore = document.getElementById("button-explore");
  const buttonPost = document.getElementById("button-post");

  if (buttonExplore) {
    buttonExplore.addEventListener("click", (event) => {
      event.preventDefault();
      if (!currentUser) {
        alert("Debes iniciar sesión o registrarte para explorar.");
        window.location.href = "index.php?accion=loginView";
      } else {
        if (currentUser == 'administrador') {
          window.location.href = "index.php?accion=seeBoth";
        } else {
          window.location.href = "index.php?accion=seeActivities";
        }
      }
    });
  }

  if (buttonPost) {
    buttonPost.addEventListener("click", (event) => {
      event.preventDefault();
      if (!currentUser) {
        alert("Debes iniciar sesión o registrarte para crear.");
        window.location.href = "index.php?accion=loginView";
      } else {
        window.location.href = "index.php?accion=createActivity";
      }
    });
  }

  // Menú hamburguesa
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("header nav");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      nav.classList.toggle("open");
      toggle.innerHTML = nav.classList.contains("open")
        ? '<i class="fa-solid fa-xmark"></i>'
        : '<i class="fa-solid fa-bars"></i>';
    });
  }
});


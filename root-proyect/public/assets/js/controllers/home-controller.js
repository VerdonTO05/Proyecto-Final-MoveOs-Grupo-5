document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btn_users").addEventListener("click", function () {
    window.location.href = "../../../../app/views/users.php";
  });

  const currentUser = sessionStorage.getItem("usuario");

  if (
    !currentUser &&
    window.location.pathname !== "landing.php"
  ) {
    // Redirigir si el usuario no está logueado
    window.location.href = "landing.php";
    return;
  }

  document.getElementById("btn_users").addEventListener("click", function () {
    window.location.href = "../../../../app/views/users.php"; // Cambia esto por la URL que desees
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

document.addEventListener("DOMContentLoaded", () => {
  if (
    !currentUser &&
    window.location.pathname !== "landing.php"
  ) {
    // Redirigir si el usuario no está logueado
    window.location.href = "landing.php";
    return;
  }

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

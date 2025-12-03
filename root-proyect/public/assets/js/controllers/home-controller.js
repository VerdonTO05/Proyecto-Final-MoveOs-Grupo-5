document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btn_users").addEventListener("click", function () {
    window.location.href = "../../../../app/views/users.php";
  });

  const currentUser = sessionStorage.getItem("currentUser");

  if (
    !currentUser &&
    window.location.pathname !== "../../../../app/views/landing.php"
  ) {
    // Redirigir si el usuario no está logueado
    window.location.href = "../../../../app/views/landing.php";
    return;
  }

  // Si está logueado, muestra Explorar actividades en el header de la pagina
  if (currentUser) {
    const ul = document.getElementById("list");

    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = "../../../../app/views/home.php";
    a.textContent = "Explorar Actividades";

    li.appendChild(a);
    ul.appendChild(li);
  }

  document.getElementById("btn_users").addEventListener("click", function () {
    window.location.href = "../../../../app/views/users.php"; // Cambia esto por la URL que desees
  });
});

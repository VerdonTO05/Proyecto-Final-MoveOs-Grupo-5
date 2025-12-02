document.addEventListener("DOMContentLoaded", () => {

  document.getElementById("btn_users").addEventListener("click", function () {
    window.location.href = "../views/users.php";
  });

  const currentUser = sessionStorage.getItem('currentUser');

  if (!currentUser && window.location.pathname !== '../views/landing.php') {
    // Redirigir si el usuario no está logueado
    window.location.href = '../views/landing.php';
    return;
  }

  // Si está logueado, muestra Explorar actividades en el header de la pagina 
  if (currentUser) {
    const ul = document.getElementById("list");

    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '../views/home.php';
    a.textContent = 'Explorar Actividades';

    li.appendChild(a);
    ul.appendChild(li);
  }


});
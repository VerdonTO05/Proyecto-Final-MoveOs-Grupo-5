document.addEventListener("DOMContentLoaded", () => {

  document.getElementById("btn_users").addEventListener("click", function () {
    window.location.href = "users.html";
  });

  const currentUser = sessionStorage.getItem('currentUser');

  if (!currentUser && window.location.pathname !== '/landing.html') {
    // Redirigir si el usuario no está logueado
    window.location.href = 'landing.html';
    return;
  }

  // Si está logueado, muestra Explorar actividades en el header de la pagina 
  if (currentUser) {
    const ul = document.getElementById("list");

    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = 'home.html';
    a.textContent = 'Explorar Actividades';

    li.appendChild(a);
    ul.appendChild(li);
  }


});
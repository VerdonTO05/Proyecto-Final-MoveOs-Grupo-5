/** main.js que controla el tema de la página (claro u oscuro), ya que en todas las ventanas se podrá realizar*/
document.addEventListener('DOMContentLoaded', () => {
  const toggleSwitch = document.getElementById('theme-toggle');
  const html = document.documentElement;
  const darkModeEnabled = localStorage.getItem('mode') === 'dark';

  html.classList.toggle('dark-mode', darkModeEnabled);
  html.classList.toggle('light-mode', !darkModeEnabled);
  toggleSwitch.checked = darkModeEnabled;

  toggleSwitch.addEventListener('change', () => {
    const isDark = toggleSwitch.checked;
    html.classList.toggle('dark-mode', isDark);
    html.classList.toggle('light-mode', !isDark);
    localStorage.setItem('mode', isDark ? 'dark' : 'light');
  });


  //Añadir dependiendo del rol elementos al encabezado
  const rol = sessionStorage.getItem("rol");
  const header = document.getElementById("list");

  const linksRol = {
    administrador: [
      { texto: "Panel de control", href: "control.php" }
    ],
    participante: [
      { texto: "Explorar Actividades", href: "home.php" },
      { texto: "Mis peticiones", href: "mis_peticiones.php" }, //cambiar link
      { texto: "Actividades pendientes", href: "inscripciones.php" }
      
    ],
    ofertante: [
      { texto: "Explorar Peticiones", href: "home.php" },
      { texto: "Mis actividades", href: "mis_actividades.php" }, //cambiar link
      { texto: "Peticiones pendientes", href: "inscripciones.php" }
    ]
  };

  if (linksRol[rol]) {
    linksRol[rol].forEach(enlace => {
      const li = document.createElement("li");
      const a = document.createElement("a");

      a.textContent = enlace.texto;
      a.href = enlace.href;

      li.appendChild(a);
      header.appendChild(li);
    });
  }




});


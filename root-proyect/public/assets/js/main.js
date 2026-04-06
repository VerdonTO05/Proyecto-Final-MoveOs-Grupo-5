document.addEventListener('DOMContentLoaded', () => {
  initThemeLogic();
  renderHeaderByRole();

  const closeBtn = document.querySelector(".close-btn");

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      window.location.href = "index.php";
    });
  }

  //Filtro de publicaciones
  const filterType = document.getElementById("filterType");
  const filterInput = document.getElementById("filterInput");

  if (filterType && filterInput) {
    filterType.addEventListener("change", () => {
      let html = "";
      switch (filterType.value) {
        case "title":
          html = `<input type="text" id="filterValue" placeholder="Buscar por título">`;
          break;
        case "date":
          html = `<input type="date" id="filterValue">`;
          break;
        case "category":
          html = `
          <select id="filterValue" name="category_id" required aria-required="true">
            <option value="">Selecciona...</option>
            <option value="Taller">Taller</option>
            <option value="Clase">Clase</option>
            <option value="Evento">Evento</option>
            <option value="Excursión">Excursión</option>
            <option value="Formación técnica">Formación técnica</option>
            <option value="Conferencia">Conferencia</option>
            <option value="Reunión">Reunión</option>
            <option value="Experiencia">Experiencia</option>
            <option value="Tour">Tour</option>
            <option value="Competición">Competición</option>
            <option value="Evento social">Evento social</option>
          </select>`;
          break;
      }
      filterInput.innerHTML = html;
    });
  }
});

document.addEventListener("click", (e) => {
  const toggle = e.target.closest(".menu-toggle");
  if (!toggle) return;

  const nav = document.querySelector("header nav");
  if (!nav) return;

  nav.classList.toggle("open");
  toggle.innerHTML = nav.classList.contains("open")
    ? '<i class="fa-solid fa-xmark"></i>'
    : '<i class="fa-solid fa-bars"></i>';
});


/**
 * Inicializar tema claro/oscuro
 */
function initThemeLogic() {
  const html = document.documentElement;
  const toggleSwitch = document.getElementById('theme-toggle');
  const darkModeEnabled = localStorage.getItem('mode') === 'dark';

  html.classList.toggle('dark-mode', darkModeEnabled);
  html.classList.toggle('light-mode', !darkModeEnabled);

  if (toggleSwitch) {
    toggleSwitch.checked = darkModeEnabled;
    toggleSwitch.setAttribute('aria-checked', darkModeEnabled);

    toggleSwitch.addEventListener('change', () => {
      const isDark = toggleSwitch.checked;
      html.classList.toggle('dark-mode', isDark);
      html.classList.toggle('light-mode', !isDark);
      localStorage.setItem('mode', isDark ? 'dark' : 'light');

      toggleSwitch.setAttribute('aria-checked', isDark);
    });
  }
}

/**
 * Renderiza el header dinámicamente según rol
 */
function renderHeaderByRole() {
  const header = document.getElementById('list');
  if (!header) return;

  const user = window.CURRENT_USER;
  if (!user || !user.role) return;

  const rol = user.role;

  const linksRol = {
    administrador: [
      { texto: "Explorar Publicaciones", href: "index.php?accion=seeBoth" },
      { texto: "Panel de control", href: "index.php?accion=controlPanel" },
      { texto: "Control de usuarios", href: "index.php?accion=users" }, 
    ],
    participante: [
      { texto: "Explorar Actividades", href: "index.php?accion=seeActivities" },
      { texto: "Mis peticiones", href: "index.php?accion=seeMyActivities" },
      { texto: "Actividades pendientes", href: "index.php?accion=seeRegistrations" },
      { texto: '<i class="fa-solid fa-angles-up"></i>', href: "index.php?accion=createActivity", title: "Crear Publicación" }
    ],
    organizador: [
      { texto: "Explorar Peticiones", href: "index.php?accion=seeRequest" },
      { texto: "Mis actividades", href: "index.php?accion=seeMyActivities" },
      { texto: "Peticiones pendientes", href: "index.php?accion=seeRegistrations" },
      { texto: '<i class="fa-solid fa-angles-up"></i>', href: "index.php?accion=createActivity", title: "Crear Publicación" }
    ]
  };

  if (!linksRol[rol]) return;

  // Agregar links dinámicos
  linksRol[rol].forEach(link => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.innerHTML = link.texto;
    a.href = link.href;

    if (link.title) {
      a.title = link.title;
    }

    li.appendChild(a);
    header.appendChild(li);
  });

}


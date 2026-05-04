/**
 * admin.js (o el nombre de tu archivo)
 * Controlador de la interfaz principal por rol.
 * Maneja:
 * - Inicialización del tema claro / oscuro
 * - Renderizado dinámico del header según el rol del usuario
 * - Filtro de publicaciones con inputs dinámicos según criterio
 * - Toggle del menú de navegación en móvil
 */
document.addEventListener('DOMContentLoaded', () => {
  initThemeLogic();
  renderHeaderByRole();
  initFilterLogic();
});

/**
 * Inicializa el filtro de publicaciones.
 * Actualiza el input de valor dinámicamente según el criterio seleccionado:
 * texto libre para título, selector de fecha, o desplegable de categoría.
 */
function initFilterLogic() {
  const filterType  = document.getElementById("filterType");
  const filterInput = document.getElementById("filterInput");

  if (!filterType || !filterInput) return;

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

/**
 * Escucha clics delegados en el botón `.menu-toggle` para abrir y cerrar
 * el menú de navegación en móvil.
 * Actualiza el icono del botón según el estado del menú.
 */
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
 * Inicializa el toggle de tema claro/oscuro.
 * Lee el modo guardado en `localStorage`, lo aplica al elemento `<html>`
 * y sincroniza el estado del checkbox y su atributo ARIA.
 * Persiste el nuevo modo al cambiar el toggle.
 */
function initThemeLogic() {
  const html            = document.documentElement;
  const toggleSwitch    = document.getElementById('theme-toggle');
  const darkModeEnabled = localStorage.getItem('mode') === 'dark';

  html.classList.toggle('dark-mode',  darkModeEnabled);
  html.classList.toggle('light-mode', !darkModeEnabled);

  if (!toggleSwitch) return;

  toggleSwitch.checked = darkModeEnabled;
  toggleSwitch.setAttribute('aria-checked', darkModeEnabled);

  toggleSwitch.addEventListener('change', () => {
    const isDark = toggleSwitch.checked;
    html.classList.toggle('dark-mode',  isDark);
    html.classList.toggle('light-mode', !isDark);
    localStorage.setItem('mode', isDark ? 'dark' : 'light');
    toggleSwitch.setAttribute('aria-checked', isDark);
  });
}

/**
 * Renderiza los enlaces de navegación del header según el rol del usuario.
 * Los enlaces se definen por rol en `linksRol` y se insertan en `#list`.
 * No hace nada si el usuario no está autenticado o su rol no está contemplado.
 * Depende de `window.CURRENT_USER` para leer el rol activo.
 */
function renderHeaderByRole() {
  const navList = document.getElementById('list');
  if (!navList) return;

  const user = window.CURRENT_USER;
  if (!user || !user.role) return;

  const linksRol = {
    administrador: [
      { texto: "Explorar Publicaciones", href: "index.php?accion=seeBoth" },
      { texto: "Panel de control",       href: "index.php?accion=controlPanel" },
      { texto: "Panel de usuarios",      href: "index.php?accion=users" },
    ],
    participante: [
      { texto: "Explorar Actividades",   href: "index.php?accion=seeActivities" },
      { texto: "Mis peticiones",         href: "index.php?accion=seeMyActivities" },
      { texto: "Actividades pendientes", href: "index.php?accion=seeRegistrations" },
      { texto: '<i class="fa-solid fa-angles-up"></i>', href: "index.php?accion=createActivity", title: "Crear Publicación" }
    ],
    organizador: [
      { texto: "Explorar Peticiones",    href: "index.php?accion=seeRequest" },
      { texto: "Mis actividades",        href: "index.php?accion=seeMyActivities" },
      { texto: "Peticiones pendientes",  href: "index.php?accion=seeRegistrations" },
      { texto: '<i class="fa-solid fa-angles-up"></i>', href: "index.php?accion=createActivity", title: "Crear Publicación" }
    ]
  };

  const links = linksRol[user.role];
  if (!links) return;

  links.forEach(({ texto, href, title }) => {
    const li = document.createElement('li');
    const a  = document.createElement('a');
    a.innerHTML = texto;
    a.href      = href;
    if (title) a.title = title;
    li.appendChild(a);
    navList.appendChild(li);
  });
}
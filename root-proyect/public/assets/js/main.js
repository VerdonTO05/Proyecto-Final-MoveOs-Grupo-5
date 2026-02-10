document.addEventListener('DOMContentLoaded', () => {
  initThemeLogic();
  renderHeaderByRole();

  
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
      { texto: "Panel de control", href: "index.php?accion=controlPanel" },
      { texto: "Control de usuarios", href: "index.php?accion=users"},
      { texto: "Explorar Publicaciones", href: "index.php?accion=seeBoth" }
      
    ],
    participante: [
      { texto: "Explorar Actividades", href: "index.php?accion=seeActivities" },
      { texto: "Mis peticiones", href: "index.php?accion=seeMyActivities" },
      { texto: "Actividades pendientes", href: "index.php?accion=inscripciones" }
    ],
    organizador: [
      { texto: "Explorar Peticiones", href: "index.php?accion=seeRequest" },
      { texto: "Mis actividades", href: "index.php?accion=seeMyActivities" },
      { texto: "Peticiones pendientes", href: "index.php?accion=inscripciones" }
    ]
  };

  if (!linksRol[rol]) return;

  // Agregar links dinámicos
  linksRol[rol].forEach(link => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.textContent = link.texto;
    a.href = link.href;
    li.appendChild(a);
    header.appendChild(li);
  });

}


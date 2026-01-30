document.addEventListener('DOMContentLoaded', () => {
  initThemeLogic();
  renderHeaderByRole();
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

    toggleSwitch.addEventListener('change', () => {
      const isDark = toggleSwitch.checked;
      html.classList.toggle('dark-mode', isDark);
      html.classList.toggle('light-mode', !isDark);
      localStorage.setItem('mode', isDark ? 'dark' : 'light');
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
      { texto: "Panel de control", href: "control.php" }
    ],
    participante: [
      { texto: "Explorar Actividades", href: "home.php" },
      { texto: "Mis peticiones", href: "mis_peticiones.php" },
      { texto: "Actividades pendientes", href: "inscripciones.php" }
    ],
    organizador: [
      { texto: "Explorar Peticiones", href: "home.php" },
      { texto: "Mis actividades", href: "mis_actividades.php" },
      { texto: "Peticiones pendientes", href: "inscripciones.php" }
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


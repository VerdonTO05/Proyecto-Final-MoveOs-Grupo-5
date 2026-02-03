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
      { texto: "Panel de control", href: "index.php?accion=controlPanel" }
    ],
    participante: [
      { texto: "Explorar Actividades", href: "index.php?accion=seeActivities" },
      { texto: "Mis peticiones", href: "index.php?accion=misPeticiones" },
      { texto: "Actividades pendientes", href: "index.php?accion=inscripciones" }
    ],
    organizador: [
      { texto: "Explorar Peticiones", href: "index.php?accion=seeRequest" },
      { texto: "Mis actividades", href: "index.php?accion=misActividades" },
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

function showAlert(title, message, type = 'info') {
  const container = document.getElementById('alert-container');

  const alert = document.createElement('div');
  alert.className = `custom-alert ${type}`;
  alert.innerHTML = `
    <h2>${title}</h2>
    <div>${message}</div>
    <button>&times;</button>
  `;

  // Cerrar manualmente
  alert.querySelector('button').addEventListener('click', () => {
    alert.remove();
    localStorage.setItem('alert_view_data_shown', 'false');
  });

  container.appendChild(alert);
}



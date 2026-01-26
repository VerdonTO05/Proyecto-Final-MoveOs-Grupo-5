document.addEventListener('DOMContentLoaded', () => {
  const html = document.documentElement;

  // === Tema claro / oscuro ===
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

  //Pintar header según rol al cargar cada vista
  renderHeaderByRole();
});

//Detectar cambio de rol desde otra pestaña
window.addEventListener("storage", (event) => {
  if (event.key === "role") {
    renderHeaderByRole();
  }
});

function renderHeaderByRole() {
  const rol = sessionStorage.getItem("role");
  const header = document.getElementById("list");

  if (!header || !rol) return;

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

  linksRol[rol].forEach(enlace => {
    const li = document.createElement("li");
    const a = document.createElement("a");

    a.textContent = enlace.texto;
    a.href = enlace.href;

    li.appendChild(a);
    header.appendChild(li);
  });
}

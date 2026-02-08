/**
 * Inicializa el tema al cargar la página para evitar el "Flash of Unstyled Content" (FOUC).
 * Esta función se ejecuta inmediatamente antes de que se renderice la ventana,
 * asegurando que se aplique el tema correcto (claro u oscuro) desde el inicio.
 */
(function() {
  try {
    const darkModeEnabled = localStorage.getItem('mode') === 'dark';
    const html = document.documentElement;

    // Aplicar clase correspondiente al tema
    html.classList.add(darkModeEnabled ? 'dark-mode' : 'light-mode');
  } catch (e) {
    // En caso de error, no hacer nada (fallback a CSS por defecto)
    console.error("Error al aplicar el tema inicial:", e);
  }
})();

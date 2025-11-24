/** Función que carga de localStorage el tema y evita que se produzca “Flash of Unstyled Content” (FOUC),
 * un flash no deseado al cambiar de ventana cuando el tema es oscuro. Es lo primero que se debe cargar.
 */
(function() {
  try {
    const darkModeEnabled = localStorage.getItem('mode') === 'dark';
    const html = document.documentElement;
    html.classList.add(darkModeEnabled ? 'dark-mode' : 'light-mode');
  } catch (e) {}
})();


/*La estructura de esta función es así debido a que es una IIFE (Immediately Invoked Function Expression), es decir, 
una función auto-ejecutada. Se usa en muchos scripts, especialmente cuando se necesita ejecutar algo inmediatamente al cargar,
antes de que la página renderice.*/
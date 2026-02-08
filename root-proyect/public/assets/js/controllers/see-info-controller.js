/**
 * Función que se ejecuta cuando el DOM está completamente cargado.
 * Inicializa los listeners de los elementos interactivos de la página.
 */
document.addEventListener("DOMContentLoaded", () => {

  /** 
   * Botón de cierre que redirige al usuario a la página principal.
   * @type {HTMLElement|null} 
   */
  const closeBtn = document.querySelector('.close-btn');

  // Si el botón existe, se añade el evento de clic
  if (closeBtn) {
    /**
     * Evento click del botón de cierre.
     * Redirige al usuario a la página principal (index.php).
     * @event click
     */
    closeBtn.addEventListener('click', () => {
      window.location.href = "index.php";
    });
  }

});
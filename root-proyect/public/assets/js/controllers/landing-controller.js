document.addEventListener("DOMContentLoaded", () => {

  /** @type {string|null|undefined} Usuario actual, definido globalmente en la página */
  const currentUser = window.CURRENT_USER;

  /** @type {HTMLElement|null} Botón para explorar actividades */
  const buttonExplore = document.getElementById("button-explore");

  /** @type {HTMLElement|null} Botón para crear nueva actividad */
  const buttonPost = document.getElementById("button-post");

  // ---------------------
  // Evento click: explorar
  // ---------------------
  if (buttonExplore) {
    /**
     * Evento click del botón "Explorar".
     * Redirige al usuario según su rol o solicita login si no ha iniciado sesión.
     * @param {MouseEvent} event Evento click
     */
    buttonExplore.addEventListener("click", (event) => {
      event.preventDefault();

      if (!currentUser) {
        alert("Debes iniciar sesión o registrarte para explorar.");
        window.location.href = "index.php?accion=loginView";
      } else {
        if (currentUser === 'administrador') {
          window.location.href = "index.php?accion=seeBoth";
        } else {
          window.location.href = "index.php?accion=seeActivities";
        }
      }
    });
  }

  // ---------------------
  // Evento click: crear actividad
  // ---------------------
  if (buttonPost) {
    /**
     * Evento click del botón "Crear".
     * Redirige al usuario a la página de creación de actividad
     * o solicita login si no ha iniciado sesión.
     * @param {MouseEvent} event Evento click
     */
    buttonPost.addEventListener("click", (event) => {
      event.preventDefault();

      if (!currentUser) {
        alert("Debes iniciar sesión o registrarte para crear.");
        window.location.href = "index.php?accion=loginView";
      } else {
        window.location.href = "index.php?accion=createActivity";
      }
    });
  }

});

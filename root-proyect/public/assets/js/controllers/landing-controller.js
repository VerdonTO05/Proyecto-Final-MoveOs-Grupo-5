document.addEventListener("DOMContentLoaded", () => {
  /** 
   * Información del usuario actual obtenida desde la variable global.
   * @type {Object|null}
   * @property {string} role - Rol del usuario
   */
  const currentUser = window.CURRENT_USER;

  const buttonExplore = document.getElementById("button-explore");
  const buttonPost = document.getElementById("button-post");

  // Configuración del botón "Explorar"
  handleButtonClick(
    buttonExplore,
    currentUser,
    null,
    "index.php?accion=loginView",
    (role) => role !== 'administrador' ? "index.php?accion=seeActivities" : "index.php?accion=seeBoth"
  );

  // Configuración del botón "Crear publicación"
  handleButtonClick(
    buttonPost,
    currentUser,
    "index.php?accion=createActivity",
    "index.php?accion=loginView"
  );
});

/**
 * Maneja la acción de un botón con redirección y muestra alerta si el usuario no está identificado.
 *
 * @param {HTMLElement|null} button - Botón que dispara la acción
 * @param {Object|null} currentUser - Usuario actual
 * @param {string|null} redirectIfLoggedIn - URL a redirigir si hay usuario
 * @param {string|null} redirectIfNotLoggedIn - URL a redirigir si NO hay usuario
 * @param {function(string): string} [roleRedirect] - Función opcional que recibe el rol del usuario y devuelve la URL de redirección
 */
const handleButtonClick = (button, currentUser, redirectIfLoggedIn, redirectIfNotLoggedIn, roleRedirect) => {
  if (!button) return;

  button.addEventListener("click", async (event) => {
    event.preventDefault();

    if (!currentUser) {
      // Si no hay usuario, mostrar alerta y redirigir al login
      await showAlert(
        'Acceso denegado',
        'Debes iniciar sesión o registrarte para explorar.',
        'warning',
        2500
      );
      window.location.href = redirectIfNotLoggedIn;
    } else {
      // Si hay usuario, decidir la URL según rol o redirección fija
      const targetUrl = roleRedirect ? roleRedirect(currentUser.role) : redirectIfLoggedIn;
      window.location.href = targetUrl;
    }
  });
};
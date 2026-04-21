document.addEventListener("DOMContentLoaded", () => {
  /** 
   * Información del usuario actual obtenida desde la variable global.
   * @type {Object|null}
   */
  const currentUser = window.CURRENT_USER;

  const buttonExplore = document.getElementById("button-explore");
  const buttonPost    = document.getElementById("button-post");

  // Configuración del botón "Explorar"
  handleButtonClick(
    buttonExplore,
    currentUser,
    null,
    null, // sin redirect: abrimos modal
    (role) => role !== 'administrador' ? "index.php?accion=seeActivities" : "index.php?accion=seeBoth"
  );

  // Configuración del botón "Crear publicación"
  handleButtonClick(
    buttonPost,
    currentUser,
    "index.php?accion=createActivity",
    null // sin redirect: abrimos modal
  );
});

/**
 * Maneja la acción de un botón con redirección y muestra alerta si el usuario no está identificado.
 * Si redirectIfNotLoggedIn es null, abre el modal de auth en vez de navegar.
 *
 * @param {HTMLElement|null} button - Botón que dispara la acción
 * @param {Object|null} currentUser - Usuario actual
 * @param {string|null} redirectIfLoggedIn - URL a redirigir si hay usuario
 * @param {string|null} redirectIfNotLoggedIn - URL de fallback si NO hay usuario (null → modal)
 * @param {function(string): string} [roleRedirect] - Función opcional que recibe el rol y devuelve URL
 */
const handleButtonClick = (button, currentUser, redirectIfLoggedIn, redirectIfNotLoggedIn, roleRedirect) => {
  if (!button) return;

  button.addEventListener("click", async (event) => {
    event.preventDefault();

    if (!currentUser) {
      await showAlert(
        'Acceso denegado',
        'Debes iniciar sesión o registrarte para explorar.',
        'warning',
        2500
      );
      if (redirectIfNotLoggedIn) {
        window.location.href = redirectIfNotLoggedIn;
      } else if (window.openAuthModal) {
        openAuthModal('login');
      } else {
        window.location.href = 'index.php?accion=loginView';
      }
    } else {
      const targetUrl = roleRedirect ? roleRedirect(currentUser.role) : redirectIfLoggedIn;
      window.location.href = targetUrl;
    }
  });
};
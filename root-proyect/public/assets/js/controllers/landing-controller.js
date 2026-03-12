//js refactorizado 12/03/2026
import { showAlert } from "./shared.js";

document.addEventListener("DOMContentLoaded", () => {
  /** 
   * Información del usuario actual obtenida desde la variable global.
   * @type {Object|null}
   * @property {string} role - Rol del usuario
   */
  const currentUser = window.CURRENT_USER;

  /** @type {HTMLElement|null} Botón que redirige a explorar actividades */
  const buttonExplore = document.getElementById("button-explore");

  /** @type {HTMLElement|null} Botón que redirige a crear una actividad */
  const buttonPost = document.getElementById("button-post");

  /**
   * Maneja la acción de un botón con redirección y muestra alerta si el usuario no está identificado.
   *
   * @param {HTMLElement|null} button - Botón que dispara la acción
   * @param {string|null} redirectIfLoggedIn - URL a redirigir si hay usuario
   * @param {string} redirectIfNotLoggedIn - URL a redirigir si NO hay usuario
   * @param {function(string): string} [roleRedirect] - Función opcional que recibe el rol del usuario y devuelve la URL de redirección
   */
  const handleButtonClick = (button, redirectIfLoggedIn, redirectIfNotLoggedIn, roleRedirect) => {
    if (!button) return;

    button.addEventListener("click", async (event) => {
      event.preventDefault();

      if (!currentUser) {
        // Si no hay usuario, mostrar alerta y redirigir al login
        await showAlert(
          'Acceso denegado',
          'Debes iniciar sesión o registrarte para explorar.',
          'warning',
          3000
        );
        window.location.href = redirectIfNotLoggedIn;
      } else {
        // Si hay usuario, decidir la URL según rol o redirección fija
        const targetUrl = roleRedirect ? roleRedirect(currentUser.role) : redirectIfLoggedIn;
        window.location.href = targetUrl;
      }
    });
  };

  // Configuración del botón "Explorar"
  handleButtonClick(
    buttonExplore,
    null,
    "index.php?accion=loginView",
    (role) => role !== 'administrador' ? "index.php?accion=seeActivities" : "index.php?accion=seeBoth"
  );

  // Configuración del botón "Crear publicación"
  handleButtonClick(
    buttonPost,
    "index.php?accion=createActivity",
    "index.php?accion=loginView"
  );
});
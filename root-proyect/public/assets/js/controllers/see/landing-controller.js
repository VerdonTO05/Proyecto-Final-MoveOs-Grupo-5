/**
 * Inicio
 * Maneja:
 * - Acción del botón "Explorar" con redirección según rol del usuario
 * - Acción del botón "Crear publicación" con redirección o modal de login
 * - Apertura del modal de autenticación si el usuario no está identificado
 */

document.addEventListener("DOMContentLoaded", () => {
    /** @type {Object|null} Usuario actual obtenido desde la variable global */
    const currentUser = window.CURRENT_USER;

    /** @type {HTMLElement|null} */
    const buttonExplore = document.getElementById("button-explore");

    /** @type {HTMLElement|null} */
    const buttonPost = document.getElementById("button-post");

    // Explorar: redirige a actividades o al panel según el rol
    handleButtonClick(
        buttonExplore,
        currentUser,
        null,
        null,
        (role) => role !== 'administrador'
            ? "index.php?accion=seeActivities"
            : "index.php?accion=seeBoth"
    );

    // Crear publicación: redirige al formulario o abre el modal si no hay sesión
    handleButtonClick(
        buttonPost,
        currentUser,
        "index.php?accion=createActivity",
        null
    );
});

/**
 * Asocia un listener de click a un botón con lógica de redirección según autenticación.
 * Si el usuario no está identificado muestra una alerta y abre el modal de login
 * o redirige a la URL de fallback. Si está identificado, redirige según su rol o
 * a la URL indicada.
 *
 * @param {HTMLElement|null}          button                 - Botón que dispara la acción
 * @param {Object|null}               currentUser            - Usuario actual o null si no hay sesión
 * @param {string|null}               redirectIfLoggedIn     - URL de destino si hay sesión activa
 * @param {string|null}               redirectIfNotLoggedIn  - URL de fallback si no hay sesión (null → modal)
 * @param {function(string): string}  [roleRedirect]         - Función opcional que recibe el rol y devuelve la URL de destino
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

            // Prioridad: URL de fallback → modal global → loginView
            if (redirectIfNotLoggedIn) {
                window.location.href = redirectIfNotLoggedIn;
            } else if (window.openAuthModal) {
                openAuthModal('login');
            } else {
                window.location.href = 'index.php?accion=loginView';
            }
        } else {
            const targetUrl = roleRedirect
                ? roleRedirect(currentUser.role)
                : redirectIfLoggedIn;
            window.location.href = targetUrl;
        }
    });
};
/**
 * Inscripciones / Peticiones pendientes
 * Maneja:
 * - Carga y refresco periódico de las inscripciones del usuario
 * - Renderizado de tarjetas activas y terminadas en grids separados
 * - Filtrado de inscripciones por categoría u otros criterios
 * - Cancelación de inscripciones activas con confirmación
 * - Textos adaptativos según el rol (organizador o participante)
 */

/** @type {Object[]} Caché local de inscripciones activas del usuario */
let registrationsActive = [];

/** @type {Object[]} Caché local de inscripciones terminadas del usuario */
let registrationsFinished = [];

document.addEventListener("DOMContentLoaded", () => {
    const role  = CURRENT_USER.role;
    const isOrg = role === 'organizador';

    bindFilterListeners(() => applyFilters(role));
    loadRegistrations(role);

    // Textos del toggle adaptados al rol del usuario
    bindToggleSection(
        "toggleFinished",
        "gridRegistrationsFinished",
        isOrg ? "Ocultar peticiones terminadas"  : "Ocultar inscripciones terminadas",
        isOrg ? "Ver peticiones terminadas"       : "Ver inscripciones terminadas"
    );

    // Refresco automático cada 5 segundos para mantener los grids actualizados
    setInterval(() => {
        loadRegistrations(CURRENT_USER.role);
    }, 5000);
});

/**
 * Carga las inscripciones activas y terminadas del usuario desde el servidor.
 * Solo re-renderiza si los datos han cambiado respecto a la caché local.
 *
 * @param {string} role - Rol del usuario actual
 * @returns {Promise<void>}
 */
async function loadRegistrations(role) {
    const grid = document.getElementById('gridRegistrations');
    if (!grid) return;

    try {
        const result = await fetch('index.php?accion=inscripciones').then(r => r.json());

        if (!result.success) return;

        const newActive   = result.data.active   || [];
        const newFinished = result.data.finished  || [];

        // Evitar re-renders innecesarios comparando con la caché actual
        const changed =
            JSON.stringify(newActive)   !== JSON.stringify(registrationsActive) ||
            JSON.stringify(newFinished) !== JSON.stringify(registrationsFinished);

        if (changed) {
            registrationsActive   = newActive;
            registrationsFinished = newFinished;
            render(registrationsActive, registrationsFinished, role);
        }

    } catch (error) {
        grid.innerHTML = '<p class="error">Error al cargar inscripciones.</p>';
    }
}

/**
 * Renderiza las listas de inscripciones activas y terminadas en sus respectivos grids.
 * Muestra mensajes informativos si alguna de las listas está vacía.
 *
 * @param {Object[]} active   - Inscripciones activas del usuario
 * @param {Object[]} finished - Inscripciones terminadas del usuario
 * @param {string}   role     - Rol del usuario actual
 */
function render(active, finished, role) {
    const grid  = document.getElementById('gridRegistrations');
    const gridF = document.getElementById('gridRegistrationsFinished');

    grid.innerHTML = active.length === 0
        ? `<p class="no-activities">Todavía no tienes ninguna inscripción.</p>
           <p><a href="index.php?accion=seeActivities">Busca una nueva aventura</a></p>`
        : '';
    active.forEach(a => grid.appendChild(createActiveCard(a, role)));

    gridF.innerHTML = finished.length === 0
        ? '<p class="no-activities">Todavía no tienes inscripciones terminadas.</p>'
        : '';
    finished.forEach(a => gridF.appendChild(createFinishedCard(a)));
}

/**
 * Aplica los filtros activos sobre ambas cachés locales y vuelve a renderizar los grids.
 *
 * @param {string} role - Rol del usuario actual, necesario para el render
 */
function applyFilters(role) {
    const { type, value } = getFilterValues();
    if (!type) return;

    render(
        registrationsActive.filter(a  => matchFilter(a, type, value)),
        registrationsFinished.filter(a => matchFilter(a, type, value)),
        role
    );
}

/**
 * Crea la tarjeta DOM de una inscripción activa con la opción de cancelarla.
 * Tras cancelar con éxito, anima y elimina la tarjeta del DOM.
 *
 * @param {Object} pub             - Datos de la inscripción
 * @param {number} pub.id          - ID único de la actividad
 * @param {string} pub.title       - Título
 * @param {string} [pub.category_name] - Nombre de la categoría
 * @param {string} role            - Rol del usuario actual
 * @returns {HTMLElement} Tarjeta lista para insertar en el DOM
 */
function createActiveCard(pub, role) {
    const card = document.createElement("article");
    card.className = "activity activity-card";

    card.innerHTML = `
        <div class="activity-image">${buildImageHTML(pub)}</div>
        <div class="activity-content">
            ${pub.category_name ? `<span class="category">${pub.category_name}</span>` : ""}
            <h3>${pub.title}</h3>
            <p class="description">${pub.description}</p>
            ${buildDetailsHTML(pub)}
            ${buildMetaHTML(pub)}
            ${buildFooterHTML(pub)}
            <div class="actions">
                <button class="btn-detail" data-id="${pub.id}">Ver detalles</button>
                <button class="btn-signup" data-id="${pub.id}">Cancelar</button>
            </div>
        </div>`;

    const grid = document.getElementById('gridRegistrations');

    card.querySelector(".btn-detail")?.addEventListener("click", function () {
        openDetailModal(pub, role, CURRENT_USER, { showChat: true });
    });

    card.querySelector(".btn-signup")?.addEventListener("click", async function () {
        const confirmed = await showConfirm({
            title: '¿Cancelar inscripción?',
            message: 'Dejarás de estar apuntado a esta actividad. Podrás volver a inscribirte si hay plazas disponibles.',
            confirmText: 'Sí, cancelar',
            cancelText: 'Volver'
        });
        if (!confirmed) return;

        try {
            const response = await fetch('index.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    accion: 'cancelRegistration',
                    id: this.dataset.id
                })
            });

            const result = await response.json();

            if (result.success) {
                showAlert('Cancelada', result.message, 'success');

                // Animar y eliminar la tarjeta del DOM
                card.style.transition = 'opacity 0.3s, transform 0.3s';
                card.style.opacity    = '0';
                card.style.transform  = 'scale(0.9)';

                setTimeout(() => {
                    card.remove();

                    // Si el grid quedó vacío, mostrar mensaje con enlace a explorar
                    if (grid && grid.children.length === 0) {
                        grid.innerHTML = `
                            <p class="no-activities">Todavía no tienes ninguna inscripción.</p>
                            <p><a href="index.php?accion=seeActivities">Busca una nueva aventura</a></p>`;
                    }
                }, 300);

            } else {
                throw new Error(result.message || 'Error desconocido');
            }

        } catch (error) {
            showAlert('Error', 'No se pudo cancelar la actividad', 'error');
        }
    });

    return card;
}

/**
 * Crea la tarjeta DOM de una inscripción terminada, solo para visualización.
 *
 * @param {Object} pub             - Datos de la inscripción terminada
 * @param {number} pub.id          - ID único de la actividad
 * @param {string} pub.title       - Título
 * @param {string} [pub.category_name] - Nombre de la categoría
 * @returns {HTMLElement} Tarjeta lista para insertar en el DOM
 */
function createFinishedCard(pub) {
    const card = document.createElement("article");
    card.className = "activity activity-card";

    card.innerHTML = `
        <div class="activity-image">${buildImageHTML(pub)}</div>
        <div class="activity-content">
            ${pub.category_name ? `<span class="category">${pub.category_name}</span>` : ""}
            <h3>${pub.title}</h3>
            <p class="description">${pub.description}</p>
            ${buildDetailsHTML(pub)}
            ${buildMetaHTML(pub)}
            ${buildFooterHTML(pub)}
        </div>`;

    return card;
}
/**
 * Publicaciones propias
 * Maneja:
 * - Carga y refresco periódico de las actividades propias del usuario
 * - Renderizado de tarjetas activas y terminadas en grids separados
 * - Filtrado de publicaciones por categoría u otros criterios
 * - Edición y eliminación de actividades activas con confirmación
 * - Notificación por email a inscritos al eliminar una actividad
 * - Republicación de actividades terminadas con nueva fecha
 */

/** @type {Object[]} Caché local de actividades activas del usuario */
let activitiesActive = [];

/** @type {Object[]} Caché local de actividades terminadas del usuario */
let activitiesFinished = [];

document.addEventListener("DOMContentLoaded", () => {
    loadActivities(CURRENT_USER.role);

    bindToggleSection(
        "toggleFinished",
        "gridActivitiesFinished",
        "Ocultar actividades terminadas",
        "Ver actividades terminadas"
    );

    bindFilterListeners(applyFilters);

    // Refresco automático cada 5 segundos para mantener los grids actualizados
    setInterval(() => {
        loadActivities(CURRENT_USER.role);
    }, 5000);
});

/**
 * Carga las actividades activas y terminadas del usuario desde el servidor.
 * Solo re-renderiza si los datos han cambiado respecto a la caché local.
 *
 * @param {string} role - Rol del usuario actual
 * @returns {Promise<void>}
 */
async function loadActivities(role) {
    const grid = document.getElementById('gridActivities');
    if (!grid) return;

    try {
        const result = await fetch('index.php?accion=getMyActivities').then(r => r.json());

        if (!result.success) return;

        const newActive = result.data.active || [];
        const newFinished = result.data.finished || [];

        // Evitar re-renders innecesarios comparando con la caché actual
        const changed =
            JSON.stringify(newActive) !== JSON.stringify(activitiesActive) ||
            JSON.stringify(newFinished) !== JSON.stringify(activitiesFinished);

        if (changed) {
            activitiesActive = newActive;
            activitiesFinished = newFinished;
            render(activitiesActive, activitiesFinished, role);
        }

    } catch (error) {
        grid.innerHTML = '<p class="error">Error al cargar tus actividades.</p>';
    }
}

/**
 * Renderiza las listas de actividades activas y terminadas en sus respectivos grids.
 * Muestra mensajes informativos si alguna de las listas está vacía.
 *
 * @param {Object[]} active   - Actividades activas del usuario
 * @param {Object[]} finished - Actividades terminadas del usuario
 * @param {string}   role     - Rol del usuario actual
 */
function render(active, finished, role) {
    const grid = document.getElementById('gridActivities');
    const gridF = document.getElementById('gridActivitiesFinished');

    grid.innerHTML = active.length === 0
        ? `<p class="no-activities">Todavía no tienes ninguna actividad.</p>
           <p><a href="index.php?accion=createActivity">Crea una ahora</a></p>`
        : '';
    active.forEach(a => grid.appendChild(createActiveCard(a, role)));

    gridF.innerHTML = finished.length === 0
        ? '<p class="no-activities">Todavía no tienes ninguna actividad propia terminada.</p>'
        : '';
    finished.forEach(a => gridF.appendChild(createFinishedCard(a)));
}

/**
 * Aplica los filtros activos sobre ambas cachés locales y vuelve a renderizar los grids.
 */
function applyFilters() {
    const { type, value } = getFilterValues();
    if (!type) return;

    render(
        activitiesActive.filter(a => matchFilter(a, type, value)),
        activitiesFinished.filter(a => matchFilter(a, type, value)),
        CURRENT_USER.role
    );
}

/**
 * Crea la tarjeta DOM de una actividad activa con acciones de ver, editar y eliminar.
 * La eliminación incluye confirmación y opción de notificar a los inscritos por email.
 *
 * @param {Object} pub              - Datos de la publicación
 * @param {number} pub.id           - ID único
 * @param {string} pub.title        - Título
 * @param {string} pub.state        - Estado: 'pendiente', 'rechazada' o 'aprobada'
 * @param {string} [pub.category_name] - Nombre de la categoría
 * @param {string} role             - Rol del usuario actual
 * @returns {HTMLElement} Tarjeta lista para insertar en el DOM
 */
function createActiveCard(pub, role) {
    const card = document.createElement("article");
    card.className = "activity activity-card";

    card.innerHTML = `
        <div class="activity-image">${buildImageHTML(pub)}</div>
        <div class="activity-content">
            ${pub.category_name ? `<span class="category">${pub.category_name}</span>` : ""}
            ${pub.state === 'pendiente'
            ? `<button id="btn-state" class="state"><i class="fas fa-hourglass-half"></i></button>`
            : pub.state === 'rechazada'
                ? `<span class="state"><i class="fas fa-times"></i></span>`
                : `<span class="state"><i class="fas fa-check-double"></i></span>`}
            <h3>${pub.title}</h3>
            <p class="description">${pub.description}</p>
            ${buildDetailsHTML(pub)}
            ${buildMetaHTML(pub)}
            ${buildFooterHTML(pub)}
            <div class="actions">
                <button class="btn-detail" data-id="${pub.id}">Ver detalles</button>
                <button class="btn-edit"   data-id="${pub.id}">Editar</button>
                <button class="btn-delete" data-id="${pub.id}">Eliminar</button>
            </div>
        </div>`;

    const grid = document.getElementById('gridActivities');

    card.querySelector(".btn-detail")?.addEventListener("click", () => {
        openDetailModal(pub, role, CURRENT_USER, { showChat: true });
    });

    card.querySelector(".btn-edit")?.addEventListener("click", function () {
        submitForm("editActivity", this.dataset.id);
    });

    card.querySelector(".btn-delete")?.addEventListener("click", async function () {
        // Primera confirmación: ¿eliminar la publicación?
        const confirmedDelete = await showConfirmTwo({
            title: '¿Eliminar publicación?',
            message: 'Esta acción es permanente y no se puede deshacer.',
            confirmText: 'Sí, eliminar',
            cancelText: 'Cancelar'
        });
        if (!confirmedDelete) return;

        // Segunda confirmación: ¿notificar a los inscritos por email?
        let sendEmails = false;

        if (role === 'participante') {
            sendEmails = await showConfirmTwo({
                title: '¿Notificar al organizador?',
                message: 'Se enviará un email al organizador informando de la cancelación.',
                confirmText: 'Sí, enviar email',
                cancelText: 'No, eliminar sin notificar'
            });
        } else {
            sendEmails = await showConfirmTwo({
                title: '¿Notificar a los participantes?',
                message: 'Se enviará un email a todos los inscritos informando de la cancelación.',
                confirmText: 'Sí, enviar emails',
                cancelText: 'No, eliminar sin notificar'
            });
        }

        // Mostrar spinner mientras se procesa la petición
        const actionsDiv = card.querySelector('.actions');
        actionsDiv.innerHTML = `<span class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Procesando...</span>`;

        try {
            const response = await fetch('index.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    accion: 'deleteActivity',
                    id: this.dataset.id,
                    sendEmails
                })
            });

            const result = await response.json();

            if (result.success) {
                showAlert('Eliminada', result.message, 'success');

                // Animar y eliminar la tarjeta del DOM
                card.style.transition = 'opacity 0.3s, transform 0.3s';
                card.style.opacity = '0';
                card.style.transform = 'scale(0.9)';

                setTimeout(() => {
                    card.remove();
                    if (grid && grid.children.length === 0) {
                        grid.innerHTML = `
                            <p class="no-activities">Todavía no tienes ninguna actividad.</p>
                            <p><a href="index.php?accion=createActivity">Crea una ahora</a></p>`;
                    }
                }, 300);

            } else {
                showAlert('Error', result.message || 'No se pudo eliminar', 'error');

                // Restaurar los botones de acción si el servidor devuelve error
                actionsDiv.innerHTML = `
                    <button class="btn-detail" data-id="${pub.id}">Ver detalles</button>
                    <button class="btn-edit"   data-id="${pub.id}">Editar</button>
                    <button class="btn-delete" data-id="${pub.id}">Eliminar</button>`;
            }

        } catch (error) {
            showAlert('Error', 'Error de conexión con el servidor', 'error');
        }
    });

    return card;
}

/**
 * Crea la tarjeta DOM de una actividad terminada con la opción de republicarla.
 * Al republicar se solicita una nueva fecha mediante un input dentro del modal de confirmación.
 *
 * @param {Object} pub             - Datos de la publicación terminada
 * @param {number} pub.id          - ID único
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
            ${buildMetaHTML(pub)}
            <div class="actions">
                <button class="btn-republish" data-id="${pub.id}">Volver a publicar</button>
            </div>
        </div>`;

    card.querySelector(".btn-republish")?.addEventListener("click", async function () {
        // El modal incluye un input de fecha dentro del mensaje de confirmación
        const confirmed = await showConfirm({
            title: 'Republicar actividad',
            message: `
                <p>Selecciona la nueva fecha:</p>
                <input type="date" id="republish-date" class="swal2-input">
            `,
            confirmText: 'Republicar',
            cancelText: 'Cancelar'
        });

        if (!confirmed) return;

        const date = document.getElementById("republish-date").value;
        if (!date) {
            showAlert("Error", "Debes seleccionar una fecha", "error");
            return;
        }

        await republishActivity(pub.id, date);
    });

    return card;
}

/**
 * Envía al servidor la solicitud para republicar una actividad o petición con una nueva fecha.
 * Recarga las actividades si la operación tiene éxito.
 *
 * @param {number} id      - ID de la actividad a republicar
 * @param {string} newDate - Nueva fecha en formato 'YYYY-MM-DD'
 * @returns {Promise<void>}
 */
async function republishActivity(id, newDate) {
    const type_publication = CURRENT_USER.role === 'participante' ? 'request' : 'activity';

    try {
        const response = await fetch('index.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: new URLSearchParams({
                accion: 'republishActivity',
                id,
                date: newDate,
                type: type_publication
            })
        });

        const result = await response.json();

        if (result.success) {
            showAlert('Re-publicada', 'La actividad se ha creado de nuevo correctamente', 'success');
            loadActivities(CURRENT_USER.role);
        } else {
            showAlert('Error', result.message || 'No se pudo republicar', 'error');
        }

    } catch (error) {
        showAlert('Error', 'No se pudo republicar la actividad', 'error');
    }
}
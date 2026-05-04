/**
 * Explorar publicaciones administradores
 * Maneja:
 * - Cambio entre pestañas de actividades y peticiones
 * - Carga y renderizado de actividades y peticiones
 * - Filtrado de elementos por categoría u otros criterios
 * - Aprobación y cancelación de publicaciones desde la tarjeta
 */

/** @type {Object[]} Caché local de actividades cargadas desde el servidor */
let activities = [];

/** @type {Object[]} Caché local de peticiones cargadas desde el servidor */
let requests = [];

document.addEventListener("DOMContentLoaded", () => {
    initTabSwitch();
    loadActivities();
    bindFilterListeners(applyFilters);
});

/**
 * Inicializa el cambio entre pestañas de actividades y peticiones.
 * Actualiza el título, subtítulo y contenido del grid al cambiar de pestaña.
 */
function initTabSwitch() {
    const buttons = document.querySelectorAll('.tab-btn.control');
    const title = document.getElementById('view-title');
    const subtitle = document.getElementById('view-subtitle');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const type = btn.dataset.type;

            if (type === 'activities') {
                title.innerHTML = 'Explorar Actividades';
                subtitle.innerHTML = 'Los organizadores han añadido actividades para los próximos días';
                loadActivities('activities');
            } else if (type === 'requests') {
                title.innerHTML = 'Explorar Peticiones';
                subtitle.innerHTML = 'Los participantes han añadido peticiones para llevar a cabo sus ideas';
                loadRequests('requests');
            }
        });
    });
}

/**
 * Carga las actividades desde el servidor y las renderiza en el grid.
 *
 * @param {string} [type='activities'] - Tipo de vista activa, usado para generar las tarjetas
 * @returns {Promise<void>}
 */
async function loadActivities(type = 'activities') {
    const grid = document.getElementById('gridActivities');
    if (!grid) return;

    try {
        const result = await fetch('index.php?accion=getActivities').then(r => r.json());
        if (result.success) {
            activities = result.data || [];
            renderItems(activities, activity => createActivityCard(activity, type));
        }
    } catch (error) {
        grid.innerHTML = '<p class="error">Error al cargar las actividades.</p>';
    }
}

/**
 * Carga las peticiones desde el servidor y las renderiza en el grid.
 *
 * @param {string} [type='requests'] - Tipo de vista activa, usado para generar las tarjetas
 * @returns {Promise<void>}
 */
async function loadRequests(type = 'requests') {
    const grid = document.getElementById('gridActivities');
    if (!grid) return;

    try {
        const result = await fetch('index.php?accion=getRequests').then(r => r.json());
        if (result.success) {
            requests = result.data || [];
            renderItems(requests, activity => createActivityCard(activity, type));
        } else {
            grid.innerHTML = '<p class="no-activities">No hay peticiones disponibles en este momento.</p>';
        }
    } catch (error) {
        grid.innerHTML = '<p class="error">Error al cargar las peticiones.</p>';
    }
}

/**
 * Renderiza una lista de elementos en el grid usando una función de fábrica de tarjetas.
 * Si la lista está vacía, muestra un mensaje informativo.
 *
 * @param {Object[]}                  items       - Lista de elementos a renderizar
 * @param {function(Object): Element} cardFactory - Función que recibe un elemento y devuelve su tarjeta DOM
 */
function renderItems(items, cardFactory) {
    const grid = document.getElementById('gridActivities');
    grid.innerHTML = '';

    if (!items || items.length === 0) {
        grid.innerHTML = '<p class="no-activities">No hay elementos disponibles en este momento.</p>';
        return;
    }

    items.forEach(item => grid.appendChild(cardFactory(item)));
}

/**
 * Aplica los filtros activos sobre la caché local de actividades o peticiones
 * según la pestaña seleccionada y vuelve a renderizar el grid.
 */
function applyFilters() {
    const { type, value } = getFilterValues();
    if (!type) return;

    const activeTab = document.querySelector(".tab-btn.control.active")?.dataset.type;

    if (activeTab === "activities") {
        renderItems(
            activities.filter(i => matchFilter(i, type, value)),
            activity => createActivityCard(activity, activeTab)
        );
    } else if (activeTab === "requests") {
        renderItems(
            requests.filter(i => matchFilter(i, type, value)),
            activity => createActivityCard(activity, activeTab)
        );
    }
}

/**
 * Crea la tarjeta DOM de una actividad o petición con sus acciones de moderación.
 *
 * @param {Object} activity               - Datos del elemento a representar
 * @param {number} activity.id            - ID único de la actividad o petición
 * @param {string} activity.title         - Título  
 * @param {string} activity.state         - Estado actual: 'pendiente', 'aprobada', 'rechazada' u otro
 * @param {string} [activity.category_name] - Nombre de la categoría, si existe
 * @param {string} type                   - Tipo de vista: 'activities' o 'requests'
 * @returns {HTMLElement} Tarjeta lista para insertar en el DOM
 */
function createActivityCard(activity, type) {
    const card = document.createElement("article");
    card.className = "activity activity-card";

    const stateHTML = activity.state === 'pendiente'
        ? `<button id="btn-state" class="state"><i class="fas fa-hourglass-half"></i></button>`
        : activity.state === 'rechazada'
            ? `<button id="btn-state" class="state"><i class="fas fa-times"></i></button>`
            : activity.state === 'aprobada'
                ? `<button id="btn-state" class="state"><i class="fas fa-check-double"></i></button>`
                : `<button id="btn-state" class="state"><i class="fas fa-flag-checkered"></i></button>`;

    card.innerHTML = `
        <div class="activity-image">${buildImageHTML(activity)}</div>
        <div class="activity-content">
            ${activity.category_name ? `<span class="category">${activity.category_name}</span>` : ""}
            ${stateHTML}
            <h3>${activity.title}</h3>
            <p class="description">${activity.description}</p>
            ${buildDetailsHTML(activity)}
            ${buildMetaHTML(activity)}
            ${buildFooterHTML(activity)}
            <div class="actions">
                <button class="btn-detail"  data-id="${activity.id}">Ver Detalles</button>
                <button class="btn-function ${activity.state == 'aprobada' ? 'cancel' : 'accept'}" data-id="${activity.id}">${activity.state == 'aprobada' ? 'Cancelar' : 'Aceptar'}</button>
            </div>
        </div>`;

    // 'activity' → para actividades | 'request' → para peticiones
    const typeSingular = type === 'activities' ? 'activity' : 'request';

    /**
     * Alterna el estado de la publicación entre aprobada y rechazada.
     * Muestra un diálogo de confirmación antes de enviar la petición al servidor.
     * Actualiza el icono y el botón de acción en la tarjeta sin recargar el grid.
     *
     * @returns {Promise<void>}
     */
    async function toggleActivityState() {
        let title = '';
        let message = '';
        let realizar = '';

        if (activity.state === 'aprobada') {
            title = "Cancelar publicación";
            message = "¿Deseas cancelar esta publicación?";
            realizar = 'rejectActivity';
        } else {
            title = "Aceptar publicación";
            message = "¿Deseas aceptar esta publicación?";
            realizar = 'approveActivity';
        }

        const confirmed = await showConfirm(title, message);
        if (!confirmed) return;

        try {
            const response = await fetch('index.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({ accion: realizar, id: activity.id, type: typeSingular })
            });

            const result = await response.json();

            if (result.success) {
                showAlert('Éxito', result.message, 'success');

                // Actualizar icono de estado y texto del botón de acción sin re-renderizar la tarjeta
                const stateEl = card.querySelector(".state");
                const btnFunction = card.querySelector(".btn-function");

                if (realizar === 'approveActivity') {
                    activity.state = 'aprobada';
                    btnFunction.classList = 'btn-function cancel';
                    stateEl.innerHTML = `<i class="fas fa-check-double"></i>`;
                    btnFunction.textContent = 'Cancelar';
                } else {
                    activity.state = 'rechazada';
                    btnFunction.classList = 'btn-function accept';
                    stateEl.innerHTML = `<i class="fas fa-times"></i>`;
                    btnFunction.textContent = 'Aceptar';
                }

            } else {
                throw new Error(result.message || 'Error desconocido');
            }
        } catch (error) {
            showAlert('Error', 'No se pudo procesar la acción', 'error');
        }
    }

    card.querySelector(".btn-detail")?.addEventListener("click", () => openDetailModal(activity));
    card.querySelector(".btn-function")?.addEventListener("click", toggleActivityState);
    card.querySelector("#btn-state")?.addEventListener("click", toggleActivityState);

    return card;
}
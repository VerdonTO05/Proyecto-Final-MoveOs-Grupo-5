/**
 * Panel de control de publicaciones
 * Maneja:
 * - Carga inicial del panel de control con actividades y peticiones pendientes
 * - Renderizado de estadísticas y contadores por pestaña
 * - Aprobación y rechazo de actividades y peticiones con confirmación
 * - Actualización optimista del estado local tras cada acción
 * - Animación de eliminación de tarjetas del DOM
 */

document.addEventListener("DOMContentLoaded", async () => {
    await loadControlPanel();

    const activitiesContainer = document.querySelector(".activities");
    if (!activitiesContainer) return;

    // Delegación de eventos para aprobar/rechazar desde cualquier tarjeta del grid
    activitiesContainer.addEventListener("click", async (e) => {
        const approveBtn = e.target.closest(".btn-approve");
        const rejectBtn = e.target.closest(".btn-reject");

        if (approveBtn) handleActivityAction(approveBtn, "approveActivity", "approved");
        if (rejectBtn) handleActivityAction(rejectBtn, "rejectActivity", "rejected");
    });

    initTabs();
});

/** @type {Object|null} Caché local con los datos del panel cargados desde el servidor */
let controlPanelData = null;

/**
 * Inicializa los botones de pestañas para alternar entre actividades y peticiones.
 */
function initTabs() {
    const tabButtons = document.querySelectorAll(".tab-btn.control");

    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            tabButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const isActivitiesTab = btn.textContent.trim().startsWith("Actividades");
            renderItems(isActivitiesTab ? "activities" : "requests");
        });
    });
}

/**
 * Maneja la aprobación o rechazo de una actividad o petición.
 * Muestra un diálogo de confirmación, envía la acción al servidor
 * y actualiza el DOM y la caché local si la operación tiene éxito.
 *
 * @param {HTMLElement}                       button       - Botón que disparó la acción
 * @param {'approveActivity'|'rejectActivity'} action      - Acción a ejecutar en el servidor
 * @param {'approved'|'rejected'}              resultAction - Estado resultante tras la acción
 * @returns {Promise<void>}
 */
async function handleActivityAction(button, action, resultAction) {
    const id = button.dataset.id;
    const type = button.dataset.type || "activity";
    const activityCard = button.closest(".activity-control");

    const isApprove = action === "approveActivity";

    const confirmed = await showConfirm({
        title: isApprove
            ? type === "activity" ? "¿Aprobar actividad?" : "¿Aprobar petición?"
            : type === "activity" ? "¿Rechazar actividad?" : "¿Rechazar petición?",
        message: isApprove
            ? type === "activity"
                ? "La actividad será publicada y visible para los participantes."
                : "La petición será publicada y visible para los organizadores."
            : "La publicación será rechazada. El autor podrá volver a publicarla.",
        confirmText: isApprove ? "Sí, aprobar" : "Sí, rechazar",
        cancelText: "Cancelar"
    });

    if (!confirmed) return;

    try {
        const result = await postAction(action, { id, type });

        if (result.success) {
            showAlert(isApprove ? "Aprobada" : "Rechazada", result.message, "success");

            // Animar y eliminar la tarjeta, luego sincronizar caché y estadísticas
            removeActivityCard(activityCard, () => {
                updateAfterAction(type, id, resultAction);
            });
        } else {
            showAlert("Error", result.message, "error");
        }
    } catch (error) {
        showAlert(
            "Error",
            isApprove ? "Ocurrió un error al aprobar." : "Ocurrió un error al rechazar la actividad",
            "error"
        );
    }
}

/**
 * Realiza una petición POST al backend con datos en formato JSON.
 *
 * @param {string} accion - Nombre de la acción a ejecutar en el servidor
 * @param {Object} data   - Datos adicionales a incluir en el cuerpo de la petición
 * @returns {Promise<Object>} Respuesta del servidor parseada como JSON
 */
async function postAction(accion, data) {
    const response = await fetch("index.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion, ...data })
    });

    return response.json();
}

/**
 * Aplica una animación de desvanecimiento y elimina la tarjeta del DOM.
 * Ejecuta el callback una vez completada la animación.
 *
 * @param {HTMLElement|null} card     - Tarjeta a eliminar
 * @param {Function}         callback - Función a ejecutar tras eliminar la tarjeta
 */
function removeActivityCard(card, callback) {
    if (!card) return;

    card.style.transition = "opacity 0.3s, transform 0.3s";
    card.style.opacity = "0";
    card.style.transform = "scale(0.9)";

    setTimeout(() => {
        card.remove();
        callback?.();
    }, 300);
}

/**
 * Carga los datos iniciales del panel de control desde el servidor.
 * Actualiza estadísticas, contadores de pestañas y renderiza las actividades pendientes.
 *
 * @returns {Promise<void>}
 */
async function loadControlPanel() {
    try {
        const response = await fetch("index.php?accion=getPendingActivities");

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            controlPanelData = result;
            updateStats(result.stats);
            updateTabCounts(result.activities.length, result.requests.length);
            renderItems("activities");
        } else {
            renderError(result.message || "Error al cargar actividades");
        }
    } catch {
        renderError("Error de conexión. Verifica que estés autenticado como administrador.");
    }
}

/**
 * Muestra un mensaje de error en el contenedor principal del grid.
 *
 * @param {string} message - Mensaje de error a mostrar
 */
function renderError(message) {
    const container = document.querySelector(".activities");
    if (!container) return;

    container.innerHTML = `
        <p style="text-align:center;padding:2rem;color:var(--accent-danger);">
            <i class="fas fa-exclamation-triangle"></i> ${message}
        </p>
    `;
}

/**
 * Actualiza las tarjetas de estadísticas del panel con los datos actuales.
 *
 * @param {Object} stats            - Objeto con estadísticas de actividades y peticiones
 * @param {Object} stats.activities - Contadores de actividades por estado
 * @param {Object} stats.requests   - Contadores de peticiones por estado
 */
function updateStats(stats) {
    const { activities, requests } = stats;
    const statsContainer = document.querySelector(".stats");
    if (!statsContainer) return;

    statsContainer.innerHTML = `
        <div class="card pending">
            <i class="fas fa-clock icon"></i>
            <h2>${Number(activities.pendiente) + Number(requests.pendiente)}</h2>
            <p>Pendientes</p>
            <small>Requieren revisión</small>
        </div>
        <div class="card approved">
            <i class="fas fa-check-circle icon"></i>
            <h2>${Number(activities.aprobada) + Number(requests.aprobada)}</h2>
            <p>Aprobadas</p>
            <small>Activas en la plataforma</small>
        </div>
        <div class="card rejected">
            <i class="fas fa-times-circle icon"></i>
            <h2>${Number(activities.rechazada) + Number(requests.rechazada)}</h2>
            <p>Rechazadas</p>
            <small>No cumplen requisitos</small>
        </div>
        <div class="card total">
            <i class="fas fa-circle-info icon"></i>
            <h2>${Number(activities.total) + Number(requests.total)}</h2>
            <p>Total</p>
            <small>Todas las actividades</small>
        </div>
    `;
}

/**
 * Actualiza el texto y contador numérico de cada pestaña.
 *
 * @param {number} activitiesCount - Número de actividades pendientes
 * @param {number} requestsCount   - Número de peticiones pendientes
 */
function updateTabCounts(activitiesCount, requestsCount) {
    const tabs = document.querySelectorAll(".tab-btn.control");

    if (tabs[0]) tabs[0].innerHTML = `Actividades <span>${activitiesCount}</span>`;
    if (tabs[1]) tabs[1].innerHTML = `Peticiones <span>${requestsCount}</span>`;
}

/**
 * Renderiza en el grid las actividades o peticiones pendientes según la pestaña activa.
 * Si no hay elementos, muestra un mensaje informativo.
 *
 * @param {'activities'|'requests'} type - Tipo de elementos a renderizar
 */
function renderItems(type) {
    const container = document.querySelector(".activities");
    if (!container || !controlPanelData) return;

    const items = type === "activities"
        ? controlPanelData.activities
        : controlPanelData.requests;

    const cardType = type === "activities" ? "activity" : "request";

    if (!items.length) {
        container.innerHTML = `
            <p class="no-items">
                <i class="fas fa-check-circle"></i>
                No hay ${type === "activities" ? "actividades" : "peticiones"} pendientes.
            </p>
        `;
        return;
    }

    container.innerHTML = "";
    items.forEach(item => container.appendChild(createActivityControlCard(item, cardType)));
}

/**
 * Crea la tarjeta DOM de control para una actividad o petición pendiente.
 *
 * @param {Object}          activity                        - Datos del elemento
 * @param {number|string}   activity.id                     - ID único
 * @param {string}          activity.title                  - Título            
 * @param {string}          activity.date                   - Fecha en formato ISO o similar
 * @param {string}          activity.location               - Ubicación
 * @param {string}          activity.category_name          - Nombre de la categoría
 * @param {string}          [activity.image_url]            - URL de la imagen
 * @param {string}          [activity.offertant_name]       - Nombre del organizador (actividades)
 * @param {string}          [activity.participant_name]     - Nombre del solicitante (peticiones)
 * @param {number}          [activity.max_people]           - Aforo máximo
 * @param {number}          [activity.current_registrations] - Inscritos actuales
 * @param {number}          [activity.price]                - Precio (0 = gratis)
 * @param {'activity'|'request'} [type='activity']         - Tipo de tarjeta
 * @returns {HTMLElement} Elemento `<section>` listo para insertar en el DOM
 */
function createActivityControlCard(activity, type = 'activity') {
    const section = document.createElement('section');
    section.className = 'activity-control';

    const imageUrl = activity.image_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e';
    const formattedDate = new Date(activity.date).toLocaleDateString('es-ES', {
        day: 'numeric', month: 'short', year: 'numeric'
    });

    const categoryIcons = {
        'Taller': 'fa-tools',
        'Clase': 'fa-chalkboard-teacher',
        'Evento': 'fa-calendar-star',
        'Excursión': 'fa-route',
        'Formación técnica': 'fa-laptop-code',
        'Conferencia': 'fa-users-rectangle',
        'Reunión': 'fa-handshake',
        'Experiencia': 'fa-star',
        'Tour': 'fa-map-signs',
        'Competición': 'fa-trophy',
        'Evento social': 'fa-glass-cheers'
    };

    const icon = categoryIcons[activity.category_name] || 'fa-calendar';
    const organizerName = activity.offertant_name || activity.participant_name || 'Desconocido';

    section.innerHTML = `
        <div class="activity-image-control">
            <img src="${imageUrl}" alt="Actividad"
                 onerror="this.src='https://images.unsplash.com/photo-1507525428034-b723cf961d3e'">
        </div>
        <div class="activity-info">
            <div class="tags">
                <span class="tag blue"><i class="fas ${icon}"></i> ${activity.category_name}</span>
                <span class="tag orange"><i class="fas fa-hourglass-half"></i> Pendiente</span>
            </div>
            <h3>${activity.title}</h3>
            <p class="description">${activity.description}</p>
            <p class="organizer"><i class="fas fa-user"></i> <strong>Organizador:</strong> ${organizerName}</p>
            <div class="meta">
                <span><i class="fas fa-calendar-alt"></i> ${formattedDate}</span>
                <span><i class="fas fa-map-marker-alt"></i> ${activity.location}</span>
                ${activity.max_people
                    ? `<span><i class="fas fa-users"></i> ${activity.current_registrations || 0}/${activity.max_people}</span>`
                    : ''}
                ${activity.price
                    ? `<span><i class="fas fa-euro-sign"></i> ${activity.price == 0 ? 'Gratis' : activity.price + '€'}</span>`
                    : ''}
            </div>
            <div class="actions-control">
                <button data-id="${activity.id}" data-type="${type}" class="btn approve btn-approve">
                    <i class="fas fa-check"></i> Aceptar
                </button>
                <button data-id="${activity.id}" data-type="${type}" class="btn reject btn-reject">
                    <i class="fas fa-times"></i> Rechazar
                </button>
            </div>
        </div>
    `;

    return section;
}

/**
 * Actualiza la caché local y las estadísticas del panel tras aprobar o rechazar
 * una actividad o petición, y muestra un mensaje vacío si ya no quedan elementos.
 *
 * @param {'activity'|'request'} type   - Tipo de elemento afectado
 * @param {number|string}        id     - ID del elemento procesado
 * @param {'approved'|'rejected'} action - Acción realizada
 */
function updateAfterAction(type, id, action) {
    if (type === 'activity') {
        controlPanelData.activities = controlPanelData.activities.filter(item => item.id != id);
        controlPanelData.stats.activities.pendiente--;
        if (action === 'approved') controlPanelData.stats.activities.aprobada++;
        else controlPanelData.stats.activities.rechazada++;
    } else if (type === 'request') {
        controlPanelData.requests = controlPanelData.requests.filter(item => item.id != id);
        controlPanelData.stats.requests.pendiente--;
        if (action === 'approved') controlPanelData.stats.requests.aprobada++;
        if (action === 'rejected') controlPanelData.stats.requests.rechazada++;
    }

    updateStats(controlPanelData.stats);
    updateTabCounts(
        controlPanelData.activities.length,
        controlPanelData.requests.length
    );

    // Si el grid quedó vacío, mostrar mensaje según la pestaña activa
    const container = document.querySelector('.activities');
    if (container.querySelectorAll('.activity-control').length === 0) {
        const currentTab = document.querySelector('.tab-btn.control.active');
        const isActivitiesTab = currentTab?.textContent.trim().startsWith('Actividades');
        container.innerHTML = `
            <p>
                <i class="fas fa-check-circle"></i>
                ${isActivitiesTab ? 'No hay actividades pendientes' : 'No hay peticiones pendientes'}
            </p>
        `;
    }
}
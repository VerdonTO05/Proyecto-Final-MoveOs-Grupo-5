document.addEventListener("DOMContentLoaded", async () => {
    await loadControlPanel();

    const activitiesContainer = document.querySelector(".activities");
    if (!activitiesContainer) return;

    activitiesContainer.addEventListener("click", async (e) => {
        const approveBtn = e.target.closest(".btn-approve");
        const rejectBtn = e.target.closest(".btn-reject");

        if (approveBtn) {
            handleActivityAction(approveBtn, "approveActivity", "approved");
        }

        if (rejectBtn) {
            handleActivityAction(rejectBtn, "rejectActivity", "rejected");
        }
    });

    initTabs();
});

/** @type {Object|null} */
let controlPanelData = null;

/**
 * Inicializa los botones de pestañas.
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
 * Maneja la aprobación o rechazo de una actividad/petición.
 * @param {HTMLElement} button
 * @param {"approveActivity"|"rejectActivity"} action
 * @param {"approved"|"rejected"} resultAction
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
                ? "Estás a punto de aprobar esta actividad."
                : "Estás a punto de aprobar esta petición."
            : "Esta acción no se puede deshacer."
    });

    if (!confirmed) return;

    try {
        const result = await postAction(action, { id, type });

        if (result.success) {
            showAlert(
                isApprove ? "Aprobada" : "Rechazada",
                result.message,
                "success"
            );

            removeActivityCard(activityCard, () => {
                updateAfterAction(type, id, resultAction);
            });
        } else {
            showAlert("Error", result.message, "error");
        }
    } catch (error) {
        showAlert(
            "Error",
            isApprove
                ? "Ocurrió un error al aprobar."
                : "Ocurrió un error al rechazar la actividad",
            "error"
        );
    }
}

/**
 * Realiza una petición POST al backend.
 * @param {string} accion
 * @param {Object} data
 * @returns {Promise<Object>}
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
 * Aplica animación y elimina la tarjeta del DOM.
 * @param {HTMLElement|null} card
 * @param {Function} callback
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
 * Carga los datos iniciales del panel de control.
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
        renderError(
            "Error de conexión. Verifica que estés autenticado como administrador."
        );
    }
}

/**
 * Muestra mensaje de error en el contenedor principal.
 * @param {string} message
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
 * Actualiza las estadísticas del panel.
 * @param {Object} stats
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
 * Actualiza los contadores de las pestañas.
 * @param {number} activitiesCount
 * @param {number} requestsCount
 */
function updateTabCounts(activitiesCount, requestsCount) {
    const tabs = document.querySelectorAll(".tab-btn.control");

    if (tabs[0]) tabs[0].innerHTML = `Actividades <span>${activitiesCount}</span>`;
    if (tabs[1]) tabs[1].innerHTML = `Peticiones <span>${requestsCount}</span>`;
}

/**
 * Renderiza actividades o peticiones en pantalla.
 * @param {"activities"|"requests"} type
 */
function renderItems(type) {
    const container = document.querySelector(".activities");

    if (!container || !controlPanelData) return;

    const items =
        type === "activities"
            ? controlPanelData.activities
            : controlPanelData.requests;

    const cardType = type === "activities" ? "activity" : "request";

    if (!items.length) {
        container.innerHTML = `<p class="no-items"><i class="fas fa-check-circle"></i> No hay ${type === "activities" ? "actividades" : "peticiones"
            } pendientes.</p>`;
        return;
    }

    container.innerHTML = "";

    items.forEach(item =>
        container.appendChild(createActivityControlCard(item, cardType))
    );
}

/**
 * Crea una tarjeta HTML para una actividad o petición pendiente.
 *
 * @param {Object} activity - Datos de la actividad o petición.
 * @param {number|string} activity.id - Identificador único.
 * @param {string} activity.title - Título de la actividad.
 * @param {string} activity.description - Descripción de la actividad.
 * @param {string} activity.date - Fecha de la actividad en formato ISO o similar.
 * @param {string} activity.location - Ubicación donde se realiza.
 * @param {string} [activity.image_url] - URL de la imagen de la actividad.
 * @param {string} activity.category_name - Nombre de la categoría.
 * @param {string} [activity.offertant_name] - Nombre del organizador (si es actividad).
 * @param {string} [activity.participant_name] - Nombre del solicitante (si es petición).
 * @param {number} [activity.max_people] - Máximo número de participantes.
 * @param {number} [activity.current_registrations] - Participantes actuales.
 * @param {number} [activity.price] - Precio de la actividad.
 * @param {'activity'|'request'} [type='activity'] - Tipo de tarjeta que se está renderizando.
 *
 * @returns {HTMLElement} Elemento `<section>` que representa la tarjeta de control.
 */
function createActivityControlCard(activity, type = 'activity') {
    const section = document.createElement('section');
    section.className = 'activity-control';

    const imageUrl = activity.image_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e';
    const date = new Date(activity.date);
    const formattedDate = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

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
        <div class="activity-image">
            <img src="${imageUrl}" alt="Actividad" onerror="this.src='https://images.unsplash.com/photo-1507525428034-b723cf961d3e'">
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
                ${activity.max_people ? `<span><i class="fas fa-users"></i> ${activity.current_registrations || 0}/${activity.max_people}</span>` : ''}
                ${activity.price ? `<span><i class="fas fa-euro-sign"></i> ${activity.price == 0? 'Gratis' : activity.price + '€'}</span>` : ''}
            </div>
            <div class="actions-control">
                <button data-id="${activity.id}" data-type="${type}" class="btn approve btn-approve">
                    <i class="fas fa-check"></i> Aprobar
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
 * Actualiza los datos del panel de control tras aprobar o rechazar
 * una actividad o petición y refresca estadísticas y contadores.
 *
 * @param {'activity'|'request'} type - Tipo de elemento afectado.
 * @param {number|string} id - ID del elemento que se ha procesado.
 * @param {'approved'|'rejected'} action - Acción realizada.
 *
 * @returns {void}
 */
function updateAfterAction(type, id, action) {
    if (type === 'activity') {
        controlPanelData.activities = controlPanelData.activities.filter(item => item.id != id);
        controlPanelData.stats.activities.pendiente--;
        if (action == 'approved') {
            controlPanelData.stats.activities.aprobada++;
        } else {
            controlPanelData.stats.activities.rechazada++;
        }
    } else if (type === 'request') {
        controlPanelData.requests = controlPanelData.requests.filter(item => item.id != id);
        controlPanelData.stats.requests.pendiente--;

        if (action === 'approved') {
            controlPanelData.stats.requests.aprobada++;
        }

        if (action === 'rejected') {
            controlPanelData.stats.requests.rechazada++;
        }
    }
    updateStats(controlPanelData.stats);
    updateTabCounts(
        controlPanelData.activities.length,
        controlPanelData.requests.length
    );

    const container = document.querySelector('.activities');
    if (container.querySelectorAll('.activity-control').length === 0) {
        const currentTab = document.querySelector('.tab-btn.control.active');
        const isActivitiesTab = currentTab && currentTab.textContent.trim().startsWith('Actividades');
        container.innerHTML = `<p>
            <i class="fas fa-check-circle"></i> ${isActivitiesTab ? 'No hay actividades pendientes' : 'No hay peticiones pendientes'}
        </p>`;
    }
}

/**
 * Muestra un modal de confirmación personalizado.
 *
 * Devuelve una promesa que se resuelve en:
 * - `true` si el usuario confirma.
 * - `false` si cancela.
 *
 * @param {Object} options
 * @param {string} options.title - Título del modal.
 * @param {string} options.message - Mensaje descriptivo.
 *
 * @returns {Promise<boolean>} Resultado de la confirmación del usuario.
 */
function showConfirm({ title, message }) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.id = 'modal-container';
        overlay.classList.add('active');

        const modal = document.createElement('div');
        modal.classList.add('modal');
        modal.innerHTML = `
            <div class="modal-header">${title}</div>
            <div class="modal-body">${message}</div>
            <div class="modal-actions">
                <button class="confirm">Aceptar</button>
                <button class="cancel">Cancelar</button>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        const closeModal = () => {
            modal.style.animation = 'fadeOut 0.25s forwards';
            overlay.classList.remove('active');
            setTimeout(() => document.body.removeChild(overlay), 250);
        };

        modal.querySelector('.confirm').addEventListener('click', () => { resolve(true); closeModal(); });
        modal.querySelector('.cancel').addEventListener('click', () => { resolve(false); closeModal(); });
    });
}

/**
 * Muestra una alerta visual temporal en pantalla.
 *
 * @param {string} title - Título de la alerta.
 * @param {string} message - Mensaje descriptivo.
 * @param {'info'|'success'|'error'|'warning'} [type='info'] - Tipo de alerta.
 * @param {number} [duration=3000] - Tiempo en milisegundos antes de cerrarse automáticamente.
 *
 * @returns {void}
 */
function showAlert(title, message, type = 'info', duration = 2000) {
    const overlay = document.createElement('div');
    overlay.classList.add('alert-overlay', type);

    const alertBox = document.createElement('div');
    alertBox.classList.add('alert-box');
    alertBox.innerHTML = `
        <div class="alert-header">${title}</div>
        <div class="alert-body">${message}</div>
    `;

    overlay.appendChild(alertBox);
    document.body.appendChild(overlay);

    const closeAlert = () => {
        alertBox.style.animation = 'fadeOut 0.3s forwards';
        overlay.classList.remove('active');
        setTimeout(() => document.body.removeChild(overlay), 300);
    };
    setTimeout(closeAlert, duration);
    requestAnimationFrame(() => {
        overlay.classList.add('active');
        alertBox.style.animation = 'fadeIn 0.3s forwards';
    });
}
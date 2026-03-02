document.addEventListener("DOMContentLoaded", () => {
    // Cargar datos del panel de control
    loadControlPanel();

    const activitiesContainer = document.querySelector(".activities");
    if (!activitiesContainer) return;

    activitiesContainer.addEventListener("click", async (e) => {
        const approveBtn = e.target.closest(".btn-approve");
        const rejectBtn = e.target.closest(".btn-reject");

        let id, type, activityCard, confirmed;

        // Botón aprobar
        if (approveBtn) {
            id = approveBtn.dataset.id;
            type = approveBtn.dataset.type || 'activity';
            activityCard = approveBtn.closest('.activity-control');

            confirmed = await showConfirm({
                title: type === 'activity' ? '¿Aprobar actividad?' : '¿Aprobar petición?',
                message: type === 'activity' ? 'Estás a punto de aprobar esta actividad.' : 'Estás a punto de aprobar esta petición.'
            });

            if (!confirmed) return;

            try {
                const response = await fetch('index.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ accion: 'approveActivity', id, type })
                });
                const result = await response.json();

                if (result.success) {
                    showAlert('Aprobada', result.message, 'success');

                    if (activityCard) {
                        activityCard.style.transition = 'opacity 0.3s, transform 0.3s';
                        activityCard.style.opacity = '0';
                        activityCard.style.transform = 'scale(0.9)';

                        setTimeout(() => {
                            activityCard.remove();
                            updateAfterAction(type, id);
                        }, 300);
                    }
                } else {
                    showAlert('Error', result.message, 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showAlert('Error', 'Ocurrió un error al aprobar.', 'error');
            }
        }

        // Botón rechazar
        if (rejectBtn) {
            id = rejectBtn.dataset.id;
            type = rejectBtn.dataset.type || 'activity';
            activityCard = rejectBtn.closest('.activity-control');

            confirmed = await showConfirm({
                title: type === 'activity' ? '¿Rechazar actividad?' : '¿Rechazar petición?',
                message: 'Esta acción no se puede deshacer.'
            });

            if (!confirmed) return;

            try {
                const response = await fetch('index.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ accion: 'rejectActivity', id, type })
                });
                const result = await response.json();

                if (result.success) {
                    showAlert('Rechazada', result.message, 'success');

                    if (activityCard) {
                        activityCard.style.transition = 'opacity 0.3s, transform 0.3s';
                        activityCard.style.opacity = '0';
                        activityCard.style.transform = 'scale(0.9)';

                        setTimeout(() => {
                            activityCard.remove();
                            updateAfterAction(type, id);
                        }, 300);
                    }
                } else {
                    showAlert('Error', result.message, 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showAlert('Error', 'Ocurrió un error al rechazar la actividad', 'error');
            }
        }
    });

    // Cambiar de actividades a peticiones
    const tabButtons = document.querySelectorAll(".tab-btn.control");
    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            tabButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const isActivitiesTab = btn.textContent.trim().startsWith('Actividades');
            renderItems(isActivitiesTab ? 'activities' : 'requests');
        });
    });
});

// Variable global para almacenar los datos
let controlPanelData = null;

// Cargar datos del panel de control
async function loadControlPanel() {
    try {
        const response = await fetch('index.php?accion=getPendingActivities');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();

        if (result.success) {
            controlPanelData = result;
            updateStats(result.stats);
            updateTabCounts(result.activities.length, result.requests.length);
            renderItems('activities');
        } else {
            const container = document.querySelector('.activities');
            if (container) {
                container.innerHTML = `<p style="text-align: center; padding: 2rem; color: var(--accent-danger);">
                    <i class="fas fa-exclamation-triangle"></i> ${result.message || 'Error al cargar actividades'}
                </p>`;
            }
        }
    } catch (error) {
        const container = document.querySelector('.activities');
        if (container) {
            container.innerHTML = `<p style="text-align: center; padding: 2rem; color: var(--accent-danger);">
                <i class="fas fa-exclamation-triangle"></i> Error de conexión. Verifica que estés autenticado como administrador.
            </p>`;
        }
    }
}

// Actualizar estadísticas
function updateStats(stats) {
    const { activities, requests } = stats;
    const statsContainer = document.querySelector('.stats');
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

// Actualizar contadores en las pestañas
function updateTabCounts(activitiesCount, requestsCount) {
    const tabs = document.querySelectorAll('.tab-btn.control');
    if (tabs[0]) tabs[0].innerHTML = `Actividades <span>${activitiesCount}</span>`;
    if (tabs[1]) tabs[1].innerHTML = `Peticiones <span>${requestsCount}</span>`;
}

// Renderizar items
function renderItems(type) {
    const container = document.querySelector('.activities');
    if (!container || !controlPanelData) return;

    const items = type === 'activities' ? controlPanelData.activities : controlPanelData.requests;
    const cardType = type === 'activities' ? 'activity' : 'request';

    if (items.length === 0) {
        container.innerHTML = `<p class="no-items">No hay ${type === 'activities' ? 'actividades' : 'peticiones'} pendientes.</p>`;
        return;
    }

    container.innerHTML = '';
    items.forEach(item => container.appendChild(createActivityControlCard(item, cardType)));
}

// Crear tarjeta de actividad
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
        <img src="${imageUrl}" alt="Actividad" onerror="this.src='https://images.unsplash.com/photo-1507525428034-b723cf961d3e'">
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
                ${activity.price ? `<span><i class="fas fa-euro-sign"></i> ${activity.price}€</span>` : ''}
            </div>
            <div class="actions">
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

// Actualizar después de aprobar/rechazar
function updateAfterAction(type, id) {
    if (type === 'activity') {
        controlPanelData.activities = controlPanelData.activities.filter(item => item.id != id);
    } else if (type === 'request') {
        controlPanelData.requests = controlPanelData.requests.filter(item => item.id != id);
    }

    updateTabCounts(
        controlPanelData.activities.length,
        controlPanelData.requests.length
    );

    const container = document.querySelector('.activities');
    if (container.querySelectorAll('.activity-control').length === 0) {
        const currentTab = document.querySelector('.tab-btn.control.active');
        const isActivitiesTab = currentTab && currentTab.textContent.trim().startsWith('Actividades');
        container.innerHTML = `<p style="text-align:center; padding:2rem; color:var(--text-secondary);">
            <i class="fas fa-check-circle"></i> ${isActivitiesTab ? 'No hay actividades pendientes' : 'No hay peticiones pendientes'}
        </p>`;
    }
}

// Función para mostrar confirmación
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

// Función para mostrar alert
function showAlert(title, message, type = 'info', duration = 3000) {
    const overlay = document.createElement('div');
    overlay.classList.add('alert-overlay', type);

    const alertBox = document.createElement('div');
    alertBox.classList.add('alert-box');
    alertBox.innerHTML = `
        <div class="alert-header">${title}</div>
        <div class="alert-body">${message}</div>
        <button class="alert-close">&times;</button>
    `;

    overlay.appendChild(alertBox);
    document.body.appendChild(overlay);

    const closeAlert = () => {
        alertBox.style.animation = 'fadeOut 0.3s forwards';
        overlay.classList.remove('active');
        setTimeout(() => document.body.removeChild(overlay), 300);
    };

    alertBox.querySelector('.alert-close').addEventListener('click', closeAlert);
    setTimeout(closeAlert, duration);

    requestAnimationFrame(() => {
        overlay.classList.add('active');
        alertBox.style.animation = 'fadeIn 0.3s forwards';
    });
}
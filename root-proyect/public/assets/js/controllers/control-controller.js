document.addEventListener("DOMContentLoaded", () => {
    // Cargar datos del panel de control
    loadControlPanel();

    const activitiesContainer = document.querySelector(".activities");
    if (!activitiesContainer) return;

    activitiesContainer.addEventListener("click", async (e) => {
        const approveBtn = e.target.closest(".btn-approve");
        const rejectBtn = e.target.closest(".btn-reject");

        // Botón aprobar
        if (approveBtn) {
            const id = approveBtn.dataset.id;
            const type = approveBtn.dataset.type || 'activity';
            const activityCard = approveBtn.closest('.activity-control');

            showConfirm({
                title: '¿Aprobar actividad?',
                message: 'Estás a punto de aprobar esta actividad.',
                onConfirm: async () => {
                    try {
                        const response = await fetch('index.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ accion: 'approveActivity', id: id })
                        });

                        const result = await response.json();

                        if (result.success) {
                            showAlert({
                                title: 'Aprobada',
                                message: 'La actividad se aprobó correctamente'
                            });

                            // Eliminar la tarjeta con animación
                            if (activityCard) {
                                activityCard.style.transition = 'opacity 0.3s, transform 0.3s';
                                activityCard.style.opacity = '0';
                                activityCard.style.transform = 'scale(0.9)';

                                setTimeout(() => {
                                    activityCard.remove();
                                    updateAfterAction(type);
                                }, 300);
                            }
                        } else {
                            showAlert({
                                title: 'Error',
                                message: 'No se pudo aprobar la actividad'
                            });
                        }
                    } catch (error) {
                        console.error('Error:', error);
                        showAlert({
                            title: 'Error',
                            message: 'Ocurrió un error al aprobar la actividad'
                        });
                    }
                }
            });
        }

        // Botón rechazar
        if (rejectBtn) {
            const id = rejectBtn.dataset.id;
            const type = rejectBtn.dataset.type || 'activity';
            const activityCard = rejectBtn.closest('.activity-control');

            showConfirm({
                title: '¿Rechazar actividad?',
                message: 'Esta acción no se puede deshacer.',
                onConfirm: async () => {
                    try {
                        const response = await fetch('index.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ accion: 'rejectActivity', id: id })
                        });

                        const result = await response.json();

                        if (result.success) {
                            showAlert({
                                title: 'Rechazada',
                                message: 'La actividad fue rechazada'
                            });

                            // Eliminar la tarjeta con animación
                            if (activityCard) {
                                activityCard.style.transition = 'opacity 0.3s, transform 0.3s';
                                activityCard.style.opacity = '0';
                                activityCard.style.transform = 'scale(0.9)';

                                setTimeout(() => {
                                    activityCard.remove();
                                    updateAfterAction(type);
                                }, 300);
                            }
                        } else {
                            showAlert({
                                title: 'Error',
                                message: 'No se pudo rechazar la actividad'
                            });
                        }
                    } catch (error) {
                        console.error('Error:', error);
                        showAlert({
                            title: 'Error',
                            message: 'Ocurrió un error al rechazar la actividad'
                        });
                    }
                }
            });
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

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            controlPanelData = result;
            updateStats(result.stats);
            updateTabCounts(result.activities.length, result.requests.length);
            renderItems('activities');
        } else {
            const activitiesContainer = document.querySelector('.activities');
            if (activitiesContainer) {
                activitiesContainer.innerHTML = `
                    <p style="text-align: center; padding: 2rem; color: var(--accent-danger);">
                        <i class="fas fa-exclamation-triangle"></i> ${result.message || 'Error al cargar actividades'}
                    </p>
                `;
            }
        }
    } catch (error) {
        const activitiesContainer = document.querySelector('.activities');
        if (activitiesContainer) {
            activitiesContainer.innerHTML = `
                <p style="text-align: center; padding: 2rem; color: var(--accent-danger);">
                    <i class="fas fa-exclamation-triangle"></i> Error de conexión. Verifica que estés autenticado como administrador.
                </p>
            `;
        }
    }
}

// Actualizar estadísticas
function updateStats(stats) {
    const activities = stats.activities;
    const requests = stats.requests;

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
            <h2>${Number(activities.rechazada) + Number(requests.rechazada) }</h2>
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

// Renderizar items (actividades o peticiones)
function renderItems(type) {
    const container = document.querySelector('.activities');
    if (!container || !controlPanelData) return;

    const items = type === 'activities' ? controlPanelData.activities : controlPanelData.requests;

    if (items.length === 0) {
        container.innerHTML = `<p class="no-items">No hay ${type === 'activities' ? 'actividades' : 'peticiones'} pendientes.</p>`;
        return;
    }

    container.innerHTML = '';
    items.forEach(item => {
        container.appendChild(createActivityControlCard(item, type));
    });
}

// Crear tarjeta de actividad para panel de control
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
                <span class="tag blue">
                    <i class="fas ${icon}"></i> ${activity.category_name}
                </span>
                <span class="tag orange">
                    <i class="fas fa-hourglass-half"></i> Pendiente
                </span>
            </div>

            <h3>${activity.title}</h3>
            <p class="description">${activity.description}</p>

            <p class="organizer">
                <i class="fas fa-user"></i>
                <strong>Organizador:</strong> ${organizerName}
            </p>

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

// Actualizar contadores y UI después de aprobar/rechazar
function updateAfterAction(type) {
    const activitiesContainer = document.querySelector('.activities');

    if (!controlPanelData) return;

    // Contar las actividades y peticiones que quedan en el DOM
    const remainingActivities = activitiesContainer.querySelectorAll('.activity-control').length;

    // Si es el tipo actual (activities o requests), actualizar el contador
    const currentTab = document.querySelector('.tab-btn.control.active');
    const isActivitiesTab = currentTab && currentTab.textContent.trim().startsWith('Actividades');

    // Actualizar los datos en memoria (decrementar contadores)
    if (type === 'activity' && controlPanelData.activities) {
        controlPanelData.activities = controlPanelData.activities.filter((_, index) =>
            activitiesContainer.querySelectorAll('.activity-control')[index]
        );
    } else if (type === 'request' && controlPanelData.requests) {
        controlPanelData.requests = controlPanelData.requests.filter((_, index) =>
            activitiesContainer.querySelectorAll('.activity-control')[index]
        );
    }

    // Actualizar los contadores en las tabs
    const activityCount = controlPanelData.activities ? controlPanelData.activities.length : 0;
    const requestCount = controlPanelData.requests ? controlPanelData.requests.length : 0;
    updateTabCounts(activityCount, requestCount);

    // Si no quedan actividades en el contenedor, mostrar mensaje
    if (remainingActivities === 0) {
        const emptyMessage = isActivitiesTab
            ? 'No hay actividades pendientes'
            : 'No hay peticiones pendientes';

        activitiesContainer.innerHTML = `
            <p style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                <i class="fas fa-check-circle"></i> ${emptyMessage}
            </p>
        `;
    }
}

// Función para mostrar confirmación
function showConfirm({ title, message, onConfirm, onCancel }) {
    const overlay = document.createElement('div');
    overlay.classList.add('custom-confirm-overlay');

    const modal = document.createElement('div');
    modal.classList.add('custom-confirm-modal');

    modal.innerHTML = `
        <h2 class="custom-confirm-title">${title}</h2>
        <p class="custom-confirm-message">${message}</p>
        <div class="custom-confirm-buttons">
            <button class="custom-confirm-btn confirm">Aceptar</button>
            <button class="custom-confirm-btn cancel">Cancelar</button>
        </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    modal.querySelector('.confirm').addEventListener('click', () => {
        if (onConfirm) onConfirm();
        document.body.removeChild(overlay);
    });

    modal.querySelector('.cancel').addEventListener('click', () => {
        if (onCancel) onCancel?.();
        document.body.removeChild(overlay);
    });
}

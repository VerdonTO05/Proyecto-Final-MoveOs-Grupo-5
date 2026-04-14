let activities = [];
let requests = [];

document.addEventListener("DOMContentLoaded", () => {
    initTabSwitch();
    loadActivities();
    bindFilterListeners(applyFilters);
});

// ----------------------------
// Tabs
// ----------------------------
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

// ----------------------------
// Carga de datos
// ----------------------------
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

// ----------------------------
// Render genérico
// ----------------------------
function renderItems(items, cardFactory) {
    const grid = document.getElementById('gridActivities');
    grid.innerHTML = '';

    if (!items || items.length === 0) {
        grid.innerHTML = '<p class="no-activities">No hay elementos disponibles en este momento.</p>';
        return;
    }

    items.forEach(item => grid.appendChild(cardFactory(item)));
}

// ----------------------------
// Filtros
// ----------------------------
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

// ----------------------------
// Card
// ----------------------------
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

    const typeSingular = type === 'activities' ? 'activity' : 'request';

    // --- Función reutilizable para aprobar/cancelar ---
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

                // --- Actualizar icono y botón ---
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
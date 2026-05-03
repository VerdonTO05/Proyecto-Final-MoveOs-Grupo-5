// ============================================================
// my-activities-controller.js
// ============================================================

let activitiesActive = [];
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

    setInterval(() => {
        loadActivities(CURRENT_USER.role);
    }, 5000);
});

// ----------------------------
// Carga de datos
// ----------------------------
async function loadActivities(role) {
    const grid = document.getElementById('gridActivities');
    if (!grid) return;

    try {
        const result = await fetch('index.php?accion=getMyActivities')
            .then(r => r.json());

        if (!result.success) return;

        const newActive = result.data.active || [];
        const newFinished = result.data.finished || [];

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

// ----------------------------
// Render
// ----------------------------
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

// ----------------------------
// Filtros
// ----------------------------
function applyFilters() {
    const { type, value } = getFilterValues();
    if (!type) return;
    render(
        activitiesActive.filter(a => matchFilter(a, type, value)),
        activitiesFinished.filter(a => matchFilter(a, type, value))
    );
}

// ----------------------------
// Card activa (con acciones editar/eliminar)
// ----------------------------
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
                <button class="btn-edit" data-id="${pub.id}">Editar</button>
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
        const confirmedDelete = await showConfirmTwo({
            title: '¿Eliminar publicación?',
            message: 'Esta acción es permanente y no se puede deshacer.',
            confirmText: 'Sí, eliminar',
            cancelText: 'Cancelar'
        });
        if (!confirmedDelete) return;

        const sendEmails = await showConfirmTwo({
            title: '¿Notificar a los participantes?',
            message: 'Se enviará un email a todos los inscritos informando de la cancelación.',
            confirmText: 'Sí, enviar emails',
            cancelText: 'No, eliminar sin notificar'
        });

        // Mostrar spinner
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
                    sendEmails: sendEmails  // true o false
                })
            });
            const result = await response.json();

            if (result.success) {
                showAlert('Eliminada', result.message, 'success');
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
                // Restaurar botones si falla
                actionsDiv.innerHTML = `
                <button class="btn-detail" data-id="${pub.id}">Ver detalles</button>
                <button class="btn-edit" data-id="${pub.id}">Editar</button>
                <button class="btn-delete" data-id="${pub.id}">Eliminar</button>`;
            }

        } catch (error) {
            showAlert('Error', 'Error de conexión con el servidor', 'error');
        }
    });

    return card;
}

// ----------------------------
// Card terminada (solo visualización)
// ----------------------------
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
                <button class="btn-republish" data-id="${pub.id}">
                    Volver a publicar
                </button>
            </div>
        </div>`;

    card.querySelector(".btn-republish")?.addEventListener("click", async function () {

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
                id: id,
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
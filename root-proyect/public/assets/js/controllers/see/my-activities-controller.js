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
});

// ----------------------------
// Carga de datos
// ----------------------------
async function loadActivities(role) {
    const grid = document.getElementById('gridActivities');
    if (!grid) return;

    try {
        const result = await fetch('index.php?accion=getMyActivities').then(r => r.json());
        if (result.success) {
            activitiesActive = result.data.active || [];
            activitiesFinished = result.data.finished || [];
            render(activitiesActive, activitiesFinished,role);
        }
    } catch (error) {
        console.error('Error al cargar publicaciones:', error);
        grid.innerHTML = '<p class="error">Error al cargar tus actividades.</p>';
    }
}

// ----------------------------
// Render
// ----------------------------
function render(active, finished,role) {
    const grid = document.getElementById('gridActivities');
    const gridF = document.getElementById('gridActivitiesFinished');

    grid.innerHTML = active.length === 0
        ? `<p class="no-activities">Todavía no tienes ninguna actividad.</p>
           <p><a href="index.php?accion=createActivity">Crea una ahora</a></p>`
        : '';
    active.forEach(a => grid.appendChild(createActiveCard(a,role)));

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
function createActiveCard(pub,role) {
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
        const confirmed = await showConfirm('¿Estás seguro que quieres eliminar esta publicación?');
        if (!confirmed) return;

        try {
            const response = await fetch('index.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    accion: 'deleteActivity',
                    id: this.dataset.id
                })
            });
            const result = await response.json();

            if (result.success) {
                showAlert('Eliminada', result.message, 'success');

                // Animación y eliminación de la card
                card.style.transition = 'opacity 0.3s, transform 0.3s';
                card.style.opacity = '0';
                card.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    card.remove();

                    // Si no quedan más cards, mostrar párrafo
                    if (grid && grid.children.length === 0) {
                        grid.innerHTML = `
                            <p class="no-activities">
                                Todavía no tienes ninguna actividad.
                            </p>
                            <p><a href="index.php?accion=createActivity">Crea una ahora</a></p>`;
                    }
                }, 300);

            } else {
                throw new Error(result.message || 'Error desconocido');
            }

        } catch (error) {
            console.error(error);
            showAlert('Error', 'No se pudo eliminar la publicación', 'error');
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
        </div>`;

    return card;
}
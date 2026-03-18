// ============================================================
// my-activities-controller.js
// ============================================================

let activitiesActive   = [];
let activitiesFinished = [];

document.addEventListener("DOMContentLoaded", () => {
    loadActivities();

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
async function loadActivities() {
    const grid = document.getElementById('gridActivities');
    if (!grid) return;

    try {
        const result = await fetch('index.php?accion=getMyActivities').then(r => r.json());
        if (result.success) {
            activitiesActive   = result.data.active   || [];
            activitiesFinished = result.data.finished || [];
            render(activitiesActive, activitiesFinished);
        }
    } catch (error) {
        console.error('Error al cargar publicaciones:', error);
        grid.innerHTML = '<p class="error">Error al cargar tus actividades.</p>';
    }
}

// ----------------------------
// Render
// ----------------------------
function render(active, finished) {
    const grid  = document.getElementById('gridActivities');
    const gridF = document.getElementById('gridActivitiesFinished');

    grid.innerHTML = active.length === 0
        ? `<p class="no-activities">Todavía no tienes ninguna actividad.</p>
           <p><a href="index.php?accion=createActivity">Crea una ahora</a></p>`
        : '';
    active.forEach(a => grid.appendChild(createActiveCard(a)));

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
        activitiesActive.filter(a   => matchFilter(a, type, value)),
        activitiesFinished.filter(a => matchFilter(a, type, value))
    );
}

// ----------------------------
// Card activa (con acciones editar/eliminar)
// ----------------------------
function createActiveCard(pub) {
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
                <button class="btn-detail" data-id="${pub.id}">Editar</button>
                <button class="btn-signup" data-id="${pub.id}">Eliminar</button>
                ${pub.state === 'aprobada' ? `
                <a
                    href="index.php?accion=chatActivity&activity_id=${pub.id}"
                    class="btn-chat"
                    aria-label="Abrir chat de la actividad ${pub.title}"
                >
                    <i class="fas fa-comments"></i> Chat
                </a>` : ''}
            </div>
        </div>`;

    card.querySelector(".btn-detail")?.addEventListener("click", function () {
        submitForm("editActivity", this.dataset.id);
    });

    card.querySelector(".btn-signup")?.addEventListener("click", function () {
        if (!confirm("¿Estás seguro de que quieres eliminar esta publicación?")) return;
        submitForm("deleteActivity", this.dataset.id);
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
// ============================================================
// my-registrations-controller.js
// ============================================================

let registrationsActive = [];
let registrationsFinished = [];

document.addEventListener("DOMContentLoaded", () => {
    const role = CURRENT_USER.role;
    const isOrg = role === 'organizador';

    bindFilterListeners(() => applyFilters(role));

    loadRegistrations(role);

    bindToggleSection(
        "toggleFinished",
        "gridRegistrationsFinished",
        isOrg ? "Ocultar peticiones terminadas" : "Ocultar inscripciones terminadas",
        isOrg ? "Ver peticiones terminadas" : "Ver inscripciones terminadas"
    );
});

// ----------------------------
// Carga de datos
// ----------------------------
async function loadRegistrations(role) {
    const grid = document.getElementById('gridRegistrations');
    if (!grid) return;

    try {
        const result = await fetch('index.php?accion=inscripciones').then(r => r.json());
        if (result.success) {
            registrationsActive = result.data.active || [];
            registrationsFinished = result.data.finished || [];
            render(registrationsActive, registrationsFinished, role);
        }
    } catch (error) {
        console.error('Error al cargar inscripciones:', error);
        grid.innerHTML = '<p class="error">Error al cargar inscripciones.</p>';
    }
}

// ----------------------------
// Render
// ----------------------------
function render(active, finished, role) {
    const grid = document.getElementById('gridRegistrations');
    const gridF = document.getElementById('gridRegistrationsFinished');

    grid.innerHTML = active.length === 0
        ? `<p class="no-activities">Todavía no tienes ninguna inscripción.</p>
           <p><a href="index.php?accion=seeActivities">Busca una nueva aventura</a></p>`
        : '';
    active.forEach(a => grid.appendChild(createActiveCard(a, role)));

    gridF.innerHTML = finished.length === 0
        ? '<p class="no-activities">Todavía no tienes inscripciones terminadas.</p>'
        : '';
    finished.forEach(a => gridF.appendChild(createFinishedCard(a)));
}

// ----------------------------
// Filtros
// ----------------------------
function applyFilters(role) {
    const { type, value } = getFilterValues();
    if (!type) return;
    render(
        registrationsActive.filter(a => matchFilter(a, type, value)),
        registrationsFinished.filter(a => matchFilter(a, type, value)), role
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
            <h3>${pub.title}</h3>
            <p class="description">${pub.description}</p>
            ${buildDetailsHTML(pub)}
            ${buildMetaHTML(pub)}
            ${buildFooterHTML(pub)}
            <div class="actions">
                <button class="btn-detail" data-id="${pub.id}">Ver detalles</button>
                <button class="btn-signup" data-id="${pub.id}">Cancelar</button>
            </div>
        </div>`;

    const grid = document.getElementById('gridRegistrations');

    card.querySelector(".btn-detail")?.addEventListener("click", function () {
        openDetailModal(pub, role);
    });

    card.querySelector(".btn-signup")?.addEventListener("click", async function () {
        const confirmed = await showConfirm('¿Estás seguro que quieres cancelar esta actividad?');
        if (!confirmed) return;

        try {
            const response = await fetch('index.php', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest' 
                },
                body: JSON.stringify({
                    accion: 'cancelRegistration',
                    id: this.dataset.id
                })
            });

            const result = await response.json();

            if (result.success) {
                showAlert('Cancelada', result.message, 'success');

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
                                Todavía no tienes ninguna inscripción.
                            </p>
                            <p><a href="index.php?accion=seeActivities">Busca una nueva aventura</a></p>`;
                    }
                }, 300);

            } else {
                throw new Error(result.message || 'Error desconocido');
            }

        } catch (error) {
            console.error(error);
            showAlert('Error', 'No se pudo cancelar la actividad', 'error');
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
            ${buildDetailsHTML(pub)}
            ${buildMetaHTML(pub)}
            ${buildFooterHTML(pub)}
        </div>`;

    return card;
}
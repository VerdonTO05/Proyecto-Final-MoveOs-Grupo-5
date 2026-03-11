let activitiesActive = [];
let activitiesFinished = [];

document.addEventListener("DOMContentLoaded", () => {

    loadActivities();

    const toggleBtn = document.getElementById("toggleFinished");
    const finishedSection = document.getElementById("gridActivitiesFinished");

    toggleBtn?.addEventListener("click", () => {
        const isVisible = finishedSection.classList.toggle("visible");

        toggleBtn.textContent = isVisible
            ? "Ocultar actividades terminadas"
            : "Ver actividades terminadas";
    });


    const filterInput = document.getElementById("filterInput");

    if (filterInput) {
        filterInput.addEventListener("input", applyFilters);
        filterInput.addEventListener("change", applyFilters);
    }

});

async function loadActivities() {

    const gridContainer = document.getElementById('gridActivities');
    const gridContainerFinished = document.getElementById('gridActivitiesFinished');

    if (!gridContainer || !gridContainerFinished) return;

    try {

        const response = await fetch('index.php?accion=getMyActivities');
        const result = await response.json();

        if (result.success) {

            activitiesActive = result.data.active || [];
            activitiesFinished = result.data.finished || [];

            renderActivities(activitiesActive, activitiesFinished);

        }

    } catch (error) {

        console.error('Error al cargar publicaciones:', error);
        gridContainer.innerHTML = '<p class="error">Error al cargar tus actividades.</p>';

    }

}

function renderActivities(active, finished) {

    const gridContainer = document.getElementById('gridActivities');
    const gridContainerFinished = document.getElementById('gridActivitiesFinished');

    gridContainer.innerHTML = '';
    gridContainerFinished.innerHTML = '';

    if (active.length === 0) {

        gridContainer.innerHTML = `
        <p class="no-activities">Todavía no tienes ninguna actividad.</p>
        <p><a href="index.php?accion=createActivity">Crea una ahora</a></p>
        `;
    } else {

        active.forEach(activity => {
            gridContainer.appendChild(createActivityCard(activity));
        });

    }

    if (finished.length === 0) {

        gridContainerFinished.innerHTML =
            '<p class="no-activities">Todavía no tienes ninguna actividad propia terminada.</p>';

    } else {

        finished.forEach(activity => {
            gridContainerFinished.appendChild(createActivityCardFinished(activity));
        });

    }

}

function applyFilters() {

    const type = document.getElementById("filterType")?.value;
    const value = document.getElementById("filterValue")?.value?.toLowerCase() || "";

    if (!type) return;

    const filteredActive = activitiesActive.filter(a => matchFilter(a, type, value));
    const filteredFinished = activitiesFinished.filter(a => matchFilter(a, type, value));

    renderActivities(filteredActive, filteredFinished);
}

function matchFilter(activity, type, value) {
    if (!value) return true;
    switch (type) {
        case "title":
            return activity.title?.toLowerCase().includes(value);
        case "category":
            return activity.category_name?.toLowerCase().includes(value);
        case "date":
            return activity.date?.includes(value);
        default:
            return true;
    }
}

function createActivityCard(publication) {

    const card = document.createElement("article");
    card.className = "activity activity-card";

    const contentClass = "activity-content";

    let formattedDate = "";
    if (publication.date) {
        const date = new Date(publication.date);
        formattedDate = date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }

    const imageUrl = publication.image_url || 'assets/img/default-activity.jpg';

    const imgHTML =
        `<img src="${imageUrl}" alt="${publication.alt || publication.title}"
        onerror="this.src='assets/img/default-activity.jpg'">`;

    const tagHTML =
        publication.label
            ? `<div class="tag ${publication.labelClass || ''}">${publication.label}</div>`
            : "";

    const detailsHTML =
        publication.details?.length
            ? `<ul class="details">${publication.details.map(d => `<li>${d}</li>`).join("")}</ul>`
            : "";

    const metaHTML = `
        <div class="activity-meta">
            ${formattedDate ? `<span><i class="fas fa-calendar-alt"></i> ${formattedDate}</span>` : ""}
            ${publication.location ? `<span><i class="fas fa-map-marker-alt"></i> ${publication.location}</span>` : ""}
            ${publication.price ? `<span><i class="fas fa-euro-sign"></i> ${publication.price == 0 ? "Gratis" : publication.price}</span>` : ""}
        </div>
    `;

    const footerHTML = `
        <div class="activity-footer">
            ${publication.offertant_name ? `<span class="organizer"><i class="fas fa-user"></i> ${publication.offertant_name}</span>` : ""}
            ${publication.current_registrations != null && publication.max_people != null
            ? `<span class="participants"><i class="fas fa-users"></i> ${publication.current_registrations}/${publication.max_people}</span>`
            : ""}
        </div>
    `;

    card.innerHTML = `
        <div class="activity-image">${imgHTML}${tagHTML}</div>
        <div class="${contentClass}">
            ${publication.category_name ? `<span class="category">${publication.category_name}</span>` : ""}
            <h3>${publication.title}</h3>
            <p class="description">${publication.description}</p>
            ${detailsHTML}
            ${metaHTML}
            ${footerHTML}
            <div class="actions">
                <button class="btn-detail" data-id="${publication.id}">Editar</button>
                <button class="btn-signup" data-id="${publication.id}">Eliminar</button>
            </div>
        </div>
    `;

    card.querySelector(".btn-detail")?.addEventListener("click", function () {

        const id = this.dataset.id;

        const form = document.createElement("form");
        form.method = "POST";
        form.action = "index.php";

        form.innerHTML = `
        <input type="hidden" name="accion" value="editActivity">
        <input type="hidden" name="id" value="${id}">`;

        document.body.appendChild(form);
        form.submit();

    });

    card.querySelector(".btn-signup")?.addEventListener("click", function () {

        const id = this.dataset.id;

        const confirmacion =
            confirm("¿Estás seguro de que quieres eliminar esta publicación?");

        if (!confirmacion) return;

        const form = document.createElement("form");
        form.method = "POST";
        form.action = "index.php";

        form.innerHTML = `
        <input type="hidden" name="accion" value="deleteActivity">
        <input type="hidden" name="id" value="${id}">`;

        document.body.appendChild(form);
        form.submit();

    });

    return card;

}

function createActivityCardFinished(publication) {

    const card = document.createElement("article");
    card.className = "activity activity-card";

    let formattedDate = "";

    if (publication.date) {

        const date = new Date(publication.date);

        formattedDate = date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });

    }

    const imageUrl =
        publication.image_url || 'assets/img/default-activity.jpg';

    const imgHTML =
        `<img src="${imageUrl}" alt="${publication.alt || publication.title}"
        onerror="this.src='assets/img/default-activity.jpg'">`;

    const metaHTML = `
        <div class="activity-meta">
            ${formattedDate ? `<span><i class="fas fa-calendar-alt"></i> ${formattedDate}</span>` : ""}
            ${publication.location ? `<span><i class="fas fa-map-marker-alt"></i> ${publication.location}</span>` : ""}
        </div>
    `;

    card.innerHTML = `
        <div class="activity-image">${imgHTML}</div>
        <div class="activity-content">
            ${publication.category_name ? `<span class="category">${publication.category_name}</span>` : ""}
            <h3>${publication.title}</h3>
            <p class="description">${publication.description}</p>
            ${metaHTML}
        </div>
    `;

    return card;

}
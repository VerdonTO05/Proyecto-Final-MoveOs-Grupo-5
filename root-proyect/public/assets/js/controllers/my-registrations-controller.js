document.addEventListener("DOMContentLoaded", () => {
    loadActivities();

    const role = CURRENT_USER.role;

    const toggleBtn = document.getElementById("toggleFinished");
    const finishedSection = document.getElementById("gridRegistrationsFinished");

    if (toggleBtn && finishedSection) {
        toggleBtn.addEventListener("click", () => {
            const isVisible = finishedSection.classList.toggle("visible");

            toggleBtn.textContent = isVisible
                ? role === 'organizador'
                    ? "Ocultar peticiones terminadas"
                    : "Ocultar inscripciones terminadas"
                : role === 'organizador'
                    ? "Ver peticiones terminadas"
                    : "Ver inscripciones terminadas";
        });
    }
});

async function loadActivities() {

    const gridContainer = document.getElementById('gridRegistrations');
    const gridContainerFinished = document.getElementById('gridRegistrationsFinished');

    if (!gridContainer || !gridContainerFinished) return;

    try {

        const response = await fetch('index.php?accion=inscripciones');
        const result = await response.json();

        // ACTIVAS
        if (result.success && result.data?.active?.length > 0) {

            gridContainer.innerHTML = '';

            result.data.active.forEach(activity => {
                gridContainer.appendChild(createActivityCard(activity));
            });

        } else {
            // que se vea una debajo de otro
            gridContainer.innerHTML = `
            <p class="no-activities">Todavía no tienes ninguna inscripción.</p>
            <p><a href="index.php?accion=seeActivities">Busca una nueva aventura</a></p>
            `;

        }

        // TERMINADAS
        if (result.success && result.data?.finished?.length > 0) {

            gridContainerFinished.innerHTML = '';

            result.data.finished.forEach(activity => {
                gridContainerFinished.appendChild(createActivityCardFinished(activity));
            });

        } else {

            gridContainerFinished.innerHTML = `
            <p class="no-activities">Todavía no tienes inscripciones terminadas.</p>
            `;

        }

    } catch (error) {

        console.error('Error al cargar inscripciones:', error);
        gridContainer.innerHTML = '<p class="error">Error al cargar inscripciones.</p>';

    }
}

function createActivityCard(publication) {
    const card = document.createElement("article");
    card.className = "activity activity-card";

    const isActive = true;
    const contentClass = isActive ? "activity-content" : "activity-content desactivate";

    let formattedDate = "";
    if (publication.date) {
        const date = new Date(publication.date);
        formattedDate = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    const imageUrl = publication.image_url || 'assets/img/default-activity.jpg';
    const imgHTML = `<img src="${imageUrl}" alt="${publication.alt || publication.title}" onerror="this.src='assets/img/default-activity.jpg'">`;
    const tagHTML = publication.label ? `<div class="tag ${publication.labelClass || ''}">${publication.label}</div>` : "";
    const detailsHTML = publication.details?.length ? `<ul class="details">${publication.details.map(d => `<li>${d}</li>`).join("")}</ul>` : "";

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

    //Ajustar clases a los botones
    card.innerHTML = `
        <div class="activity-image">${imgHTML}${tagHTML}</div>
        <div class="${contentClass}">
            ${publication.category_name ? `<span class="category">${publication.category_name}</span>` : ""}
            <h3>${publication.title}</h3>
            <p class="description">${publication.description}</p>
            ${detailsHTML}${metaHTML}${footerHTML}
            <div class="actions">
                <button class="btn-detail" data-id="${publication.id}">Editar</button>
                <button class="btn-signup" data-id="${publication.id}" ${!isActive ? "disabled" : ""}>Eliminar</button>
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

    //CREAR MODAL PERSONALIZADO (funcion ya creada en control-controller.js- buscar forma de exportar)
    card.querySelector(".btn-signup")?.addEventListener("click", function () {
        const id = this.dataset.id;
        const confirmacion = confirm("¿Estás seguro de que quieres eliminar esta publicación?");

        if (!confirmacion) {
            return; // Si pulsa Cancelar, no hace nada
        }
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

    const isActive = true;
    const contentClass = isActive ? "activity-content" : "activity-content desactivate";

    let formattedDate = "";
    if (publication.date) {
        const date = new Date(publication.date);
        formattedDate = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    const imageUrl = publication.image_url || 'assets/img/default-activity.jpg';
    const imgHTML = `<img src="${imageUrl}" alt="${publication.alt || publication.title}" onerror="this.src='assets/img/default-activity.jpg'">`;
    const tagHTML = publication.label ? `<div class="tag ${publication.labelClass || ''}">${publication.label}</div>` : "";
    const detailsHTML = publication.details?.length ? `<ul class="details">${publication.details.map(d => `<li>${d}</li>`).join("")}</ul>` : "";

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

    //Ajustar clases a los botones
    card.innerHTML = `
        <div class="activity-image">${imgHTML}${tagHTML}</div>
        <div class="${contentClass}">
            ${publication.category_name ? `<span class="category">${publication.category_name}</span>` : ""}
            <h3>${publication.title}</h3>
            <p class="description">${publication.description}</p>
            ${detailsHTML}${metaHTML}${footerHTML}
        </div>
    `;

    return card;
}

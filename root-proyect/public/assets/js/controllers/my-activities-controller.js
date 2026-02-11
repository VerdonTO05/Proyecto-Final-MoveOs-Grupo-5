document.addEventListener("DOMContentLoaded", () => {
    loadActivities();
});

async function loadActivities() {
    const gridContainer = document.getElementById('gridActivities');
    if (!gridContainer) return;
    try {
        const response = await fetch('index.php?accion=getMyActivities');
        const text = await response.text();
        const result = JSON.parse(text);

        if (result.success && result.data.length > 0) {
            gridContainer.innerHTML = '';
            result.data.forEach(activity => {
                gridContainer.appendChild(createActivityCard(activity));
            });
        } else {
            gridContainer.innerHTML = '<p class="no-activities">Todavía no tienes ninguna actividad propia.</p>';
            gridContainer.innerHTML = '<p><a href="index.php?accion=createActivity"></a>Crea una ahora</p>';
        }
    } catch (error) {
        console.error('Error al cargar publicaciones:', error);
        gridContainer.innerHTML = '<p class="error">Error al cargar tus propias publicaciones.</p>';
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

    card.querySelector(".btn-detail")?.addEventListener("click", () => {
        console.log("Editar actividad con id:", publication.id); //por terminar
    });

    card.querySelector(".btn-signup")?.addEventListener("click", () => {
        console.log("Borrar actividad con id:", publication.id); //por terminar
    });

    return card;
}
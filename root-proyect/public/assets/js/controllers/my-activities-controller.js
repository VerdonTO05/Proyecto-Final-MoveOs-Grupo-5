document.addEventListener("DOMContentLoaded", () => {
    loadActivities();
});

/**
 * Carga las actividades propias del usuario desde el servidor
 * y las renderiza dentro del contenedor de la página.
 * @async
 */
async function loadActivities() {
    /** @type {HTMLElement|null} Contenedor donde se mostrarán las actividades */
    const gridContainer = document.getElementById('gridActivities');
    if (!gridContainer) return;

    try {
        const response = await fetch('index.php?accion=getMyActivities');
        const text = await response.text();
        /** @type {{success: boolean, data: any[]}} */
        const result = JSON.parse(text);

        if (result.success && result.data.length > 0) {
            gridContainer.innerHTML = '';
            result.data.forEach(activity => {
                gridContainer.appendChild(createActivityCard(activity));
            });
        } else {
            gridContainer.innerHTML = `
                <p class="no-activities">Todavía no tienes ninguna actividad propia.</p>
                <p><a href="index.php?accion=createActivity">Crea una ahora</a></p>
            `;
        }
    } catch (error) {
        console.error('Error al cargar publicaciones:', error);
        gridContainer.innerHTML = '<p class="error">Error al cargar tus propias publicaciones.</p>';
    }
}

/**
 * Crea una tarjeta HTML representando una actividad.
 * @param {Object} publication Objeto con los datos de la actividad.
 * @param {number} publication.id ID de la actividad
 * @param {string} publication.title Título de la actividad
 * @param {string} [publication.description] Descripción de la actividad
 * @param {string} [publication.date] Fecha de la actividad
 * @param {string} [publication.image_url] URL de la imagen
 * @param {string} [publication.alt] Texto alternativo de la imagen
 * @param {string} [publication.label] Etiqueta de la actividad
 * @param {string} [publication.labelClass] Clase CSS para la etiqueta
 * @param {string} [publication.category_name] Nombre de la categoría
 * @param {string} [publication.location] Ubicación de la actividad
 * @param {number} [publication.price] Precio de la actividad
 * @param {number} [publication.current_registrations] Número de inscritos
 * @param {number} [publication.max_people] Número máximo de participantes
 * @param {string} [publication.offertant_name] Nombre del organizador
 * @param {Array<string>} [publication.details] Lista de detalles adicionales
 * @returns {HTMLElement} Elemento artículo representando la actividad
 */
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
            ${publication.price ? `<span><i class="fas fa-euro-sign"></i> ${publication.price}€</span>` : ""}
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
            ${detailsHTML}${metaHTML}${footerHTML}
            <div class="actions">
                <button class="btn-detail" data-id="${publication.id}">Editar</button>
                <button class="btn-signup" data-id="${publication.id}" ${!isActive ? "disabled" : ""}>Eliminar</button>
            </div>
        </div>
    `;

    // Eventos de los botones
    card.querySelector(".btn-detail")?.addEventListener("click", () => {
        console.log("Editar actividad con id:", publication.id); //por terminar
    });

    card.querySelector(".btn-signup")?.addEventListener("click", () => {
        console.log("Borrar actividad con id:", publication.id); //por terminar
    });

    return card;
}

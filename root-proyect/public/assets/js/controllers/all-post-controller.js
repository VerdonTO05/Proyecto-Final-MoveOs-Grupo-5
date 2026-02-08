document.addEventListener("DOMContentLoaded", () => {
    initTabSwitch();
    loadActivities();
});

/**
 * Inicializa la navegación entre pestañas "Actividades" y "Peticiones"
 */
function initTabSwitch() {
    const buttons = document.querySelectorAll('.tab-btn.control');
    const title = document.getElementById('view-title');
    const subtitle = document.getElementById('view-subtitle');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Activar la pestaña seleccionada
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const type = btn.dataset.type;

            if (type === 'activities') {
                title.innerHTML = 'Explorar Actividades';
                subtitle.innerHTML = 'Los organizadores han añadido actividades para los próximos días';
                loadActivities();
            } else if (type === 'requests') {
                title.innerHTML = 'Explorar Peticiones';
                subtitle.innerHTML = 'Los participantes han añadido peticiones para llevar a cabo sus ideas';
                loadRequests();
            }
        });
    });
}

/**
 * Carga y renderiza las actividades desde el servidor
 */
async function loadActivities() {
    const gridContainer = document.getElementById('gridActivities');
    if (!gridContainer) return;

    try {
        const response = await fetch('index.php?accion=getActivities');
        const text = await response.text();
        const result = JSON.parse(text);

        if (result.success && result.data.length > 0) {
            gridContainer.innerHTML = '';
            result.data.forEach(activity => {
                gridContainer.appendChild(createActivityCard(activity));
            });
        } else {
            gridContainer.innerHTML = '<p class="no-activities">No hay actividades disponibles en este momento.</p>';
        }
    } catch (error) {
        console.error('Error al cargar actividades:', error);
        gridContainer.innerHTML = '<p class="error">Error al cargar las actividades.</p>';
    }
}

/**
 * Carga y renderiza las peticiones desde el servidor
 */
async function loadRequests() {
    const gridContainer = document.getElementById('gridActivities');
    if (!gridContainer) return;

    try {
        const response = await fetch('index.php?accion=getRequests');
        const text = await response.text();
        const result = JSON.parse(text);

        if (result.success && result.data.length > 0) {
            gridContainer.innerHTML = '';
            result.data.forEach(request => {
                gridContainer.appendChild(createActivityCard(request));
            });
        } else {
            gridContainer.innerHTML = '<p class="no-activities">No hay peticiones disponibles en este momento.</p>';
        }
    } catch (error) {
        console.error('Error al cargar peticiones:', error);
        gridContainer.innerHTML = '<p class="error">Error al cargar las peticiones.</p>';
    }
}

/**
 * Crea una tarjeta HTML de actividad o petición
 * @param {Object} activity - Objeto con datos de la actividad/ petición
 * @returns {HTMLElement} Elemento `article` con la tarjeta completa
 */
function createActivityCard(activity) {
    const card = document.createElement("article");
    card.className = "activity activity-card";

    const isActive = true;
    const contentClass = isActive ? "activity-content" : "activity-content desactivate";

    // Formatear fecha
    let formattedDate = "";
    if (activity.date) {
        const date = new Date(activity.date);
        formattedDate = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    const imageUrl = activity.image_url || 'assets/img/default-activity.jpg';
    const imgHTML = `<img src="${imageUrl}" alt="${activity.alt || activity.title}" onerror="this.src='assets/img/default-activity.jpg'">`;
    const tagHTML = activity.label ? `<div class="tag ${activity.labelClass || ''}">${activity.label}</div>` : "";
    const detailsHTML = activity.details?.length ? `<ul class="details">${activity.details.map(d => `<li>${d}</li>`).join("")}</ul>` : "";

    const metaHTML = `
        <div class="activity-meta">
            ${formattedDate ? `<span><i class="fas fa-calendar-alt"></i> ${formattedDate}</span>` : ""}
            ${activity.location ? `<span><i class="fas fa-map-marker-alt"></i> ${activity.location}</span>` : ""}
            ${activity.price ? `<span><i class="fas fa-euro-sign"></i> ${activity.price}€</span>` : ""}
        </div>
    `;

    const footerHTML = `
        <div class="activity-footer">
            ${activity.offertant_name ? `<span class="organizer"><i class="fas fa-user"></i> ${activity.offertant_name}</span>` : ""}
            ${activity.current_registrations != null && activity.max_people != null
            ? `<span class="participants"><i class="fas fa-users"></i> ${activity.current_registrations}/${activity.max_people}</span>`
            : ""}
        </div>
    `;

    // Construir el HTML de la tarjeta
    card.innerHTML = `
        <div class="activity-image">${imgHTML}${tagHTML}</div>
        <div class="${contentClass}">
            ${activity.category_name ? `<span class="category">${activity.category_name}</span>` : ""}
            <h3>${activity.title}</h3>
            <p class="description">${activity.description}</p>
            ${detailsHTML}${metaHTML}${footerHTML}
            <div class="actions">
                <button class="btn-detail" data-id="${activity.id}">Ver Detalles</button>
                <button class="btn-signup" data-id="${activity.id}" ${!isActive ? "disabled" : ""}>Inscribirse</button>
            </div>
        </div>
    `;

    // Eventos de botones
    card.querySelector(".btn-detail")?.addEventListener("click", () => {
        console.log("Detalles de:", activity.id);
    });

    card.querySelector(".btn-signup")?.addEventListener("click", () => {
        console.log("Inscripción en:", activity.id);
    });

    return card;
}

// let activities = [];
// let requests = [];

// document.addEventListener("DOMContentLoaded", () => {
//     initTabSwitch();
//     loadActivities();

//     const filterInput = document.getElementById("filterInput");

//     if (filterInput) {
//         filterInput.addEventListener("input", applyFilters);
//         filterInput.addEventListener("change", applyFilters);
//     }
// });

// function initTabSwitch() {
//     const buttons = document.querySelectorAll('.tab-btn.control');
//     const title = document.getElementById('view-title');
//     const subtitle = document.getElementById('view-subtitle');
//     //Al pulsar el btn-state que se habra un modal que pregunte si se quiere aceptar o rechazar la actividad

//     buttons.forEach(btn => {
//         btn.addEventListener('click', () => {
//             buttons.forEach(b => b.classList.remove('active'));
//             btn.classList.add('active');

//             const type = btn.dataset.type;

//             if (type === 'activities') {
//                 title.innerHTML = 'Explorar Actividades';
//                 subtitle.innerHTML = 'Los organizadores han añadido actividades para los próximos días';
//                 loadActivities();
//             } else if (type === 'requests') {
//                 title.innerHTML = 'Explorar Peticiones';
//                 subtitle.innerHTML = 'Los participantes han añadido peticiones para llevar a cabo sus ideas';
//                 loadRequests();
//             }
//         });
//     });
// }


// async function loadActivities() {
//     const gridContainer = document.getElementById('gridActivities');
//     if (!gridContainer) return;
//     try {
//         const response = await fetch('index.php?accion=getActivities');
//         const text = await response.text();
//         const result = JSON.parse(text);
//         if (result.success) {

//             activities = result.data || [];

//             renderActivities(activities);
//             // gridContainer.innerHTML = '';
//             // result.data.forEach(activity => {
//             //     gridContainer.appendChild(createActivityCard(activity));
//             // });
//         }
//     } catch (error) {
//         console.error('Error al cargar actividades:', error);
//         gridContainer.innerHTML = '<p class="error">Error al cargar las actividades.</p>';
//     }

// }


// function renderActivities(activities) {
//     const gridContainer = document.getElementById('gridActivities');

//     gridContainer.innerHTML = '';

//     if (activities.length === 0) {
//         gridContainer.innerHTML = '<p class="no-activities">No hay actividades disponibles en este momento.</p>';

//     } else {
//         activities.forEach(activity => {
//             gridContainer.appendChild(createActivityCard(activity));
//         });
//     }
// }

// async function loadRequests() {
//     const gridContainer = document.getElementById('gridActivities');
//     if (!gridContainer) return;

//     try {
//         const response = await fetch('index.php?accion=getRequests');
//         const text = await response.text();
//         const result = JSON.parse(text);

//         if (result.success) {
//             requests = result.data || [];

//             renderRequests(requests);
//             // gridContainer.innerHTML = '';
//             // result.data.forEach(request => {
//             //     gridContainer.appendChild(createActivityCard(request));
//             // });
//         } else {
//             gridContainer.innerHTML = '<p class="no-activities">No hay peticiones disponibles en este momento.</p>';
//         }
//     } catch (error) {
//         console.error('Error al cargar peticiones:', error);
//         gridContainer.innerHTML = '<p class="error">Error al cargar las peticiones.</p>';
//     }
// }

// function renderRequests(requests) {
//     const gridContainer = document.getElementById('gridActivities');

//     gridContainer.innerHTML = '';

//     if (requests.length === 0) {
//         gridContainer.innerHTML = '<p class="no-activities">No hay actividades disponibles en este momento.</p>';

//     } else {
//         requests.forEach(request => {
//             gridContainer.appendChild(createActivityCard(request));
//         });
//     }
// }

// function applyFilters() {
//     const type = document.getElementById("filterType")?.value;
//     const value = document.getElementById("filterValue")?.value?.toLowerCase() || "";

//     if (!type) return;

//     // Determinar la tab activa
//     const activeTab = document.querySelector(".tab-btn.control.active")?.dataset.type;

//     if (activeTab === "activities") {
//         // Filtrar actividades
//         const filtered = activities.filter(item => matchFilter(item, type, value));
//         renderActivities(filtered);
//     } else if (activeTab === "requests") {
//         // Filtrar peticiones
//         const filtered = requests.filter(item => matchFilter(item, type, value));
//         renderRequests(filtered);
//     }
// }

// function matchFilter(activity, type, value) {
//     if (!value) return true;
//     switch (type) {
//         case "title":
//             return activity.title?.toLowerCase().includes(value);
//         case "category":
//             return activity.category_name?.toLowerCase().includes(value);
//         case "date":
//             return activity.date?.includes(value);
//         default:
//             return true;
//     }
// }


// function createActivityCard(activity) {
//     const modal = document.getElementById("activityModal");
//     const modalBody = modal?.querySelector(".modal-body");
//     const modalClose = modal?.querySelector(".modal-close");
//     const card = document.createElement("article");
//     card.className = "activity activity-card";

//     const isActive = true;
//     const contentClass = isActive ? "activity-content" : "activity-content desactivate";

//     let formattedDate = "";
//     if (activity.date) {
//         const date = new Date(activity.date);
//         formattedDate = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
//     }

//     const imageUrl = activity.image_url || 'assets/img/default-activity.jpg';
//     const imgHTML = `<img src="${imageUrl}" alt="${activity.alt || activity.title}" onerror="this.src='assets/img/default-activity.jpg'">`;
//     const tagHTML = activity.label ? `<div class="tag ${activity.labelClass || ''}">${activity.label}</div>` : "";
//     const detailsHTML = activity.details?.length ? `<ul class="details">${activity.details.map(d => `<li>${d}</li>`).join("")}</ul>` : "";

//     const metaHTML = `
//         <div class="activity-meta">
//             ${formattedDate ? `<span><i class="fas fa-calendar-alt"></i> ${formattedDate}</span>` : ""}
//             ${activity.location ? `<span><i class="fas fa-map-marker-alt"></i> ${activity.location}</span>` : ""}
//             ${activity.price ? `<span><i class="fas fa-euro-sign"></i> ${activity.price}€</span>` : ""}
//         </div>
//     `;

//     const footerHTML = `
//         <div class="activity-footer">
//             ${activity.offertant_name ? `<span class="organizer"><i class="fas fa-user"></i> ${activity.offertant_name}</span>` : ""}
//             ${activity.current_registrations != null && activity.max_people != null
//             ? `<span class="participants"><i class="fas fa-users"></i> ${activity.current_registrations}/${activity.max_people}</span>`
//             : ""}
//         </div>
//     `;

//     card.innerHTML = `
//         <div class="activity-image">${imgHTML}${tagHTML}</div>
//         <div class="${contentClass}">
//             ${activity.category_name ? `<span class="category">${activity.category_name}</span>` : ""}
//             ${activity.state === 'pendiente'
//             ? `<button id="btn-state" class="state"><i class="fas fa-hourglass-half"></i></button>`
//             : activity.state === 'rechazada'
//                 ? `<span class="state"><i class="fas fa-times"></i></span>`
//                 : `<span class="state"><i class="fas fa-check-double"></i></span>`}
//                 <h3>${activity.title}</h3>
//             <p class="description">${activity.description}</p>
//             ${detailsHTML}${metaHTML}${footerHTML}
//             <div class="actions">
//                 <button class="btn-detail" data-id="${activity.id}">Ver Detalles</button>
//                 <button class="btn-signup" data-id="${activity.id}" ${!isActive ? "disabled" : ""}>Inscribirse</button>
//             </div>
//         </div>
//     `;

//     card.querySelector(".btn-detail")?.addEventListener("click", () => {
//         if (modal && modalBody) openModal(activity, modalBody, modal);
//     });

//     //Cambiar esto
//     card.querySelector(".btn-signup")?.addEventListener("click", () => {
//         console.log("Inscripción en:", activity.id);
//     });

//     card.querySelector("#btn-state")?.addEventListener("click", () => {
//         console.log("state");
//         //Abrir alert-container y mostrar un dialog personalizado para aceptar o rechazar publicacion
//     });

//     modalClose?.addEventListener("click", () => { modal.style.display = "none"; });
//     modal?.addEventListener("click", (e) => { if (e.target === modal) modal.style.display = "none"; });

//     return card;
// }


// function openModal(activity) {
//     const modal = document.getElementById("activityModal");
//     const modalTitle = modal.querySelector(".modal-title");
//     const modalCategory = modal.querySelector(".category");
//     const modalImage = modal.querySelector(".modal-image");
//     const modalDescription = modal.querySelector(".modal-description");
//     const modalInfo = modal.querySelector(".modal-info");
//     const modalInfoAditional = modal.querySelector(".modal-info-aditional");

//     // Cabecera
//     modalTitle.textContent = activity.title;
//     modalCategory.textContent = activity.category_name || '';

//     // Imagen
//     modalImage.innerHTML = `<img src="${activity.image_url || 'assets/img/default-activity.jpg'}" alt="${activity.title}">`;

//     // Descripción
//     modalDescription.innerHTML = `
//   <h3><i class="fas fa-circle-info"></i> Descripción</h3>
//   <p>${activity.description || 'Sin descripción.'}</p>`;

//     // Información principal
//     modalInfo.innerHTML = `
//   <h3>Información Principal</h3>
//   <p><span class="title"><i class="fas fa-calendar-day"></i> <strong>Fecha</strong></span> ${activity.date || 'No disponible'}</p>
//   <p><span class="title"><i class="fas fa-clock"></i> <strong>Hora</strong></span> ${activity.time || 'No disponible'}</p>
//   <p><span class="title"><i class="fas fa-location-dot"></i> <strong>Ubicación</strong></span> ${activity.location || 'No disponible'}</p>
//   <p><span class="title"><i class="fas fa-stopwatch"></i> <strong>Duración</strong></span> ${activity.duration || 'No disponible'}</p>
//   <p><span class="title"><i class="fas fa-users"></i> <strong>Participantes</strong></span> ${activity.current_registrations || 0}/${activity.max_people || '-'}</p>
//   <p><span class="title"><i class="fas fa-euro-sign"></i> <strong>Precio</strong></span> ${activity.price || 'Gratis'}</p>
//   <p><span class="title"><i class="fas fa-user"></i> <strong>Organizador</strong></span> ${activity.offertant_name || 'No disponible'}</p>
// `;

//     modalInfoAditional.innerHTML = `
//   <h3>Información Adicional</h3>
//   <p><span class="title"><i class="fas fa-car"></i> <strong>${activity.transport_included ? 'Transporte incluido' : 'Transporte no incluido'}</strong></span></p>
//   <p><span class="title"><i class="fas fa-language"></i> <strong>Idioma</strong></span> ${activity.language || 'No disponible'}</p>
//   <p><span class="title"><i class="fas fa-plus"></i> <strong>Edad recomendada</strong></span> ${activity.min_age || 'No disponible'} ${activity.min_age == 1 ? 'año' : 'años'}</p>
//   <p><span class="title"><i class="fas fa-location-dot"></i> <strong>Ciudad de partida</strong></span> ${activity.departure_city || 'No disponible'}</p>
//   <p><span class="title"><i class="fas fa-paw"></i> <strong>${activity.pets_allowed ? 'Mascotas permitidas' : 'Mascotas no permitidas'}</strong></span></p>
//   <p><span class="title"><i class="fas fa-tshirt"></i> <strong>Código de vestimenta</strong></span> ${activity.dress_code || 'No disponible'}</p> 
// `;

//     modal.style.display = "flex";

//     // Cerrar modal
//     modal.querySelector(".modal-close").onclick = () => modal.style.display = "none";
//     modal.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };
// }

// ============================================================
// all-post-controller.js
// ============================================================
import {
    matchFilter, getFilterValues, bindFilterListeners,
    buildImageHTML, buildMetaHTML, buildFooterHTML, buildDetailsHTML,
    openDetailModal
} from './shared.js';

let activities = [];
let requests   = [];

document.addEventListener("DOMContentLoaded", () => {
    initTabSwitch();
    loadActivities();
    bindFilterListeners(applyFilters);
});

// ----------------------------
// Tabs
// ----------------------------
function initTabSwitch() {
    const buttons  = document.querySelectorAll('.tab-btn.control');
    const title    = document.getElementById('view-title');
    const subtitle = document.getElementById('view-subtitle');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const type = btn.dataset.type;

            if (type === 'activities') {
                title.innerHTML    = 'Explorar Actividades';
                subtitle.innerHTML = 'Los organizadores han añadido actividades para los próximos días';
                loadActivities();
            } else if (type === 'requests') {
                title.innerHTML    = 'Explorar Peticiones';
                subtitle.innerHTML = 'Los participantes han añadido peticiones para llevar a cabo sus ideas';
                loadRequests();
            }
        });
    });
}

// ----------------------------
// Carga de datos
// ----------------------------
async function loadActivities() {
    const grid = document.getElementById('gridActivities');
    if (!grid) return;

    try {
        const result = await fetch('index.php?accion=getActivities').then(r => r.json());
        if (result.success) {
            activities = result.data || [];
            renderItems(activities, createActivityCard);
        }
    } catch (error) {
        console.error('Error al cargar actividades:', error);
        document.getElementById('gridActivities').innerHTML =
            '<p class="error">Error al cargar las actividades.</p>';
    }
}

async function loadRequests() {
    const grid = document.getElementById('gridActivities');
    if (!grid) return;

    try {
        const result = await fetch('index.php?accion=getRequests').then(r => r.json());
        if (result.success) {
            requests = result.data || [];
            renderItems(requests, createActivityCard);
        } else {
            grid.innerHTML = '<p class="no-activities">No hay peticiones disponibles en este momento.</p>';
        }
    } catch (error) {
        console.error('Error al cargar peticiones:', error);
        document.getElementById('gridActivities').innerHTML =
            '<p class="error">Error al cargar las peticiones.</p>';
    }
}

// ----------------------------
// Render genérico
// ----------------------------
function renderItems(items, cardFactory) {
    const grid = document.getElementById('gridActivities');
    grid.innerHTML = '';

    if (items.length === 0) {
        grid.innerHTML = '<p class="no-activities">No hay elementos disponibles en este momento.</p>';
        return;
    }
    items.forEach(item => grid.appendChild(cardFactory(item)));
}

// ----------------------------
// Filtros
// ----------------------------
function applyFilters() {
    const { type, value }  = getFilterValues();
    if (!type) return;

    const activeTab = document.querySelector(".tab-btn.control.active")?.dataset.type;

    if (activeTab === "activities") {
        renderItems(activities.filter(i => matchFilter(i, type, value)), createActivityCard);
    } else if (activeTab === "requests") {
        renderItems(requests.filter(i => matchFilter(i, type, value)), createActivityCard);
    }
}

// ----------------------------
// Card
// ----------------------------
function createActivityCard(activity) {
    const card = document.createElement("article");
    card.className = "activity activity-card";

    const stateHTML = activity.state === 'pendiente'
        ? `<button id="btn-state" class="state"><i class="fas fa-hourglass-half"></i></button>`
        : activity.state === 'rechazada'
            ? `<span class="state"><i class="fas fa-times"></i></span>`
            : `<span class="state"><i class="fas fa-check-double"></i></span>`;

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
                <button class="btn-signup"  data-id="${activity.id}">Inscribirse</button>
            </div>
        </div>`;

    card.querySelector(".btn-detail")?.addEventListener("click", () => {
        openDetailModal(activity);
    });

    card.querySelector(".btn-signup")?.addEventListener("click", () => {
        console.log("Inscripción en:", activity.id);
        // TODO: implementar lógica de inscripción
    });

    card.querySelector(".btn-state")?.addEventListener("click", () => {
        // TODO: abrir dialog para aceptar/rechazar publicación
        console.log("Cambiar estado de:", activity.id);
    });

    return card;
}
// let registrationsActive = [];
// let registrationsFinished = [];

// document.addEventListener("DOMContentLoaded", () => {
//     loadActivities();

//     const role = CURRENT_USER.role;

//     const toggleBtn = document.getElementById("toggleFinished");
//     const finishedSection = document.getElementById("gridRegistrationsFinished");

//     if (toggleBtn && finishedSection) {
//         toggleBtn.addEventListener("click", () => {
//             const isVisible = finishedSection.classList.toggle("visible");

//             toggleBtn.textContent = isVisible
//                 ? role === 'organizador'
//                     ? "Ocultar peticiones terminadas"
//                     : "Ocultar inscripciones terminadas"
//                 : role === 'organizador'
//                     ? "Ver peticiones terminadas"
//                     : "Ver inscripciones terminadas";
//         });
//     }

//     const filterInput = document.getElementById("filterInput");

//     if (filterInput) {
//         filterInput.addEventListener("input", applyFilters);
//         filterInput.addEventListener("change", applyFilters);
//     }
// });

// async function loadActivities() {

//     const gridContainer = document.getElementById('gridRegistrations');
//     const gridContainerFinished = document.getElementById('gridRegistrationsFinished');

//     if (!gridContainer || !gridContainerFinished) return;

//     try {

//         const response = await fetch('index.php?accion=inscripciones');
//         const result = await response.json();

//         // ACTIVAS
//         if (result.success) {

//             registrationsActive = result.data.active || [];
//             registrationsFinished = result.data.finished || [];

//             renderRegistrations(registrationsActive, registrationsFinished)
//             // gridContainer.innerHTML = '';

//             // result.data.active.forEach(activity => {
//             //     gridContainer.appendChild(createActivityCard(activity));
//             // });

//          } 
//         //  else {
//         //     // que se vea una debajo de otro
//         //     gridContainer.innerHTML = `
//         //     <p class="no-activities">Todavía no tienes ninguna inscripción.</p>
//         //     <p><a href="index.php?accion=seeActivities">Busca una nueva aventura</a></p>
//         //     `;

//         // }

//         // // TERMINADAS
//         // if (result.success && result.data?.finished?.length > 0) {

//         //     gridContainerFinished.innerHTML = '';

//         //     result.data.finished.forEach(activity => {
//         //         gridContainerFinished.appendChild(createActivityCardFinished(activity));
//         //     });

//         // } else {

//         //     gridContainerFinished.innerHTML = `
//         //     <p class="no-activities">Todavía no tienes inscripciones terminadas.</p>
//         //     `;

//         // }

//     } catch (error) {

//         console.error('Error al cargar inscripciones:', error);
//         gridContainer.innerHTML = '<p class="error">Error al cargar inscripciones.</p>';

//     }
// }

// function renderRegistrations(active, finished){
//     const gridContainer = document.getElementById('gridRegistrations');
//     const gridContainerFinished = document.getElementById('gridRegistrationsFinished');

//     gridContainer.innerHTML = '';
//     gridContainerFinished.innerHTML = '';

//     if (active.length === 0) {

//         gridContainer.innerHTML = `
//             <p class="no-activities">Todavía no tienes ninguna inscripción.</p>
//             <p><a href="index.php?accion=seeActivities">Busca una nueva aventura</a></p>
//              `;
//     } else {

//         active.forEach(activity => {
//             gridContainer.appendChild(createActivityCard(activity));
//         });

//     }

//     if (finished.length === 0) {

//         gridContainerFinished.innerHTML = `
//              <p class="no-activities">Todavía no tienes inscripciones terminadas.</p>
//             `;
//     } else {

//         finished.forEach(activity => {
//             gridContainerFinished.appendChild(createActivityCardFinished(activity));
//         });

//     }

// }

// function applyFilters() {

//     const type = document.getElementById("filterType")?.value;
//     const value = document.getElementById("filterValue")?.value?.toLowerCase() || "";

//     if (!type) return;

//     const filteredActive = registrationsActive.filter(a => matchFilter(a, type, value));
//     const filteredFinished = registrationsFinished.filter(a => matchFilter(a, type, value));

//     renderRegistrations(filteredActive, filteredFinished);
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

// function createActivityCard(publication) {
//     const card = document.createElement("article");
//     card.className = "activity activity-card";

//     const isActive = true;
//     const contentClass = isActive ? "activity-content" : "activity-content desactivate";

//     let formattedDate = "";
//     if (publication.date) {
//         const date = new Date(publication.date);
//         formattedDate = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
//     }

//     const imageUrl = publication.image_url || 'assets/img/default-activity.jpg';
//     const imgHTML = `<img src="${imageUrl}" alt="${publication.alt || publication.title}" onerror="this.src='assets/img/default-activity.jpg'">`;
//     const tagHTML = publication.label ? `<div class="tag ${publication.labelClass || ''}">${publication.label}</div>` : "";
//     const detailsHTML = publication.details?.length ? `<ul class="details">${publication.details.map(d => `<li>${d}</li>`).join("")}</ul>` : "";

//     const metaHTML = `
//         <div class="activity-meta">
//             ${formattedDate ? `<span><i class="fas fa-calendar-alt"></i> ${formattedDate}</span>` : ""}
//             ${publication.location ? `<span><i class="fas fa-map-marker-alt"></i> ${publication.location}</span>` : ""}
//             ${publication.price ? `<span><i class="fas fa-euro-sign"></i> ${publication.price == 0 ? "Gratis" : publication.price}</span>` : ""}
//         </div>
//     `;

//     const footerHTML = `
//         <div class="activity-footer">
//             ${publication.offertant_name ? `<span class="organizer"><i class="fas fa-user"></i> ${publication.offertant_name}</span>` : ""}
//             ${publication.current_registrations != null && publication.max_people != null
//             ? `<span class="participants"><i class="fas fa-users"></i> ${publication.current_registrations}/${publication.max_people}</span>`
//             : ""}
//         </div>
//     `;

//     //Ajustar clases a los botones
//     card.innerHTML = `
//         <div class="activity-image">${imgHTML}${tagHTML}</div>
//         <div class="${contentClass}">
//             ${publication.category_name ? `<span class="category">${publication.category_name}</span>` : ""}
//             <h3>${publication.title}</h3>
//             <p class="description">${publication.description}</p>
//             ${detailsHTML}${metaHTML}${footerHTML}
//             <div class="actions">
//                 <button class="btn-detail" data-id="${publication.id}">Editar</button>
//                 <button class="btn-signup" data-id="${publication.id}" ${!isActive ? "disabled" : ""}>Eliminar</button>
//             </div>
//         </div>
//     `;

//     card.querySelector(".btn-detail")?.addEventListener("click", function () {
//         const id = this.dataset.id;

//         const form = document.createElement("form");
//         form.method = "POST";
//         form.action = "index.php";

//         form.innerHTML = `
//         <input type="hidden" name="accion" value="editActivity">
//         <input type="hidden" name="id" value="${id}">`;

//         document.body.appendChild(form);
//         form.submit();
//     });

//     //CREAR MODAL PERSONALIZADO (funcion ya creada en control-controller.js- buscar forma de exportar)
//     card.querySelector(".btn-signup")?.addEventListener("click", function () {
//         const id = this.dataset.id;
//         const confirmacion = confirm("¿Estás seguro de que quieres eliminar esta publicación?");

//         if (!confirmacion) {
//             return; // Si pulsa Cancelar, no hace nada
//         }
//         const form = document.createElement("form");
//         form.method = "POST";
//         form.action = "index.php";

//         form.innerHTML = `
//         <input type="hidden" name="accion" value="deleteActivity">
//         <input type="hidden" name="id" value="${id}">`;

//         document.body.appendChild(form);
//         form.submit();
//     });

//     return card;
// }

// function createActivityCardFinished(publication) {
//     const card = document.createElement("article");
//     card.className = "activity activity-card";

//     const isActive = true;
//     const contentClass = isActive ? "activity-content" : "activity-content desactivate";

//     let formattedDate = "";
//     if (publication.date) {
//         const date = new Date(publication.date);
//         formattedDate = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
//     }

//     const imageUrl = publication.image_url || 'assets/img/default-activity.jpg';
//     const imgHTML = `<img src="${imageUrl}" alt="${publication.alt || publication.title}" onerror="this.src='assets/img/default-activity.jpg'">`;
//     const tagHTML = publication.label ? `<div class="tag ${publication.labelClass || ''}">${publication.label}</div>` : "";
//     const detailsHTML = publication.details?.length ? `<ul class="details">${publication.details.map(d => `<li>${d}</li>`).join("")}</ul>` : "";

//     const metaHTML = `
//         <div class="activity-meta">
//             ${formattedDate ? `<span><i class="fas fa-calendar-alt"></i> ${formattedDate}</span>` : ""}
//             ${publication.location ? `<span><i class="fas fa-map-marker-alt"></i> ${publication.location}</span>` : ""}
//             ${publication.price ? `<span><i class="fas fa-euro-sign"></i> ${publication.price == 0 ? "Gratis" : publication.price}</span>` : ""}
//         </div>
//     `;

//     const footerHTML = `
//         <div class="activity-footer">
//             ${publication.offertant_name ? `<span class="organizer"><i class="fas fa-user"></i> ${publication.offertant_name}</span>` : ""}
//             ${publication.current_registrations != null && publication.max_people != null
//             ? `<span class="participants"><i class="fas fa-users"></i> ${publication.current_registrations}/${publication.max_people}</span>`
//             : ""}
//         </div>
//     `;

//     //Ajustar clases a los botones
//     card.innerHTML = `
//         <div class="activity-image">${imgHTML}${tagHTML}</div>
//         <div class="${contentClass}">
//             ${publication.category_name ? `<span class="category">${publication.category_name}</span>` : ""}
//             <h3>${publication.title}</h3>
//             <p class="description">${publication.description}</p>
//             ${detailsHTML}${metaHTML}${footerHTML}
//         </div>
//     `;

//     return card;
// }
// ============================================================
// my-registrations-controller.js
// ============================================================
import {
    matchFilter, getFilterValues, bindFilterListeners,
    buildImageHTML, buildMetaHTML, buildFooterHTML, buildDetailsHTML,
    bindToggleSection, submitForm
} from './shared.js';

let registrationsActive   = [];
let registrationsFinished = [];

document.addEventListener("DOMContentLoaded", () => {
    loadRegistrations();

    const role = CURRENT_USER.role;
    const isOrg = role === 'organizador';

    bindToggleSection(
        "toggleFinished",
        "gridRegistrationsFinished",
        isOrg ? "Ocultar peticiones terminadas"   : "Ocultar inscripciones terminadas",
        isOrg ? "Ver peticiones terminadas"        : "Ver inscripciones terminadas"
    );

    bindFilterListeners(applyFilters);
});

// ----------------------------
// Carga de datos
// ----------------------------
async function loadRegistrations() {
    const grid = document.getElementById('gridRegistrations');
    if (!grid) return;

    try {
        const result = await fetch('index.php?accion=inscripciones').then(r => r.json());
        if (result.success) {
            registrationsActive   = result.data.active   || [];
            registrationsFinished = result.data.finished || [];
            render(registrationsActive, registrationsFinished);
        }
    } catch (error) {
        console.error('Error al cargar inscripciones:', error);
        grid.innerHTML = '<p class="error">Error al cargar inscripciones.</p>';
    }
}

// ----------------------------
// Render
// ----------------------------
function render(active, finished) {
    const grid  = document.getElementById('gridRegistrations');
    const gridF = document.getElementById('gridRegistrationsFinished');

    grid.innerHTML = active.length === 0
        ? `<p class="no-activities">Todavía no tienes ninguna inscripción.</p>
           <p><a href="index.php?accion=seeActivities">Busca una nueva aventura</a></p>`
        : '';
    active.forEach(a => grid.appendChild(createActiveCard(a)));

    gridF.innerHTML = finished.length === 0
        ? '<p class="no-activities">Todavía no tienes inscripciones terminadas.</p>'
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
        registrationsActive.filter(a   => matchFilter(a, type, value)),
        registrationsFinished.filter(a => matchFilter(a, type, value))
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
            <h3>${pub.title}</h3>
            <p class="description">${pub.description}</p>
            ${buildDetailsHTML(pub)}
            ${buildMetaHTML(pub)}
            ${buildFooterHTML(pub)}
            <div class="actions">
                <button class="btn-detail" data-id="${pub.id}">Editar</button>
                <button class="btn-signup" data-id="${pub.id}">Eliminar</button>
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
            ${buildDetailsHTML(pub)}
            ${buildMetaHTML(pub)}
            ${buildFooterHTML(pub)}
        </div>`;

    return card;
}
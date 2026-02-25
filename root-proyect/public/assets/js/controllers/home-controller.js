// ============================
// Inicialización al cargar la página
// ============================
document.addEventListener("DOMContentLoaded", () => {
  if (!window.CURRENT_USER) {
    // Redirigir si no hay usuario
    window.location.href = "index.php?accion=loginView";
    return;
  }

  const role = CURRENT_USER.role;
  loadPublications(role);
});

// ============================
// Función para cargar publicaciones desde el backend
// ============================
async function loadPublications(role) {
  const gridContainer = document.getElementById('gridActivities');
  if (!gridContainer) return;

  try {
    const response = await fetch('index.php?accion=getAprove');
    const text = await response.text();
    const result = JSON.parse(text);

    gridContainer.innerHTML = "";

    if (result.success && result.data.length > 0) {
      // Crear y añadir cada card
      result.data.forEach(activity => {
        gridContainer.appendChild(createCard(activity, role));
      });
    } else {
      const message = role === 'organizador'
        ? '<p class="no-activities">No hay peticiones disponibles en este momento.</p>'
        : '<p class="no-activities">No hay actividades disponibles en este momento.</p>';
      gridContainer.innerHTML = message;
    }
  } catch (error) {
    console.error('Error al cargar actividades:', error);
    gridContainer.innerHTML = '<p class="error">Error al cargar las actividades.</p>';
  }
}

// ============================
// Función para crear una card de actividad
// ============================
function createCard(activity, role) {
  const modal = document.getElementById("activityModal");
  const modalBody = modal?.querySelector(".modal-body");
  const modalClose = modal?.querySelector(".modal-close");

  const card = document.createElement("article");
  card.className = "activity activity-card";

  const isActive = true;
  const contentClass = isActive ? "activity-content" : "activity-content desactivate";

  // Formato de fecha
  let formattedDate = "";
  if (activity.date) {
    const date = new Date(activity.date);
    formattedDate = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  // Imagen y etiquetas
  const imageUrl = activity.image_url || 'assets/img/default-activity.jpg';
  const imgHTML = `<img src="${imageUrl}" alt="${activity.alt || activity.title}" onerror="this.src='assets/img/default-activity.jpg'">`;
  const tagHTML = activity.label ? `<div class="tag ${activity.labelClass || ''}">${activity.label}</div>` : "";
  const detailsHTML = activity.details?.length ? `<ul class="details">${activity.details.map(d => `<li>${d}</li>`).join("")}</ul>` : "";

  // Meta info (fecha, ubicación, precio)
  const metaHTML = `
    <div class="activity-meta">
      ${formattedDate ? `<span><i class="fas fa-calendar-alt"></i> ${formattedDate}</span>` : ""}
      ${activity.location ? `<span><i class="fas fa-map-marker-alt"></i> ${activity.location}</span>` : ""}
      ${activity.price ? `<span><i class="fas fa-euro-sign"></i> ${activity.price}</span>` : ""}
    </div>
  `;

  // Footer (organizador y participantes)
  const footerHTML = `
    <div class="activity-footer">
      ${activity.offertant_name ? `<span class="organizer"><i class="fas fa-user"></i> ${activity.offertant_name}</span>` : ""}
      ${activity.current_registrations != null && activity.max_people != null
      ? `<span class="participants"><i class="fas fa-users"></i> ${activity.current_registrations}/${activity.max_people}</span>`
      : ""}
    </div>
  `;

  // Construcción de la card
  card.innerHTML = `
    <div class="activity-image">${imgHTML}${tagHTML}</div>
    <div class="${contentClass}">
      ${activity.category_name ? `<span class="category">${activity.category_name}</span>` : ""}
      <h3>${activity.title}</h3>
      <p class="description">${activity.description}</p>
      ${detailsHTML}${metaHTML}${footerHTML}
      <div class="actions">
        <button class="btn-detail" data-id="${activity.id}">Ver Detalles</button>
        <button class="btn-signup" data-id="${activity.id}" ${!isActive ? "disabled" : ""}>
          ${role === 'organizador' ? 'Aceptar' : 'Inscribirse'}
        </button>
      </div>
    </div>
  `;

  // ============================
  // Eventos de la card
  // ============================
  card.querySelector(".btn-detail")?.addEventListener("click", () => {
    if (modal && modalBody) openModal(activity, modalBody, modal);
  });

  card.querySelector(".btn-signup")?.addEventListener("click", () => {
    console.log("Inscripción en:", activity.id);
  });

  // Cerrar modal
  modalClose?.addEventListener("click", () => { modal.style.display = "none"; });
  modal?.addEventListener("click", (e) => { if (e.target === modal) modal.style.display = "none"; });

  return card;
}

// ============================
// Función para abrir el modal
// ============================
function openModal(activity) {
  const modal = document.getElementById("activityModal");
  const modalTitle = modal.querySelector(".modal-title");
  const modalCategory = modal.querySelector(".category");
  const modalImage = modal.querySelector(".modal-image");
  const modalDescription = modal.querySelector(".modal-description");
  const modalInfo = modal.querySelector(".modal-info");
  const modalInfoAditional =modal.querySelector(".modal-info-aditional");

  // Cabecera
  modalTitle.textContent = activity.title;
  modalCategory.textContent = activity.category_name || '';

  // Imagen
  modalImage.innerHTML = `<img src="${activity.image_url || 'assets/img/default-activity.jpg'}" alt="${activity.title}">`;

  // Descripción
  modalDescription.innerHTML = `
  <h3><i class="fas fa-circle-info"></i> Descripción</h3>
  <p>${activity.description || 'Sin descripción.'}</p>`;

  // Información principal
modalInfo.innerHTML = `
  <h3>Información Principal</h3>
  <p><span class="title"><i class="fas fa-calendar-day"></i> <strong>Fecha</strong></span> ${activity.date || 'No disponible'}</p>
  <p><span class="title"><i class="fas fa-clock"></i> <strong>Hora</strong></span> ${activity.time || 'No disponible'}</p>
  <p><span class="title"><i class="fas fa-location-dot"></i> <strong>Ubicación</strong></span> ${activity.location || 'No disponible'}</p>
  <p><span class="title"><i class="fas fa-stopwatch"></i> <strong>Duración</strong></span> ${activity.duration || 'No disponible'}</p>
  <p><span class="title"><i class="fas fa-users"></i> <strong>Participantes</strong></span> ${activity.current_registrations || 0}/${activity.max_people || '-'}</p>
  <p><span class="title"><i class="fas fa-euro-sign"></i> <strong>Precio</strong></span> ${activity.price || 'Gratis'}</p>
  <p><span class="title"><i class="fas fa-user"></i> <strong>Organizador</strong></span> ${activity.offertant_name || 'No disponible'}</p>
`;

modalInfoAditional.innerHTML = `
  <h3>Información Adicional</h3>
  <p><span class="title"><i class="fas fa-car"></i> <strong>${activity.transport_included ? 'Transporte incluido' : 'Transporte no incluido'}</strong></span></p>
  <p><span class="title"><i class="fas fa-language"></i> <strong>Idioma</strong></span> ${activity.language || 'No disponible'}</p>
  <p><span class="title"><i class="fas fa-plus"></i> <strong>Edad recomendada</strong></span> ${activity.min_age || 'No disponible'} ${activity.min_age == 1 ? 'año' : 'años'}</p>
  <p><span class="title"><i class="fas fa-location-dot"></i> <strong>Ciudad de partida</strong></span> ${activity.departure_city || 'No disponible'}</p>
  <p><span class="title"><i class="fas fa-paw"></i> <strong>${activity.pets_allowed ? 'Mascotas permitidas' : 'Mascotas no permitidas'}</strong></span></p>
  <p><span class="title"><i class="fas fa-tshirt"></i> <strong>Código de vestimenta</strong></span> ${activity.dress_code || 'No disponible'}</p> 
`;

  modal.style.display = "flex";

  // Cerrar modal
  modal.querySelector(".modal-close").onclick = () => modal.style.display = "none";
  modal.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };
}
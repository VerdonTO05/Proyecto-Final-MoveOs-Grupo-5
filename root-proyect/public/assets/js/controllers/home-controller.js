let publications = [];
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

  const filterInput = document.getElementById("filterInput");

  if (filterInput) {
    filterInput.addEventListener("input", applyFilters);
    filterInput.addEventListener("change", applyFilters);
  }
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

    if (result.success) {

      publications = result.data || [];

      renderPublications(publications, role);
      // Crear y añadir cada card
      // result.data.forEach(activity => {
      //   gridContainer.appendChild(createCard(activity, role));
      // });
    }
    //  else {
    //   const message = role === 'organizador'
    //     ? '<p class="no-activities">No hay peticiones disponibles en este momento.</p>'
    //     : '<p class="no-activities">No hay actividades disponibles en este momento.</p>';
    //   gridContainer.innerHTML = message;
    // }
  } catch (error) {
    gridContainer.innerHTML = '<p class="error">Error al cargar las actividades.</p>';
  }
}

function renderPublications(publications, role) {
  const gridContainer = document.getElementById('gridActivities');

  gridContainer.innerHTML = '';

  if (publications.length === 0) {
    const message = role === 'organizador'
      ? '<p class="no-activities">No hay peticiones disponibles en este momento.</p>'
      : '<p class="no-activities">No hay actividades disponibles en este momento.</p>';
    gridContainer.innerHTML = message;
  } else {
    publications.forEach(activity => {
      gridContainer.appendChild(createCard(activity, role));
    });
  }
}

function applyFilters() {

  const type = document.getElementById("filterType")?.value;
  const value = document.getElementById("filterValue")?.value?.toLowerCase() || "";

  if (!type) return;

  const publicationsFilter = publications.filter(a => matchFilter(a, type, value));

  renderPublications(publicationsFilter);
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
    if (modal && modalBody) openModal(activity, role, modalBody, modal);
  });

  const signupBtn = card.querySelector(".btn-signup");

  signupBtn?.addEventListener("click", async () => {

    const id_activity = signupBtn.dataset.id;
    const activityCard = signupBtn.closest('.activity-card');

    const actionText = role === 'organizador'
      ? 'aceptar esta actividad'
      : 'inscribirte en esta actividad';

    const confirmed = await showConfirm({
      title: role === 'organizador' ? '¿Aceptar esta actividad?' : '¿Inscribirse a esta actividad?',
      message: `Estás a punto de ${actionText}.`
    });

    if (!confirmed) return;

    signupBtn.disabled = true;

    try {

      const response = await fetch('index.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accion: role === 'organizador' ? 'acceptRequest' : 'signupActivity',
          id_activity,
        })
      });

      const result = await response.json();

      if (result.success) {

        showAlert(
          role === 'organizador' ? 'Actividad aceptada' : 'Inscripción realizada',
          result.message,
          'success'
        );

        if (role === 'organizador') {
          // eliminar card (solo organizador)
          if (activityCard) {
            activityCard.style.transition = 'opacity 0.3s, transform 0.3s';
            activityCard.style.opacity = '0';
            activityCard.style.transform = 'scale(0.9)';

            setTimeout(() => {
              activityCard.remove();
            }, 300);
          }
        } else {
          // usuario inscrito → cambiar botón
          signupBtn.textContent = "Inscrito";
          signupBtn.disabled = true;
        }
      }
    } catch (error) {
      console.error(error);
      showAlert('Error', 'Ocurrió un error al realizar la acción.', 'error');
      signupBtn.disabled = false;
      signupBtn.textContent = role === 'organizador' ? 'Aceptar' : 'Inscribirse';
    }
  });
  return card;
}
// ============================
// Función para abrir el modal
// ============================
function openModal(activity, role) {
  const modal = document.getElementById("activityModal");
  const modalTitle = modal.querySelector(".modal-title");
  const modalCategory = modal.querySelector(".category");
  const modalImage = modal.querySelector(".modal-image");
  const modalDescription = modal.querySelector(".modal-description");
  const modalInfo = modal.querySelector(".modal-info");
  const modalInfoAditional = modal.querySelector(".modal-info-aditional");

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
  ${role !== 'organizador' ? `<p><span class="title"><i class="fas fa-users"></i> <strong>Participantes</strong></span> ${activity.current_registrations || 0}/${activity.max_people || '-'}</p>` : ''} 
  ${role !== 'organizador' ? `<p><span class="title"><i class="fas fa-euro-sign"></i> <strong>Precio</strong></span>${activity.price || "Gratis"}</p>` : ''}
  <p><span class="title"><i class="fas fa-user"></i> <strong>${role != 'organizador' ? 'Organizador' : 'Participante'}</strong></span>${activity.organizer_email || 'No disponible'}</p>
`;

  modalInfoAditional.innerHTML = `
  <h3>Información Adicional</h3>
  <p><span class="title"><i class="fas fa-car"></i> <strong>${activity.transport_included ? 'Transporte incluido' : 'Transporte no incluido'}</strong></span></p>
  <p><span class="title"><i class="fas fa-language"></i> <strong>Idioma</strong></span> ${activity.language || 'No disponible'}</p>
  ${role !== 'organizador' ? `<p><span class='title'><i class='fas fa-plus'></i> <strong>Edad recomendada</strong></span> ${activity.min_age || '0'} ${activity.min_age == 1 ? 'año' : 'años'}</p>` : ''}  <p><span class="title"><i class="fas fa-location-dot"></i> <strong>Ciudad de partida</strong></span> ${activity.departure_city || activity.location}</p>
  <p><span class="title"><i class="fas fa-paw"></i> <strong>${activity.pets_allowed ? 'Mascotas permitidas' : 'Mascotas no permitidas'}</strong></span></p>
  <p><span class="title"><i class="fas fa-tshirt"></i> <strong>Código de vestimenta</strong></span> ${activity.dress_code || 'No disponible'}</p> 
`;

  modal.style.display = "flex";

  // Cerrar modal
  modal.querySelector(".modal-close").onclick = () => modal.style.display = "none";
  modal.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };
}


function showConfirm({ title, message }) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.id = 'modal-container';
    overlay.classList.add('active');

    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
            <div class="modal-header">${title}</div>
            <div class="modal-body">${message}</div>
            <div class="modal-actions">
                <button class="confirm">Aceptar</button>
                <button class="cancel">Cancelar</button>
            </div>
        `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const closeModal = () => {
      modal.style.animation = 'fadeOut 0.25s forwards';
      overlay.classList.remove('active');
      setTimeout(() => document.body.removeChild(overlay), 250);
    };

    modal.querySelector('.confirm').addEventListener('click', () => { resolve(true); closeModal(); });
    modal.querySelector('.cancel').addEventListener('click', () => { resolve(false); closeModal(); });
  });
}


function showAlert(title, message, type = 'info', duration = 3000) {
  const overlay = document.createElement('div');
  overlay.classList.add('alert-overlay', type);

  const alertBox = document.createElement('div');
  alertBox.classList.add('alert-box');
  alertBox.innerHTML = `
        <div class="alert-header">${title}</div>
        <div class="alert-body">${message}</div>
        <button class="alert-close">&times;</button>
    `;

  overlay.appendChild(alertBox);
  document.body.appendChild(overlay);

  const closeAlert = () => {
    alertBox.style.animation = 'fadeOut 0.3s forwards';
    overlay.classList.remove('active');
    setTimeout(() => document.body.removeChild(overlay), 300);
  };

  alertBox.querySelector('.alert-close').addEventListener('click', closeAlert);
  setTimeout(closeAlert, duration);

  requestAnimationFrame(() => {
    overlay.classList.add('active');
    alertBox.style.animation = 'fadeIn 0.3s forwards';
  });
}
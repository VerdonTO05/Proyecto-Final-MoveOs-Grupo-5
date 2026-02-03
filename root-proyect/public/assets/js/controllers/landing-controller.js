document.addEventListener("DOMContentLoaded", () => {

  // --- 1. LÓGICA DEL VIDEO PERSONALIZADO ---
  const video = document.getElementById('miVideo');
  const btnPlayPause = document.getElementById('btnPlayPause');
  const barra = document.getElementById('barraProgreso');

  if (video && btnPlayPause && barra) {
    // Control de Reproducción / Pausa
    btnPlayPause.addEventListener('click', () => {
      if (video.paused) {
        video.play();
        btnPlayPause.innerHTML = '<i class="fas fa-pause"></i> Pausar';
      } else {
        video.pause();
        btnPlayPause.innerHTML = '<i class="fas fa-play"></i> Reproducir';
      }
    });

    // Actualizar barra según avance el video
    video.addEventListener('timeupdate', () => {
      if (!isNaN(video.duration)) {
        const porcentaje = (video.currentTime / video.duration) * 100;
        barra.value = porcentaje;
      }
    });

    // Buscar posición en el video al mover la barra
    barra.addEventListener('input', () => {
      const tiempo = (barra.value * video.duration) / 100;
      video.currentTime = tiempo;
    });
  }

  // --- 2. GESTIÓN DE ACTIVIDADES Y NAVEGACIÓN ---
  loadActivities();

  const currentUser = sessionStorage.getItem('username');
  const buttonExplore = document.getElementById("button-explore");
  const buttonPost = document.getElementById("button-post");

  if (buttonExplore) {
    buttonExplore.addEventListener("click", () => {
      if (!currentUser) {
        alert("Debes iniciar sesión o registrarte para explorar.");
        window.location.href = "index.php?accion=loginView";
      } else {
        window.location.href = "index.php?accion=seeActivities";
      }
    });
  }

  if (buttonPost) {
    buttonPost.addEventListener("click", () => {
      if (!currentUser) {
        alert("Debes iniciar sesión o registrarte para crear.");
        window.location.href = "index.php?accion=loginView";
      } else {
        window.location.href = 'create-activity.php';
      }
    });
  }

  // Menú hamburguesa
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("header nav");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      nav.classList.toggle("open");
      toggle.innerHTML = nav.classList.contains("open")
        ? '<i class="fa-solid fa-xmark"></i>'
        : '<i class="fa-solid fa-bars"></i>';
    });
  }
});

// --- 3. FUNCIONES DE CARGA (FETCH) ---
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

// --- 4. CREADOR DE COMPONENTES ---
function createActivityCard(activity) {
  const card = document.createElement("article");
  card.className = "activity activity-card";

  const isActive = true;
  const contentClass = isActive ? "activity-content" : "activity-content desactivate";

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

  card.querySelector(".btn-detail")?.addEventListener("click", () => {
    console.log("Detalles de:", activity.id);
  });

  card.querySelector(".btn-signup")?.addEventListener("click", () => {
    console.log("Inscripción en:", activity.id);
  });

  return card;
}

document.addEventListener("DOMContentLoaded", () => {
    // Cargar actividades aprobadas
    loadActivities();

    const currentUser = sessionStorage.getItem('username');
    const buttonExplore = document.getElementById("button-explore");
    const buttonPost = document.getElementById("button-post");

    // Si pulsa el botón de Explorar actividades
    if (buttonExplore) {
        buttonExplore.addEventListener("click", () => {
            if (!currentUser) {
                alert("Debes iniciar sesión o registrarte para explorar.");
                window.location.href = "index.php?accion=loginView";
            }else{
                window.location.href = "index.php?accion=seeActivities";
            }
        });
    }

    // Publicar actividad
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

    // Botón hamburguesa
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

// Función para cargar actividades desde el servidor
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

// Función para crear una tarjeta de actividad

function createActivityCard(activity) {
  const card = document.createElement("article"); // Usamos article para semántica
  card.className = "activity activity-card";

  const isActive = true; // Determina si está activo por modificar
  const contentClass = isActive ? "activity-content" : "activity-content desactivate";

  // Fecha formateada
  let formattedDate = "";
  if (activity.date) {
    const date = new Date(activity.date);
    formattedDate = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  // Imagen
  const imageUrl = activity.image_url || 'assets/img/default-activity.jpg';
  const imgHTML = `<img src="${imageUrl}" alt="${activity.alt || activity.title}" onerror="this.src='assets/img/default-activity.jpg'">`;

  // Tag
  const tagHTML = activity.label ? `<div class="tag ${activity.labelClass || ''}">${activity.label}</div>` : "";

  // Detalles
  const detailsHTML = activity.details?.length
    ? `<ul class="details">${activity.details.map(d => `<li>${d}</li>`).join("")}</ul>`
    : "";

  // Precio
  const priceHTML = activity.price ? `<div class="price">${activity.price}${activity.price ? "€" : ""}</div>` : "";

  // Meta información (fecha, ubicación, etc.)
  const metaHTML = `
    <div class="activity-meta">
      ${formattedDate ? `<span><i class="fas fa-calendar-alt"></i> ${formattedDate}</span>` : ""}
      ${activity.location ? `<span><i class="fas fa-map-marker-alt"></i> ${activity.location}</span>` : ""}
      ${activity.price ? `<span><i class="fas fa-euro-sign"></i> ${activity.price}€</span>` : ""}
    </div>
  `;

  // Footer (organizador, participantes)
  const footerHTML = `
    <div class="activity-footer">
      ${activity.offertant_name ? `<span class="organizer"><i class="fas fa-user"></i> ${activity.offertant_name}</span>` : ""}
      ${activity.current_registrations != null && activity.max_people != null
        ? `<span class="participants"><i class="fas fa-users"></i> ${activity.current_registrations}/${activity.max_people}</span>`
        : ""}
    </div>
  `;

  // HTML final de la tarjeta
  card.innerHTML = `
    <div class="activity-image">
      ${imgHTML}
      ${tagHTML}
    </div>

    <div class="${contentClass}">
      ${activity.category_name ? `<span class="category">${activity.category_name}</span>` : ""}
      <h3>${activity.title}</h3>
      <p class="description">${activity.description}</p>
      
      ${detailsHTML}
      ${metaHTML}
      ${priceHTML}
      ${footerHTML}

      <div class="actions">
        <button class="btn-detail" data-id="${activity.id}">Ver Detalles</button>
        <button class="btn-signup" data-id="${activity.id}" ${!isActive ? "disabled" : ""}>Inscribirse</button>
      </div>
    </div>
  `;

  // Eventos botones
  card.querySelector(".btn-detail")?.addEventListener("click", () => {
    if (typeof activity.loadDetails === "function") {
      activity.loadDetails(activity.id);
    } else {
      console.log("Ver detalles actividad", activity.id);
    }
  });

  card.querySelector(".btn-signup")?.addEventListener("click", () => {
    if (typeof activity.signup === "function") {
      activity.signup(activity.id);
    } else {
      console.log("Inscribirse actividad", activity.id);
    }
  });

  return card;
}




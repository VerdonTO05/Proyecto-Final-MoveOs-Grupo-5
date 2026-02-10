document.addEventListener("DOMContentLoaded", () => {
  if (!window.CURRENT_USER) {
    window.location.href = "index.php?accion=loginView";
    return;
  } else {
    role = CURRENT_USER.role;
  }

  loadPublications(role);
});

async function loadPublications(role) {
  const gridContainer = document.getElementById('users');
  if (!gridContainer) return;
  try {
    const response = await fetch('index.php?accion=getUsers');
    const text = await response.text();
    const result = JSON.parse(text);

    if (result.success && result.data.length > 0) {
      gridContainer.innerHTML = '';
      result.data.forEach(user => {
        gridContainer.appendChild(createCard(user));
      });
    } else {
      $message = '<p class="no-activities">No hay usuarios registrados en este momento.</p>';
      gridContainer.innerHTML = $message;
    }
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
    gridContainer.innerHTML = '<p class="error">Error al cargar los usuarios.</p>';
  }
}

//Crear card de usuario

// function createCard(user) {
//   const card = document.createElement("article");
//   card.className = "activity activity-card";

//   const isActive = true;
//   const contentClass = isActive ? "activity-content" : "activity-content desactivate";

//   let formattedDate = "";
//   if (publication.date) {
//     const date = new Date(publication.date);
//     formattedDate = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
//   }

//   const imageUrl = publication.image_url || 'assets/img/default-activity.jpg';
//   const imgHTML = `<img src="${imageUrl}" alt="${publication.alt || publication.title}" onerror="this.src='assets/img/default-activity.jpg'">`;
//   const tagHTML = publication.label ? `<div class="tag ${publication.labelClass || ''}">${publication.label}</div>` : "";
//   const detailsHTML = publication.details?.length ? `<ul class="details">${publication.details.map(d => `<li>${d}</li>`).join("")}</ul>` : "";

//   const metaHTML = `
//         <div class="activity-meta">
//             ${formattedDate ? `<span><i class="fas fa-calendar-alt"></i> ${formattedDate}</span>` : ""}
//             ${publication.location ? `<span><i class="fas fa-map-marker-alt"></i> ${publication.location}</span>` : ""}
//             ${publication.price ? `<span><i class="fas fa-euro-sign"></i> ${publication.price}€</span>` : ""}
//         </div>
//     `;

//   const footerHTML = `
//         <div class="activity-footer">
//             ${publication.offertant_name ? `<span class="organizer"><i class="fas fa-user"></i> ${publication.offertant_name}</span>` : ""}
//             ${publication.current_registrations != null && publication.max_people != null
//       ? `<span class="participants"><i class="fas fa-users"></i> ${publication.current_registrations}/${publication.max_people}</span>`
//       : ""}
//         </div>
//     `;

//   card.innerHTML = `
//         <div class="activity-image">${imgHTML}${tagHTML}</div>
//         <div class="${contentClass}">
//             ${publication.category_name ? `<span class="category">${publication.category_name}</span>` : ""}
//             <h3>${publication.title}</h3>
//             <p class="description">${publication.description}</p>
//             ${detailsHTML}${metaHTML}${footerHTML}
//             <div class="actions">
//                 <button class="btn-detail" data-id="${publication.id}">Ver Detalles</button>
//                 <button class="btn-signup" data-id="${publication.id}" ${!isActive ? "disabled" : ""}>${role == 'organizador' ? 'Aceptar' : 'Inscribirse' }</button>
//             </div>
//         </div>
//     `;

//   card.querySelector(".btn-detail")?.addEventListener("click", () => {
//     console.log("Detalles de:", publication.id);
//   });

//   card.querySelector(".btn-signup")?.addEventListener("click", () => {
//     console.log("Inscripción en:", publication.id);
//   });

//   return card;
// }
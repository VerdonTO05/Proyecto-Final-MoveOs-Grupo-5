// ============================================================
// home-controller.js
// ============================================================

let publications = [];

document.addEventListener("DOMContentLoaded", async () => {
  if (!window.CURRENT_USER) {
    await showAlert(
      'Acceso denegado',
      'Debes iniciar sesión o registrarte para explorar.',
      'warning',
      2500
    );
    if (window.openAuthModal) {
      openAuthModal('login');
    } else {
      window.location.href = "index.php?accion=loginView";
    }
    return;
  }

  loadPublications(CURRENT_USER.role);
  bindFilterListeners(applyFilters);
});

// ----------------------------
// Carga de datos
// ----------------------------
async function loadPublications(role) {
  const grid = document.getElementById('gridActivities');
  if (!grid) return;

  try {
    const result = await fetch('index.php?accion=getAprove').then(r => r.json());
    if (result.success) {
      publications = result.data || [];
      render(publications, role);
    }
  } catch (error) {
    grid.innerHTML = '<p class="error">Error al cargar las actividades.</p>';
  }
}

// ----------------------------
// Render
// ----------------------------
function render(items, role) {
  const grid = document.getElementById('gridActivities');
  grid.innerHTML = '';

  if (items.length === 0) {
    grid.innerHTML = role === 'organizador'
      ? '<p class="no-activities">No hay peticiones disponibles en este momento.</p>'
      : '<p class="no-activities">No hay actividades disponibles en este momento.</p>';
    return;
  }
  items.forEach(item => grid.appendChild(createCard(item, role)));
}

// ----------------------------
// Filtros
// ----------------------------
function applyFilters() {
  const { type, value } = getFilterValues();
  if (!type) return;

  const role = CURRENT_USER.role;
  render(publications.filter(a => matchFilter(a, type, value)), role);
}

// ----------------------------
// Card
// ----------------------------
function createCard(activity, role) {
  const card = document.createElement("article");
  card.className = "activity activity-card";

  card.innerHTML = `
    <div class="activity-image">${buildImageHTML(activity)}</div>
    <div class="activity-content">
        ${activity.category_name ? `<span class="category">${activity.category_name}</span>` : ""}
        <h3>${activity.title}</h3>
        <p class="description">${activity.description}</p>
        ${buildDetailsHTML(activity)}
        ${buildMetaHTML(activity)}
        ${buildFooterHTML(activity)}
        <div class="actions">
            <button class="btn-detail" data-id="${activity.id}">Ver Detalles</button>
            <button class="btn-signup" data-id="${activity.id}">
                ${role === 'organizador' ? 'Aceptar' : 'Inscribirse'}
            </button>
        </div>
    </div>`;

  const signupBtn = card.querySelector(".btn-signup");

  // Deshabilitar si el usuario ya está inscrito
  if (role !== 'organizador' && activity.enrolled_user_ids?.includes(CURRENT_USER.id)) {
    signupBtn.textContent = "Inscrito";
    signupBtn.disabled = true;
    signupBtn.classList.add("enrolled");
  }

  card.querySelector(".btn-detail")?.addEventListener("click", () => {
    openDetailModal(activity, role, CURRENT_USER);
  });

  signupBtn?.addEventListener("click", (e) => {
    handleSignup(e.currentTarget, activity, role, card);
  });

  return card;
}

// ----------------------------
// Acción de signup / aceptar
// ----------------------------
async function handleSignup(btn, activity, role, card) {
  const actionText = role === 'organizador' ? 'aceptar esta actividad' : 'inscribirte en esta actividad';

  const confirmed = await showConfirm({
    title: role === 'organizador' ? '¿Aceptar esta actividad?' : '¿Inscribirse a esta actividad?',
    message: `Estás a punto de ${actionText}.`
  });

  if (!confirmed) return;

  const signupBtn = card.querySelector(".btn-signup");
  signupBtn.disabled = true;

  // Verifica si el usuario ya está inscrito (antes de llamar al servidor)
  // enrolled_user_ids contiene ints (intval en PHP), CURRENT_USER.id es string → parseamos
  if (activity.enrolled_user_ids?.includes(parseInt(CURRENT_USER.id))) {
    signupBtn.textContent = "Inscrito";
    signupBtn.disabled = true;
    signupBtn.classList.add("enrolled");
    return; // No hace falta llamar al servidor
  }

  try {
    const response = await fetch('index.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accion: role === 'organizador' ? 'acceptRequest' : 'signupActivity',
        ...(role === 'organizador'
          ? { id_request: activity.id }
          : { id_activity: activity.id })
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
        card.style.transition = 'opacity 0.3s, transform 0.3s';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.9)';
        setTimeout(() => {
          card.remove();
          const grid = document.getElementById('gridActivities');
          if (grid && grid.querySelectorAll('.activity-card').length === 0) {
            grid.innerHTML = '<p class="no-activities">No hay peticiones disponibles en este momento.</p>';
          }
        }, 300);
      } else {
        // Participante: eliminar la tarjeta del grid (ya puede verse en "Mis actividades")
        card.style.transition = 'opacity 0.3s, transform 0.3s';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.9)';

        // Quitar del array local para que los filtros no la vuelvan a mostrar
        publications = publications.filter(p => p.id !== activity.id);

        setTimeout(() => {
          card.remove();
          const grid = document.getElementById('gridActivities');
          if (grid && grid.querySelectorAll('.activity-card').length === 0) {
            grid.innerHTML = '<p class="no-activities">No hay actividades disponibles en este momento.</p>';
          }
        }, 300);
      }
    } else {
      // Si el servidor dice ya inscrito, tratar como estado válido (no como error)
      if (result.message === 'Ya estás inscrito en esta actividad') {
        signupBtn.textContent = "Inscrito";
        signupBtn.disabled = true;
        signupBtn.classList.add("enrolled");
      } else {
        throw new Error(result.message || 'Error desconocido');
      }
    }
  } catch (error) {
    showAlert('Error', error, 'error');
    signupBtn.disabled = false;
    signupBtn.textContent = role === 'organizador' ? 'Aceptar' : 'Inscribirse';
  }
}
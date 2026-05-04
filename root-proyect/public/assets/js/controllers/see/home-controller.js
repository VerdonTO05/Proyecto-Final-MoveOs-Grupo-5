/**
 * Explorar
 * Maneja:
 * - Redirección o modal de login si el usuario no está autenticado
 * - Carga y refresco periódico de actividades y peticiones aprobadas
 * - Renderizado de tarjetas según el rol del usuario
 * - Filtrado de publicaciones por categoría u otros criterios
 * - Inscripción de participantes a actividades
 * - Aceptación de peticiones por parte de organizadores
 */

/** @type {Object[]} Caché local de publicaciones aprobadas cargadas desde el servidor */
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

  // Refresco automático cada 5 segundos para mantener el grid actualizado
  setInterval(() => {
    loadPublications(CURRENT_USER.role);
  }, 5000);
});

/**
 * Carga las publicaciones aprobadas desde el servidor y las renderiza si han cambiado.
 * Usa comparación por JSON para evitar re-renders innecesarios.
 *
 * @param {string} role - Rol del usuario actual ('organizador', 'participante', etc.)
 * @returns {Promise<void>}
 */
async function loadPublications(role) {
  const grid = document.getElementById('gridActivities');
  if (!grid) return;

  try {
    const result = await fetch('index.php?accion=getAprove').then(r => r.json());

    if (result.success) {
      const newData = result.data || [];

      // Solo re-renderizar si los datos han cambiado respecto a la caché local
      if (JSON.stringify(newData) !== JSON.stringify(publications)) {
        publications = newData;
        render(publications, role);
      }
    }
  } catch (error) {
    grid.innerHTML = '<p class="error">Error al cargar las actividades.</p>';
  }
}

/**
 * Renderiza la lista de publicaciones en el grid.
 * Muestra un mensaje diferente según el rol si no hay elementos.
 *
 * @param {Object[]} items - Lista de publicaciones a renderizar
 * @param {string}   role  - Rol del usuario actual
 */
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

/**
 * Aplica los filtros activos sobre la caché local y vuelve a renderizar el grid.
 */
function applyFilters() {
  const { type, value } = getFilterValues();
  if (!type) return;

  render(publications.filter(a => matchFilter(a, type, value)), CURRENT_USER.role);
}

/**
 * Crea la tarjeta DOM de una publicación con sus acciones según el rol del usuario.
 * Si el usuario ya está inscrito, deshabilita el botón de inscripción.
 *
 * @param {Object}   activity                      - Datos de la publicación
 * @param {number}   activity.id                   - ID único
 * @param {string}   activity.title                - Título         
 * @param {string}   [activity.category_name]      - Nombre de la categoría
 * @param {number[]} [activity.enrolled_user_ids]  - IDs de usuarios ya inscritos
 * @param {string}   role                          - Rol del usuario actual
 * @returns {HTMLElement} Tarjeta lista para insertar en el DOM
 */
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

  // Si el participante ya está inscrito, bloquear el botón sin necesidad de llamar al servidor
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

/**
 * Gestiona la inscripción de un participante o la aceptación de una petición por un organizador.
 * Muestra confirmación, llama al servidor y actualiza el DOM según el resultado.
 *
 * @param {HTMLElement} btn      - Botón que disparó la acción
 * @param {Object}      activity - Datos de la publicación
 * @param {string}      role     - Rol del usuario actual
 * @param {HTMLElement} card     - Tarjeta asociada a la publicación
 * @returns {Promise<void>}
 */
async function handleSignup(btn, activity, role, card) {
  const actionText = role === 'organizador'
    ? 'aceptar esta actividad'
    : 'inscribirte en esta actividad';

  const confirmed = await showConfirm({
    title: role === 'organizador' ? '¿Aceptar esta actividad?' : '¿Inscribirse a esta actividad?',
    message: `Estás a punto de ${actionText}.`,
    confirmText: role === 'organizador' ? 'Sí, aceptar' : 'Sí, inscribirme',
    cancelText: 'Cancelar'
  });

  if (!confirmed) return;

  const signupBtn = card.querySelector(".btn-signup");
  signupBtn.disabled = true;

  // Comprobar inscripción duplicada en local antes de llamar al servidor.
  // enrolled_user_ids contiene enteros (intval en PHP) y CURRENT_USER.id puede ser string → parseamos.
  if (activity.enrolled_user_ids?.includes(parseInt(CURRENT_USER.id))) {
    signupBtn.textContent = "Inscrito";
    signupBtn.classList.add("enrolled");
    return;
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

      // Animar y eliminar la tarjeta del grid tras la acción exitosa
      card.style.transition = 'opacity 0.3s, transform 0.3s';
      card.style.opacity = '0';
      card.style.transform = 'scale(0.9)';

      // Quitar de la caché local para que los filtros no la vuelvan a mostrar
      if (role !== 'organizador') {
        publications = publications.filter(p => p.id !== activity.id);
      }

      setTimeout(() => {
        card.remove();
        const grid = document.getElementById('gridActivities');
        if (grid && grid.querySelectorAll('.activity-card').length === 0) {
          grid.innerHTML = role === 'organizador'
            ? '<p class="no-activities">No hay peticiones disponibles en este momento.</p>'
            : '<p class="no-activities">No hay actividades disponibles en este momento.</p>';
        }
      }, 300);

    } else {
      // El servidor indica que el usuario ya estaba inscrito → tratar como estado válido
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
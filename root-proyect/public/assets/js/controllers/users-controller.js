document.addEventListener("DOMContentLoaded", () => {
  if (!window.CURRENT_USER) {
    window.location.href = "index.php?accion=loginView";
    return;
  } else {
    role = CURRENT_USER.role;
  }

  loadPublications();

});

async function loadPublications() {
  const gridContainer = document.getElementById('users');
  if (!gridContainer) return;
  try {
    const response = await fetch('index.php?accion=getUsers');
    const text = await response.text();
    const result = JSON.parse(text);

    if (result.success && result.data.length > 0) {
      gridContainer.innerHTML = '';
      result.data.forEach(user => {
        gridContainer.appendChild(createUserCard(user));
      });
    } else {
      $message = '<p class="no-activities">No hay usuarios registrados en este momento.</p>';
      gridContainer.innerHTML = $message;
    }
  } catch (error) {
    gridContainer.innerHTML = '<p class="error">Error al cargar los usuarios.</p>';
  }
}

//Crear card de usuario

/**
 * Crea una tarjeta de usuario con estructura tipo "CARD USER"
 * @param {Object} user - Datos del usuario
 * @param {string} user.username - Nombre de usuario
 * @param {string} user.role - Rol del usuario
 * @param {Object} user.vacData - Datos adicionales ("vac datos")
 * @param {boolean} user.active - Estado activo/desactivado
 * @param {string} [user.message] - Mensaje de alerta (opcional)
 * @returns {HTMLElement} Elemento artículo con la tarjeta de usuario
 */
function createUserCard(user) {
  const card = document.createElement('article');
  card.className = 'user-card';

  const isActive = user.active;
  const activeClass = isActive ? 'active' : 'inactive';

  card.innerHTML = `
    <header class="user-header">
      <div class="username-role">
        <h2 class="username">${user.username}</h2>
        <span class="role">${user.role}</span>
      </div>
      <button class="btn-toggle ${activeClass}">
        ${isActive ? 'Activo' : 'Desactivado'}
      </button>
    </header>

    <section class="vac-data">
      <h3>Vac Datos</h3>
      <pre>${JSON.stringify(user.vacData, null, 2)}</pre>
    </section>

    ${user.message ? `<section class="alert-message">${user.message}</section>` : ''}
  `;

  // Botón para activar/desactivar usuario
  card.querySelector('.btn-toggle').addEventListener('click', () => {
    card.classList.toggle('inactive');
    card.classList.toggle('active');
    const btn = card.querySelector('.btn-toggle');
    if (btn.textContent === 'Activo') {
      btn.textContent = 'Desactivado';
    } else {
      btn.textContent = 'Activo';
    }
  });

  return card;
}
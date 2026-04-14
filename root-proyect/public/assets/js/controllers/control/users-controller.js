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


function createUserCard(user) {
  const card = document.createElement('article');
  card.className = 'user-card';

  const isActive = user.state === 'activa';
  const activeClass = isActive ? 'active' : 'inactive';
  card.classList.add(activeClass);

  card.innerHTML = `
    <header class="user-header">
    <div class="username-role">
  <div class="user-avatar-wrapper">
    ${user.profile_image
      ? `<img src="${user.profile_image}" alt="${user.username}" onerror="this.parentElement.innerHTML='<div class=\\'user-avatar--placeholder\\'><i class=\\'fas fa-user\\'></i></div>'">`
      : `<div class="user-avatar--placeholder"><i class="fas fa-user"></i></div>`
    }
  </div>
  <div>
    <h2 class="username">${user.username}</h2>
    <span class="role">${user.role}</span>
  </div>
</div>
    <button class="btn-toggle">
      ${isActive ? 'Desactivar' : 'Activar'}
    </button>
  </header>

    <section class="vac-data">
      <h3>Información</h3>
      <p id="full_name"><b>Nombre completo:</b> ${user.full_name}</p>
      <p id="email"><b>Email:</b> ${user.email}</p>
      <p id="created_at"><b>Fecha de registro:</b> ${user.created_at}</p>
    </section>

    <section class="buttons">
      <button class="btn btn-detail">Ver datos</button>
      <button class="btn btn-message">Chat</button>
    </section>

    ${user.message ? `<section class="alert-message">${user.message}</section>` : ''}
  `;

  // Botón activar/desactivar usuario
  const btnToggle = card.querySelector('.btn-toggle');
  btnToggle.addEventListener('click', async () => {
    const currentlyActive = card.classList.contains('active');
    const newState = currentlyActive ? 'inactiva' : 'activa';
    const accion = currentlyActive ? 'desactivar' : 'activar';

    // Pedir mensaje al admin
    const adminMessage = await showPromptConfirm({
      title: `¿Quieres ${accion} a ${user.username}?`,
      message: `Puedes escribir un mensaje opcional para notificar al usuario:`,
      placeholder: `Motivo para ${accion} la cuenta...`,
      confirmText: accion.charAt(0).toUpperCase() + accion.slice(1),
      cancelText: 'Cancelar'
    });

    // Si se canceló (null), no hacer nada
    if (adminMessage === null) return;

    // Actualizar UI inmediatamente
    if (currentlyActive) {
      card.classList.replace('active', 'inactive');
      btnToggle.textContent = 'Activar';
    } else {
      card.classList.replace('inactive', 'active');
      btnToggle.textContent = 'Desactivar';
    }

    try {
      const response = await fetch(`index.php?accion=toggleUser&id=${user.id}&state=${newState}`);
      const result = await response.json();

      if (result.success) {
        user.state = newState;

        // Enviar email con el mensaje
        await fetch(`index.php?accion=notifyUser&id=${user.id}&state=${newState}&message=${encodeURIComponent(adminMessage)}`);

      } else {
        // Revertir UI
        if (currentlyActive) {
          card.classList.replace('inactive', 'active');
          btnToggle.textContent = 'Desactivar';
        } else {
          card.classList.replace('active', 'inactive');
          btnToggle.textContent = 'Activar';
        }
        showAlert({ title: 'Error', message: 'No se pudo cambiar el estado del usuario' });
      }
    } catch (error) {
      if (currentlyActive) {
        card.classList.replace('inactive', 'active');
        btnToggle.textContent = 'Desactivar';
      } else {
        card.classList.replace('active', 'inactive');
        btnToggle.textContent = 'Activar';
      }
      showAlert({ title: 'Error', message: 'Error de conexión al cambiar el estado' });
    }
  });

  // Botón ver/ocultar datos
  const btnEdit = card.querySelector('.btn-detail');
  const vacData = card.querySelector('.vac-data');

  btnEdit.addEventListener('click', () => {
    const currentDisplay = window.getComputedStyle(vacData).display;
    if (currentDisplay === 'none') {
      vacData.style.display = 'block';
      btnEdit.textContent = 'Ocultar datos';
    } else {
      vacData.style.display = 'none';
      btnEdit.textContent = 'Ver datos';
    }
  });

  // Botón Chat — el admin inicia conversación con ese usuario
  const btnMessage = card.querySelector('.btn-message');
  if (btnMessage) {
    btnMessage.addEventListener('click', () => {
      window.location.href = `index.php?accion=adminChat&user_id=${user.id}`;
    });
  }

  return card;
}
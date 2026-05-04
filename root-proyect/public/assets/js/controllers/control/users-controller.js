/**
 * Control de usuarios
 * Maneja:
 * - Redirección si el usuario no está autenticado
 * - Carga y renderizado de tarjetas de usuario
 * - Activación y desactivación de cuentas con mensaje opcional
 * - Notificación por email al usuario afectado
 * - Navegación al chat directo con un usuario desde la tarjeta
 */

document.addEventListener("DOMContentLoaded", () => {
    if (!window.CURRENT_USER) {
        window.location.href = "index.php?accion=loginView";
        return;
    } else {
        role = CURRENT_USER.role;
    }

    loadPublications();
});

/**
 * Carga la lista de usuarios desde el servidor y la renderiza en el grid.
 * Si no hay usuarios, muestra un mensaje informativo.
 *
 * @returns {Promise<void>}
 */
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
            gridContainer.innerHTML = '<p class="no-activities">No hay usuarios registrados en este momento.</p>';
        }
    } catch (error) {
        gridContainer.innerHTML = '<p class="error">Error al cargar los usuarios.</p>';
    }
}

/**
 * Crea la tarjeta DOM de un usuario con sus acciones de administración.
 *
 * @param {Object}      user               - Datos del usuario
 * @param {number}      user.id            - ID único del usuario
 * @param {string}      user.username      - Nombre de usuario
 * @param {string}      user.full_name     - Nombre completo
 * @param {string}      user.email         - Correo electrónico
 * @param {string}      user.role          - Rol asignado ('administrador', 'participante', etc.)
 * @param {string}      user.state         - Estado de la cuenta: 'activa' o 'inactiva'
 * @param {string}      user.created_at    - Fecha de registro
 * @param {string|null} user.profile_image - URL de la imagen de perfil, o null
 * @param {string|null} user.message       - Mensaje de alerta asociado, o null
 * @returns {HTMLElement} Tarjeta lista para insertar en el DOM
 */
function createUserCard(user) {
    const card = document.createElement('article');
    card.className = 'user-card';

    const isActive = user.state === 'activa';
    card.classList.add(isActive ? 'active' : 'inactive');

    card.innerHTML = `
    <header class="user-header">
      <div class="username-role">
        <div class="user-avatar-wrapper">
          ${user.profile_image
            ? `<img src="${user.profile_image}" alt="${user.username}"
                 onerror="this.parentElement.innerHTML='<div class=\\'user-avatar--placeholder\\'><i class=\\'fas fa-user\\'></i></div>'">`
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

    // Botón activar / desactivar 
    const btnToggle = card.querySelector('.btn-toggle');

    btnToggle.addEventListener('click', async () => {
        const currentlyActive = card.classList.contains('active');
        const newState = currentlyActive ? 'inactiva' : 'activa';
        const accion = currentlyActive ? 'desactivar' : 'activar';

        // Solicitar al admin un mensaje opcional para notificar al usuario
        const adminMessage = await showPromptConfirm({
            title: `¿Quieres ${accion} a ${user.username}?`,
            message: `Puedes escribir un mensaje opcional para notificar al usuario:`,
            placeholder: `Motivo para ${accion} la cuenta...`,
            confirmText: accion.charAt(0).toUpperCase() + accion.slice(1),
            cancelText: 'Cancelar'
        });

        // El admin canceló el diálogo → no hacer nada
        if (adminMessage === null) return;

        // Actualizar la UI de forma optimista antes de confirmar con el servidor
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

                // Notificar al usuario por email con el mensaje del admin
                await fetch(`index.php?accion=notifyUser&id=${user.id}&state=${newState}&message=${encodeURIComponent(adminMessage)}`);
            } else {
                // El servidor rechazó el cambio → revertir la UI
                if (currentlyActive) {
                    card.classList.replace('inactive', 'active');
                    btnToggle.textContent = 'Desactivar';
                } else {
                    card.classList.replace('active', 'inactive');
                    btnToggle.textContent = 'Activar';
                }
                showAlert('Error', 'No se pudo cambiar el estado del usuario', 'error');
            }
        } catch (error) {
            // Error de red → revertir la UI
            if (currentlyActive) {
                card.classList.replace('inactive', 'active');
                btnToggle.textContent = 'Desactivar';
            } else {
                card.classList.replace('active', 'inactive');
                btnToggle.textContent = 'Activar';
            }
            showAlert('Error', 'Error de conexión al cambiar el estado', 'error');
        }
    });

    // Botón ver / ocultar datos
    const btnEdit = card.querySelector('.btn-detail');
    const vacData = card.querySelector('.vac-data');

    btnEdit.addEventListener('click', () => {
        const isHidden = window.getComputedStyle(vacData).display === 'none';
        vacData.style.display = isHidden ? 'block' : 'none';
        btnEdit.textContent = isHidden ? 'Ocultar datos' : 'Ver datos';
    });

    // Botón chat
    const btnMessage = card.querySelector('.btn-message');
    if (btnMessage) {
        btnMessage.addEventListener('click', () => {
            window.location.href = `index.php?accion=adminChat&user_id=${user.id}`;
        });
    }

    return card;
}
document.addEventListener("DOMContentLoaded", () => {
    // Cargar actividades aprobadas
    loadActivities();

    const currentUser = sessionStorage.getItem('username');
    const rol = sessionStorage.getItem('role');
    const buttonExplore = document.getElementById("button-explore");
    const buttonPost = document.getElementById("button-post");

    // Si pulsa el botón de Explorar actividades
    if (buttonExplore) {
        buttonExplore.addEventListener("click", () => {
            if (!currentUser) {
                alert("Debes iniciar sesión o registrarte para explorar.");
                window.location.href = "login.php";
            }else{
                window.location.href = "home.php";
            }
        });
    }

    // Publicar actividad
    if (buttonPost) {
        buttonPost.addEventListener("click", () => {
            if (!currentUser) {
                alert("Debes iniciar sesión o registrarte para crear.");
                window.location.href = "login.php";
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
        const response = await fetch('../../app/controllers/get-activities.php');
        const result = await response.json();

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
    const card = document.createElement('div');
    card.className = 'activity-card';

    const imageUrl = activity.image_url || '../../public/assets/img/default-activity.jpg';
    const date = new Date(activity.date);
    const formattedDate = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

    card.innerHTML = `
        <img src="${imageUrl}" alt="${activity.title}" onerror="this.src='../../public/assets/img/default-activity.jpg'">
        <div class="activity-content">
            <span class="category">${activity.category_name}</span>
            <h3>${activity.title}</h3>
            <p class="description">${activity.description}</p>
            <div class="activity-meta">
                <span><i class="fas fa-calendar-alt"></i> ${formattedDate}</span>
                <span><i class="fas fa-map-marker-alt"></i> ${activity.location}</span>
                ${activity.price ? `<span><i class="fas fa-euro-sign"></i> ${activity.price}€</span>` : ''}
            </div>
            <div class="activity-footer">
                <span class="organizer"><i class="fas fa-user"></i> ${activity.offertant_name}</span>
                <span class="participants"><i class="fas fa-users"></i> ${activity.current_registrations}/${activity.max_people}</span>
            </div>
        </div>
    `;

    return card;
}

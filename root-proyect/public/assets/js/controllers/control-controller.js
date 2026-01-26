
document.addEventListener("DOMContentLoaded", () => {
    const activitiesContainer = document.querySelector(".activities");
    if (!activitiesContainer) return;

    activitiesContainer.addEventListener("click", (e) => {

        const approveBtn = e.target.closest(".btn-approve");
        const rejectBtn = e.target.closest(".btn-reject");

        // Boton aprobar
        if (approveBtn) {
            const id = approveBtn.dataset.id;

            showConfirm({
                title: '¿Aprobar actividad?',
                message: 'Estás a punto de aprobar esta actividad.',
                onConfirm: () => {
                    console.log(`Actividad ${id} aprobada`);

                    showAlert({
                        title: 'Aprobada',
                        message: 'La actividad se aprobó correctamente'
                    });

                    // Aceptar actividad bbdd
                    // actualizar en la interfaz
                }
            });
        }

        // Boton rechazar
        if (rejectBtn) {
            const id = rejectBtn.dataset.id;

            showConfirm({
                title: '¿Rechazar actividad?',
                message: 'Estás a punto de rechazar esta actividad.',
                onConfirm: () => {
                    console.log(`Actividad ${id} rechazada`);

                    showAlert({
                        title: 'Rechazada',
                        message: 'La actividad fue rechazada'
                    });

                    // Rechazar actividad bbdd
                    // actualizar
                }
            });
        }
    });

    // Cambiar de actividades a peticiones
    const tabButtons = document.querySelectorAll(".tab-btn.control");

    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            tabButtons.forEach(b => b.classList.remove("active")); // Quitar active a todos
            btn.classList.add("active"); // Activar solo el pulsado

            //Al cambiar, se debe pedir al servidor las peticiones/actividades por aceptar si hay y 
            //si no mostrar que no se encuentran peticiones/actividades por aceptar actualmente (vacío)

        });
    });

});


//Probar a crear las funciones en un documento global 
function showConfirm({ title, message, onConfirm, onCancel }) {
    // Crear overlay
    const overlay = document.createElement('div');
    overlay.classList.add('custom-confirm-overlay');

    // Crear caja del modal
    const modal = document.createElement('div');
    modal.classList.add('custom-confirm-modal');

    modal.innerHTML = `
        <h2 class="custom-confirm-title">${title}</h2>
        <p class="custom-confirm-message">${message}</p>
        <div class="custom-confirm-buttons">
            <button class="custom-confirm-btn confirm">Aceptar</button>
            <button class="custom-confirm-btn cancel">Cancelar</button>
        </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Botones
    modal.querySelector('.confirm').addEventListener('click', () => {
        if (onConfirm) onConfirm();
        document.body.removeChild(overlay);
    });

    modal.querySelector('.cancel').addEventListener('click', () => {
        if (onCancel) onCancel?.();
        document.body.removeChild(overlay);
    });
}







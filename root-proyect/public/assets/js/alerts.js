document.addEventListener("DOMContentLoaded", () => {
    const modalContainer = document.getElementById("modal-container");

    window.showConfirm = function({ title = "Confirmar", message = "", onConfirm }) {
        if (!modalContainer) return;

        const modal = document.createElement("div");
        modal.className = "modal";

        modal.innerHTML = `
            <div class="modal-header">${title}</div>
            <div class="modal-body">${message}</div>
            <div class="modal-actions">
                <button class="cancel">Cancelar</button>
                <button class="confirm">Aprobar</button>
            </div>
        `;

        modalContainer.appendChild(modal);
        modalContainer.classList.add("active"); // activar fondo

        modal.querySelector(".cancel").addEventListener("click", () => closeModal(modal));
        modal.querySelector(".confirm").addEventListener("click", () => {
            if (onConfirm) onConfirm();
            closeModal(modal);
        });
    };

    function closeModal(modal) {
        modal.style.animation = "fadeOut 0.25s forwards";
        setTimeout(() => {
            modal.remove();
            modalContainer.classList.remove("active"); // quitar fondo
        }, 250);
    }
});

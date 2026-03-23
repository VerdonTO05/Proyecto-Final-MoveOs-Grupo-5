window.showAlert = function (title, message, type = 'info', duration = 3000) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.classList.add('alert-overlay', type);

    const alertBox = document.createElement('div');
    alertBox.classList.add('alert-box');
    alertBox.innerHTML = `
        <div class="alert-header">${title}</div>
        <div class="alert-body">${message}</div>
    `;

    overlay.appendChild(alertBox);
    document.body.appendChild(overlay);

    const closeAlert = () => {
      alertBox.style.animation = 'fadeOut 0.3s forwards';
      overlay.classList.remove('active');

      setTimeout(() => {
        document.body.removeChild(overlay);
        resolve(); // 👈 aquí se resuelve la promesa
      }, 300);
    };

    setTimeout(closeAlert, duration);

    requestAnimationFrame(() => {
      overlay.classList.add('active');
      alertBox.style.animation = 'fadeIn 0.3s forwards';
    });
  });
};

window.setupPasswordToggle = function (passwordInput, toggleButton) {
    const icon = toggleButton.querySelector("i");

    toggleButton.addEventListener("click", (e) => {
        e.preventDefault();

        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            icon.classList.remove("fa-eye");
            icon.classList.add("fa-eye-slash");
        } else {
            passwordInput.type = "password";
            icon.classList.remove("fa-eye-slash");
            icon.classList.add("fa-eye");
        }
    });
}

window.showConfirm = function (optionsOrTitle, message = "") {
    const options = typeof optionsOrTitle === "string"
        ? { title: optionsOrTitle, message }
        : optionsOrTitle;

    const { title = "Confirmar", message: msg = "", confirmText = "Aceptar", cancelText = "Cancelar" } = options;

    let modalContainer = document.getElementById("modal-container");
    if (!modalContainer) {
        modalContainer = document.createElement("div");
        modalContainer.id = "modal-container";
        document.body.appendChild(modalContainer);
    }

    return new Promise((resolve) => {
        const modal = document.createElement("div");
        modal.className = "modal";

        modal.innerHTML = `
            <div class="modal-header">${title}</div>
            <div class="modal-body">${msg}</div>
            <div class="modal-actions">
                <button class="cancel">${cancelText}</button>
                <button class="confirm">${confirmText}</button>
            </div>
        `;

        modalContainer.appendChild(modal);
        modalContainer.classList.add("active");

        const close = () => {
            modal.style.animation = "fadeOut 0.25s forwards";
            setTimeout(() => {
                modal.remove();
                modalContainer.classList.remove("active");
            }, 250);
        };

        modal.querySelector(".cancel").addEventListener("click", () => { close(); resolve(false); });
        modal.querySelector(".confirm").addEventListener("click", () => { close(); resolve(true); });
    });
};

window.openDetailModal = function (activity, role = null, currentUser, options = {}) {

    const showChat = options.showChat ?? false;

    // ── Eliminar modal previo siempre para evitar listeners duplicados ──
    const existing = document.getElementById("activityModal");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.id = "activityModal";
    modal.className = "modalHome";
    modal.innerHTML = `
        <div class="modal-content">
            <span class="modal-close">&times;</span>
            <div class="modal-header-activity">
                <h2 class="modal-title"></h2>
                <span class="category"></span>
            </div>
            <div class="modal-tabs">
                <button class="tab-btn active" data-tab="details">Detalles</button>
                ${showChat ? '<button class="tab-btn" data-tab="chat">Chat Grupal</button>' : ''}
            </div>
            <div class="modal-body">
                <div class="modal-image"></div>
                <div class="modal-description"></div>
                <div class="modal-info"></div>
                <div class="modal-info-aditional"></div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const isOrg    = role === 'organizador';
    const modalBody = modal.querySelector('.modal-body');

    // ── Renderizar detalles ──────────────────────────────────────────────
    function renderDetails() {
        modalBody.innerHTML = `
            <div class="modal-image"></div>
            <div class="modal-description"></div>
            <div class="modal-info"></div>
            <div class="modal-info-aditional"></div>
        `;

        modal.querySelector(".modal-title").textContent    = activity.title || '';
        modal.querySelector(".category").textContent       = activity.category_name || '';
        modal.querySelector(".modal-image").innerHTML      = `<img src="${activity.image_url || 'assets/img/default-activity.jpg'}" alt="${activity.title}">`;
        modal.querySelector(".modal-description").innerHTML = `<h3><i class="fas fa-circle-info"></i> Descripción</h3><p>${activity.description || 'Sin descripción.'}</p>`;
        modal.querySelector(".modal-info").innerHTML = `
            <h3>Información Principal</h3>
            <p><span class="title"><i class="fas fa-calendar-day"></i> <strong>Fecha</strong></span> ${activity.date || 'No disponible'}</p>
            <p><span class="title"><i class="fas fa-clock"></i> <strong>Hora</strong></span> ${activity.time || 'No disponible'}</p>
            <p><span class="title"><i class="fas fa-location-dot"></i> <strong>Ubicación</strong></span> ${activity.location || 'No disponible'}</p>
            <p><span class="title"><i class="fas fa-stopwatch"></i> <strong>Duración</strong></span> ${activity.duration || 'No disponible'}</p>
            ${!isOrg ? `<p><span class="title"><i class="fas fa-users"></i> <strong>Participantes</strong></span> ${activity.current_registrations || 0}/${activity.max_people || '-'}</p>` : ''}
            ${!isOrg ? `<p><span class="title"><i class="fas fa-euro-sign"></i> <strong>Precio</strong></span> ${activity.price || 'Gratis'}</p>` : ''}
            <p><span class="title"><i class="fas fa-user"></i> <strong>${!isOrg ? 'Organizador' : 'Participante'}</strong></span> ${activity.offertant_name || activity.organizer_email || 'No disponible'}</p>
        `;
        modal.querySelector(".modal-info-aditional").innerHTML = `
            <h3>Información Adicional</h3>
            <p><span class="title"><i class="fas fa-car"></i> <strong>${activity.transport_included ? 'Transporte incluido' : 'Transporte no incluido'}</strong></span></p>
            <p><span class="title"><i class="fas fa-language"></i> <strong>Idioma</strong></span> ${activity.language || 'No disponible'}</p>
            ${!isOrg ? `<p><span class="title"><i class="fas fa-plus"></i> <strong>Edad recomendada</strong></span> ${activity.min_age || 0} ${activity.min_age === 1 ? 'año' : 'años'}</p>` : ''}
            <p><span class="title"><i class="fas fa-location-dot"></i> <strong>Ciudad de partida</strong></span> ${activity.departure_city || activity.location || 'No disponible'}</p>
            <p><span class="title"><i class="fas fa-paw"></i> <strong>${activity.pets_allowed ? 'Mascotas permitidas' : 'Mascotas no permitidas'}</strong></span></p>
            <p><span class="title"><i class="fas fa-tshirt"></i> <strong>Código de vestimenta</strong></span> ${activity.dress_code || 'No disponible'}</p>
        `;
    }

    // ── Renderizar chat ──────────────────────────────────────────────────
    function renderChat() {
        modalBody.innerHTML = window.buildChatHTML(activity.title);

        window.CURRENT_USER    = currentUser;
        window.CHAT_ROOM_TYPE  = 'activity';
        window.CHAT_ROOM_ID    = activity.id;
        window.CHAT_ADMIN_MODE = false;

        if (window.initChatController) {
            window.initChatController();
        }
    }

    // ── Tabs (modal recién creado, sin listeners previos) ────────────────
    const tabs = modal.querySelectorAll('.modal-tabs .tab-btn');
    tabs.forEach(btn => {
        btn.addEventListener('click', () => {
            tabs.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (btn.dataset.tab === 'chat') {
                renderChat();
            } else {
                renderDetails();
            }
        });
    });

    // ── Mostrar y cerrar ─────────────────────────────────────────────────
    renderDetails();
    modal.style.display = 'flex';

    const closeModal = () => {
        if (typeof stopPolling === 'function') stopPolling();
        modal.remove();
    };

    modal.querySelector(".modal-close").onclick = closeModal;
    modal.onclick = (e) => { if (e.target === modal) closeModal(); };
};

window.initModalDetails = function (activity, role = null) {
    const modal = document.getElementById("activityModal");
    if (!modal) return;

    const titleEl    = modal.querySelector(".modal-title");
    const categoryEl = modal.querySelector(".category");
    const imageEl    = modal.querySelector(".modal-image");
    const descEl     = modal.querySelector(".modal-description");
    const infoEl     = modal.querySelector(".modal-info");
    const infoAddEl  = modal.querySelector(".modal-info-aditional");

    if (!titleEl || !categoryEl || !imageEl || !descEl || !infoEl || !infoAddEl) return;

    const isOrg = role === 'organizador';

    titleEl.textContent    = activity.title || '';
    categoryEl.textContent = activity.category_name || '';
    imageEl.innerHTML      = `<img src="${activity.image_url || 'assets/img/default-activity.jpg'}" alt="${activity.title}">`;

    descEl.innerHTML = `
        <h3><i class="fas fa-circle-info"></i> Descripción</h3>
        <p>${activity.description || 'Sin descripción.'}</p>`;

    infoEl.innerHTML = `
        <h3>Información Principal</h3>
        <p><span class="title"><i class="fas fa-calendar-day"></i> <strong>Fecha</strong></span> ${activity.date || 'No disponible'}</p>
        <p><span class="title"><i class="fas fa-clock"></i> <strong>Hora</strong></span> ${activity.time || 'No disponible'}</p>
        <p><span class="title"><i class="fas fa-location-dot"></i> <strong>Ubicación</strong></span> ${activity.location || 'No disponible'}</p>
        <p><span class="title"><i class="fas fa-stopwatch"></i> <strong>Duración</strong></span> ${activity.duration || 'No disponible'}</p>
        ${!isOrg ? `<p><span class="title"><i class="fas fa-users"></i> <strong>Participantes</strong></span> ${activity.current_registrations || 0}/${activity.max_people || '-'}</p>` : ''}
        ${!isOrg ? `<p><span class="title"><i class="fas fa-euro-sign"></i> <strong>Precio</strong></span> ${activity.price || 'Gratis'}</p>` : ''}
        <p><span class="title"><i class="fas fa-user"></i> <strong>${!isOrg ? 'Organizador' : 'Participante'}</strong></span> ${activity.offertant_name || activity.organizer_email || 'No disponible'}</p>`;

    infoAddEl.innerHTML = `
        <h3>Información Adicional</h3>
        <p><span class="title"><i class="fas fa-car"></i> <strong>${activity.transport_included ? 'Transporte incluido' : 'Transporte no incluido'}</strong></span></p>
        <p><span class="title"><i class="fas fa-language"></i> <strong>Idioma</strong></span> ${activity.language || 'No disponible'}</p>
        ${!isOrg ? `<p><span class="title"><i class="fas fa-plus"></i> <strong>Edad recomendada</strong></span> ${activity.min_age || 0} ${activity.min_age === 1 ? 'año' : 'años'}</p>` : ''}
        <p><span class="title"><i class="fas fa-location-dot"></i> <strong>Ciudad de partida</strong></span> ${activity.departure_city || activity.location || 'No disponible'}</p>
        <p><span class="title"><i class="fas fa-paw"></i> <strong>${activity.pets_allowed ? 'Mascotas permitidas' : 'Mascotas no permitidas'}</strong></span></p>
        <p><span class="title"><i class="fas fa-tshirt"></i> <strong>Código de vestimenta</strong></span> ${activity.dress_code || 'No disponible'}</p>`;
};

window.matchFilter = function (item, type, value) {
    if (!value) return true;
    switch (type) {
        case "title":    return item.title?.toLowerCase().includes(value);
        case "category": return item.category_name?.toLowerCase().includes(value);
        case "date":     return item.date?.includes(value);
        default:         return true;
    }
}

window.getFilterValues = function () {
    return {
        type:  document.getElementById("filterType")?.value || "",
        value: document.getElementById("filterValue")?.value?.toLowerCase() || ""
    };
}

window.bindFilterListeners = function (callback) {
    const filterInput = document.getElementById("filterInput");
    if (filterInput) {
        filterInput.addEventListener("input",  callback);
        filterInput.addEventListener("change", callback);
    }
}

window.buildImageHTML = function (pub) {
    const url = pub.image_url || 'assets/img/default-activity.jpg';
    const tag = pub.label
        ? `<div class="tag ${pub.labelClass || ''}">${pub.label}</div>`
        : "";
    return `
        <img src="${url}" alt="${pub.alt || pub.title}"
             onerror="this.src='assets/img/default-activity.jpg'">
        ${tag}`;
}

window.buildMetaHTML = function (pub) {
    const date  = window.formatDate(pub.date);
    const price = pub.price != null
        ? (pub.price == 0 ? "Gratis" : `${pub.price}€`)
        : null;
    return `
        <div class="activity-meta">
            ${date         ? `<span><i class="fas fa-calendar-alt"></i> ${date}</span>`           : ""}
            ${pub.location ? `<span><i class="fas fa-map-marker-alt"></i> ${pub.location}</span>` : ""}
            ${price        ? `<span><i class="fas fa-euro-sign"></i> ${price}</span>`              : ""}
        </div>`;
}

window.buildFooterHTML = function (pub) {
    return `
        <div class="activity-footer">
            ${pub.offertant_name
                ? `<span class="organizer"><i class="fas fa-user"></i> ${pub.offertant_name}</span>`
                : ""}
            ${pub.current_registrations != null && pub.max_people != null
                ? `<span class="participants"><i class="fas fa-users"></i> ${pub.current_registrations}/${pub.max_people}</span>`
                : ""}
        </div>`;
}

window.buildDetailsHTML = function (pub) {
    return pub.details?.length
        ? `<ul class="details">${pub.details.map(d => `<li>${d}</li>`).join("")}</ul>`
        : "";
}

window.bindToggleSection = function (btnId, sectionId, labelOpen, labelClose) {
    const btn     = document.getElementById(btnId);
    const section = document.getElementById(sectionId);
    if (!btn || !section) return;

    btn.addEventListener("click", () => {
        const visible = section.classList.toggle("visible");
        btn.textContent = visible ? labelOpen : labelClose;
    });
}

window.submitForm = function (action, id) {
    const form     = document.createElement("form");
    form.method    = "POST";
    form.action    = "index.php";
    form.innerHTML = `
        <input type="hidden" name="accion" value="${action}">
        <input type="hidden" name="id"     value="${id}">`;
    document.body.appendChild(form);
    form.submit();
}

window.formatDate = function (dateStr) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString('es-ES', {
        day: 'numeric', month: 'short', year: 'numeric'
    });
}

window.validateFullName = function (name) {
    return name.trim().split(" ").filter(p => p.length > 0).length >= 2;
}

window.validateEmail = function (email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase());
}

window.validatePassword = function (password) {
    return password.length >= 8;
}

window.buildChatHTML = function (activityTitle) {
    return `
        <div class="chat-page">
            <div class="chat-header">
                <div class="chat-header-info">
                    <h1 id="chat-title">
                        <i class="fas fa-users"></i> ${activityTitle}
                    </h1>
                    <span class="chat-subtitle">Chat grupal de la actividad</span>
                </div>
            </div>

            <div class="chat-messages-area" id="chatMessagesArea">
                <p class="chat-empty-state" id="chatEmptyState">
                    <i class="fas fa-comment-dots"></i>
                    Sé el primero en escribir algo...
                </p>
            </div>

            <form class="chat-input-area" id="chatForm">
                <input type="text" id="chatInput" class="chat-input"
                    placeholder="Escribe un mensaje..." required>

                <button type="submit" class="chat-send-btn">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </form>
        </div>
    `;
}
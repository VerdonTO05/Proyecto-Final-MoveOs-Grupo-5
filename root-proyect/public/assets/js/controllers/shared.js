// ============================================================
// shared.js — Utilidades compartidas entre todos los controllers
// ============================================================

// ----------------------------
// Fecha
// ----------------------------
export function formatDate(dateStr) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString('es-ES', {
        day: 'numeric', month: 'short', year: 'numeric'
    });
}

// ----------------------------
// Filtros
// ----------------------------
export function matchFilter(item, type, value) {
    if (!value) return true;
    switch (type) {
        case "title": return item.title?.toLowerCase().includes(value);
        case "category": return item.category_name?.toLowerCase().includes(value);
        case "date": return item.date?.includes(value);
        default: return true;
    }
}

export function getFilterValues() {
    return {
        type: document.getElementById("filterType")?.value || "",
        value: document.getElementById("filterValue")?.value?.toLowerCase() || ""
    };
}

export function bindFilterListeners(callback) {
    const filterInput = document.getElementById("filterInput");
    if (filterInput) {
        filterInput.addEventListener("input", callback);
        filterInput.addEventListener("change", callback);
    }
}

// ----------------------------
// HTML de card reutilizable
// ----------------------------
export function buildImageHTML(pub) {
    const url = pub.image_url || 'assets/img/default-activity.jpg';
    const tag = pub.label
        ? `<div class="tag ${pub.labelClass || ''}">${pub.label}</div>`
        : "";
    return `
        <img src="${url}" alt="${pub.alt || pub.title}"
             onerror="this.src='assets/img/default-activity.jpg'">
        ${tag}`;
}

export function buildMetaHTML(pub) {
    const date = formatDate(pub.date);
    const price = pub.price != null
        ? (pub.price == 0 ? "Gratis" : `${pub.price}€`)
        : null;
    return `
        <div class="activity-meta">
            ${date ? `<span><i class="fas fa-calendar-alt"></i> ${date}</span>` : ""}
            ${pub.location ? `<span><i class="fas fa-map-marker-alt"></i> ${pub.location}</span>` : ""}
            ${price ? `<span><i class="fas fa-euro-sign"></i> ${price}</span>` : ""}
        </div>`;
}

export function buildFooterHTML(pub) {
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

export function buildDetailsHTML(pub) {
    return pub.details?.length
        ? `<ul class="details">${pub.details.map(d => `<li>${d}</li>`).join("")}</ul>`
        : "";
}

// ----------------------------
// Modal de detalle de actividad
// ----------------------------
export function openDetailModal(activity, role = null) {
    const modal = document.getElementById("activityModal");
    if (!modal) return;

    const isOrg = role === 'organizador';

    modal.querySelector(".modal-title").textContent = activity.title;
    modal.querySelector(".category").textContent = activity.category_name || '';
    modal.querySelector(".modal-image").innerHTML =
        `<img src="${activity.image_url || 'assets/img/default-activity.jpg'}" alt="${activity.title}">`;

    modal.querySelector(".modal-description").innerHTML = `
        <h3><i class="fas fa-circle-info"></i> Descripción</h3>
        <p>${activity.description || 'Sin descripción.'}</p>`;

    modal.querySelector(".modal-info").innerHTML = `
        <h3>Información Principal</h3>
        <p><span class="title"><i class="fas fa-calendar-day"></i> <strong>Fecha</strong></span> ${activity.date || 'No disponible'}</p>
        <p><span class="title"><i class="fas fa-clock"></i> <strong>Hora</strong></span> ${activity.time || 'No disponible'}</p>
        <p><span class="title"><i class="fas fa-location-dot"></i> <strong>Ubicación</strong></span> ${activity.location || 'No disponible'}</p>
        <p><span class="title"><i class="fas fa-stopwatch"></i> <strong>Duración</strong></span> ${activity.duration || 'No disponible'}</p>
        ${!isOrg ? `<p><span class="title"><i class="fas fa-users"></i> <strong>Participantes</strong></span> ${activity.current_registrations || 0}/${activity.max_people || '-'}</p>` : ''}
        ${!isOrg ? `<p><span class="title"><i class="fas fa-euro-sign"></i> <strong>Precio</strong></span> ${activity.price || 'Gratis'}</p>` : ''}
        <p><span class="title"><i class="fas fa-user"></i> <strong>${!isOrg ? 'Organizador' : 'Participante'}</strong></span> ${activity.offertant_name || activity.organizer_email || 'No disponible'}</p>`;

    modal.querySelector(".modal-info-aditional").innerHTML = `
        <h3>Información Adicional</h3>
        <p><span class="title"><i class="fas fa-car"></i> <strong>${activity.transport_included ? 'Transporte incluido' : 'Transporte no incluido'}</strong></span></p>
        <p><span class="title"><i class="fas fa-language"></i> <strong>Idioma</strong></span> ${activity.language || 'No disponible'}</p>
        ${!isOrg ? `<p><span class="title"><i class="fas fa-plus"></i> <strong>Edad recomendada</strong></span> ${activity.min_age || 0} ${activity.min_age == 1 ? 'año' : 'años'}</p>` : ''}
        <p><span class="title"><i class="fas fa-location-dot"></i> <strong>Ciudad de partida</strong></span> ${activity.departure_city || activity.location || 'No disponible'}</p>
        <p><span class="title"><i class="fas fa-paw"></i> <strong>${activity.pets_allowed ? 'Mascotas permitidas' : 'Mascotas no permitidas'}</strong></span></p>
        <p><span class="title"><i class="fas fa-tshirt"></i> <strong>Código de vestimenta</strong></span> ${activity.dress_code || 'No disponible'}</p>`;

    modal.style.display = "flex";
    modal.querySelector(".modal-close").onclick = () => modal.style.display = "none";
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };
}

// ----------------------------
// Modal de confirmación personalizado
// ----------------------------
export function showConfirm({ title, message }) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.id = 'modal-container';
        overlay.classList.add('active');

        const modal = document.createElement('div');
        modal.classList.add('modal');
        modal.innerHTML = `
            <div class="modal-header">${title}</div>
            <div class="modal-body">${message}</div>
            <div class="modal-actions">
                <button class="confirm">Aceptar</button>
                <button class="cancel">Cancelar</button>
            </div>`;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        const close = () => {
            modal.style.animation = 'fadeOut 0.25s forwards';
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 250);
        };

        modal.querySelector('.confirm').addEventListener('click', () => { resolve(true); close(); });
        modal.querySelector('.cancel').addEventListener('click', () => { resolve(false); close(); });
    });
}

// ----------------------------
// Alerta tipo toast
// ----------------------------
export function showAlert(title, message, type = 'info', duration = 3000) {
    return new Promise((resolve) => {

        const overlay = document.createElement('div');
        overlay.classList.add('alert-overlay', type);

        const alertBox = document.createElement('div');
        alertBox.classList.add('alert-box');
        alertBox.innerHTML = `
            <div class="alert-header">${title}</div>
            <div class="alert-body">${message}</div>
            <button class="alert-close">&times;</button>`;

        overlay.appendChild(alertBox);
        document.body.appendChild(overlay);

        const close = () => {
            alertBox.style.animation = 'fadeOut 0.3s forwards';
            overlay.classList.remove('active');

            setTimeout(() => {
                overlay.remove();
                resolve(); // 👈 aquí termina la alerta
            }, 300);
        };

        alertBox.querySelector('.alert-close').addEventListener('click', close);
        setTimeout(close, duration);

        requestAnimationFrame(() => {
            overlay.classList.add('active');
            alertBox.style.animation = 'fadeIn 0.3s forwards';
        });

    });
}
// ----------------------------
// Envío de formulario dinámico (POST)
// ----------------------------
export function submitForm(action, id) {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "index.php";
    form.innerHTML = `
        <input type="hidden" name="accion" value="${action}">
        <input type="hidden" name="id"     value="${id}">`;
    document.body.appendChild(form);
    form.submit();
}

// ----------------------------
// Toggle de sección colapsable
// ----------------------------
export function bindToggleSection(btnId, sectionId, labelOpen, labelClose) {
    const btn = document.getElementById(btnId);
    const section = document.getElementById(sectionId);
    if (!btn || !section) return;

    btn.addEventListener("click", () => {
        const visible = section.classList.toggle("visible");
        btn.textContent = visible ? labelOpen : labelClose;
    });
}

export function renderError(selector, message) {
    const container = document.querySelector(selector);
    if (!container) return;

    container.innerHTML = `
        <p style="text-align:center;padding:2rem;color:var(--accent-danger);">
            <i class="fas fa-exclamation-triangle"></i> ${message}
        </p>
    `;
}

export function removeElementWithAnimation(element, duration = 300, callback) {
    if (!element) return;

    element.style.transition = `opacity ${duration}ms, transform ${duration}ms`;
    element.style.opacity = "0";
    element.style.transform = "scale(0.9)";

    setTimeout(() => {
        element.remove();
        callback?.();
    }, duration);
}


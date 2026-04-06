document.addEventListener('DOMContentLoaded', () => {

    document.querySelector('.back-btn')?.addEventListener('click', () => {
        history.back();
    });

    const form = document.querySelector('.form-activity');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        let errors = [];

        // ===== OBTENER VALORES =====
        const titulo = form.querySelector('[name="title"]')?.value.trim() || '';
        const descripcion = form.querySelector('[name="description"]')?.value.trim() || '';
        const categoria = form.querySelector('#category')?.value || '';
        const ubicacion = form.querySelector('[name="location"]')?.value.trim() || '';
        const fecha = form.querySelector('[name="date"]')?.value || '';
        const hora = form.querySelector('[name="time"]')?.value || '';

        const edad = form.querySelector('[name="min_age"]')?.value || '';
        const edadNum = parseInt(edad) || 0;

        const max_people = form.querySelector('[name="max_people"]')?.value || '';
        const maxPeopleNum = parseInt(max_people) || 0;

        const precioInput = form.querySelector('[name="price"]');
        if (precioInput && !precioInput.value.trim()) {
            precioInput.value = 0;
        }
        const precio = precioInput ? parseFloat(precioInput.value) || 0 : 0;

        const imagenInput = document.getElementById('image_file');
        const imagen = imagenInput?.files[0];
        const currentImage = form.querySelector('[name="current_image"]')?.value || '';

        // ===== VALIDACIONES FRONT =====

        if (!titulo) errors.push("El título no puede estar vacío.");
        else if (titulo.length < 5) errors.push("El título debe tener al menos 5 caracteres.");
        else if (titulo.length > 50) errors.push("El título debe tener menos de 50 caracteres.");

        if (!descripcion) errors.push("La descripción no puede estar vacía.");
        else if (descripcion.length < 15) errors.push("La descripción es demasiado breve.");

        if (!categoria) errors.push("Debes seleccionar una categoría.");
        if (!ubicacion) errors.push("La ubicación es obligatoria.");
        if (!fecha) errors.push("La fecha es obligatoria.");
        if (!hora) errors.push("La hora es obligatoria.");

        if (fecha) {
            const hoy = new Date();
            const fechaInput = new Date(fecha);
            const hoyStr = hoy.toISOString().split('T')[0];
            const maxFecha = new Date();
            maxFecha.setFullYear(hoy.getFullYear() + 2);

            if (fecha < hoyStr) errors.push("La fecha no puede ser anterior a hoy.");
            if (fechaInput > maxFecha) errors.push("La fecha no puede ser superior a 2 años.");
        }

        if (hora) {
            const [h, m] = hora.split(':').map(Number);
            if (h < 8 || h > 23 || (h === 23 && m > 0)) {
                errors.push("La hora debe estar entre las 08:00 y las 23:00.");
            }
        }

        if (edadNum > 18) errors.push("La edad mínima no puede ser mayor a 18 años.");
        if (maxPeopleNum > 500) errors.push("El máximo de participantes es 500.");
        if (precio > 1000) errors.push("El precio no puede ser mayor a 1000€.");

        if (!imagen && !currentImage) {
            errors.push("Debes subir una imagen.");
        } else if (imagen) {
            const tiposValidos = ['image/jpeg', 'image/png', 'image/jpg'];
            if (!tiposValidos.includes(imagen.type)) errors.push("Formato de imagen inválido (solo JPG o PNG).");
            if (imagen.size > 5 * 1024 * 1024) errors.push("La imagen no puede superar 5MB.");
        }

        // ===== MOSTRAR ERRORES FRONT =====
        if (errors.length > 0) {
            showAlert(
                "Errores en el formulario:",
                `<ul>${errors.map(err => `<li>${err}</li>`).join('')}</ul>`,
                "error",
                4000
            );
            return;
        }

        // ===== ENVÍO AL BACKEND =====
        const formData = new FormData(form);

        fetch(form.action, {
            method: "POST",
            body: formData
        })
        .then(res => res.json())
        .then(data => {

            if (!data.success) {

                // ===== ERRORES DE VALIDACIÓN PHP =====
                if (data.errors && data.errors.length > 0) {
                    showAlert(
                        data.message || "Errores en el formulario:",
                        `<ul>${data.errors.map(err => `<li>${err}</li>`).join('')}</ul>`,
                        "error",
                        4000
                    );
                    return;
                }

                // ===== ERROR GENERAL =====
                showAlert(
                    "Error",
                    data.message || "Ha ocurrido un error",
                    "error",
                    4000
                );
                return;
            }

            // ===== ÉXITO =====
            showAlert(
                "Éxito",
                data.message,
                "success",
                1800
            );
            window.location.href = "?accion=seeMyActivities";

        })
        .catch(error => {
            console.error(error);
            showAlert(
                "Error",
                "No se pudo conectar con el servidor",
                "error",
                4000
            );
        });
    });

    // ===== TRANSPORTE =====
    const transportToggle = document.getElementById('transport_toggle');
    const box = document.getElementById('departure_box');

    if (transportToggle && box) {
        box.style.display = transportToggle.checked ? 'block' : 'none';
        transportToggle.addEventListener('change', function () {
            box.style.display = this.checked ? 'block' : 'none';
        });
    }

    // ===== NOMBRE DEL ARCHIVO =====
    const imageInput = document.getElementById('image_file');
    if (imageInput) {
        imageInput.addEventListener('change', function () {
            const fileName = this.files[0] ? this.files[0].name : "Haz clic para subir una imagen";
            const label = document.getElementById('file-name');
            if (label) label.innerText = fileName;
        });
    }

    // ===== LIGHTBOX IMAGEN ACTUAL =====
    const previewImg = document.querySelector('.current-image-preview img');
    if (previewImg) {
        previewImg.parentElement.addEventListener('click', () => {
            const lightbox = document.createElement('div');
            lightbox.className = 'lightbox-overlay';
            lightbox.innerHTML = `
                <div class="lightbox-content">
                    <button class="lightbox-close" aria-label="Cerrar">
                        <i class="fas fa-times"></i>
                    </button>
                    <img src="${previewImg.src}" alt="Vista previa ampliada">
                </div>
            `;
            document.body.appendChild(lightbox);
            requestAnimationFrame(() => lightbox.classList.add('active'));

            const close = () => {
                lightbox.classList.remove('active');
                lightbox.addEventListener('transitionend', () => lightbox.remove(), { once: true });
            };

            lightbox.querySelector('.lightbox-close').addEventListener('click', close);
            lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
            document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); }, { once: true });
        });
    }
});
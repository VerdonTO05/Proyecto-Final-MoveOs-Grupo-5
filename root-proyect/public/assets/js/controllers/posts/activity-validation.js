/**
 * Validar publicaciones 
 * Maneja:
 * - Validación del formulario de edición de actividad o petición
 * - Bloqueo de modificación de la fecha original
 * - Envío de datos al servidor con confirmación de notificación por email
 * - Visibilidad del campo de transporte según el toggle
 * - Previsualización del nombre del archivo de imagen seleccionado
 * - Lightbox para ampliar la imagen actual de la actividad
 */

document.addEventListener('DOMContentLoaded', () => {

    document.querySelector('.back-btn')?.addEventListener('click', () => {
        history.back();
    });

    const form = document.querySelector('.form-activity');
    if (!form) return;

    // Guardar la fecha original al cargar el formulario para impedir su modificación
    const dateInput = form.querySelector('[name="date"]');
    const originalDate = dateInput ? dateInput.value : null;

    // Envío del formulario 
    form.addEventListener('submit', async (e) => {
        const isEditing = form.dataset.mode === 'edit';
        e.preventDefault();

        let errors = [];

        // Recoger y limpiar valores del formulario
        const titulo = form.querySelector('[name="title"]')?.value.trim() || '';
        const descripcion = form.querySelector('[name="description"]')?.value.trim() || '';
        const categoria = form.querySelector('#category')?.value || '';
        const ubicacion = form.querySelector('[name="location"]')?.value.trim() || '';
        const fecha = dateInput?.value || '';
        const hora = form.querySelector('[name="time"]')?.value || '';
        const edadNum = parseInt(form.querySelector('[name="min_age"]')?.value) || 0;
        const maxPeopleNum = parseInt(form.querySelector('[name="max_people"]')?.value) || 0;

        // Normalizar precio vacío a 0 antes de leerlo
        const precioInput = form.querySelector('[name="price"]');
        if (precioInput && !precioInput.value.trim()) precioInput.value = 0;
        const precio = precioInput ? parseFloat(precioInput.value) || 0 : 0;

        const imagenInput = document.getElementById('image_file');
        const imagen = imagenInput?.files[0];

        // Validaciones
        if (!titulo) errors.push("El título no puede estar vacío.");
        else if (titulo.length < 5) errors.push("El título debe tener al menos 5 caracteres.");
        else if (titulo.length > 50) errors.push("El título debe tener menos de 50 caracteres.");

        if (!descripcion) errors.push("La descripción no puede estar vacía.");
        else if (descripcion.length < 15) errors.push("La descripción es demasiado breve.");

        if (!categoria) errors.push("Debes seleccionar una categoría.");
        if (!ubicacion) errors.push("La ubicación es obligatoria.");
        if (!fecha) errors.push("La fecha es obligatoria.");
        if (!hora) errors.push("La hora es obligatoria.");

        // La fecha no puede ser modificada respecto al valor original
        if (isEditing) {
            if (dateInput && originalDate && dateInput.value !== originalDate) {
                errors.push("La fecha no se puede modificar.");
            }
        }

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

        if (imagen) {
            const tiposValidos = ['image/jpeg', 'image/png', 'image/jpg'];
            if (!tiposValidos.includes(imagen.type)) errors.push("Formato de imagen inválido (solo JPG o PNG).");
            if (imagen.size > 5 * 1024 * 1024) errors.push("La imagen no puede superar 5MB.");
        }

        // Mostrar todos los errores de validación antes de enviar
        if (errors.length > 0) {
            showAlert(
                "Errores en el formulario:",
                `<ul>${errors.map(err => `<li>${err}</li>`).join('')}</ul>`,
                "error",
                4000
            );
            return;
        }

        // Confirmación de notificación por email
        const formData = new FormData(form);
        let sendEmails = false;
        console.log('CURRENT_USER.role');
        if (isEditing) {
            if (CURRENT_USER.role === 'participante') {
                sendEmails = await showConfirm({
                    title: '¿Notificar al organizador?',
                    message: 'Se enviará un email al organizador informando de los cambios realizados.',
                    confirmText: 'Sí, notificar',
                    cancelText: 'No notificar'
                });
            } else {
                sendEmails = await showConfirm({
                    title: '¿Notificar a los participantes?',
                    message: 'Se enviará un email a los inscritos informando de los cambios realizados.',
                    confirmText: 'Sí, notificar',
                    cancelText: 'No notificar'
                });
            }

            formData.append('send_emails', sendEmails ? '1' : '0');
        }
        // Envío al servidor

        const btn = form.querySelector('.btn-submit');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';

        fetch(form.action, {
            method: "POST",
            body: formData,
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
            .then(res => {
                const contentType = res.headers.get('content-type') || '';
                if (!contentType.includes('application/json')) {
                    throw new Error('El servidor no devolvió JSON. Posible error PHP.');
                }
                return res.json();
            })
            .then(data => {
                if (!data.success) {
                    // Restaurar el botón si el servidor devuelve error
                    btn.disabled = false;
                    btn.innerHTML = '<?= $participante ? "Editar Petición" : "Editar Actividad" ?>';

                    if (data.errors?.length > 0) {
                        showAlert(
                            data.message || "Errores en el formulario:",
                            `<ul>${data.errors.map(err => `<li>${err}</li>`).join('')}</ul>`,
                            "error", 4000
                        );
                        return;
                    }
                    showAlert("Error", data.message || "Ha ocurrido un error", "error", 4000);
                    return;
                }

                // Éxito: mostrar alerta y redirigir tras el mismo tiempo
                showAlert("Éxito", data.message, "success", 1800);
                setTimeout(() => {
                    window.location.href = "?accion=seeMyActivities";
                }, 1800);
            })
            .catch(error => {
                btn.disabled = false;
                btn.innerHTML = 'Editar';
                console.error('Error fetch:', error);
                showAlert("Error", "No se pudo conectar con el servidor", "error", 4000);
            });
    });

    // Toggle de transporte
    const transportToggle = document.getElementById('transport_toggle');
    const box = document.getElementById('departure_box');

    if (transportToggle && box) {
        // Establecer visibilidad inicial según el estado del checkbox
        box.style.display = transportToggle.checked ? 'block' : 'none';
        transportToggle.addEventListener('change', function () {
            box.style.display = this.checked ? 'block' : 'none';
        });
    }

    // Nombre del archivo de imagen seleccionado 
    const imageInput = document.getElementById('image_file');
    if (imageInput) {
        imageInput.addEventListener('change', function () {
            const label = document.getElementById('file-name');
            if (label) {
                label.innerText = this.files[0]
                    ? this.files[0].name
                    : "Haz clic para subir una imagen";
            }
        });
    }

    // Lightbox de imagen actual
    const previewImg = document.querySelector('.current-image-preview img');
    if (previewImg) {
        previewImg.parentElement.addEventListener('click', () => {
            const lightbox = document.createElement('div');
            lightbox.className = 'lightbox-overlay';
            lightbox.innerHTML = `
                <div class="lightbox-content">
                    <button class="lightbox-close">
                        <i class="fas fa-times"></i>
                    </button>
                    <img src="${previewImg.src}" alt="Vista previa ampliada">
                </div>
            `;
            document.body.appendChild(lightbox);

            // Forzar un frame antes de añadir la clase para que la transición CSS se active
            requestAnimationFrame(() => lightbox.classList.add('active'));

            const close = () => {
                lightbox.classList.remove('active');
                lightbox.addEventListener('transitionend', () => lightbox.remove(), { once: true });
            };

            // Cerrar con el botón, clic en el fondo o tecla Escape
            lightbox.querySelector('.lightbox-close').addEventListener('click', close);
            lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
            document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); }, { once: true });
        });
    }
});
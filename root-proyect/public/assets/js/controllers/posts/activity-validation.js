document.addEventListener('DOMContentLoaded', () => {

    // ===== ERRORES DESDE PHP =====
    const phpErrors = window.__PHP_FORM_ERRORS__ ?? [];
    if (phpErrors.length > 0) {
        showAlert(
            "Errores en el formulario:",
            `<ul>${phpErrors.map(err => `<li>${err}</li>`).join('')}</ul>`,
            "error",
            4000
        );
    }

    const form = document.querySelector('.form-activity');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        let errors = [];

        // ===== OBTENER VALORES =====
        const titulo      = form.querySelector('[name="title"]')?.value.trim() || '';
        const descripcion = form.querySelector('[name="description"]')?.value.trim() || '';
        const categoria   = form.querySelector('#category')?.value || '';
        const ubicacion   = form.querySelector('[name="location"]')?.value.trim() || '';
        const fecha       = form.querySelector('[name="date"]')?.value || '';
        const hora        = form.querySelector('[name="time"]')?.value || '';

        const edad        = form.querySelector('[name="min_age"]')?.value || '';
        const edadNum     = parseInt(edad) || 0;

        const max_people    = form.querySelector('[name="max_people"]')?.value || '';
        const maxPeopleNum  = parseInt(max_people) || 0;

        const precioInput = form.querySelector('[name="price"]');
        const precio      = precioInput ? parseFloat(precioInput.value) || 0 : 0;

        const imagenInput  = document.getElementById('image_file');
        const imagen       = imagenInput?.files[0];
        const currentImage = form.querySelector('[name="current_image"]')?.value || '';

        // ===== VALIDACIONES =====

        // TÍTULO
        if (!titulo) {
            errors.push("El título no puede estar vacío.");
        } else if (titulo.length < 5) {
            errors.push("El título debe tener al menos 5 caracteres.");
        } else if (titulo.length > 50) {
            errors.push("El título debe tener menos de 50 caracteres.");
        }

        // DESCRIPCIÓN
        if (!descripcion) {
            errors.push("La descripción no puede estar vacía.");
        } else if (descripcion.length < 15) {
            errors.push("La descripción es demasiado breve.");
        }

        // CATEGORÍA
        if (!categoria) errors.push("Debes seleccionar una categoría.");

        // UBICACIÓN
        if (!ubicacion) errors.push("La ubicación es obligatoria.");

        // FECHA (hoy → +2 años)
        if (fecha) {
            const hoy       = new Date();
            const fechaInput = new Date(fecha);
            const hoyStr    = hoy.toISOString().split('T')[0];
            const maxFecha  = new Date();
            maxFecha.setFullYear(hoy.getFullYear() + 2);

            if (fecha < hoyStr)        errors.push("La fecha no puede ser anterior a hoy.");
            if (fechaInput > maxFecha) errors.push("La fecha no puede ser superior a 2 años.");
        }

        // HORA (08:00 → 23:00)
        if (hora) {
            const [h, m] = hora.split(':').map(Number);
            if (h < 8 || h > 23 || (h === 23 && m > 0)) {
                errors.push("La hora debe estar entre las 08:00 y las 23:00.");
            }
        }

        // EDAD
        if (edadNum > 18) errors.push("La edad mínima no puede ser mayor a 18 años.");

        // MÁXIMO PERSONAS
        if (maxPeopleNum > 500) errors.push("El máximo de participantes es 500.");

        // PRECIO
        if (precio < 0)    errors.push("El precio no puede ser negativo.");
        if (precio > 1000) errors.push("El precio no puede ser mayor a 1000€.");

        // IMAGEN
        if (!imagen && !currentImage) {
            errors.push("Debes subir una imagen.");
        } else if (imagen) {
            const tiposValidos = ['image/jpeg', 'image/png'];
            if (!tiposValidos.includes(imagen.type))  errors.push("Formato de imagen inválido (solo JPG o PNG).");
            if (imagen.size > 5 * 1024 * 1024)        errors.push("La imagen no puede superar 5MB.");
        }

        // ===== MOSTRAR ERRORES =====
        if (errors.length > 0) {
            e.preventDefault();
            showAlert(
                "Errores en el formulario:",
                `<ul>${errors.map(err => `<li>${err}</li>`).join('')}</ul>`,
                "error",
                4000
            );
        }
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
});
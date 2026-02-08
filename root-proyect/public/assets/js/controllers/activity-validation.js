document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.form-activity');

    /**
     * Maneja la validación del formulario de creación/edición de actividad
     */
    form.addEventListener('submit', (e) => {
        let errors = [];

        // Captura de valores
        const titulo = document.getElementById('titulo').value.trim();
        const descripcion = document.getElementById('descripcion').value.trim();
        const categoria = document.getElementById('category').value;
        const ubicacion = document.getElementById('ubicacion').value.trim();
        const fecha = document.getElementById('fecha').value;
        const precio = document.getElementById('precio').value;

        // Validaciones de los campos
        if (titulo.length < 5) errors.push("El título debe tener al menos 5 caracteres.");
        if (titulo.length > 50) errors.push("El título debe tener menos de 50 caracteres.");
        if (descripcion.length < 15) errors.push("La descripción es demasiado breve.");
        if (!categoria) errors.push("Debes seleccionar una categoría.");
        if (!ubicacion) errors.push("La ubicación es obligatoria.");

        if (fecha) {
            const hoy = new Date().toISOString().split('T')[0];
            if (fecha < hoy) errors.push("La fecha no puede ser anterior a hoy.");
        }

        if (precio < 0) errors.push("El precio no puede ser negativo.");

        // Mostrar errores y detener envío si existen
        if (errors.length > 0) {
            e.preventDefault();
            alert("Errores en el formulario:\n- " + errors.join("\n- "));
        }
    });

    /**
     * Muestra u oculta el campo de ciudad de salida según el transporte incluido
     */
    document.getElementById('transport_toggle').addEventListener('change', function () {
        document.getElementById('departure_box').style.display = this.checked ? 'block' : 'none';
    });

    /**
     * Actualiza el texto con el nombre del archivo de imagen seleccionado
     */
    document.getElementById('image_file').addEventListener('change', function () {
        const fileName = this.files[0] ? this.files[0].name : "Haz clic para subir una imagen";
        document.getElementById('file-name').innerText = fileName;
    });
});

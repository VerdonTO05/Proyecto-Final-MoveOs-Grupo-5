document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.form-activity');

    form.addEventListener('submit', (e) => {
        let errors = [];
        
        // Captura de valores
        const titulo = document.getElementById('titulo').value.trim();
        const descripcion = document.getElementById('descripcion').value.trim();
        const categoria = document.getElementById('category').value;
        const ubicacion = document.getElementById('ubicacion').value.trim();
        const fecha = document.getElementById('fecha').value;
        const precio = document.getElementById('precio').value;

        // Validaciones
        if (titulo.length < 5) errors.push("El título debe tener al menos 5 caracteres.");
        if (descripcion.length < 15) errors.push("La descripción es demasiado breve.");
        if (!categoria) errors.push("Debes seleccionar una categoría.");
        if (!ubicacion) errors.push("La ubicación es obligatoria.");
        
        if (fecha) {
            const hoy = new Date().toISOString().split('T')[0];
            if (fecha < hoy) errors.push("La fecha no puede ser anterior a hoy.");
        }

        if (precio < 0) errors.push("El precio no puede ser negativo.");

        if (errors.length > 0) {
            e.preventDefault(); // Detiene el envío
            alert("Errores en el formulario:\n- " + errors.join("\n- "));
        }
    });
});
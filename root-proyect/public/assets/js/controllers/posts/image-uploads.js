/**
 * Subida de imagenes
 * Maneja:
 * - Previsualización de la imagen seleccionada en el input de archivo
 * - Actualización del nombre del archivo mostrado al usuario
 * - Ocultación del placeholder de subida al seleccionar una imagen
 */

document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('image_file');
    const preview = document.getElementById('image-preview');
    const content = document.getElementById('upload-content');
    const fileNameText = document.getElementById('file-name');

    if (!input) return;

    input.addEventListener('change', function () {
        const file = this.files[0];
        if (!file) return;

        // Actualizar el nombre del archivo visible bajo el área de subida
        if (fileNameText) {
            fileNameText.textContent = file.name;
        }

        // Leer el archivo como URL base64 para mostrarlo como preview
        const reader = new FileReader();

        reader.onload = function (e) {
            // Mostrar la imagen seleccionada
            if (preview) {
                preview.src = e.target.result;
                preview.style.display = 'block';
            }

            // Ocultar el icono y el texto de placeholder una vez hay imagen
            if (content) {
                content.style.display = 'none';
            }
        };

        reader.readAsDataURL(file);
    });
});
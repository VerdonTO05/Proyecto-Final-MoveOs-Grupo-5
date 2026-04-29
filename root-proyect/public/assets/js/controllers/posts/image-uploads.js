document.addEventListener('DOMContentLoaded', () => {

    const input = document.getElementById('image_file');
    const preview = document.getElementById('image-preview');
    const content = document.getElementById('upload-content');
    const fileNameText = document.getElementById('file-name');

    if (!input) return;

    input.addEventListener('change', function () {

        const file = this.files[0];
        if (!file) return;

        // Mostrar nombre
        if (fileNameText) {
            fileNameText.textContent = file.name;
        }

        // Mostrar preview
        const reader = new FileReader();

        reader.onload = function (e) {
            if (preview) {
                preview.src = e.target.result;
                preview.style.display = 'block';
            }

            // Ocultar icono y texto
            if (content) {
                content.style.display = 'none';
            }
        };

        reader.readAsDataURL(file);
    });

});
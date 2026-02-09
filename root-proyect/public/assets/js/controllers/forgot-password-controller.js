/**
 * Controlador para el formulario de recuperación de contraseña
 */

// Función para alternar visibilidad de contraseña
function setupPasswordToggle() {
    const toggleButtons = document.querySelectorAll('.toggle-password');

    toggleButtons.forEach(button => {
        button.addEventListener('click', function () {
            const targetId = this.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);

            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                this.classList.remove('fa-eye');
                this.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                this.classList.remove('fa-eye-slash');
                this.classList.add('fa-eye');
            }
        });
    });
}

// Función para manejar el envío del formulario
async function handleForgotPasswordSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const email = document.getElementById('email').value;
    const oldPassword = document.getElementById('old-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Validar que las contraseñas nuevas coincidan
    if (newPassword !== confirmPassword) {
        alert('Las contraseñas nuevas no coinciden. Por favor, verifica e intenta de nuevo.');
        return;
    }

    // Validar longitud mínima de la contraseña
    if (newPassword.length < 6) {
        alert('La nueva contraseña debe tener al menos 6 caracteres.');
        return;
    }

    // Validar que la nueva contraseña sea diferente a la antigua
    if (oldPassword === newPassword) {
        alert('La nueva contraseña debe ser diferente a la contraseña antigua.');
        return;
    }

    try {
        const formData = new FormData();
        formData.append('accion', 'changePassword');
        formData.append('email', email);
        formData.append('old_password', oldPassword);
        formData.append('new_password', newPassword);

        const response = await fetch('index.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            alert('Contraseña cambiada exitosamente. Serás redirigido al inicio de sesión.');
            window.location.href = 'index.php?accion=loginView';
        } else {
            alert(data.message || 'Error al cambiar la contraseña. Por favor, verifica tus datos.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Ocurrió un error al procesar tu solicitud. Por favor, intenta de nuevo.');
    }
}

// Función para configurar el botón de cerrar
function setupCloseButton() {
    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', function () {
            window.location.href = 'index.php?accion=loginView';
        });
    }
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('forgot-password-form');
    if (form) {
        form.addEventListener('submit', handleForgotPasswordSubmit);
    }

    setupPasswordToggle();
    setupCloseButton();
});

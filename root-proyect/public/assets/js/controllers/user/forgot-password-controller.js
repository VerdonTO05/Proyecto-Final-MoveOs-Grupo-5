/**
 * Controlador para el formulario de recuperación de contraseña con código de verificación
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

// Función para manejar la solicitud de código
async function handleRequestCode(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const submitBtn = event.target.querySelector('.submit-btn');

    // Validar email
    if (!email || !email.includes('@')) {
        showAlert('Email inválido.','Por favor, ingresa un correo electrónico válido.', 'error');
        return;
    }

    // Deshabilitar botón mientras se procesa
    submitBtn.disabled = true;
    submitBtn.value = 'Enviando...';

    try {
        const formData = new FormData();
        formData.append('accion', 'requestCode');
        formData.append('email', email);

        const response = await fetch('index.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            // Guardar el email para el siguiente paso
            document.getElementById('email-hidden').value = email;

            // Mostrar mensaje de éxito
            showAlert('',data.message);

            // Cambiar al paso 2
            showStep2();
        } else {
            showAlert('Error', data.message || 'Error al solicitar el código. Por favor, intenta de nuevo.', 'error');
        }
    } catch (error) {
        showAlert('Error', 'Ocurrió un error al procesar tu solicitud. Por favor, intenta de nuevo.', 'error');
    } finally {
        // Rehabilitar botón
        submitBtn.disabled = false;
        submitBtn.value = 'Enviar Código de Verificación';
    }
}

// Función para manejar el cambio de contraseña
async function handleChangePassword(event) {
    event.preventDefault();

    const email = document.getElementById('email-hidden').value;
    const verificationCode = document.getElementById('verification-code').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const submitBtn = event.target.querySelector('.submit-btn');

    // Validar que las contraseñas nuevas coincidan
    if (newPassword !== confirmPassword) {
        showAlert('Las contraseñas nuevas no coinciden.', 'Por favor, verifica e intenta de nuevo.');
        return;
    }

    // Validar longitud mínima de la contraseña
    if (newPassword.length < 8) {
        showAlert('Info','La nueva contraseña debe tener al menos 8 caracteres.');
        return;
    }

    // Validar código de 6 dígitos
    if (!/^\d{6}$/.test(verificationCode)) {
        showAlert('Info','El código de verificación debe tener 6 dígitos numéricos.');
        return;
    }

    // Deshabilitar botón mientras se procesa
    submitBtn.disabled = true;
    submitBtn.value = 'Cambiando contraseña...';

    try {
        const formData = new FormData();
        formData.append('accion', 'changePassword');
        formData.append('email', email);
        formData.append('verification_code', verificationCode);
        formData.append('new_password', newPassword);

        const response = await fetch('index.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            await showAlert('¡Contraseña cambiada exitosamente!','Serás redirigido al inicio de sesión.','info', 2500);
            window.location.href = 'index.php?accion=loginView';
        } else {
            showAlert('', data.message, 'error', 2500);
        }
    } catch (error) {
        showAlert('Ocurrió un error al procesar tu solicitud.', 'Por favor, intenta de nuevo.','error', 2500);
    } finally {
        // Rehabilitar botón
        submitBtn.disabled = false;
        submitBtn.value = 'Cambiar Contraseña';
    }
}

// Función para mostrar el paso 2
function showStep2() {
    document.getElementById('request-code-form').style.display = 'none';
    document.getElementById('change-password-form').style.display = 'block';
    document.getElementById('header-description').textContent = 'Ingresa el código que recibiste en tu correo';

    // Enfocar en el campo de código
    setTimeout(() => {
        document.getElementById('verification-code').focus();
    }, 100);
}

// Función para volver al paso 1
function showStep1() {
    document.getElementById('request-code-form').style.display = 'block';
    document.getElementById('change-password-form').style.display = 'none';
    document.getElementById('header-description').textContent = 'Ingresa tu correo electrónico para recibir un código de verificación';

    // Limpiar formularios
    document.getElementById('verification-code').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
    const requestForm = document.getElementById('request-code-form');
    const changeForm = document.getElementById('change-password-form');
    const backButton = document.getElementById('back-to-email');

    if (requestForm) {
        requestForm.addEventListener('submit', handleRequestCode);
    }

    if (changeForm) {
        changeForm.addEventListener('submit', handleChangePassword);
    }

    if (backButton) {
        backButton.addEventListener('click', showStep1);
    }

    setupPasswordToggle();
});

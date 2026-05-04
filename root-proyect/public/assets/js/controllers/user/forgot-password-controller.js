/**
 * Script de recuperación de contraseña.
 * Maneja:
 * - Mostrar/ocultar contraseña
 * - Solicitud de código de verificación por email
 * - Validación y cambio de contraseña
 * - Navegación entre pasos del formulario
 */
document.addEventListener('DOMContentLoaded', init);

/**
 * Inicializa los eventos del formulario de recuperación
 */
function init() {
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
}

/**
 * Configura el toggle de visibilidad para todos los campos de contraseña.
 * Busca botones con la clase `.toggle-password` y alterna entre
 * tipo `password` y `text` según el atributo `data-target`.
 */
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

/**
 * Maneja el envío del formulario de solicitud de código.
 * Valida el email y lo envía al servidor para generar el código.
 * Si tiene éxito, avanza al paso 2.
 *
 * @param {SubmitEvent} event - Evento de envío del formulario
 * @returns {Promise<void>}
 */
async function handleRequestCode(event) {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const submitBtn = event.target.querySelector('.submit-btn');

  if (!email || !email.includes('@')) {
    showAlert('Email inválido.', 'Por favor, ingresa un correo electrónico válido.', 'error');
    return;
  }

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
      // Conservar el email para usarlo en el paso 2
      document.getElementById('email-hidden').value = email;
      showAlert('', data.message);
      showStep2();
    } else {
      showAlert('Error', data.message || 'Error al solicitar el código. Por favor, intenta de nuevo.', 'error');
    }
  } catch (error) {
    showAlert('Error', 'Ocurrió un error al procesar tu solicitud. Por favor, intenta de nuevo.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.value = 'Enviar Código de Verificación';
  }
}

/**
 * Maneja el envío del formulario de cambio de contraseña.
 * Valida el código de verificación y las nuevas contraseñas antes de enviarlas.
 * Si tiene éxito, redirige al login.
 *
 * @param {SubmitEvent} event - Evento de envío del formulario
 * @returns {Promise<void>}
 */
async function handleChangePassword(event) {
  event.preventDefault();

  const email = document.getElementById('email-hidden').value;
  const verificationCode = document.getElementById('verification-code').value;
  const newPassword = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  const submitBtn = event.target.querySelector('.submit-btn');

  if (newPassword !== confirmPassword) {
    showAlert('Las contraseñas nuevas no coinciden.', 'Por favor, verifica e intenta de nuevo.');
    return;
  }

  if (newPassword.length < 8) {
    showAlert('Info', 'La nueva contraseña debe tener al menos 8 caracteres.');
    return;
  }

  if (!/^\d{6}$/.test(verificationCode)) {
    showAlert('Info', 'El código de verificación debe tener 6 dígitos numéricos.');
    return;
  }

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
      await showAlert('¡Contraseña cambiada exitosamente!', 'Serás redirigido al inicio de sesión.', 'info', 2500);
      window.location.href = 'index.php?accion=loginView';
    } else {
      showAlert('', data.message, 'error', 2500);
    }
  } catch (error) {
    showAlert('Ocurrió un error al procesar tu solicitud.', 'Por favor, intenta de nuevo.', 'error', 2500);
  } finally {
    submitBtn.disabled = false;
    submitBtn.value = 'Cambiar Contraseña';
  }
}

/**
 * Muestra el paso 2: formulario de cambio de contraseña.
 * Oculta el formulario de solicitud de código y actualiza la descripción del encabezado.
 * Enfoca automáticamente el campo de código de verificación.
 */
function showStep2() {
  document.getElementById('request-code-form').style.display = 'none';
  document.getElementById('change-password-form').style.display = 'block';
  document.getElementById('header-description').textContent = 'Ingresa el código que recibiste en tu correo';

  setTimeout(() => {
    document.getElementById('verification-code').focus();
  }, 100);
}

/**
 * Vuelve al paso 1: formulario de solicitud de código.
 * Oculta el formulario de cambio de contraseña, restaura la descripción del encabezado
 * y limpia los campos del paso 2.
 */
function showStep1() {
  document.getElementById('request-code-form').style.display = 'block';
  document.getElementById('change-password-form').style.display = 'none';
  document.getElementById('header-description').textContent =
    'Ingresa tu correo electrónico para recibir un código de verificación';

  document.getElementById('verification-code').value = '';
  document.getElementById('new-password').value = '';
  document.getElementById('confirm-password').value = '';
}
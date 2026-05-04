/**
 * Modal de autenticación
 * Modal global de autenticación (login / registro).
 * Maneja:
 * - Inyección dinámica del HTML del modal en el DOM
 * - Navegación entre tabs de login y registro
 * - Envío y validación de ambos formularios
 * - Mostrar/ocultar contraseña
 * - Cierre por botón, clic en overlay o tecla Escape
 *
 * Uso: window.openAuthModal('login') | window.openAuthModal('register')
 */

(function () {
  'use strict';

  /**
   * Genera el HTML completo del modal de autenticación.
   * Incluye los formularios de login y registro, y los tabs de navegación.
   *
   * @returns {string} HTML del modal listo para insertar en el DOM
   */
  function buildModalHTML() {
    return `
    <div id="auth-modal-overlay" class="auth-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
      <div class="auth-modal-container" id="auth-modal-box">
        <button class="auth-modal-close" id="auth-modal-close-btn" aria-label="Cerrar">&times;</button>

        <header class="header-form">
          <h2 id="auth-modal-title">BIENVENIDO a MOVEos</h2>
          <p id="auth-modal-subtitle">Inicia sesión para continuar tu aventura</p>
        </header>

        <!-- Tabs -->
        <div class="tab-switch" role="tablist">
          <button class="tab-btn" id="auth-tab-login" role="tab" aria-selected="true">Iniciar Sesión</button>
          <button class="tab-btn" id="auth-tab-register" role="tab" aria-selected="false">Registrarse</button>
        </div>

        <!-- Formulario Login -->
        <form id="auth-login-form" class="login-form auth-form" autocomplete="off" novalidate>
          <label for="auth-username">Nombre de Usuario</label>
          <div class="input-group">
            <i class="fas fa-user icon" aria-hidden="true"></i>
            <input type="text" id="auth-username" name="username" placeholder="tu_usuario" required>
          </div>

          <label for="auth-password">Contraseña</label>
          <div class="input-group">
            <i class="fas fa-lock icon" aria-hidden="true"></i>
            <div class="div-password">
              <input type="password" id="auth-password" name="password" placeholder="••••••••" required>
              <button type="button" class="toggle-password" id="auth-toggle-pwd" aria-label="Mostrar/Ocultar contraseña">
                <i class="fa-solid fa-eye"></i>
              </button>
            </div>
          </div>

          <a href="index.php?accion=forgot-password" class="forgot-password">¿Olvidaste tu contraseña?</a>
          <button type="submit" class="submit-btn">Iniciar Sesión</button>
        </form>

        <!-- Formulario Register -->
        <form id="auth-register-form" class="register-form auth-form" autocomplete="off" novalidate style="display:none">
          <label for="auth-fullname">Nombre Completo *</label>
          <div class="input-group">
            <i class="fas fa-user icon" aria-hidden="true"></i>
            <input type="text" id="auth-fullname" name="fullname" placeholder="Juan Pérez García" required>
          </div>

          <label for="auth-reg-username">Nombre de Usuario *</label>
          <div class="input-group">
            <i class="fas fa-user icon" aria-hidden="true"></i>
            <input type="text" id="auth-reg-username" name="username" placeholder="juanperez" required>
          </div>

          <label for="auth-email">Correo Electrónico *</label>
          <div class="input-group">
            <i class="fas fa-envelope icon" aria-hidden="true"></i>
            <input type="email" id="auth-email" name="email" placeholder="juan@email.com" required>
          </div>

          <label for="auth-reg-password">Contraseña *</label>
          <div class="input-group">
            <i class="fas fa-lock icon" aria-hidden="true"></i>
            <div class="div-password">
              <input type="password" id="auth-reg-password" name="password" placeholder="••••••••" required>
              <button type="button" class="toggle-password" id="auth-toggle-reg-pwd" aria-label="Mostrar/Ocultar contraseña">
                <i class="fa-solid fa-eye"></i>
              </button>
            </div>
          </div>

          <!-- Tipo de usuario -->
          <fieldset class="user-type-group">
            <div class="option">
              <input type="radio" id="auth-participante" name="type" value="participante">
              <label for="auth-participante" class="user-type-card">
                <i class="fas fa-users icon" aria-hidden="true"></i>
                <h3>Participante</h3>
                <p>Buscar e inscribirse en actividades</p>
              </label>
            </div>
            <div class="option">
              <input type="radio" id="auth-organizador" name="type" value="organizador">
              <label for="auth-organizador" class="user-type-card">
                <i class="fas fa-user-cog icon" aria-hidden="true"></i>
                <h3>Organizador</h3>
                <p>Publicar y gestionar actividades</p>
              </label>
            </div>
          </fieldset>

          <button type="submit" class="submit-btn">Registrarse</button>
        </form>
      </div>
    </div>`;
  }

  /**
   * Activa el tab indicado y muestra el formulario correspondiente.
   * Actualiza los atributos ARIA y el subtítulo del encabezado.
   *
   * @param {'login'|'register'} tab - Tab a activar
   */
  function activateTab(tab) {
    const loginForm = document.getElementById('auth-login-form');
    const registerForm = document.getElementById('auth-register-form');
    const tabLogin = document.getElementById('auth-tab-login');
    const tabRegister = document.getElementById('auth-tab-register');
    const subtitle = document.getElementById('auth-modal-subtitle');

    if (tab === 'register') {
      loginForm.style.display = 'none';
      registerForm.style.display = '';
      tabLogin.classList.remove('active');
      tabRegister.classList.add('active');
      tabLogin.setAttribute('aria-selected', 'false');
      tabRegister.setAttribute('aria-selected', 'true');
      subtitle.textContent = 'Crea una cuenta para comenzar tu aventura';
    } else {
      registerForm.style.display = 'none';
      loginForm.style.display = '';
      tabRegister.classList.remove('active');
      tabLogin.classList.add('active');
      tabRegister.setAttribute('aria-selected', 'false');
      tabLogin.setAttribute('aria-selected', 'true');
      subtitle.textContent = 'Inicia sesión para continuar tu aventura';
    }
  }

  /**
   * Cierra el modal de autenticación con animación de salida.
   * Elimina el overlay del DOM al finalizar la transición CSS
   * y restaura el scroll del body.
   */
  function closeModal() {
    const overlay = document.getElementById('auth-modal-overlay');
    if (!overlay) return;
    overlay.classList.remove('auth-modal-visible');
    overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
    document.body.style.overflow = '';
  }

  /**
   * Maneja el envío del formulario de login.
   * Valida los campos y envía las credenciales al servidor.
   * Si el login es correcto, cierra el modal y redirige.
   *
   * @param {SubmitEvent} e - Evento de envío del formulario
   * @returns {Promise<void>}
   */
  async function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('auth-username').value.trim();
    const password = document.getElementById('auth-password').value.trim();

    if (!username || !password) {
      return showAlert('¡Ojo!', 'Completa todos los campos', 'info');
    }

    try {
      const res = await fetch('index.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'login', username, password })
      });
      const text = await res.text();
      if (!text) throw new Error('Respuesta vacía');
      const data = JSON.parse(text);

      if (res.ok && data.success) {
        closeModal();
        window.location.href = data.redirect;
      } else {
        showAlert('Error al iniciar sesión', 'Credenciales incorrectas', 'info');
      }
    } catch {
      showAlert('Error', 'No se pudo conectar con el servidor', 'error');
    }
  }

  /**
   * Maneja el envío del formulario de registro.
   * Valida todos los campos y el rol seleccionado antes de enviar.
   * Si el registro es exitoso, cierra el modal y redirige a actividades.
   *
   * @param {SubmitEvent} e - Evento de envío del formulario
   * @returns {Promise<void>}
   */
  async function handleRegister(e) {
    e.preventDefault();

    const fullname = document.getElementById('auth-fullname').value.trim();
    const username = document.getElementById('auth-reg-username').value.trim();
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-reg-password').value;
    const rolInput = document.querySelector('#auth-register-form input[name="type"]:checked');

    const errors = [];
    if (!validateFullName(fullname)) errors.push('Introduce nombre y apellido.');
    if (!username) errors.push('El nombre de usuario es obligatorio.');
    if (!validateEmail(email)) errors.push('El formato del correo no es válido.');
    if (!validatePassword(password)) errors.push('La contraseña debe tener al menos 8 caracteres.');
    if (!rolInput) errors.push('Debes seleccionar un rol.');

    if (errors.length) {
      return showAlert('Errores en el formulario', `<ul>${errors.map(err => `<li>${err}</li>`).join('')}</ul>`, 'error');
    }

    try {
      const res = await fetch('index.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'registerUser', fullname, username, email, password, rol: rolInput.value })
      });
      const result = await res.json();

      if (res.ok && result.success) {
        await showAlert('¡Registro exitoso!', `Bienvenido, ${username}.`, 'success');
        closeModal();
        window.location.href = 'index.php?accion=seeActivities';
      } else {
        showAlert('Error en el registro', result.message, 'error');
      }
    } catch {
      showAlert('Error', 'No se pudo conectar con el servidor.', 'error');
    }
  }

  /**
   * Vincula el botón de mostrar/ocultar contraseña a su campo correspondiente.
   * Alterna entre tipo `password` y `text`, y actualiza el icono del botón.
   *
   * @param {string} btnId   - ID del botón toggle
   * @param {string} inputId - ID del input de contraseña asociado
   */
  function bindPasswordToggle(btnId, inputId) {
    const btn = document.getElementById(btnId);
    const input = document.getElementById(inputId);
    if (!btn || !input) return;

    btn.addEventListener('click', () => {
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      const icon = btn.querySelector('i');
      icon.classList.toggle('fa-eye', !isPassword);
      icon.classList.toggle('fa-eye-slash', isPassword);
    });
  }

  /**
   * Abre el modal de autenticación en el tab indicado.
   * Si el modal ya existe en el DOM, simplemente cambia de tab sin duplicarlo.
   * Registra todos los eventos necesarios (tabs, formularios, cierre, Escape).
   *
   * @param {'login'|'register'} [tab='login'] - Tab inicial a mostrar
   */
  window.openAuthModal = function (tab = 'login') {
    // Evitar duplicar el modal si ya está abierto
    if (document.getElementById('auth-modal-overlay')) {
      activateTab(tab);
      return;
    }

    document.body.insertAdjacentHTML('beforeend', buildModalHTML());
    document.body.style.overflow = 'hidden';

    // Doble rAF para que la transición CSS de entrada se dispare correctamente
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.getElementById('auth-modal-overlay')?.classList.add('auth-modal-visible');
      });
    });

    activateTab(tab);

    // Eventos de tabs
    document.getElementById('auth-tab-login')?.addEventListener('click', () => activateTab('login'));
    document.getElementById('auth-tab-register')?.addEventListener('click', () => activateTab('register'));

    // Eventos de formularios
    document.getElementById('auth-login-form')?.addEventListener('submit', handleLogin);
    document.getElementById('auth-register-form')?.addEventListener('submit', handleRegister);

    // Toggle de contraseñas
    bindPasswordToggle('auth-toggle-pwd', 'auth-password');
    bindPasswordToggle('auth-toggle-reg-pwd', 'auth-reg-password');

    // Cerrar con el botón ×
    document.getElementById('auth-modal-close-btn')?.addEventListener('click', closeModal);

    // Cerrar al hacer clic fuera del contenedor
    const overlay = document.getElementById('auth-modal-overlay');
    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    // Cerrar con la tecla Escape (se desvincula automáticamente al cerrar)
    const onEsc = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', onEsc);
      }
    };
    document.addEventListener('keydown', onEsc);
  };

})();
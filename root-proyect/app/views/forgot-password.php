<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperar Contraseña - MOVEos</title>
    <link rel="stylesheet" href="assets/css/main.css">
    <link rel="icon" type="image/ico" href="assets/img/ico/icono.svg" id="icon.ico">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <script src="assets/js/theme-init.js"></script>
    <script src="assets/js/main.js"></script>
    <script type="module" src="assets/js/controllers/forgot-password-controller.js"></script>
</head>

<body>
    <!-- Switch del tema -->
    <div class="icons">
        <label class="switch top-right">
            <input type="checkbox" id="theme-toggle" role="switch" aria-checked="false"
                aria-label="Cambiar tema claro/oscuro">
            <span class="slider"></span>
        </label>
    </div>
    <!-- Contenedor principal -->
    <main class="first">
        <div class="container">
            <a href="index.php?accion=loginView" class="back-btn" aria-label="Volver al login">
                <i class="fas fa-arrow-left"></i>
            </a>
            <header class="header-form">
                <h1>RECUPERAR CONTRASEÑA</h1>
                <p id="header-description">Ingresa tu correo electrónico para recibir un código de verificación</p>
            </header>

            <div class="tab-switch" role="tablist">
                <a href="#" class="tab-btn active" role="tab" aria-selected="true" style="text-align: center;">Recuperar
                    Contraseña</a>
            </div>

            <!-- Paso 1: Solicitar código -->
            <form id="request-code-form" class="forgot-password-form">
                <input type="hidden" name="accion" value="requestCode">

                <label for="email">Correo Electrónico</label>
                <div class="input-group">
                    <i class="fas fa-envelope icon" aria-hidden="true"></i>
                    <input type="email" id="email" name="email" placeholder="tu_correo@example.com" required
                        aria-required="true">
                </div>

                <input type="submit" class="submit-btn" value="Enviar Código de Verificación"
                    aria-label="Enviar código de verificación">
            </form>

            <!-- Paso 2: Verificar código y cambiar contraseña -->
            <form id="change-password-form" class="forgot-password-form" style="display: none;">
                <input type="hidden" name="accion" value="changePassword">
                <input type="hidden" id="email-hidden" name="email" value="">

                <div class="info-message">
                    <i class="fas fa-info-circle"></i>
                    <span>Hemos enviado un código de 6 dígitos a tu correo electrónico.</span>
                </div>

                <label for="verification-code">Código de Verificación</label>
                <div class="input-group">
                    <i class="fas fa-key icon" aria-hidden="true"></i>
                    <input type="text" id="verification-code" name="verification_code" placeholder="123456"
                        maxlength="6" pattern="\d{6}" required aria-required="true">
                </div>

                <label for="new-password">Nueva Contraseña</label>
                <div class="input-group">
                    <i class="fas fa-lock icon" aria-hidden="true"></i>
                    <input type="password" id="new-password" name="new_password" placeholder="Tu nueva contraseña"
                        required aria-required="true">
                    <i class="fas fa-eye toggle-password" data-target="new-password" aria-label="Mostrar contraseña"
                        role="button" tabindex="0"></i>
                </div>

                <label for="confirm-password">Confirmar Nueva Contraseña</label>
                <div class="input-group">
                    <i class="fas fa-lock icon" aria-hidden="true"></i>
                    <input type="password" id="confirm-password" name="confirm_password"
                        placeholder="Repite tu nueva contraseña" required aria-required="true">
                    <i class="fas fa-eye toggle-password" data-target="confirm-password" aria-label="Mostrar contraseña"
                        role="button" tabindex="0"></i>
                </div>

                <input type="submit" class="submit-btn" value="Cambiar Contraseña" aria-label="Cambiar contraseña">

                <button type="button" id="back-to-email" class="link-btn">
                    <i class="fas fa-arrow-left"></i> Volver a ingresar email
                </button>
            </form>
        </div>
    </main>
</body>

</html>
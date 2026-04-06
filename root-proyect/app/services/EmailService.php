<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../../vendor/autoload.php';

class EmailService {

    private $mailer;

    public function __construct() {
        $this->mailer = new PHPMailer(true);
        $config = require __DIR__ . '/../../config/email-config.php';

        try {
            // Configuración SMTP
            $this->mailer->isSMTP();
            $this->mailer->Host       = $config['host'];
            $this->mailer->SMTPAuth   = true;
            $this->mailer->Username   = $config['username'];
            $this->mailer->Password   = $config['password'];
            $this->mailer->SMTPSecure = $config['encryption']; // 'tls' o 'ssl'
            $this->mailer->Port       = $config['port'];

            $this->mailer->setFrom($config['from_email'], $config['from_name']);
            $this->mailer->CharSet = 'UTF-8';
            $this->mailer->Encoding = 'base64';
        } catch (Exception $e) {
            error_log("Error inicializando PHPMailer: " . $e->getMessage());
        }
    }

    public function sendVerificationCode($toEmail, $toName, $code) {
        try {
            $this->mailer->clearAddresses(); // Limpiar direcciones previas para evitar duplicados
            $this->mailer->addAddress($toEmail, $toName);
            $this->mailer->isHTML(true);
            $this->mailer->Subject = 'Código de recuperación de contraseña';
            $this->mailer->Body    = "
                <p>Hola <b>$toName</b>,</p>
                <p>Tu código de verificación para recuperar tu contraseña es:</p>
                <h2>$code</h2>
                <p>Este código expirará en 15 minutos.</p>
                <p>Si no solicitaste este código, ignora este mensaje.</p>
            ";
            $this->mailer->AltBody = "Hola $toName, tu código de verificación es $code. Expira en 15 minutos.";

            return $this->mailer->send();
        } catch (Exception $e) {
            error_log("Error enviando email: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Enviar email de bienvenida al registrarse
     */
    public function sendWelcome($toEmail, $toName) {
        try {
            $this->mailer->clearAddresses();
            $this->mailer->addAddress($toEmail, $toName);
            $this->mailer->isHTML(true);
            $this->mailer->Subject = '¡Bienvenido a MOVEos!';
            $this->mailer->Body = "
                <div style='font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 2rem; background: #f9f9f9; border-radius: 12px;'>
                    <h1 style='color: #8C1E32; text-align: center;'>¡Bienvenido a MOVEos!</h1>
                    <p>Hola <b>$toName</b>,</p>
                    <p>Tu cuenta se ha creado correctamente. Ya puedes explorar actividades, inscribirte y conectar con otros usuarios.</p>
                    <p style='text-align: center; margin-top: 1.5rem;'>
                        <a href='http://localhost/Proyecto_MOVEos/Proyecto-Final-MoveOs-Grupo-5/root-proyect/public/index.php'
                           style='background: #8C1E32; color: #fff; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;'>
                           Ir a MOVEos
                        </a>
                    </p>
                    <p style='font-size: 0.85rem; color: #888; margin-top: 2rem; text-align: center;'>© 2025 MOVEos. Todos los derechos reservados.</p>
                </div>
            ";
            $this->mailer->AltBody = "Hola $toName, bienvenido a MOVEos. Tu cuenta se ha creado correctamente.";

            return $this->mailer->send();
        } catch (Exception $e) {
            error_log("Error enviando email de bienvenida: " . $e->getMessage());
            return false;
        }
    }
}
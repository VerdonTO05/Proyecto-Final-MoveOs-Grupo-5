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
}
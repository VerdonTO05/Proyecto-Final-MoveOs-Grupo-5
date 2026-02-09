<?php
/**
 * Servicio de Email usando PHPMailer
 */

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class EmailService
{
    private $mailer;
    private $config;

    public function __construct()
    {
        $this->config = require __DIR__ . '/../../config/email-config.php';
        $this->mailer = new PHPMailer(true);
        $this->configureSMTP();
    }

    /**
     * Configura el servidor SMTP
     */
    private function configureSMTP()
    {
        try {
            // Configuración del servidor
            $this->mailer->isSMTP();
            $this->mailer->Host = $this->config['smtp_host'];
            $this->mailer->SMTPAuth = true;
            $this->mailer->Username = $this->config['smtp_username'];
            $this->mailer->Password = $this->config['smtp_password'];
            $this->mailer->SMTPSecure = $this->config['smtp_secure'];
            $this->mailer->Port = $this->config['smtp_port'];

            // Configuración de encoding
            $this->mailer->CharSet = 'UTF-8';
            $this->mailer->Encoding = 'base64';

            // Debug (0 = off, 1 = client, 2 = client and server)
            $this->mailer->SMTPDebug = $this->config['smtp_debug'];

            // Remitente
            $this->mailer->setFrom(
                $this->config['from_email'],
                $this->config['from_name']
            );
        } catch (Exception $e) {
            error_log("Error configurando SMTP: " . $e->getMessage());
        }
    }

    /**
     * Envía un código de verificación al email del usuario
     * 
     * @param string $toEmail Email del destinatario
     * @param string $userName Nombre del usuario
     * @param string $verificationCode Código de verificación de 6 dígitos
     * @return bool True si el email se envió correctamente
     */
    public function sendVerificationCode($toEmail, $userName, $verificationCode)
    {
        // Modo desarrollo: Guardar código en archivo log
        if (isset($this->config['development_mode']) && $this->config['development_mode'] === true) {
            $this->saveCodeToLog($toEmail, $verificationCode);
            return true; // Simular envío exitoso
        }

        try {
            // Limpiar destinatarios previos
            $this->mailer->clearAddresses();
            $this->mailer->clearAttachments();

            // Destinatario
            $this->mailer->addAddress($toEmail, $userName);

            // Contenido
            $this->mailer->isHTML(true);
            $this->mailer->Subject = 'Código de Verificación - MOVEos';
            $this->mailer->Body = $this->getHtmlTemplate($userName, $verificationCode);
            $this->mailer->AltBody = $this->getTextTemplate($userName, $verificationCode);

            // Enviar
            $result = $this->mailer->send();

            if ($result) {
                error_log("Email enviado exitosamente a: " . $toEmail);
            }

            return $result;

        } catch (Exception $e) {
            error_log("Error al enviar email: " . $this->mailer->ErrorInfo);
            error_log("Exception: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Guarda el código de verificación en un archivo log (modo desarrollo)
     */
    private function saveCodeToLog($email, $code)
    {
        $logDir = __DIR__ . '/../../logs';
        $logFile = $logDir . '/verification_codes.log';

        // Crear directorio si no existe
        if (!file_exists($logDir)) {
            mkdir($logDir, 0755, true);
        }

        $timestamp = date('Y-m-d H:i:s');
        $logMessage = "[{$timestamp}] Email: {$email} | Código: {$code}\n";

        file_put_contents($logFile, $logMessage, FILE_APPEND);
        error_log("MODO DESARROLLO: Código guardado en logs/verification_codes.log");
    }

    /**
     * Plantilla HTML del email
     */
    private function getHtmlTemplate($userName, $code)
    {
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    line-height: 1.6; 
                    color: #333; 
                    margin: 0;
                    padding: 0;
                }
                .container { 
                    max-width: 600px; 
                    margin: 0 auto; 
                    padding: 20px; 
                }
                .header { 
                    background-color: #2c3e50; 
                    color: white; 
                    padding: 20px; 
                    text-align: center;
                    border-radius: 5px 5px 0 0;
                }
                .header h1 {
                    margin: 0;
                    font-size: 28px;
                }
                .content { 
                    background-color: #f9f9f9; 
                    padding: 30px; 
                    border-radius: 0 0 5px 5px;
                }
                .code-box {
                    background: white;
                    border-radius: 10px;
                    padding: 20px;
                    margin: 20px 0;
                    text-align: center;
                    border: 2px solid #3498db;
                }
                .code { 
                    font-size: 36px; 
                    font-weight: bold; 
                    color: #3498db; 
                    letter-spacing: 8px; 
                    margin: 10px 0;
                }
                .info {
                    color: #555;
                    font-size: 14px;
                    margin-top: 10px;
                }
                .warning {
                    background-color: #fff3cd;
                    border-left: 4px solid #ffc107;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 5px;
                }
                .footer { 
                    text-align: center; 
                    margin-top: 30px; 
                    padding-top: 20px;
                    border-top: 1px solid #ddd;
                    font-size: 12px; 
                    color: #777; 
                }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>MOVEos</h1>
                </div>
                <div class='content'>
                    <h2>Hola, {$userName}</h2>
                    <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
                    <p>Tu código de verificación es:</p>
                    
                    <div class='code-box'>
                        <div class='code'>{$code}</div>
                        <div class='info'>Este código expirará en 15 minutos</div>
                    </div>
                    
                    <div class='warning'>
                        <strong>⚠️ Importante:</strong> Si no solicitaste este cambio, ignora este mensaje y tu contraseña permanecerá sin cambios.
                    </div>
                </div>
                <div class='footer'>
                    <p>Este es un correo automático, por favor no respondas.</p>
                    <p>&copy; 2026 MOVEos. Todos los derechos reservados.</p>
                </div>
            </div>
        </body>
        </html>
        ";
    }

    /**
     * Plantilla de texto plano del email
     */
    private function getTextTemplate($userName, $code)
    {
        return "
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MOVEos - Recuperación de Contraseña
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hola, {$userName}

Hemos recibido una solicitud para restablecer tu contraseña.

Tu código de verificación es:

        {$code}

Este código expirará en 15 minutos.

⚠️ IMPORTANTE:
Si no solicitaste este cambio, ignora este mensaje y tu contraseña permanecerá sin cambios.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Este es un correo automático, por favor no respondas.
© 2026 MOVEos. Todos los derechos reservados.
        ";
    }
}

<?php
/**
 * Servicio de Email - Modo Desarrollo
 * Guarda códigos de verificación en archivo log
 */

class EmailService
{
    private $config;

    public function __construct()
    {
        $this->config = require __DIR__ . '/../../config/email-config.php';
    }

    /**
     * Envía un código de verificación (modo desarrollo: guarda en log)
     * 
     * @param string $toEmail Email del destinatario
     * @param string $userName Nombre del usuario (no usado en modo desarrollo)
     * @param string $verificationCode Código de verificación de 6 dígitos
     * @return bool True si se guardó correctamente
     */
    public function sendVerificationCode($toEmail, $userName, $verificationCode)
    {
        // En modo desarrollo, solo guardar en log
        if (isset($this->config['development_mode']) && $this->config['development_mode'] === true) {
            return $this->saveCodeToLog($toEmail, $verificationCode);
        }

        // Para futuro: aquí iría la lógica de envío real con SMTP
        error_log("ADVERTENCIA: development_mode debe estar en true en config/email-config.php");
        return false;
    }

    /**
     * Guarda el código de verificación en un archivo log
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

        $result = file_put_contents($logFile, $logMessage, FILE_APPEND);

        if ($result !== false) {
            error_log("Código guardado en logs/verification_codes.log");
            return true;
        }

        error_log("ERROR: No se pudo guardar el código en el log");
        return false;
    }
}

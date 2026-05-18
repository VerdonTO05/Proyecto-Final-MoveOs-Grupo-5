<?php
/**
 * @file EmailService.php
 * Servicio de correo electrónico de MOVEos.
 *
 * Centraliza todos los envíos de email transaccional de la plataforma
 * (bienvenida, recuperación de contraseña, notificaciones de actividades
 * y cambios de estado de cuenta) usando PHPMailer sobre SMTP.
 *
 * @package    Services
 * @author     MOVEos Grupo 5
 * @version    1.0.0
 */

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../../vendor/autoload.php';

/**
 * Servicio de envío de correos electrónicos transaccionales.
 *
 * Encapsula una instancia de PHPMailer preconfigurada con los ajustes SMTP
 * del archivo `config/email-config.php`. Cada método público compone y
 * envía un tipo específico de email; todos devuelven `true` si el envío
 * fue exitoso o `false` ante cualquier excepción (que se registra en el log).
 *
 * @package Services
 */
class EmailService
{
    /**
     * Instancia de PHPMailer usada para componer y enviar los correos.
     *
     * @var PHPMailer
     */
    private $mailer;

    /**
     * Inicializa PHPMailer con la configuración SMTP del proyecto.
     *
     * Lee el array de configuración de `config/email-config.php` y configura
     * host, autenticación, cifrado, puerto, remitente y charset.
     * Los errores de inicialización se registran en el log sin propagarse,
     * para no bloquear el flujo de la aplicación.
     */
    public function __construct()
    {
        $this->mailer = new PHPMailer(true);
        $config = require __DIR__ . '/../../config/email-config.php';

        try {
            $this->mailer->isSMTP();
            $this->mailer->Host = $config['host'];
            $this->mailer->SMTPAuth = true;
            $this->mailer->Username = $config['username'];
            $this->mailer->Password = $config['password'];
            $this->mailer->SMTPSecure = $config['encryption'];
            $this->mailer->Port = $config['port'];

            $this->mailer->setFrom($config['from_email'], $config['from_name']);
            $this->mailer->CharSet = 'UTF-8';
            $this->mailer->Encoding = 'base64';
        } catch (\Exception $e) {
            error_log("Error inicializando PHPMailer: " . $e->getMessage());
        }
    }

    /**
     * Envía un código de verificación para recuperar la contraseña.
     *
     * @param  string $toEmail Dirección de correo del destinatario.
     * @param  string $toName  Nombre completo del destinatario.
     * @param  string $code    Código numérico de verificación (expira en 15 min).
     * @return bool            `true` si el mensaje se envió, `false` ante error.
     */
    public function sendVerificationCode($toEmail, $toName, $code)
    {
        try {
            $this->mailer->clearAddresses();
            $this->mailer->addAddress($toEmail, $toName);
            $this->mailer->isHTML(true);
            $this->mailer->Subject = 'Código de recuperación de contraseña';
            $this->mailer->Body = "
                <div style='font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 2rem; background: #f9f9f9; border-radius: 12px;'>
                    <h1 style='color: #8C1E32; text-align: center;'>Recuperar contraseña</h1>
                    <p>Hola <b>$toName</b>,</p>
                    <p>Tu código de verificación para recuperar tu contraseña es:</p>
                    <div style='text-align: center; margin: 1.5rem 0;'>
                        <span style='font-size: 2rem; font-weight: bold; letter-spacing: 8px; color: #8C1E32; background: #fff; padding: 12px 24px; border-radius: 8px; border: 2px solid #8C1E32; display: inline-block;'>
                            $code
                        </span>
                    </div>
                    <p style='color: #555;'>Este código expirará en <b>15 minutos</b>.</p>
                    <p style='color: #555;'>Si no solicitaste este código, ignora este mensaje.</p>
                    <p style='font-size: 0.85rem; color: #888; margin-top: 2rem; text-align: center;'>© 2025 MOVEos. Todos los derechos reservados.</p>
                </div>
            ";
            $this->mailer->AltBody = "Hola $toName, tu código de verificación es $code. Expira en 15 minutos.";

            return $this->mailer->send();
        } catch (\Exception $e) {
            error_log("Error enviando email: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Envía el correo de bienvenida tras el registro de un nuevo usuario.
     *
     * @param  string $toEmail Dirección de correo del nuevo usuario.
     * @param  string $toName  Nombre completo del nuevo usuario.
     * @return bool            `true` si el mensaje se envió, `false` ante error.
     */
    public function sendWelcome($toEmail, $toName)
    {
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
                        <a href='http://localhost/Proyecto_Irene/Proyecto-Final-MoveOs-Grupo-5/root-proyect/public/index.php'
                           style='background: #8C1E32; color: #fff; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;'>
                           Ir a MOVEos
                        </a>
                    </p>
                    <p style='font-size: 0.85rem; color: #888; margin-top: 2rem; text-align: center;'>© 2025 MOVEos. Todos los derechos reservados.</p>
                </div>
            ";
            $this->mailer->AltBody = "Hola $toName, bienvenido a MOVEos. Tu cuenta se ha creado correctamente.";

            return $this->mailer->send();
        } catch (\Exception $e) {
            error_log("Error enviando email de bienvenida: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Notifica al usuario que su cuenta ha sido activada o desactivada.
     *
     * @param  string $toEmail       Dirección de correo del usuario afectado.
     * @param  string $toName        Nombre completo del usuario.
     * @param  string $newState      Nuevo estado: `'activa'` o `'inactiva'`.
     * @param  string $adminMessage  Mensaje opcional del administrador con el motivo.
     * @return bool                  `true` si el mensaje se envió, `false` ante error.
     */
    public function sendStateChange($toEmail, $toName, $newState, $adminMessage)
    {
        try {
            $this->mailer->clearAddresses();
            $this->mailer->addAddress($toEmail, $toName);
            $this->mailer->isHTML(true);

            $accion = $newState === 'activa' ? 'activada' : 'desactivada';
            $color = $newState === 'activa' ? '#2e7d32' : '#8C1E32';

            $this->mailer->Subject = "Tu cuenta ha sido {$accion}";
            $this->mailer->Body = "
            <div style='font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;
                        padding: 2rem; background: #f9f9f9; border-radius: 12px;'>
                <h1 style='color: {$color}; text-align: center;'>Cuenta {$accion}</h1>
                <p>Hola <b>{$toName}</b>,</p>
                <p>Tu cuenta en MOVEos ha sido <b>{$accion}</b> por un administrador.</p>
                " . ($adminMessage ? "
                <div style='background:#fff; border-left: 4px solid {$color};
                            padding: 1rem; border-radius: 6px; margin: 1rem 0;'>
                    <p style='margin:0; color:#333;'>{$adminMessage}</p>
                </div>" : "") . "
                <p style='font-size: 0.85rem; color: #888; margin-top: 2rem; text-align: center;'>
                    © 2025 MOVEos. Todos los derechos reservados.
                </p>
            </div>
        ";
            $this->mailer->AltBody = "Hola {$toName}, tu cuenta ha sido {$accion}. {$adminMessage}";

            return $this->mailer->send();
        } catch (\Exception $e) {
            error_log("Error enviando email de estado: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Notifica a un participante inscrito que una actividad ha sido cancelada.
     *
     * @param  string $activityTitle Título de la actividad eliminada.
     * @param  array  $p             Datos del participante: `['email' => ..., 'full_name' => ...]`.
     * @return bool                  `true` si el mensaje se envió, `false` ante error.
     */
    public function sendActivityDeleted($activityTitle, $p)
    {
        try {
            $this->mailer->clearAddresses();
            $this->mailer->addAddress($p['email'], $p['full_name']);
            $this->mailer->isHTML(true);

            $this->mailer->Subject = "Actividad cancelada: {$activityTitle}";

            $this->mailer->Body = "
                <div style='font-family: Arial; max-width:600px; margin:auto; padding:20px;'>
                    <h2 style='color:#8C1E32;'>Actividad cancelada</h2>
                    <p>Hola <b>{$p['full_name']}</b>,</p>
                    <p>Te informamos que la actividad <b>{$activityTitle}</b> ha sido cancelada por el organizador o un administrador.</p>
                    <p>Ya no es necesario que asistas ni realices ninguna acción.</p>
                    <hr>
                    <p style='font-size:12px;color:#888;'>MOVEos</p>
                </div>
            ";

            $this->mailer->AltBody = "La actividad {$activityTitle} ha sido cancelada.";
            $this->mailer->send();

            return true;
        } catch (\Exception $e) {
            error_log("Error email actividad eliminada: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Notifica al participante que un organizador ha rechazado su petición.
     * La petición vuelve a estar disponible para otros organizadores.
     *
     * @param  string $requestTitle Título de la petición rechazada.
     * @param  array  $p            Datos del participante: `['email' => ..., 'full_name' => ...]`.
     * @return bool                 `true` si el mensaje se envió, `false` ante error.
     */
    public function sendRequestUnaccepted($requestTitle, $p)
    {
        try {
            $this->mailer->clearAddresses();
            $this->mailer->addAddress($p['email'], $p['full_name']);
            $this->mailer->isHTML(true);

            $this->mailer->Subject = "Petición rehusada por organizador: {$requestTitle}";

            $this->mailer->Body = "
                <div style='font-family: Arial; max-width:600px; margin:auto; padding:20px;'>
                    <h2 style='color:#8C1E32;'>Petición rehusada</h2>
                    <p>Hola <b>{$p['full_name']}</b>,</p>
                    <p>Te informamos que la petición <b>{$requestTitle}</b> ha sido cancelada por el organizador.</p>
                    <p>Tu petición volverá a mostrarse a los organizadores para su realización.</p>
                    <hr>
                    <p style='font-size:12px;color:#888;'>MOVEos</p>
                </div>
            ";

            $this->mailer->AltBody = "La actividad {$requestTitle} ha sido cancelada.";
            $this->mailer->send();

            return true;
        } catch (\Exception $e) {
            error_log("Error email petición cancelada por organizador: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Notifica a un participante inscrito que los detalles de una actividad han cambiado.
     *
     * @param  string $activityTitle Título de la actividad modificada.
     * @param  string $changes       HTML con el resumen de los cambios realizados.
     * @param  array  $p             Datos del participante: `['email' => ..., 'full_name' => ...]`.
     * @return bool                  `true` si el mensaje se envió, `false` ante error.
     */
    public function sendActivityUpdated($activityTitle, $changes, $p)
    {
        try {
            $this->mailer->clearAddresses();
            $this->mailer->addAddress($p['email'], $p['full_name']);
            $this->mailer->isHTML(true);

            $this->mailer->Subject = "Actividad actualizada: {$activityTitle}";

            $this->mailer->Body = "
                <div style='font-family: Arial; max-width:600px; margin:auto; padding:20px;'>
                    <h2 style='color:#8C1E32;'>Actividad actualizada</h2>
                    <p>Hola <b>{$p['full_name']}</b>,</p>
                    <p>La actividad <b>{$activityTitle}</b> ha sido modificada.</p>

                    <div style='background:#f4f4f4; padding:10px; border-radius:8px;'>
                        {$changes}
                    </div>

                    <p>Te recomendamos revisar los nuevos detalles.</p>
                </div>
            ";
            $this->mailer->AltBody = "La actividad {$activityTitle} ha sido actualizada.";
            $this->mailer->send();

            return true;
        } catch (\Exception $e) {
            error_log("Error email actividad actualizada: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Notifica al organizador que una petición que había aceptado ha sido cancelada.
     *
     * @param  string $requestTitle Título de la petición cancelada.
     * @param  array  $organizer    Datos del organizador: `['email' => ..., 'full_name' => ...]`.
     * @return bool                 `true` si el mensaje se envió, `false` ante error.
     */
    public function sendRequestDeleted($requestTitle, $organizer)
    {
        try {
            $this->mailer->clearAddresses();
            $this->mailer->addAddress($organizer['email'], $organizer['full_name']);
            $this->mailer->isHTML(true);

            $this->mailer->Subject = "Petición cancelada: {$requestTitle}";

            $this->mailer->Body = "
                <div style='font-family: Arial; max-width:600px; margin:auto; padding:20px;'>
                    <h2 style='color:#8C1E32;'>Petición cancelada</h2>
                    <p>Hola <b>{$organizer['full_name']}</b>,</p>
                    <p>Te informamos que la petición <b>{$requestTitle}</b> ha sido cancelada por el participante o un administrador.</p>
                    <p>Ya no es necesario que asistas ni realices ninguna acción.</p>
                    <hr>
                    <p style='font-size:12px;color:#888;'>MOVEos</p>
                </div>
                ";
            $this->mailer->AltBody = "La petición {$requestTitle} ha sido cancelada.";
            $this->mailer->send();
            return true;
        } catch (\Exception $e) {
            error_log("Error email petición eliminada: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Notifica al organizador que los detalles de una petición aceptada han cambiado.
     *
     * @param  string $requestTitle Título de la petición modificada.
     * @param  string $changes      HTML con el resumen de los cambios realizados.
     * @param  array  $organizer    Datos del organizador: `['email' => ..., 'full_name' => ...]`.
     * @return bool                 `true` si el mensaje se envió, `false` ante error.
     */
    public function sendRequestUpdated($requestTitle, $changes, $organizer)
    {
        try {
            $this->mailer->clearAddresses();
            $this->mailer->addAddress($organizer['email'], $organizer['full_name']);
            $this->mailer->isHTML(true);

            $this->mailer->Subject = "Petición actualizada: {$requestTitle}";

            $this->mailer->Body = "
                <div style='font-family: Arial; max-width:600px; margin:auto; padding:20px;'>
                    <h2 style='color:#8C1E32;'>Petición actualizada</h2>
                    <p>Hola <b>{$organizer['full_name']}</b>,</p>
                    <p>La petición <b>{$requestTitle}</b> ha sido modificada.</p>

                    <div style='background:#f4f4f4; padding:10px; border-radius:8px;'>
                        {$changes}
                    </div>

                    <p>Te recomendamos revisar los nuevos detalles.</p>
                </div>
            ";
            $this->mailer->AltBody = "La petición {$requestTitle} ha sido actualizada.";
            $this->mailer->send();

            return true;
        } catch (\Exception $e) {
            error_log("Error email petición actualizada: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Notifica al organizador que su actividad ha sido aprobada por un administrador.
     *
     * @param  string $activityTitle Título de la actividad aprobada.
     * @param  array  $user          Datos del organizador: `['email' => ..., 'full_name' => ...]`.
     * @return bool                  `true` si el mensaje se envió, `false` ante error.
     */
    public function sendActivityAccepted($activityTitle, $user)
    {
        try {
            $this->mailer->clearAddresses();
            $this->mailer->addAddress($user['email'], $user['full_name']);
            $this->mailer->isHTML(true);

            $this->mailer->Subject = "Actividad aprobada: {$activityTitle}";

            $this->mailer->Body = "
            <div style='font-family: Arial; max-width:600px; margin:auto; padding:20px;'>
                <h2 style='color:#2e7d32;'>¡Actividad aprobada!</h2>

                <p>Hola <b>{$user['full_name']}</b>,</p>

                <p>Nos complace informarte de que tu actividad 
                <b>{$activityTitle}</b> ha sido <b>aprobada por un administrador</b>.</p>

                <p>Ya está disponible para los participantes en la plataforma.</p>

                <p>Te recomendamos revisarla y prepararte para gestionar las inscripciones.</p>

                <hr>

                <p style='font-size:12px;color:#888;'>MOVEos</p>
            </div>
        ";

            $this->mailer->AltBody =
                "Tu actividad '{$activityTitle}' ha sido aprobada y ya está disponible.";

            $this->mailer->send();

            return true;

        } catch (\Exception $e) {
            error_log("Error email actividad aprobada: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Notifica al participante que su petición ha sido aprobada por un administrador.
     *
     * @param  string $requestTitle Título de la petición aprobada.
     * @param  array  $user         Datos del participante: `['email' => ..., 'full_name' => ...]`.
     * @return bool                 `true` si el mensaje se envió, `false` ante error.
     */
    public function sendRequestAccepted($requestTitle, $user)
    {
        try {
            $this->mailer->clearAddresses();
            $this->mailer->addAddress($user['email'], $user['full_name']);
            $this->mailer->isHTML(true);

            $this->mailer->Subject = "Petición aprobada: {$requestTitle}";

            $this->mailer->Body = "
            <div style='font-family: Arial; max-width:600px; margin:auto; padding:20px;'>
                <h2 style='color:#2e7d32;'>¡Petición aprobada!</h2>

                <p>Hola <b>{$user['full_name']}</b>,</p>

                <p>Nos complace informarte de que tu petición 
                <b>{$requestTitle}</b> ha sido <b>aprobada por un administrador</b>.</p>

                <p>Ya está disponible para los participantes en la plataforma.</p>

                <p>Te recomendamos revisarla y prepararte para gestionar las inscripciones.</p>

                <hr>

                <p style='font-size:12px;color:#888;'>MOVEos</p>
            </div>
        ";

            $this->mailer->AltBody =
                "Tu petición '{$requestTitle}' ha sido aprobada y ya está disponible.";

            $this->mailer->send();

            return true;

        } catch (\Exception $e) {
            error_log("Error email petición aprobada: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Notifica al organizador que su actividad ha sido rechazada por un administrador.
     *
     * @param  string      $activityTitle Título de la actividad rechazada.
     * @param  array       $user          Datos del organizador: `['email' => ..., 'full_name' => ...]`.
     * @param  string|null $reason        Motivo del rechazo proporcionado por el administrador (opcional).
     * @return bool                       `true` si el mensaje se envió, `false` ante error.
     */
    public function sendActivityRejected($activityTitle, $user, $reason = null)
    {
        try {
            $this->mailer->clearAddresses();
            $this->mailer->addAddress($user['email'], $user['full_name']);
            $this->mailer->isHTML(true);

            $this->mailer->Subject = "Actividad rechazada: {$activityTitle}";

            $this->mailer->Body = "
        <div style='font-family: Arial; max-width:600px; margin:auto; padding:20px;'>
            <h2 style='color:#8C1E32;'>Actividad rechazada</h2>

            <p>Hola <b>{$user['full_name']}</b>,</p>

            <p>Lamentamos informarte de que tu actividad 
            <b>{$activityTitle}</b> ha sido <b>rechazada por un administrador</b>.</p>

            " . ($reason ? "
            <div style='background:#fff; border-left:4px solid #8C1E32; padding:10px; border-radius:6px; margin:10px 0;'>
                <p style='margin:0; color:#333;'><b>Motivo:</b> {$reason}</p>
            </div>
            " : "") . "

            <p>Puedes revisarla, corregirla e informar a un administrador para una nueva revisión.</p>

            <hr>
            <p style='font-size:12px;color:#888;'>MOVEos</p>
        </div>
        ";

            $this->mailer->AltBody =
                "Tu actividad '{$activityTitle}' ha sido rechazada. {$reason}";

            $this->mailer->send();

            return true;

        } catch (\Exception $e) {
            error_log("Error email actividad rechazada: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Notifica al participante que su petición ha sido rechazada por un administrador.
     *
     * @param  string      $requestTitle Título de la petición rechazada.
     * @param  array       $user         Datos del participante: `['email' => ..., 'full_name' => ...]`.
     * @param  string|null $reason       Motivo del rechazo proporcionado por el administrador (opcional).
     * @return bool                      `true` si el mensaje se envió, `false` ante error.
     */
    public function sendRequestRejected($requestTitle, $user, $reason = null)
    {
        try {
            $this->mailer->clearAddresses();
            $this->mailer->addAddress($user['email'], $user['full_name']);
            $this->mailer->isHTML(true);

            $this->mailer->Subject = "Petición rechazada: {$requestTitle}";

            $this->mailer->Body = "
        <div style='font-family: Arial; max-width:600px; margin:auto; padding:20px;'>
            <h2 style='color:#8C1E32;'>Petición rechazada</h2>

            <p>Hola <b>{$user['full_name']}</b>,</p>

            <p>Lamentamos informarte de que tu petición 
            <b>{$requestTitle}</b> ha sido <b>rechazada por un administrador</b>.</p>

            " . ($reason ? "
            <div style='background:#fff; border-left:4px solid #8C1E32; padding:10px; border-radius:6px; margin:10px 0;'>
                <p style='margin:0; color:#333;'><b>Motivo:</b> {$reason}</p>
            </div>
            " : "") . "

            <p>Puedes revisarla y volver a intentarlo cuando lo desees.</p>

            <hr>
            <p style='font-size:12px;color:#888;'>MOVEos</p>
        </div>
        ";

            $this->mailer->AltBody =
                "Tu petición '{$requestTitle}' ha sido rechazada. {$reason}";

            $this->mailer->send();

            return true;

        } catch (\Exception $e) {
            error_log("Error email petición rechazada: " . $e->getMessage());
            return false;
        }
    }

}
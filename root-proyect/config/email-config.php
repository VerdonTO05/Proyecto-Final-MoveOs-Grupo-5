<?php
/**
 * Configuración de Email para Modo Desarrollo
 * 
 * En modo desarrollo, los códigos se guardan en logs/verification_codes.log
 * Para producción con SMTP real, cambia development_mode a false y configura las credenciales
 */

return [
    // MODO DESARROLLO: Guarda códigos en archivo log en lugar de enviar emails
    'development_mode' => true,
];

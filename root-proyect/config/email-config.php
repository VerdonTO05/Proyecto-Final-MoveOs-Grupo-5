<?php
/**
 * Configuración de Email SMTP
 * 
 * IMPORTANTE: Este archivo contiene credenciales sensibles.
 * Asegúrate de agregarlo a .gitignore para no subirlo al repositorio.
 */

return [
    // MODO DESARROLLO: No envía emails reales, muestra el código en la respuesta
    'development_mode' => true,  // ← Cambiar a false cuando tengas SMTP configurado

    // Configuración SMTP para Gmail
    'smtp_host' => 'smtp.gmail.com',
    'smtp_port' => 587,
    'smtp_secure' => 'tls',
    'smtp_username' => 'moveosiac@gmail.com',
    'smtp_password' => 'maireale',

    // Información del remitente
    'from_email' => 'moveosiac@gmail.com',
    'from_name' => 'MOVEos',

    // Opciones de debug (0 = off, 1 = client, 2 = client and server)
    'smtp_debug' => 0,
];

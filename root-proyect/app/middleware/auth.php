<?php
/**
 * Auth Middleware - Control de acceso basado en roles
 * 
 * Este archivo proporciona funciones para verificar la autenticación
 * y autorización del usuario basándose en su rol.
 */

// Iniciar sesión si no está iniciada
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/**
 * Verificar si el usuario está autenticado
 * @return bool
 */
function isAuthenticated()
{
    return isset($_SESSION['user_id']) && isset($_SESSION['role']);
}

/**
 * Verificar si el usuario tiene un rol específico
 * @param string $role - Rol requerido (administrador, oferente, participante)
 * @return bool
 */
function hasRole($role)
{
    return isAuthenticated() && $_SESSION['role'] === $role;
}

/**
 * Verificar si el usuario tiene alguno de los roles especificados
 * @param array $roles - Array de roles permitidos
 * @return bool
 */
function hasAnyRole($roles)
{
    if (!isAuthenticated()) {
        return false;
    }
    return in_array($_SESSION['role'], $roles);
}

/**
 * Requerir autenticación - Redirige al login si no está autenticado
 * @param string $redirectUrl - URL a la que redirigir después del login
 */
function requireAuth($redirectUrl = null)
{
    if (!isAuthenticated()) {
        $redirect = $redirectUrl ? '?redirect=' . urlencode($redirectUrl) : '';
        header('Location: ../../public/index.php' . $redirect);
        exit;
    }
}

/**
 * Requerir un rol específico - Redirige si no tiene el rol
 * @param string $requiredRole - Rol requerido
 * @param string $redirectUrl - URL a la que redirigir si no tiene permisos
 */
function requireRole($requiredRole, $redirectUrl = '../views/home.php')
{
    requireAuth(); // Primero verificar que esté autenticado

    if (!hasRole($requiredRole)) {
        // Redirigir a página de error o home dependiendo del caso
        header('Location: ' . $redirectUrl);
        exit;
    }
}

/**
 * Requerir alguno de los roles especificados
 * @param array $allowedRoles - Array de roles permitidos
 * @param string $redirectUrl - URL a la que redirigir si no tiene permisos
 */
function requireAnyRole($allowedRoles, $redirectUrl = '../views/home.php')
{
    requireAuth(); // Primero verificar que esté autenticado

    if (!hasAnyRole($allowedRoles)) {
        header('Location: ' . $redirectUrl);
        exit;
    }
}

/**
 * Obtener información del usuario actual
 * @return array|null
 */
function getCurrentUser()
{
    if (!isAuthenticated()) {
        return null;
    }

    return [
        'id' => $_SESSION['user_id'] ?? null,
        'name' => $_SESSION['name'] ?? null,
        'email' => $_SESSION['email'] ?? null,
        'role' => $_SESSION['role'] ?? null
    ];
}

/**
 * Verificar si es administrador
 * @return bool
 */
function isAdmin()
{
    return hasRole('administrador');
}

/**
 * Verificar si es oferente
 * @return bool
 */
function isOferente()
{
    return hasRole('oferente');
}

/**
 * Verificar si es participante
 * @return bool
 */
function isParticipante()
{
    return hasRole('participante');
}
?>
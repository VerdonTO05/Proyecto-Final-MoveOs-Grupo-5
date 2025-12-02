/**
 * Valida formato de email
 */
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Valida longitud mínima de la contraseña
 */
function validatePassword(password) {
    return password.length >= 8;
}

/**
 * Valida que el nombre completo tenga al menos 2 palabras
 */
function validateFullName(name) {
    return name.trim().split(" ").length >= 2;
}




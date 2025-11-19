// Array temporal de usuarios
const users = [];

/**
 * Añade un nuevo usuario al array temporal
 * @param {Object} user - Objeto con los datos del usuario
 */
function addUser(user) {
    users.push(user);
    console.log("Usuario registrado:", user);
}

/**
 * Devuelve todos los usuarios registrados
 */
function getUsers() {
    return users;
}

/**
 * Comprueba si un usuario ya existe por su email o username
 */
function userExists(email, username) {
    return users.some(u => u.email === email || u.username === username);
}
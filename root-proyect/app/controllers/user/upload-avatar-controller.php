<?php
/**
 * Controlador para subir/actualizar la foto de perfil del usuario.
 *
 * Recibe un archivo vía multipart/form-data, lo valida (tipo y tamaño),
 * borra la imagen anterior si existe, guarda la nueva en uploads/avatars/
 * y actualiza la base de datos y la sesión.
 */

// Iniciar sesión solo si no hay una activa
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Cargar el modelo de usuarios y la conexión a la base de datos
require_once __DIR__ . '/../../models/entities/User.php';
require_once __DIR__ . '/../../../config/database.php';

// Establecer el tipo de respuesta como JSON
header('Content-Type: application/json');

// Verificar que el usuario esté autenticado
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Debes iniciar sesión']);
    exit;
}

// Verificar que se haya enviado un archivo
if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
    $errorMessages = [
        UPLOAD_ERR_INI_SIZE   => 'El archivo excede el tamaño máximo permitido por el servidor.',
        UPLOAD_ERR_FORM_SIZE  => 'El archivo excede el tamaño máximo permitido.',
        UPLOAD_ERR_PARTIAL    => 'El archivo se subió parcialmente.',
        UPLOAD_ERR_NO_FILE    => 'No se seleccionó ningún archivo.',
        UPLOAD_ERR_NO_TMP_DIR => 'Falta la carpeta temporal del servidor.',
        UPLOAD_ERR_CANT_WRITE => 'Error al escribir el archivo en disco.',
    ];

    $code = $_FILES['avatar']['error'] ?? UPLOAD_ERR_NO_FILE;
    $msg  = $errorMessages[$code] ?? 'Error al subir el archivo.';

    echo json_encode(['success' => false, 'message' => $msg]);
    exit;
}

$file   = $_FILES['avatar'];
$userId = $_SESSION['user_id'];

// Validar tipo MIME (solo imágenes)
$allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
$finfo        = new finfo(FILEINFO_MIME_TYPE);
$mimeType     = $finfo->file($file['tmp_name']);

if (!in_array($mimeType, $allowedTypes)) {
    echo json_encode([
        'success' => false,
        'message' => 'Formato no válido. Solo se aceptan JPEG, PNG o WEBP.'
    ]);
    exit;
}

// Validar tamaño máximo (2 MB)
$maxSize = 2 * 1024 * 1024;
if ($file['size'] > $maxSize) {
    echo json_encode([
        'success' => false,
        'message' => 'La imagen no puede superar los 2 MB.'
    ]);
    exit;
}

// Determinar extensión
$extensions = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
$ext        = $extensions[$mimeType];

// Directorio de destino
$uploadDir = __DIR__ . '/../../../public/uploads/avatars/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Borrar avatar anterior del usuario (cualquier extensión)
foreach (['jpg', 'png', 'webp'] as $oldExt) {
    $oldFile = $uploadDir . "avatar_{$userId}.{$oldExt}";
    if (file_exists($oldFile)) {
        unlink($oldFile);
    }
}

// Guardar la nueva imagen
$filename    = "avatar_{$userId}.{$ext}";
$destination = $uploadDir . $filename;

if (!move_uploaded_file($file['tmp_name'], $destination)) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al guardar la imagen en el servidor.'
    ]);
    exit;
}

// Ruta relativa para guardar en BD y usar en el frontend
$relativePath = "uploads/avatars/{$filename}";

try {
    // Actualizar la base de datos
    $database  = new Database();
    $db        = $database->getConnection();
    $userModel = new User($db);
    $userModel->updateProfileImage($userId, $relativePath);

    // Actualizar la sesión para que el cambio sea inmediato
    $_SESSION['profile_image'] = $relativePath;

    echo json_encode([
        'success' => true,
        'message' => 'Foto de perfil actualizada correctamente.',
        'image_url' => $relativePath
    ]);

} catch (Exception $e) {
    error_log('[Exception] uploadAvatarController: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor al actualizar la foto.'
    ]);
}
?>

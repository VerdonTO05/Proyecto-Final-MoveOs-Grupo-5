<?php
/**
 * Controlador para editar una publicación propia (actividad o petición).
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../models/entities/Activity.php';
require_once __DIR__ . '/../../models/entities/Request.php';
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../models/entities/User.php';
require_once __DIR__ . '/../../models/entities/Registration.php';
require_once __DIR__ . '/../../services/EmailService.php';

if (!isset($_SESSION['user_id'])) {
    header('Location: index.php?accion=loginView');
    exit;
}

function jsonResponse(bool $success, string $message, array $errors = []): void
{
    header('Content-Type: application/json');
    echo json_encode(['success' => $success, 'message' => $message, 'errors' => $errors]);
    exit;
}

/**
 * Procesa y guarda la imagen subida.
 * Devuelve la ruta pública relativa o null si no se subió ninguna imagen válida.
 */
function handleImageUpload(): ?string
{
    if (
        !isset($_FILES['image_file']) ||
        $_FILES['image_file']['error'] === UPLOAD_ERR_NO_FILE ||
        $_FILES['image_file']['size'] === 0
    ) {
        return null;
    }

    $file = $_FILES['image_file'];

    if ($file['error'] !== UPLOAD_ERR_OK) {
        jsonResponse(false, 'Error al subir la imagen.', ['Error de subida: código ' . $file['error']]);
    }

    $allowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mimeType, $allowedMimes)) {
        jsonResponse(false, 'Error en el formulario.', ['Formato de imagen inválido (solo JPG o PNG).']);
    }

    if ($file['size'] > 5 * 1024 * 1024) {
        jsonResponse(false, 'Error en el formulario.', ['La imagen no puede superar 5MB.']);
    }

    $extension = ($mimeType === 'image/png') ? 'png' : 'jpg';
    $filename = uniqid('activity_', true) . '.' . $extension;

    // Ajusta esta ruta al directorio real de tu proyecto
    $uploadDir = __DIR__ . '/../../../public/assets/img/activities/';

    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $destination = $uploadDir . $filename;

    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        jsonResponse(false, 'No se pudo guardar la imagen en el servidor.', []);
    }

    return 'assets/img/activities/' . $filename;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    $activityModel = new Activity($db);
    $requestModel = new Request($db);
    $registrationModel = new Registration($db);
    $userModel = new User($db);
    $emailService = new EmailService();

    $id = $_POST['id'] ?? $_GET['id'] ?? null;

    if (!$id) {
        $_SESSION['error'] = 'Información no recibida';
        header('Location: index.php?accion=seeMyActivities');
        exit;
    }

    if ($_SESSION['role'] === 'participante') {
        $publication = $requestModel->getRequestById($id);
        $typePublication = 'request';
    } else {
        $publication = $activityModel->getActivityById($id);
        $typePublication = 'activity';
    }

    if (!$publication) {
        $_SESSION['error'] = 'Publicación no encontrada';
        header('Location: index.php?accion=seeMyActivities');
        exit;
    }

    $userId = $_SESSION['user_id'];
    $field = ($typePublication === 'activity') ? 'offertant_id' : 'participant_id';

    if ($publication[$field] != $userId) {
        $_SESSION['error'] = 'No tienes permiso para editar esta publicación';
        header('Location: index.php?accion=seeMyActivities');
        exit;
    }

    // ── Fase POST ─────────────────────────────────────────────────────────────
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['title'])) {

        $categoryId = $_POST['category_id'] ?? null;
        if (empty($categoryId)) {
            jsonResponse(false, 'Error en el formulario', ['Debes seleccionar una categoría válida.']);
        }

        // Nueva imagen si se subió, si no mantener la actual
        $newImageUrl = handleImageUpload();
        $imageUrl = $newImageUrl ?? ($_POST['current_image'] ?? $publication['image_url'] ?? null);

        $data = [
            'id' => $id,
            'title' => trim($_POST['title'] ?? ''),
            'description' => trim($_POST['description'] ?? ''),
            'category_id' => $categoryId,
            'location' => trim($_POST['location'] ?? ''),
            'date' => $publication['date'],
            'time' => $_POST['time'] ?? null,
            'language' => trim($_POST['language'] ?? ''),
            'min_age' => $_POST['min_age'] ?? null,
            'dress_code' => trim($_POST['dress_code'] ?? ''),
            'transport_included' => isset($_POST['transport_included']) ? 1 : 0,
            'departure_city' => trim($_POST['departure_city'] ?? ''),
            'pets_allowed' => isset($_POST['pets_allowed']) ? 1 : 0,
            'image_url' => $imageUrl,
        ];

        if ($typePublication === 'activity') {
            $data['price'] = $_POST['price'] ?? null;
            $data['max_people'] = $_POST['max_people'] ?? null;
        }

        $fieldsToCompare = [
            'title',
            'description',
            'category_id',
            'location',
            'date',
            'time',
            'language',
            'min_age',
            'dress_code',
            'transport_included',
            'departure_city',
            'pets_allowed',
            'image_url',
        ];

        if ($typePublication === 'activity') {
            $fieldsToCompare[] = 'price';
            $fieldsToCompare[] = 'max_people';
        }

        $hasChanges = false;
        foreach ($fieldsToCompare as $f) {
            if ((string) ($data[$f] ?? '') !== (string) ($publication[$f] ?? '')) {
                $hasChanges = true;
                break;
            }
        }

        $changesList = [];

        foreach ($fieldsToCompare as $f) {
            $old = (string) ($publication[$f] ?? '');
            $new = (string) ($data[$f] ?? '');

            if ($old !== $new) {

                if ($f === 'image_url' || $f === 'title' || $f === 'category_id') {
                    continue;
                }

                $changesList[$f] = [
                    'old' => $old,
                    'new' => $new
                ];
            }
        }

        if (!$hasChanges) {
            jsonResponse(true, 'Sin cambios detectados.');
        }

        if ($typePublication === 'activity') {
            $data['offertant_id'] = $_SESSION['user_id'];

            if ((int) $data['max_people'] !== (int) $publication['max_people']) {

                $currentParticipants = $activityModel->getCurrentRegistrations((int) $id);

                if ($currentParticipants > (int) $data['max_people']) {
                    jsonResponse(false, 'Error en el formulario', [
                        "No puedes reducir el máximo de participantes a {$data['max_people']} porque ya hay {$currentParticipants} inscritos."
                    ]);
                }
            }

            $result = $activityModel->updateActivity($data);

            $errorMessages = [
                'conflict_activity' => 'Ya tienes otra actividad ese día: "' . (is_array($result) ? ($result['title'] ?? '') : '') . '".',
                'conflict_request' => 'Ya tienes una petición aceptada ese día: "' . (is_array($result) ? ($result['title'] ?? '') : '') . '".',
                'not_found' => 'La actividad no existe o no se pudo actualizar.',
                'exception' => 'Error del servidor.',
            ];
        } else {
            $data['participant_id'] = $_SESSION['user_id'];
            $result = $requestModel->updateRequest($data);

            $errorMessages = [
                'conflict_request' => 'Ya tienes otra petición ese día: "' . (is_array($result) ? ($result['title'] ?? '') : '') . '".',
                'conflict_activity' => 'Ya tienes una inscripción en una actividad ese día: "' . (is_array($result) ? ($result['title'] ?? '') : '') . '".',
                'not_found' => 'La petición no existe o no se pudo actualizar.',
                'exception' => 'Error del servidor.',
            ];
        }

        $changesHtml = '';

        $labels = [
            'title' => 'Título',
            'description' => 'Descripción',
            'category_id' => 'Categoría',
            'location' => 'Ubicación',
            'date' => 'Fecha',
            'time' => 'Hora',
            'language' => 'Idioma',
            'min_age' => 'Edad mínima',
            'dress_code' => 'Código de vestimenta',
            'transport_included' => 'Transporte incluido',
            'departure_city' => 'Ciudad de salida',
            'pets_allowed' => 'Mascotas permitidas',
            'price' => 'Precio',
            'max_people' => 'Máximo de personas',
            'image_url' => 'Imagen'
        ];

        foreach ($changesList as $field => $values) {
            $label = $labels[$field] ?? ucfirst(str_replace('_', ' ', $field));

            $oldValue = $values['old'];
            $newValue = $values['new'];

            // Formateo de booleanos
            if (in_array($field, ['transport_included', 'pets_allowed'])) {
                $oldValue = ($oldValue == '1') ? 'Sí' : 'No';
                $newValue = ($newValue == '1') ? 'Sí' : 'No';
            }

            $changesHtml .= "
        <p style='margin:5px 0;'>
            <b>{$label}:</b><br>
            <span style='color:#999;'>Antes:</span> {$oldValue}<br>
            <span style='color:#2E7D32;'>Ahora:</span> {$newValue}
        </p>
    ";
        }

        if ($result === true) {
            if ($typePublication === 'activity') {
                $registrations = $registrationModel->getRegistrationsByActivityId($id);

                foreach ($registrations as $r) {
                    $user = $userModel->getUserById($r['participant_id']);

                    if ($user) {
                        try {
                            $emailService->sendActivityUpdated(
                                $data['title'],
                                $changesHtml,
                                $user
                            );
                        } catch (Exception $e) {
                            error_log("Error enviando email: " . $e->getMessage());
                        }
                    }
                }
            } else {
                // Notificar al organizador si la request está aceptada
                if (!empty($publication['accepted_by'])) {

                    $organizer = $userModel->getUserById($publication['accepted_by']);

                    if ($organizer) {
                        try {
                            $emailService->sendRequestUpdated(
                                $data['title'],
                                $changesHtml,
                                $organizer
                            );
                        } catch (Exception $e) {
                            error_log("Error enviando email: " . $e->getMessage());
                        }
                    }
                }
            }

            jsonResponse(true, 'Publicación actualizada correctamente.');


        } else {
            $msg = is_array($result) && isset($result['error'])
                ? ($errorMessages[$result['error']] ?? 'Error al actualizar.')
                : 'Error al actualizar.';

            jsonResponse(false, $msg, [$msg]);
        }
    }

    // ── Fase GET ──────────────────────────────────────────────────────────────
    require __DIR__ . '/../../views/posts/edit-activity.php';

} catch (PDOException $e) {
    error_log('[PDOException] editActivityController: ' . $e->getMessage());
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        jsonResponse(false, 'Error de base de datos. Inténtalo más tarde.');
    }
    http_response_code(500);
    echo 'Error de base de datos. Inténtalo más tarde.';
} catch (Exception $e) {
    error_log('[Exception] editActivityController: ' . $e->getMessage());
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        jsonResponse(false, 'Error del servidor. Inténtalo más tarde.');
    }
    http_response_code(500);
    echo 'Error del servidor. Inténtalo más tarde.';
}
?>
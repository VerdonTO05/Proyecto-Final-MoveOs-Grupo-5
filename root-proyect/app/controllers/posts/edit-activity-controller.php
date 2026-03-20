<?php
/**
 * Controlador para editar una publicación propia (actividad o petición).
 *
 * Gestiona dos fases en una misma ruta:
 * - GET:  carga la publicación y muestra el formulario de edición.
 * - POST: valida los cambios, detecta si hubo modificaciones reales
 *         y actualiza el registro en la base de datos.
 *
 * Verifica que el usuario esté autenticado y que la publicación le pertenezca
 * antes de permitir cualquier operación.
 */

// Iniciar sesión solo si no hay una activa
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Cargar los modelos necesarios y la conexión a la base de datos
require_once __DIR__ . '/../../models/entities/Activity.php';
require_once __DIR__ . '/../../models/entities/Request.php';
require_once __DIR__ . '/../../../config/database.php';

// Verificar que el usuario esté autenticado; redirigir al login si no lo está
if (!isset($_SESSION['user_id'])) {
    header('Location: index.php?accion=loginView');
    exit;
}

try {
    // Instanciar la conexión y los modelos
    $database = new Database();
    $db = $database->getConnection();
    $activityModel = new Activity($db);
    $requestModel = new Request($db);

    // Obtener el ID de la publicación desde POST (edición) o GET (carga inicial)
    $id = $_POST['id'] ?? $_GET['id'] ?? null;

    // Validar que se haya proporcionado un ID
    if (!$id) {
        $_SESSION['error'] = 'Información no recibida';
        header('Location: index.php?accion=seeMyActivities');
        exit;
    }

    // Obtener la publicación según el rol del usuario
    if ($_SESSION['role'] === 'participante') {
        // El participante trabaja con peticiones
        $publication = $requestModel->getRequestById($id);
        $typePublication = 'request';
    } else {
        // El organizador (u otro rol) trabaja con actividades
        $publication = $activityModel->getActivityById($id);
        $typePublication = 'activity';
    }

    // Verificar que la publicación existe en la base de datos
    if (!$publication) {
        $_SESSION['error'] = 'Publicación no encontrada';
        header('Location: index.php?accion=seeMyActivities');
        exit;
    }

    // Verificar que la publicación pertenece al usuario autenticado
    $userId = $_SESSION['user_id'];
    $field = ($typePublication === 'activity') ? 'offertant_id' : 'participant_id';

    if ($publication[$field] != $userId) {
        $_SESSION['error'] = 'No tienes permiso para editar esta publicación';
        header('Location: index.php?accion=seeMyActivities');
        exit;
    }

    // ── Fase POST: procesar el formulario de edición ──────────────────────────
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['title'])) {

        // Recoger y limpiar los campos comunes del formulario
        $data = [
            'id' => $id,
            'title' => trim($_POST['title'] ?? ''),
            'description' => trim($_POST['description'] ?? ''),
            'category_id' => $_POST['category_id'] ?? null,
            'location' => trim($_POST['location'] ?? ''),
            'date' => $_POST['date'] ?? null,
            'time' => $_POST['time'] ?? null,
            'language' => trim($_POST['language'] ?? ''),
            'min_age' => $_POST['min_age'] ?: null,
            'dress_code' => trim($_POST['dress_code'] ?? ''),
            'transport_included' => isset($_POST['transport_included']) ? 1 : 0, // Checkbox
            'departure_city' => trim($_POST['departure_city'] ?? ''),
            'pets_allowed' => isset($_POST['pets_allowed']) ? 1 : 0, // Checkbox
        ];

        // Añadir campos exclusivos de actividad
        if ($typePublication === 'activity') {
            $data['price'] = $_POST['price'] ?: null;
            $data['max_people'] = $_POST['max_people'] ?: null;
        }

        // Definir los campos a comparar con los valores actuales para detectar cambios
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
            'pets_allowed'
        ];

        if ($typePublication === 'activity') {
            $fieldsToCompare[] = 'price';
            $fieldsToCompare[] = 'max_people';
        }

        // Comparar campo a campo para detectar si hubo alguna modificación real
        $hasChanges = false;
        foreach ($fieldsToCompare as $f) {
            if ((string) ($data[$f] ?? '') !== (string) ($publication[$f] ?? '')) {
                $hasChanges = true;
                break;
            }
        }

        // Si no hubo ningún cambio, redirigir sin ejecutar la actualización
        if (!$hasChanges) {
            header('Location: index.php?accion=seeMyActivities');
            exit;
        }

        // Ejecutar la actualización según el tipo de publicación
        if ($typePublication === 'activity') {
            $data['offertant_id'] = $_SESSION['user_id'];
            $result = $activityModel->updateActivity($data);

            // Mapear códigos de error del modelo a mensajes legibles
            $errorMessages = [
                'conflict_activity' => 'Ya tienes otra actividad ese día: "' . (is_array($result) ? ($result['title'] ?? '') : '') . '".',
                'conflict_request' => 'Ya tienes una petición aceptada ese día: "' . (is_array($result) ? ($result['title'] ?? '') : '') . '".',
                'not_found' => 'La actividad no existe o no se pudo actualizar.',
                'exception' => 'Error del servidor.',
            ];

        } else {
            $data['participant_id'] = $_SESSION['user_id'];
            $result = $requestModel->updateRequest($data);

            // Mapear códigos de error del modelo a mensajes legibles
            $errorMessages = [
                'conflict_request' => 'Ya tienes otra petición ese día: "' . (is_array($result) ? ($result['title'] ?? '') : '') . '".',
                'conflict_activity' => 'Ya tienes una inscripción en una actividad ese día: "' . (is_array($result) ? ($result['title'] ?? '') : '') . '".',
                'not_found' => 'La petición no existe o no se pudo actualizar.',
                'exception' => 'Error del servidor.',
            ];
        }

        // Si la actualización fue correcta, redirigir a mis actividades
        if ($result === true) {
            header('Location: index.php?accion=seeMyActivities');
            exit;
        }

        // Guardar el error en sesión y redirigir al formulario con los datos anteriores
        $msg = is_array($result) && isset($result['error'])
            ? ($errorMessages[$result['error']] ?? 'Error al actualizar.')
            : 'Error al actualizar.';

        $_SESSION['form_errors'] = [$msg];
        $_SESSION['form_old_data'] = $_POST;
        header('Location: index.php?accion=editActivity&id=' . $id);
        exit;
    }

    // ── Fase GET: mostrar el formulario de edición con los datos actuales ─────
    require __DIR__ . '/../../views/posts/edit-activity.php';

} catch (PDOException $e) {
    // Error específico de base de datos: registrar internamente sin exponer detalles
    error_log('[PDOException] editActivityController: ' . $e->getMessage());
    http_response_code(500);
    echo 'Error de base de datos. Inténtalo más tarde.';
} catch (Exception $e) {
    // Error genérico inesperado: registrar internamente sin exponer detalles
    error_log('[Exception] editActivityController: ' . $e->getMessage());
    http_response_code(500);
    echo 'Error del servidor. Inténtalo más tarde.';
}
?>
<?php
require_once __DIR__ . '/../../middleware/auth.php';
requireAnyRole(['organizador', 'participante']);
requireActiveUser();

$rol          = $_SESSION['role'];
$participante = ($rol === 'participante');

// Recuperar datos antiguos y limpiarlos de sesión
$old = $_SESSION['form_old_data'] ?? [];
unset($_SESSION['form_old_data']);

// Si hay old data la usamos, si no los datos de la publicación
function old(string $key, $fallback = ''): string {
    global $old, $publication;
    if (!empty($old) && isset($old[$key])) {
        return htmlspecialchars($old[$key], ENT_QUOTES);
    }
    return htmlspecialchars($publication[$key] ?? $fallback, ENT_QUOTES);
}
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <title>Editar Actividad</title>
    <link rel="stylesheet" href="assets/css/main.css">
    <link rel="icon" type="image/ico" href="assets/img/ico/icono.svg">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <script src="assets/js/utils.js"></script>
    <script src="assets/js/main.js"></script>
</head>

<body>
    <?php if (!empty($_SESSION['form_errors'])): ?>
    <script>
        window.__PHP_FORM_ERRORS__ = <?= json_encode($_SESSION['form_errors']) ?>;
    </script>
    <?php unset($_SESSION['form_errors']); ?>
    <?php endif; ?>

    <div class="icons">
        <label class="switch top-right">
            <input type="checkbox" id="theme-toggle" role="switch" aria-checked="false"
                aria-label="Cambiar tema claro/oscuro">
            <span class="slider"></span>
        </label>
    </div>

    <div class="container c">
        <header class="header-form create">
            <?php if ($participante): ?>
                <h1>Editar Petición</h1>
                <p>Ajusta cada detalle para que los ofertantes sepan qué quieres.</p>
            <?php else: ?>
                <h1>Editar Actividad</h1>
                <p>Ajusta cada detalle para que los participantes sepan qué esperar.</p>
            <?php endif; ?>
        </header>

        <div class="alert">
            <p>La <?= $participante ? 'petición' : 'actividad' ?> ingresada quedará <strong>pendiente de revisión
                    administrativa</strong> y será publicada una vez reciba la aprobación correspondiente.</p>
        </div>

        <form class="form-activity" id="form-create-activity" action="index.php" method="POST"
            enctype="multipart/form-data">

            <input type="hidden" name="accion" value="editActivity">
            <input type="hidden" name="id" value="<?= htmlspecialchars($publication['id']) ?>">
            <input type="hidden" name="type" value="<?= $participante ? 'request' : 'activity' ?>">

            <div class="full">
                <label>Título de la <?= $participante ? "Petición" : "Actividad" ?> *</label>
                <input type="text" name="title" placeholder="Ej: Yoga al aire libre"
                    required aria-required="true" value="<?= old('title') ?>" />
            </div>

            <div class="full">
                <label>Descripción *</label>
                <textarea name="description" placeholder="Describe los detalles..."
                    required aria-required="true"><?= old('description') ?></textarea>
            </div>

            <div>
                <?php
                $categories = [
                    1 => 'Taller',       2 => 'Clase',      3 => 'Evento',
                    4 => 'Excursión',    5 => 'Formación técnica', 6 => 'Conferencia',
                    7 => 'Reunión',      8 => 'Experiencia', 9 => 'Tour',
                    10 => 'Competición', 11 => 'Evento social'
                ];
                $selectedCategory = !empty($old) ? ($old['category_id'] ?? '') : ($publication['category_id'] ?? '');
                ?>
                <label for="category">Categoría *</label>
                <select id="category" name="category_id" required aria-required="true">
                    <option value="">Selecciona...</option>
                    <?php foreach ($categories as $catId => $name): ?>
                        <option value="<?= $catId ?>" <?= $selectedCategory == $catId ? 'selected' : '' ?>>
                            <?= htmlspecialchars($name) ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>

            <div>
                <label>Ubicación *</label>
                <input type="text" name="location" placeholder="Dirección o ciudad"
                    required aria-required="true" value="<?= old('location') ?>" />
            </div>

            <div>
                <label>Fecha</label>
                <input type="date" name="date" value="<?= old('date') ?>" />
            </div>

            <div>
                <label>Hora</label>
                <input type="time" name="time" value="<?= old('time') ?>" />
            </div>

            <?php if (!$participante): ?>
            <div>
                <label>Precio (€)</label>
                <input type="number" name="price" step="1" min="0" value="<?= old('price') ?>" />
            </div>

            <div>
                <label>Cantidad de usuarios</label>
                <input type="number" name="max_people" min="1" value="<?= old('max_people') ?>" />
            </div>
            <?php endif; ?>

            <div>
                <?php
                $languages        = ['Español','Inglés','Francés','Alemán','Italiano','Portugués','Chino','Japonés','Ruso','Árabe'];
                $selectedLanguage = !empty($old) ? ($old['language'] ?? '') : ($publication['language'] ?? '');
                ?>
                <label for="idioma">Idioma</label>
                <select id="idioma" name="language">
                    <?php foreach ($languages as $lang): ?>
                        <option value="<?= $lang ?>" <?= $selectedLanguage === $lang ? 'selected' : '' ?>>
                            <?= $lang ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>

            <div>
                <label>Edad Mínima</label>
                <input type="number" name="min_age" min="0" value="<?= old('min_age') ?>" />
            </div>

            <div>
                <label>Código de Vestimenta</label>
                <input type="text" name="dress_code" placeholder="Ej: Ropa cómoda"
                    value="<?= old('dress_code') ?>" />
            </div>

            <?php
            $transportChecked = !empty($old)
                ? isset($old['transport_included'])
                : ($publication['transport_included'] == 1);
            $petsChecked = !empty($old)
                ? isset($old['pets_allowed'])
                : ($publication['pets_allowed'] == 1);
            ?>
            <div class="checkbox-group full">
                <label>
                    <input type="checkbox" name="transport_included" id="transport_toggle" value="1"
                        <?= $transportChecked ? 'checked' : '' ?> />
                    Transporte incluido
                </label>
                <div id="departure_box" style="display:none; margin: 10px 0;">
                    <input type="text" name="departure_city" placeholder="¿Desde dónde salen?"
                        value="<?= old('departure_city') ?>">
                </div>
                <label>
                    <input type="checkbox" name="pets_allowed" value="1"
                        <?= $petsChecked ? 'checked' : '' ?> />
                    Mascotas permitidas
                </label>
            </div>

            <div class="full">
                <label>Imagen de la <?= $participante ? "Petición" : "Actividad" ?> *</label>

                <?php if (!empty($publication['image_url'])): ?>
                    <div class="current-image">
                        <p>Imagen actual:</p>
                        <img src="<?= htmlspecialchars($publication['image_url']) ?>" alt="Imagen actual"
                            style="max-width:200px; display:block; margin-bottom:10px;">
                    </div>
                <?php endif; ?>

                <div class="upload-box">
                    <input type="file" name="image_file" id="image_file" accept="image/png, image/jpeg"
                        <?= empty($publication['image_url']) ? 'required' : '' ?> />
                    <input type="hidden" name="current_image"
                        value="<?= htmlspecialchars($publication['image_url'] ?? '') ?>">
                    <div class="upload-content">
                        <i class="fas fa-upload"></i>
                        <p id="file-name">Haz clic para subir una nueva imagen (JPG/PNG)</p>
                    </div>
                </div>
            </div>

            <div class="actions">
                <button type="submit" class="btn-submit">
                    <?= $participante ? 'Editar Petición' : 'Editar Actividad' ?>
                </button>
            </div>
        </form>
    </div>

    <script src="assets/js/controllers/posts/activity-validation.js"></script>
</body>

</html>
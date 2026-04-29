<?php
require_once __DIR__ . '/../../middleware/auth.php';
requireActiveUser();
requireAnyRole(['organizador', 'participante']);

$rol = $_SESSION['role'];
$participante = ($rol === 'participante');

// Recuperar datos antiguos y limpiarlos de sesión
$old = $_SESSION['form_old_data'] ?? [];
unset($_SESSION['form_old_data']);

// Helper para imprimir valores de forma segura
function old(string $key, $default = ''): string
{
    global $old;
    return htmlspecialchars($old[$key] ?? $default, ENT_QUOTES);
}
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Publicar - MOVEos</title>
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
        <button type="button" class="back-btn" aria-label="Volver atrás">
            <i class="fas fa-arrow-left" aria-hidden="true"></i>
        </button>

        <header class="header-form create">
            <?php if ($participante): ?>
                <h1>Publicar Nueva Petición</h1>
                <p>Completa todos los detalles para que los ofertantes sepan qué quieres.</p>
            <?php else: ?>
                <h1>Publicar Nueva Actividad</h1>
                <p>Completa todos los detalles para que los participantes sepan qué esperar.</p>
            <?php endif; ?>
        </header>

        <div class="alert">
            <p>La <?= $participante ? 'petición' : 'actividad' ?> ingresada quedará <strong>pendiente de revisión
                    administrativa</strong> y será publicada una vez reciba la aprobación correspondiente.</p>
        </div>

        <form class="form-activity" id="form-create-activity" action="index.php" method="POST"
            enctype="multipart/form-data">

            <input type="hidden" name="accion" value="create">
            <input type="hidden" name="type" value="<?= $participante ? 'request' : 'activity' ?>">

            <!-- TÍTULO -->
            <div class="full">
                <label>Título</label>
                <input type="text" name="title" placeholder="Introduce un título" value="<?= old('title') ?>" required>
            </div>

            <!-- DESCRIPCIÓN -->
            <div class="full">
                <label>Descripción</label>
                <textarea name="description" placeholder="Describe detalladamente"
                    required><?= old('description') ?></textarea>
            </div>

            <!-- CATEGORÍA -->
            <div>
                <label for="category">Categoría</label>
                <select id="category" name="category_id" required aria-required="true">
                    <option value="">Selecciona...</option>
                    <option value="1" <?= old('category_id') == '1' ? 'selected' : '' ?>>Taller</option>
                    <option value="2" <?= old('category_id') == '2' ? 'selected' : '' ?>>Clase</option>
                    <option value="3" <?= old('category_id') == '3' ? 'selected' : '' ?>>Evento</option>
                    <option value="4" <?= old('category_id') == '4' ? 'selected' : '' ?>>Excursión</option>
                    <option value="5" <?= old('category_id') == '5' ? 'selected' : '' ?>>Formación técnica</option>
                    <option value="6" <?= old('category_id') == '6' ? 'selected' : '' ?>>Conferencia</option>
                    <option value="7" <?= old('category_id') == '7' ? 'selected' : '' ?>>Reunión</option>
                    <option value="8" <?= old('category_id') == '8' ? 'selected' : '' ?>>Experiencia</option>
                    <option value="9" <?= old('category_id') == '9' ? 'selected' : '' ?>>Tour</option>
                    <option value="10" <?= old('category_id') == '10' ? 'selected' : '' ?>>Competición</option>
                    <option value="11" <?= old('category_id') == '11' ? 'selected' : '' ?>>Evento social</option>
                </select>
            </div>

            <!-- UBICACIÓN -->
            <div>
                <label>Ubicación</label>
                <input type="text" name="location" placeholder="Sevilla" value="<?= old('location') ?>" required>
            </div>

            <!-- FECHA -->
            <div>
                <label>Fecha</label>
                <input type="date" name="date" min="<?= date('Y-m-d') ?>"
                    value="<?= old('date', date('Y-m-d', strtotime('+1 day'))) ?>" required>
            </div>

            <!-- HORA -->
            <div>
                <label>Hora</label>
                <input type="time" name="time" min="08:00" max="23:00" value="<?= old('time', '09:00') ?>" required>
            </div>

            <?php if (!$participante): ?>
                <div>
                    <label>Precio (€)</label>
                    <input type="number" name="price" step="0.01" min="0" value="<?= old('price', '0') ?>">
                </div>

                <div>
                    <label>Máximo de participantes</label>
                    <input type="number" name="max_people" min="1" value="<?= old('max_people', '10') ?>" required>
                </div>
            <?php endif; ?>

            <!-- CAMPOS COMUNES -->
            <div>
                <label for="idioma">Idioma</label>
                <select id="idioma" name="language">
                    <?php
                    $idiomas = ['Español', 'Inglés', 'Francés', 'Alemán', 'Italiano', 'Portugués', 'Chino', 'Japonés', 'Ruso', 'Árabe'];
                    foreach ($idiomas as $idioma):
                        $selected = old('language', 'Español') === $idioma ? 'selected' : '';
                        ?>
                        <option value="<?= $idioma ?>" <?= $selected ?>><?= $idioma ?></option>
                    <?php endforeach; ?>
                </select>
            </div>

            <div>
                <label>Edad mínima</label>
                <input type="number" name="min_age" min="0" value="<?= old('min_age', '18') ?>">
            </div>

            <div>
                <label>Código vestimenta</label>
                <input type="text" name="dress_code" value="<?= old('dress_code', 'Casual') ?>">
            </div>

            <div class="checkbox-group full">
                <label>
                    <input type="checkbox" name="transport_included" id="transport_toggle" value="1"
                        <?= isset($old['transport_included']) ? 'checked' : '' ?> />
                    Transporte incluido
                </label>
                <div id="departure_box">
                    <input type="text" name="departure_city" placeholder="¿Desde dónde salen?"
                        value="<?= old('departure_city') ?>">
                </div>
                <label>
                    <input type="checkbox" name="pets_allowed" value="1" <?= isset($old['pets_allowed']) ? 'checked' : '' ?> />
                    Mascotas permitidas
                </label>
            </div>

            <div class="full">
                <label>Imagen de la <?= $participante ? "Petición" : "Actividad" ?></label>
                <div class="upload-box" id="upload-box">
                    <input type="file" name="image_file" id="image_file" accept="image/png, image/jpeg" required />
                    <div class="upload-content" id="upload-content">
                        <i class="fas fa-upload"></i>
                        <p id="file-name">Haz clic para subir una imagen (JPG/PNG)</p>
                    </div>
                    <img id="image-preview" style="display:none;" />
                </div>
            </div>

            <div class="actions">
                <button type="submit" class="btn-submit">
                    <?= $participante ? 'Publicar Petición' : 'Publicar Actividad' ?>
                </button>
            </div>
        </form>
    </div>
    <script src="assets/js/controllers/posts/image-uploads.js"></script>
    <script src="assets/js/controllers/posts/activity-validation.js"></script>
</body>

</html>
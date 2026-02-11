<?php
// Proteger la página - solo oferentes y participantes pueden crear actividades
require_once __DIR__ . '/../middleware/auth.php';
requireAnyRole(['organizador', 'participante']);

$rol = $_SESSION['role'];
$participante = ($rol === 'participante');
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <title>Publicar Nueva Actividad</title>
    <link rel="stylesheet" href="assets/css/main.css">
    <link rel="icon" type="image/ico" href="assets/img/ico/icono.svg">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <script src="assets/js/controllers/activity-validation.js"></script>
    <script src="assets/js/main.js"></script>
</head>

<body>
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
            <p>La <?php $participante ? 'petición' : 'actividad' ?> ingresada quedará <strong>pendiente de revisión
                    administrativa</strong> y será publicada una vez reciba la aprobación correspondiente.</p>
        </div>
        <form class="form-activity" id="form-create-activity" action="../app/controllers/edit-activity-controller.php"
            method="POST" enctype="multipart/form-data" aria-labelledby="form-title" aria-describedby="form-desc">


            <div class="full">
                <label for="titulo">Título de la <?= $participante ? "Petición" : "Actividad" ?> *</label>
                <input type="text" id="titulo" name="title" placeholder="Ej: Yoga al aire libre" required
                    aria-required="true" value="<?= htmlspecialchars($publication['title']) ?? "" ?>" />
            </div>

            <div class="full">
                <label for="descripcion">Descripción *</label>
                <textarea id="descripcion" name="description" placeholder="Describe los detalles..." required
                    aria-required="true"><?= htmlspecialchars($publication['description']) ?? "" ?></textarea>
            </div>

            <div>
                <?php
                $categories = [
                    1 => 'Taller',2 => 'Clase',3 => 'Evento', 4 => 'Excursión', 5 => 'Formación técnica', 6 => 'Conferencia', 7 => 'Reunión',8 => 'Experiencia',9 => 'Tour',10 => 'Competición',11 => 'Evento social'
                ];
                $selectedCategory = $publication['language'] ?? '';
                ?>

                <label for="category">Categoría *</label>
                <select id="category" name="category_id" required aria-required="true">
                    <option value="">Selecciona...</option>
                    <?php foreach ($categories as $id => $name): ?>
                        <option value="<?= $id ?>" <?= $selectedCategory == $id ? 'selected' : '' ?>>
                            <?= htmlspecialchars($name) ?>
                        </option>
                    <?php endforeach; ?>
                </select>


            </div>

            <div>
                <label for="ubicacion">Ubicación *</label>
                <input type="text" id="ubicacion" name="location" placeholder="Dirección o ciudad" required
                    aria-required="true" value="<?= htmlspecialchars($publication['location']) ?? "" ?>" />
            </div>

            <div>
                <label for="fecha">Fecha</label>
                <input type="date" id="fecha" name="date" value="<?= htmlspecialchars($publication['date']) ?? "" ?>" />
            </div>

            <div>
                <label for="hora">Hora</label>
                <input type="time" id="hora" name="time" value="<?= htmlspecialchars($publication['time']) ?? "" ?>" />
            </div>

            <?php if (!$participante) { ?>
                <div>
                    <label for="precio">Precio (€)</label>
                    <input type="number" id="precio" name="price" step="1" min="0"
                        value="<?= htmlspecialchars($publication['price']) ?? "" ?>" />
                </div>

                <div>
                    <label for="max">Cantidad de usuarios</label>
                    <input type="number" id="max" name="max_people"
                        value="<?= htmlspecialchars($publication['max_people']) ?? "" ?>" min="1" />
                </div>
            <?php } ?>
            <div>
                <?php
                $languages = ['Español', 'Inglés', 'Francés', 'Alemán', 'Italiano', 'Portugués', 'Chino', 'Japonés', 'Ruso', 'Árabe'];
                $selectedLanguage = $publication['language'] ?? '';
                ?>

                <label for="idioma">Idioma</label>
                <select id="idioma" name="language">
                    <?php foreach ($languages as $language): ?>
                        <option value="<?= $language ?>" <?= $selectedLanguage === $language ? 'selected' : '' ?>>
                            <?= $language ?>
                        </option>
                    <?php endforeach; ?>
                </select>

            </div>

            <div>
                <label for="edad">Edad Mínima</label>
                <input type="number" id="edad" name="min_age"
                    value="<?= htmlspecialchars($publication['min_age']) ?? "" ?>" min="0" />
            </div>

            <div>
                <label for="vestimenta">Código de Vestimenta</label>
                <input type="text" id="vestimenta" name="dress_code" placeholder="Ej: Ropa cómoda"
                    value="<?= htmlspecialchars($publication['dress_code']) ?? "" ?>" />
            </div>

            <div class="checkbox-group full">
                <label>
                    <input type="checkbox" name="transport_included" id="transport_toggle"
                        value="<?= htmlspecialchars($publication['transport_included']) ?? "" ?>" />
                    Transporte incluido
                </label>
                <div id="departure_box" style="display:none; margin: 10px 0;">
                    <input type="text" name="departure_city" placeholder="¿Desde dónde salen?"
                        value="<?= htmlspecialchars($publication['departure_city']) ?? "" ?>">
                </div>
                <label>
                    <input type="checkbox" name="pets_allowed" <?= htmlspecialchars($publication['pets_allowed']) ?? "" ?> />
                    Mascotas permitidas
                </label>
            </div>

            <div class="full">
                <label>Imagen de la <?= $participante ? "Petición" : "Actividad" ?> *</label>

                <div class="upload-box">
                    <input type="file" name="image_file" id="image_file" accept="image/png, image/jpeg" required
                        value="<?= htmlspecialchars($publication['image_url']) ?? "" ?>" />
                    <div class="upload-content">
                        <i class="fas fa-upload"></i>
                        <p id="file-name">Haz clic para subir una imagen (JPG/PNG)</p>
                    </div>
                </div>
            </div>

            <?php if ($participante): ?>
                <input type="hidden" name="type" value="request">
            <?php else: ?>
                <input type="hidden" name="type" value="activity">
            <?php endif; ?>

            <div class="actions">
                <?php if ($participante): ?>
                    <button type="submit" class="btn-submit">Publicar Petición</button>
                <?php else: ?>
                    <button type="submit" class="btn-submit">Publicar Actividad</button>
                <?php endif; ?>
            </div>
        </form>
    </div>
</body>

</html>
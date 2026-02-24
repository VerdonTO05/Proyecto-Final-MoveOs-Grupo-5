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
                <h1>Publicar Nueva Petición</h1>
                <p>Completa todos los detalles para que los ofertantes sepan qué quieres.</p>
            <?php else: ?>
                <h1>Publicar Nueva Actividad</h1>
                <p>Completa todos los detalles para que los participantes sepan qué esperar.</p>
            <?php endif; ?>
        </header>

        <div class="alert">
            <p>La <?php $participante ? 'petición' : 'actividad' ?> ingresada quedará <strong>pendiente de revisión
                    administrativa</strong> y será publicada una vez reciba la aprobación correspondiente.</p>
        </div>
        <form class="form-activity" id="form-create-activity" action="index.php" method="POST"
            enctype="multipart/form-data">

            <input type="hidden" name="accion" value="create">
            <input type="hidden" name="type" value="<?= $participante ? 'request' : 'activity' ?>">

            <!-- TÍTULO -->
            <div class="full">
                <label>Título *</label>
                <input type="text" name="title" required>
            </div>

            <!-- DESCRIPCIÓN -->
            <div class="full">
                <label>Descripción *</label>
                <textarea name="description" required></textarea>
            </div>

            <!-- CATEGORÍA -->
            <div>
                <label>Categoría *</label>
                <select name="category_id" required>
                    <option value="">Selecciona...</option>
                    <?php foreach ($categories as $id => $name): ?>
                        <option value="<?= $id ?>"><?= $name ?></option>
                    <?php endforeach; ?>
                </select>
            </div>

            <!-- UBICACIÓN -->
            <div>
                <label>Ubicación *</label>
                <input type="text" name="location" required>
            </div>

            <!-- FECHA -->
            <div>
                <label>Fecha</label>
                <input type="date" name="date">
            </div>

            <!-- HORA -->
            <div>
                <label>Hora</label>
                <input type="time" name="time">
            </div>

            <?php if (!$participante): ?>
                <div>
                    <label>Precio (€)</label>
                    <input type="number" name="price" step="0.01" min="0">
                </div>

                <div>
                    <label>Máximo de participantes</label>
                    <input type="number" name="max_people" min="1">
                </div>
            <?php endif; ?>

            <!-- CAMPOS COMUNES -->
            <div>
                <label>Idioma</label>
                <select name="language">
                    <?php foreach ($languages as $lang): ?>
                        <option value="<?= $lang ?>"><?= $lang ?></option>
                    <?php endforeach; ?>
                </select>
            </div>

            <div>
                <label>Edad mínima</label>
                <input type="number" name="min_age" min="0">
            </div>

            <div>
                <label>Código vestimenta</label>
                <input type="text" name="dress_code">
            </div>

            <div class="checkbox-group full">
                <label>
                    <input type="checkbox" name="transport_included" value="1">
                    Transporte incluido
                </label>

                <div>
                    <input type="text" name="departure_city" placeholder="Ciudad de salida">
                </div>

                <label>
                    <input type="checkbox" name="pets_allowed" value="1">
                    Mascotas permitidas
                </label>
            </div>

            <div class="full">
                <label>Imagen de la <?= $participante ? "Petición" : "Actividad" ?> *</label>

                <div class="upload-box">
                    <input type="file" name="image_file" id="image_file" accept="image/png, image/jpeg" required />
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
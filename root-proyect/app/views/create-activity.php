<?php
session_start();

if (!isset($_SESSION['role'])) {
    header('Location: login.php');
    exit;
}
$rol = $_SESSION['role'];
$participante = ($rol === 'participante');

?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <title>Publicar Nueva Actividad</title>
    <link rel="stylesheet" href="../../public/assets/css/main.css">
    <link rel="icon" type="image/ico" href="../../public/assets/img/ico/icono.svg">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <script src="../../public/assets/js/controllers/activity-validation.js"></script>
    <script src="../../public/assets/js/main.js"></script>
</head>

<body>
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

        <form class="form-activity" id="form-create-activity" action="../controllers/activity-controller.php"
            method="POST" enctype="multipart/form-data">

            <div class="full">
                <label for="titulo">Título de la <?= $participante ? "Petición" : "Actividad" ?> *</label>
                <input type="text" id="titulo" name="title" placeholder="Ej: Yoga al aire libre" required />
            </div>

            <div class="full">
                <label for="descripcion">Descripción *</label>
                <textarea id="descripcion" name="description" placeholder="Describe los detalles..."
                    required></textarea>
            </div>

            <div>
                <label for="category">Categoría *</label>
                <select id="category" name="category_id" required>
                    <option value="">Selecciona...</option>
                    <option value="1">Taller</option>
                    <option value="2">Clase</option>
                    <option value="3">Evento</option>
                    <option value="4">Excursión</option>
                    <option value="5">Formación técnica</option>
                    <option value="6">Conferencia</option>
                    <option value="7">Reunión</option>
                    <option value="8">Experiencia</option>
                    <option value="9">Tour</option>
                    <option value="10">Competición</option>
                    <option value="11">Evento social</option>
                </select>
            </div>

            <div>
                <label for="ubicacion">Ubicación *</label>
                <input type="text" id="ubicacion" name="location" placeholder="Dirección o ciudad" required />
            </div>

            <div>
                <label for="fecha">Fecha</label>
                <input type="date" id="fecha" name="date" />
            </div>

            <div>
                <label for="hora">Hora</label>
                <input type="time" id="hora" name="time" />
            </div>

            <div>
                <label for="precio">Precio (€)</label>
                <input type="number" id="precio" name="price" step="0.01" value="0" />
            </div>

            <div>
                <label for="max">Cantidad de usuarios</label>
                <input type="number" id="max" name="max_people" value="10" />
            </div>

            <div>
                <label for="idioma">Idioma</label>
                <select id="idioma" name="language">
                    <option value="Español">Español</option>
                    <option value="Inglés">Inglés</option>
                </select>
            </div>

            <div>
                <label for="edad">Edad Mínima</label>
                <input type="number" id="edad" name="min_age" value="0" />
            </div>

            <div>
                <label for="vestimenta">Código de Vestimenta</label>
                <input type="text" id="vestimenta" name="dress_code" placeholder="Ej: Ropa cómoda" />
            </div>

            <div class="checkbox-group full">
                <label>
                    <input type="checkbox" name="transport_included" id="transport_toggle" value="1" />
                    Transporte incluido
                </label>
                <div id="departure_box" style="display:none; margin: 10px 0;">
                    <input type="text" name="departure_city" placeholder="¿Desde dónde salen?">
                </div>
                <label>
                    <input type="checkbox" name="pets_allowed" value="1" />
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
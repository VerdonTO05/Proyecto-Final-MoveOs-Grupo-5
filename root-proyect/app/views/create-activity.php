<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <title>Publicar Nueva Actividad</title>
    <link rel="stylesheet" href="../../public/assets/css/main.css">
    <link rel="icon" type="image/ico" href="../../public/assets/img/ico/icono.svg" id="icon.ico">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <script src="../../public/assets/js/theme-init.js"></script>
    <script src="../../public/assets/js/main.js"></script>
</head>

<body>
    <div class="container c">
        <div class="icons">
            <label class="switch top-right">
                <input type="checkbox" id="theme-toggle">
                <span class="slider"></span>
            </label>
        </div>
        <header class="header-form create">
            <h1>Publicar Nueva Actividad</h1>
            <p>Comparte tu actividad con la comunidad. Será revisada antes de publicarse.
            </p>
        </header>

        <div class="alert">
            <strong>Revisión requerida:</strong>
            Tu actividad será revisada por un administrador antes de ser publicada.
            Te notificaremos cuando sea aprobada o si necesita modificaciones.
        </div>

        <form class="form-activity">
            <div class="full">
                <label for="titulo">Título de la Actividad *</label>
                <input type="text" id="titulo" placeholder="Ej: Ruta de Senderismo por la Sierra" />
            </div>

            <div class="full">
                <label for="descripcion">Descripción *</label>
                <textarea id="descripcion" placeholder="Describe tu actividad en detalle..."></textarea>
            </div>

            <div>
                <label for="category">Categoría *</label>
                <select id="category">
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
                <input type="text" id="ubicacion" placeholder="Madrid, Barcelona..." />
            </div>

            <div>
                <label for="fecha">Fecha</label>
                <input type="date" id="fecha" />
            </div>

            <div>
                <label for="duracion">Duración</label>
                <input type="text" id="duracion" placeholder="2 horas, 1 día..." />
            </div>

            <div>
                <label for="max">Máximo de Participantes</label>
                <input type="number" id="max" value="10" />
            </div>

            <div>
                <label for="precio">Precio (€)</label>
                <input type="number" id="precio" value="0" />
            </div>

            <div>
                <label for="hora">Hora</label>
                <input type="time" id="hora" />
            </div>

            <div>
                <label for="idioma">Idioma</label>
                <select id="idioma">
                    <option>Español</option>
                    <option>Inglés</option>
                    <option>Francés</option>
                </select>
            </div>

            <div>
                <label for="edad">Edad Recomendada</label>
                <input type="number" id="edad" placeholder="Ej: 18" />
            </div>

            <div>
                <label for="vestimenta">Código de Vestimenta</label>
                <input type="text" id="vestimenta" placeholder="Ej: Casual, Deportivo" />
            </div>

            <div class="checkbox-group">
                <label>
                    <input type="checkbox" />
                    Transporte incluido
                </label>

                <!-- Si está marcado el input de transporte añadir input de ciudad de salida -->

                <label>
                    <input type="checkbox" />
                    Mascotas permitidas
                </label>
            </div>
            <!-- Imagen -->
            <div class="full">
                <label>Imagen de la Actividad</label>
                <div class="upload-box">
                    <input type="file" accept="image/png, image/jpeg" />
                    <div class="upload-content">
                        <i class="fas fa-upload"></i>
                        <p><strong>Haz clic para subir una imagen</strong></p>
                        <span>PNG, JPG hasta 5MB</span>
                    </div>
                </div>
            </div>

            <!-- Botones -->
            <div class="actions">
                <button type="submit" class="btn-submit">Publicar Actividad</button>
            </div>
        </form>
    </div>

</body>

</html>
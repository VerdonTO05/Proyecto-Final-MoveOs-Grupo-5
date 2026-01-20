<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Panel de Administrador</title>
    <link rel="stylesheet" href="styles.css">
    <script src="../models/header-footer.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">

    <script src="../../public/assets/js/theme-init.js"></script>
    <script src="../../public/assets/js/main.js"></script>
    <script src="../../public/assets/js/alerts.js"></script>
    <link rel="stylesheet" href="../../public/assets/css/main.css">
</head>

<body>


    <div id="header"></div>

    <div class="container-control">

        <!-- Header -->
        <header class="header">
            <div class="header-icon">
                <i class="fas fa-shield-alt"></i>
            </div>
            <div class="header-content">
                <h1>Panel de Administrador</h1>
                <p>Gestiona y modera las actividades de la plataforma</p>
            </div>
        </header>


        <!-- Stats -->
        <section class="stats">
            <div class="card pending">
                <i class="fas fa-clock icon"></i>
                <h2>2</h2>
                <p>Pendientes</p>
                <small>Requieren revisión</small>
            </div>

            <div class="card approved">
                <i class="fas fa-check-circle icon"></i>
                <h2>8</h2>
                <p>Aprobadas</p>
                <small>Activas en la plataforma</small>
            </div>

            <div class="card rejected">
                <i class="fas fa-times-circle icon"></i>
                <h2>0</h2>
                <p>Rechazadas</p>
                <small>No cumplen requisitos</small>
            </div>

            <div class="card total">
                <i class="fas fa-circle-info icon"></i>
                <h2>10</h2>
                <p>Total</p>
                <small>Todas las actividades</small>
            </div>
        </section>

        <!-- Tabs -->
        <section class="tab-switch">
            <button class="tab-btn control active">Actividades <span>2</span></button>
            <button class="tab-btn control">Peticiones <span>0</span></button>
        </section>

        <!-- Activity Card -->
        <div class="activities">
            <section class="activity-control">
                <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e" alt="Actividad">

                <div class="activity-info">
                    <div class="tags">
                        <span class="tag blue">
                            <i class="fas fa-route"></i> Excursión
                        </span>
                        <span class="tag orange">
                            <i class="fas fa-hourglass-half"></i> Pendiente
                        </span>
                    </div>

                    <h3>Excursión en Kayak por la Costa</h3>
                    <p class="description">
                        Aventura acuática explorando cuevas y calas secretas. Incluye todo el equipo necesario y guía
                        experto.
                        Apto para todos los niveles.
                    </p>

                    <p class="organizer">
                        <i class="fas fa-user"></i>
                        <strong>Organizador:</strong> Mar y Aventura
                    </p>

                    <div class="meta">
                        <span><i class="fas fa-calendar-alt"></i> 5 Nov 2025</span>
                        <span><i class="fas fa-map-marker-alt"></i> Alicante</span>
                        <span><i class="fas fa-users"></i> 0/12</span>
                        <span><i class="fas fa-euro-sign"></i> 55€</span>
                    </div>

                    <div class="actions">
                        <button class="btn approve">
                            <i class="fas fa-check"></i> Aprobar
                        </button>
                        <button class="btn reject">
                            <i class="fas fa-times"></i> Rechazar
                        </button>
                    </div>
                </div>

            </section>
            <section class="activity-control">
                <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e" alt="Actividad">

                <div class="activity-info">
                    <div class="tags">
                        <span class="tag blue">
                            <i class="fas fa-route"></i> Excursión
                        </span>
                        <span class="tag orange">
                            <i class="fas fa-hourglass-half"></i> Pendiente
                        </span>
                    </div>

                    <h3>Excursión en Kayak por la Costa</h3>
                    <p class="description">
                        Aventura acuática explorando cuevas y calas secretas. Incluye todo el equipo necesario y guía
                        experto.
                        Apto para todos los niveles.
                    </p>

                    <p class="organizer">
                        <i class="fas fa-user"></i>
                        <strong>Organizador:</strong> Mar y Aventura
                    </p>

                    <div class="meta">
                        <span><i class="fas fa-calendar-alt"></i> 5 Nov 2025</span>
                        <span><i class="fas fa-map-marker-alt"></i> Alicante</span>
                        <span><i class="fas fa-users"></i> 0/12</span>
                        <span><i class="fas fa-euro-sign"></i> 55€</span>
                    </div>

                    <div class="actions">
                        <button class="btn approve">
                            <i class="fas fa-check"></i> Aprobar
                        </button>
                        <button class="btn reject">
                            <i class="fas fa-times"></i> Rechazar
                        </button>
                    </div>
                </div>

            </section>
        </div>
    </div>
    <!-- Contenedor de modal -->
    <div id="modal-container"></div>

    <!-- Botón de prueba -->
    <button onclick="showConfirm({
    title: '¿Aprobar actividad?',
    message: 'Estás a punto de aprobar la actividad Excursión en Kayak por la Costa. Esta actividad será visible para todos los usuarios y podrán inscribirse.',
    onConfirm: () => {
        console.log('Actividad aprobada');
        showAlert({
            type: 'success',
            title: 'Aprobada',
            message: 'La actividad ha sido aprobada correctamente'
        });
    }
})">
        Aprobar actividad
    </button>

    <div id="footer"></div>
</body>

</html>
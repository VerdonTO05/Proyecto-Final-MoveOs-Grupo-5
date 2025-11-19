/** Crea la información del tutorial para participantes y ofertantes (icono no usado por ahora) */
const stepsParticipante = [
    {
        icon: "fas fa-search",
        title: "Explora Actividades",
        subtitle: "Descubre actividades revisadas y aprobadas por nuestro equipo",
        list: [
            "Navega por actividades: excursiones, talleres, clases y eventos",
            "Todas las actividades están previamente revisadas y aprobadas",
            "Usa filtros por categoría, ubicación, precio y fecha",
            "Lee descripciones detalladas y revisa valoraciones"
        ],
        next: "Siguiente",
        prev: null
    },
    {
        icon: "fas fa-edit",
        title: "Publica una Petición",
        subtitle: "¿No encuentras lo que buscas? Pide que se organice",
        list: [
            "Describe la actividad que te gustaría realizar",
            "Los organizadores pueden ver tu petición y aceptarla",
            "Sigue el estado de tus peticiones desde tu perfil",
            "Recibe notificación cuando un organizador acepte tu petición"
        ],
        next: "Siguiente",
        prev: "Anterior"
    },
    {
        icon: "fas fa-credit-card",
        title: "Inscríbete y Paga",
        subtitle: "Reserva tu plaza de manera segura",
        list: [
            "Haz clic en \"Inscribirse\" en la actividad que te interese",
            "Realiza el pago de forma segura y protegida",
            "Recibe confirmación instantánea"
        ],
        next: "Siguiente",
        prev: "Anterior"
    },
    {
        icon: "fas fa-star",
        title: "Participa y Valora",
        subtitle: "Vive la experiencia y comparte tu opinión",
        list: [
            "Recibe recordatorios antes de la actividad",
            "Accede a la información de contacto del organizador",
            "Conoce a otros participantes con intereses similares",
            "Valora tu experiencia para ayudar a la comunidad"
        ],
        next: "Finalizar",
        prev: "Anterior"
    }
];

const stepsOrganizadores = [
    {
        icon: "fas fa-file",
        title: "Publica tu Actividad",
        subtitle: "Crea y publica actividades para compartir tu pasión",
        list: [
            "Completa el formulario con información detallada",
            "Añade imágenes atractivas y especifica todos los detalles",
            "Define categoría, fecha, ubicación, precio y capacidad",
            "Tu actividad pasará por revisión administrativa antes de publicarse"
        ],
        next: "Siguiente",
        prev: null
    },
    {
        icon: "fas fa-file-check",
        title: "Revisión y Aprobación",
        subtitle: "Garantizamos calidad revisando cada actividad",
        list: [
            "Nuestro equipo verifica la calidad del contenido",
            "Comprobamos cumplimiento de políticas y seguridad",
            "Proceso de revisión en menos de 24 horas",
            "Una vez aprobada, aparece en 'Actividades publicadas' de tu perfil"
        ],
        next: "Siguiente",
        prev: "Anterior"
    },
    {
        icon: "fas fa-star-of-david",
        title: "Explora Peticiones",
        subtitle: "Descubre qué actividades buscan los participantes",
        list: [
            "Accede a 'Explorar peticiones' para ver solicitudes de participantes",
            "Revisa peticiones de actividades que podrías organizar",
            "Acepta peticiones que se ajusten a tus capacidades",
            "Gestiona peticiones aceptadas desde 'Peticiones aceptadas' en tu perfil"
        ],
        next: "Siguiente",
        prev: "Anterior"
    },
    {
        icon: "fas fa-cog",
        title: "Gestiona y Realiza",
        subtitle: "Administra inscripciones y ofrece experiencias únicas",
        list: [
            "Recibe notificaciones de nuevas inscripciones",
            "Visualiza y gestiona participantes desde tu panel",
            "Comunícate con los inscritos antes y durante la actividad",
            "Recibe valoraciones y construye tu reputación"
        ],
        next: "Finalizar",
        prev: "Anterior"
    }
];

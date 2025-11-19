/** Crea actividades con datos */
document.addEventListener("DOMContentLoaded", () => {
  const activitiesData = [
    {
      title: "Ruta de Senderismo en la Sierra de Guadarrama",
      description: "Descubre la naturaleza en esta impresionante ruta por la Sierra de Guadarrama.",
      image: "../img/ruta.jpg",
      alt: "Ruta de Senderismo",
      label: "Recomendado",
      labelClass: "destacado",
      details: [
        '25 Nov 2025',
        'Madrid',
        '8/10 participantes'
      ],
      price: "35€"
    },
    {
      title: "Clase de Yoga",
      description: "Sesión de yoga para principiantes impartida por un instructor especializado.",
      image: "../img/yoga.jpg",
      alt: "Clase de Yoga",
      label: "Nuevo",
      labelClass: "nuevo",
      details: [
        "Barcelona",
        "25 Nov 2025",
        "5 horas"
      ],
      price: "20€"
    },
    {
      title: "Taller de Fotografía Urbana",
      description: "Aprende a capturar la esencia de la ciudad con tu cámara o móvil en este taller práctico por las calles de Madrid.",
      image: "../img/fotografia.jpg",
      alt: "Taller de Fotografía Urbana",
      label: "Popular",
      labelClass: "destacado",
      details: [
        "Madrid",
        "25 Nov 2025",
        "3 horas"
      ],
      price: "30€"
    },
    {
      title: "Cata de Vinos",
      description: "Disfruta de una experiencia sensorial con una selección de vinos locales y aprende sobre maridaje y cata profesional.",
      image: "../img/vinos.jpg",
      alt: "Cata de Vinos",
      label: "Exclusivo",
      labelClass: "destacado",
      details: [
        "La Rioja",
        "25 Nov 2025",
        "2 horas"
      ],
      price: "45€"
    },
    {
      title: "Clase de Cocina Mediterránea",
      description: "Prepara platos típicos mediterráneos con un chef experto y descubre los secretos de esta cocina saludable y deliciosa.",
      image: "../img/cocina.jpg",
      alt: "Clase de Cocina Mediterránea",
      label: "Recomendado",
      labelClass: "destacado",
      details: [
        "Valencia",
        "25 Nov 2025",
        "4 horas"
      ],
      price: "40€"
    },
    {
      title: "Ruta en Bicicleta por la Costa",
      description: "Explora la costa con una ruta guiada en bicicleta, perfecta para disfrutar del mar y el aire libre con amigos.",
      image: "../img/bicicleta.jpg",
      alt: "Ruta en Bicicleta por la Costa",
      label: "Aventura",
      labelClass: "nuevo",
      details: [
        "Málaga",
        "25 Nov 2025",
        "6 horas"
      ],
      price: "25€"
    }
  ];

  const container = document.getElementById("gridActivities");

  // Crear y renderizar las actividades
  activitiesData.forEach(data => {
    const activity = new Activity(data);
    container.appendChild(activity.render());
  });
});


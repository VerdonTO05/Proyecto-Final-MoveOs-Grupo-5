/**
 * HTML principal del tutorial "Cómo funciona"
 * Contiene la estructura de la sección, pestañas de participante/organizador,
 * pasos numerados y enlace para abrir el vídeo.
 * @type {string}
 */
const howHTML = `
<main class="how-it-works">
  <section class="hiw-header">
    <h1>¿Cómo Funciona MOVEos?</h1>
    <p>Una plataforma simple e intuitiva para participar o crear actividades increíbles</p>

    <!-- Pestañas para cambiar entre participante y organizador -->
    <div class="tab-switch">
      <button class="tab-btn active" data-mode="participante">Soy Participante</button>
      <button class="tab-btn" data-mode="organizador">Soy Organizador</button>
    </div>
  </section>

  <!-- Botones numerados para cada paso del tutorial -->
  <section class="hiw-steps">
    <button class="step-number active">1</button>
    <button class="step-number">2</button>
    <button class="step-number">3</button>
    <button class="step-number">4</button>
  </section>

  <!-- Contenedor donde se renderizan los pasos dinámicamente -->
  <section id="hiw-card" class="hiw-card"></section>

  <!-- Enlace para abrir el vídeo del tutorial -->
  <a href="#" id="openVideo">Ver vídeo tutorial</a>
</main>
`;

/**
 * HTML del reproductor de vídeo del tutorial
 * Contiene overlay, vídeo, controles (play, volumen, progreso) y botón de cerrar.
 * @type {string}
 */
const videoHTML = `
<div class="hiw-video-overlay">
  <div class="hiw-video-wrapper">
    <button class="close-video">✕</button>
    <video id="hiwVideo" src="assets/video/video.mp4"></video>

    <div class="video-controls">
      <button class="play">▶</button>
      <input type="range" class="progress" value="0" min="0" max="100">
      <input type="range" class="volume" value="100" min="0" max="100" title="Volumen">
      <span class="time">0:00</span>
    </div>
  </div>
</div>
`;

/* =========================
   INICIALIZACIÓN
   ========================= */

/**
 * Inicializa los eventos del tutorial al cargar la página
 */
document.addEventListener("DOMContentLoaded", () => {
  const howBtn = document.getElementById("how"); // Botón que abre el tutorial
  const tutorialContainer = document.getElementById("tutorial-container"); // Contenedor del tutorial

  if (!tutorialContainer) return;

  // Evento para mostrar el tutorial al pulsar el botón
  howBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    showHowItWorks(tutorialContainer);
  });

  // Evento para abrir el vídeo al pulsar el enlace
  document.addEventListener("click", (e) => {
    if (e.target.id === "openVideo") {
      e.preventDefault();

      const enlace = e.target;
      const textoOriginal = enlace.textContent;

      enlace.textContent = "Cargando...";
      enlace.style.pointerEvents = "none"; //evita múltiples clicks

      // Esperamos 3 segundos antes de abrir el vídeo
      setTimeout(() => {
        enlace.style.pointerEvents = "auto";
        openVideo(tutorialContainer);
      }, 3000);
    }
  });

});

/* =========================
   TUTORIAL
   ========================= */

/**
 * Renderiza el HTML del tutorial en el contenedor y activa su lógica.
 * @param {HTMLElement} container - Contenedor donde se muestra el tutorial
 */
function showHowItWorks(container) {
  container.innerHTML = howHTML;

  // Scroll al final del tutorial y activación de la lógica de pestañas y pasos
  requestAnimationFrame(() => {
    container.scrollIntoView({ behavior: "smooth", block: "end" });
    activateHowItWorks();
  });
}

/**
 * Activa la lógica de pestañas y pasos del tutorial
 * Permite cambiar entre participante/organizador y seleccionar los pasos
 */
function activateHowItWorks() {
  const tabButtons = document.querySelectorAll(".tab-btn"); // Pestañas participante/organizador
  const stepButtons = document.querySelectorAll(".step-number"); // Botones de paso
  const card = document.getElementById("hiw-card"); // Contenedor de contenido del paso

  if (!card) return;

  let mode = "participante"; // Modo inicial
  let currentStep = 0; // Paso inicial

  // Devuelve el array de pasos según el modo actual
  const getSteps = () =>
    mode === "participante" ? stepsParticipante : stepsOrganizadores;

  // Cambiar de pestaña
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      mode = btn.dataset.mode; // Actualiza el modo
      currentStep = 0; // Reinicia al primer paso

      updateSteps(stepButtons, currentStep);
      renderStep(card, getSteps()[currentStep]);
    });
  });

  // Cambiar paso al pulsar un botón
  stepButtons.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      currentStep = index;
      updateSteps(stepButtons, currentStep);
      renderStep(card, getSteps()[currentStep]);
    });
  });

  // Renderiza el primer paso por defecto
  renderStep(card, stepsParticipante[0]);
}

/**
 * Actualiza el estilo activo de los botones de paso
 * @param {NodeListOf<Element>} buttons - Botones de paso
 * @param {number} activeIndex - Índice del botón activo
 */
function updateSteps(buttons, activeIndex) {
  buttons.forEach(b => b.classList.remove("active"));
  buttons[activeIndex]?.classList.add("active");
}

/**
 * Renderiza el contenido de un paso del tutorial
 * @param {HTMLElement} card - Contenedor donde se muestra el paso
 * @param {{title:string, subtitle:string, list:string[]}} step - Información del paso
 */
function renderStep(card, step) {
  card.innerHTML = `
    <div class="hiw-card">
      <div class="hiw-card-content">
        <div style="flex:1">
          <h2>${step.title}</h2>
          <p class="subtitle">${step.subtitle}</p>
          <ul class="hiw-list">
            ${step.list.map(item => `
              <li>
                <div><i class="fa-solid fa-star"></i></div>
                <span>${item}</span>
              </li>
            `).join("")}
          </ul>
        </div>
      </div>
    </div>
  `;
}

/* =========================
   VIDEO
   ========================= */

/**
 * Abre el reproductor de vídeo del tutorial
 * @param {HTMLElement} container - Contenedor donde se mostrará el vídeo
 */
function openVideo(container) {
  // Inserta el HTML del vídeo en el contenedor
  container.innerHTML = `<div class="how-it-works">${videoHTML}</div>`;

  // Elementos importantes del vídeo
  const video = container.querySelector("#hiwVideo");
  const playBtn = container.querySelector(".play");
  const progress = container.querySelector(".progress");
  const volume = container.querySelector(".volume");
  const time = container.querySelector(".time");
  const closeBtn = container.querySelector(".close-video");
  const overlay = document.querySelector("html");
  const videoWrapper = container.querySelector(".hiw-video-wrapper");

  if (!video) return;

  /**
   * Cierra el vídeo y restablece el tutorial
   */
  const closeVideo = () => {
    video.pause();
    container.innerHTML = howHTML;
    activateHowItWorks();
    document.removeEventListener("keydown", escClose);
  };

  /**
   * Detecta pulsación de la tecla ESC para cerrar el vídeo
   * @param {KeyboardEvent} e 
   */
  const escClose = (e) => {
    if (e.key === "Escape") closeVideo();
  };

  // Botón play/pause
  playBtn?.addEventListener("click", () => togglePlay(video, playBtn));

  // Actualiza barra de progreso y tiempo durante la reproducción
  video.addEventListener("timeupdate", () => {
    if (isNaN(video.duration)) return;
    const percent = (video.currentTime / video.duration) * 100;
    progress.value = percent;
    updateRangeFill(progress);
    time.textContent = formatTime(video.currentTime);
  });

  // Cambiar posición del vídeo desde la barra de progreso
  progress?.addEventListener("input", () => {
    video.currentTime = (progress.value / 100) * video.duration;
    updateRangeFill(progress);
  });

  // Control de volumen
  volume?.addEventListener("input", () => {
    video.volume = volume.value / 100;
    updateRangeFill(volume);
  });

  // Eventos para cerrar el vídeo
  closeBtn?.addEventListener("click", closeVideo);           // Botón ✕
  overlay?.addEventListener("click", closeVideo);           // Click fuera del vídeo
  videoWrapper?.addEventListener("click", e => e.stopPropagation()); // Evita cerrar al pulsar dentro del vídeo
  document.addEventListener("keydown", escClose);           // ESC

  // Inicializa estilo de barras de rango
  updateRangeFill(progress);
  updateRangeFill(volume);
}

/* =========================
   UTILS
   ========================= */

/**
 * Alterna reproducción/pausa del vídeo y actualiza el botón
 * @param {HTMLVideoElement} video 
 * @param {HTMLElement} button 
 */
function togglePlay(video, button) {
  if (video.paused) {
    video.play();
    button.textContent = "⏸";
  } else {
    video.pause();
    button.textContent = "▶";
  }
}

/**
 * Actualiza el estilo de relleno de un input range (progreso/volumen)
 * @param {HTMLInputElement} range 
 */
function updateRangeFill(range) {
  if (!range) return;

  const value = range.value;
  range.style.background = `
    linear-gradient(
      to right,
      var(--brand-primary) 0%,
      var(--brand-primary) ${value}%,
      var(--border-color) ${value}%,
      var(--border-color) 100%
    )`;
}

/**
 * Convierte segundos a formato mm:ss
 * @param {number} seconds 
 * @returns {string} Tiempo formateado
 */
function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${min}:${sec}`;
}

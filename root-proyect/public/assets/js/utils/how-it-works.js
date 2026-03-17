/**
 * HTML de la estructura del tutorial
 */
const howHTML = `
<main class="how-it-works">
  <section class="hiw-header">
    <h1>¿Cómo Funciona MOVEos?</h1>
    <p>Una plataforma simple e intuitiva para participar o crear actividades increíbles</p>

    <div class="tab-switch">
      <button class="tab-btn active" data-mode="participante">Soy Participante</button>
      <button class="tab-btn" data-mode="organizador">Soy Organizador</button>
    </div>
  </section>

  <section class="hiw-steps">
    <button class="step-number active">1</button>
    <button class="step-number">2</button>
    <button class="step-number">3</button>
    <button class="step-number">4</button>
  </section>

  <section id="hiw-card" class="hiw-card"></section>

  <a href="#" id="openVideo"><i class="fa-solid fa-video"></i> Ver vídeo tutorial</a>
</main>
`;

/**
 * HTML del video tutorial
 */
const videoHTML = `
<div class="hiw-video-overlay">
  <div class="hiw-video-wrapper">
    <button class="close-video"><i class="fas fa-times"></i></button>
    <video id="hiwVideo" src="assets/video/video.mp4"></video>

    <div class="video-controls">
      <button class="play"><i class="fas fa-play"></i></button>
      <input type="range" class="progress" value="0" min="0" max="100">
      <input type="range" class="volume" value="100" min="0" max="100" title="Volumen">
      <span class="time">0:00</span>
    </div>
  </div>
</div>
`;

/**
 * Inicialización
 */
document.addEventListener("DOMContentLoaded", () => {
  const tutorialContainer = document.getElementById("tutorial-container");

  if (!tutorialContainer) return;

  const howBtn = document.getElementById("how");

  // Click en el enlace desde index.php
  howBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    showHowItWorks(tutorialContainer);
  });

  // Detectar hash en URL para abrir tutorial automáticamente
  if (window.location.hash === "#how-tutorial") {
    showHowItWorks(tutorialContainer);
    // Limpiar hash para que no se repita
    history.replaceState(null, null, "index.php");
  }

  // Evento para abrir el vídeo
  document.addEventListener("click", (e) => {
    const videoBtn = e.target.closest("#openVideo");

    if (videoBtn) {
      e.preventDefault();
      openVideo(tutorialContainer);
    }
  });
});

/**
 * Función que renderiza el tutorial 
 * @param {*} container Contenedor donde se insertará la información
 */
function showHowItWorks(container) {
  container.innerHTML = howHTML;
  requestAnimationFrame(() => {
    container.scrollIntoView({ behavior: "smooth", block: "end" });
    activateHowItWorks();
  });
}

/**
 * Inicializa la lógica interactiva del tutorial "Cómo funciona".
 * 
 * Esta función activa:
 * 1. La selección de modo (participante u organizador) mediante las pestañas.
 * 2. La navegación entre los pasos del tutorial al pulsar los botones numerados.
 * 3. La renderización inicial del primer paso del tutorial.
 * 
 * No recibe parámetros y no retorna ningún valor. Todos los cambios se aplican
 * directamente sobre los elementos del DOM dentro del contenedor del tutorial.
 * 
 * @returns {void} - No retorna ningún valor. 
 */
function activateHowItWorks() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const stepButtons = document.querySelectorAll(".step-number");
  const card = document.getElementById("hiw-card");

  if (!card) return;

  let mode = "participante";
  let currentStep = 0;

  const getSteps = () => (mode === "participante" ? stepsParticipante : stepsOrganizadores);

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      mode = btn.dataset.mode;
      currentStep = 0;

      updateSteps(stepButtons, currentStep);
      renderStep(card, getSteps()[currentStep]);
    });
  });

  stepButtons.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      currentStep = index;
      updateSteps(stepButtons, currentStep);
      renderStep(card, getSteps()[currentStep]);
    });
  });

  renderStep(card, stepsParticipante[0]);
}

/**
 * Actualiza el paso del tutorial
 * @param {*} buttons 
 * @param {*} activeIndex 
 */
function updateSteps(buttons, activeIndex) {
  buttons.forEach(b => b.classList.remove("active"));
  buttons[activeIndex]?.classList.add("active");
}

/**
 * Renderiza la información de cada paso
 * @param {*} card 
 * @param {*} step 
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

/**
 * Abre el video tutorial, ocultando el tutorial dinámico
 * @param {*} container 
 * @returns 
 */
function openVideo(container) {
  container.innerHTML = `<div class="how-it-works">${videoHTML}</div>`;

  const video = container.querySelector("#hiwVideo");
  const playBtn = container.querySelector(".play");
  const progress = container.querySelector(".progress");
  const volume = container.querySelector(".volume");
  const time = container.querySelector(".time");
  const closeBtn = container.querySelector(".close-video");
  const overlayDiv = container.querySelector(".hiw-video-overlay"); // ✅ overlay visual
  const videoWrapper = container.querySelector(".hiw-video-wrapper");

  if (!video) return;

  const closeVideo = () => {
    video.pause();
    container.innerHTML = howHTML;
    activateHowItWorks();
    document.removeEventListener("keydown", escClose);
  };

  const escClose = (e) => {
    if (e.key === "Escape") closeVideo();
  };

  playBtn?.addEventListener("click", () => togglePlay(video, playBtn));

  video.addEventListener("timeupdate", () => {
    if (isNaN(video.duration)) return;
    const percent = (video.currentTime / video.duration) * 100;
    progress.value = percent;
    updateRangeFill(progress);
    time.textContent = formatTime(video.currentTime);
  });

  progress?.addEventListener("input", () => {
    video.currentTime = (progress.value / 100) * video.duration;
    updateRangeFill(progress);
  });

  volume?.addEventListener("input", () => {
    video.volume = volume.value / 100;
    updateRangeFill(volume);
  });

  closeBtn?.addEventListener("click", closeVideo);

  // ✅ Solo cierra si el click es directamente en el fondo oscuro
  overlayDiv?.addEventListener("click", (e) => {
    if (e.target === overlayDiv) closeVideo();
  });

  document.addEventListener("keydown", escClose);

  updateRangeFill(progress);
  updateRangeFill(volume);
}
/**
 * Pause / Play video
 * @param {*} video 
 * @param {*} button 
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
 * Actualiza la barra de progreso o volumen
 * @param {*} range 
 * @returns 
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
 * Formatea el tiempo, minutos y segundos
 * @param {*} seconds 
 * @returns 
 */
function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${min}:${sec}`;
}
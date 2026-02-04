/**
 * HTML del tutorial "Cómo funciona"
 * @type {string}
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
  <a href="#" id="openVideo">Ver vídeo tutorial</a>
</main>
`;

/**
 * HTML del reproductor de vídeo del tutorial
 * @type {string}
 */
const videoHTML = `
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
`;

/* =========================
   INICIALIZACIÓN
   ========================= */

/**
 * Inicializa los eventos del tutorial al cargar el DOM
 */
document.addEventListener("DOMContentLoaded", () => {
  const howBtn = document.getElementById("how");
  const tutorialContainer = document.getElementById("tutorial-container");

  if (!tutorialContainer) return;

  howBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    showHowItWorks(tutorialContainer);
  });

  document.addEventListener("click", (e) => {
    if (e.target.id === "openVideo") {
      e.preventDefault();
      openVideo(tutorialContainer);
    }
  });
});

/* =========================
   TUTORIAL
   ========================= */

/**
 * Muestra el tutorial "Cómo funciona" y activa su lógica
 * @param {HTMLElement} container
 */
function showHowItWorks(container) {
  container.innerHTML = howHTML;

  requestAnimationFrame(() => {
    container.scrollIntoView({ behavior: "smooth", block: "end" });
    activateHowItWorks();
  });
}

/**
 * Activa la lógica de pestañas y pasos del tutorial
 */
function activateHowItWorks() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const stepButtons = document.querySelectorAll(".step-number");
  const card = document.getElementById("hiw-card");

  if (!card) return;

  let mode = "participante";
  let currentStep = 0;

  /**
   * Obtiene los pasos según el modo actual
   * @returns {Array<Object>}
   */
  const getSteps = () =>
    mode === "participante" ? stepsParticipante : stepsOrganizadores;

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
 * Actualiza el estado visual de los botones de paso
 * @param {NodeListOf<Element>} buttons
 * @param {number} activeIndex
 */
function updateSteps(buttons, activeIndex) {
  buttons.forEach(b => b.classList.remove("active"));
  buttons[activeIndex]?.classList.add("active");
}

/**
 * Renderiza el contenido de un paso del tutorial
 * @param {HTMLElement} card
 * @param {{title:string, subtitle:string, list:string[]}} step
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
  </div>`;
}

/* =========================
   VIDEO
   ========================= */

/**
 * Abre el reproductor de vídeo del tutorial
 * @param {HTMLElement} container
 */
function openVideo(container) {
  container.innerHTML = `<div class="how-it-works">${videoHTML}</div>`;
  container.classList.replace("invisible", "visible");

  const video = container.querySelector("#hiwVideo");
  const playBtn = container.querySelector(".play");
  const progress = container.querySelector(".progress");
  const volume = container.querySelector(".volume");
  const time = container.querySelector(".time");
  const closeBtn = container.querySelector(".close-video");

  if (!video) return;

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

  updateRangeFill(progress);
  updateRangeFill(volume);

  closeBtn?.addEventListener("click", () => {
    video.pause();
    container.innerHTML = howHTML;
    activateHowItWorks();
  });
}

/**
 * Alterna play / pause del vídeo
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

/* =========================
   UTILS
   ========================= */

/**
 * Actualiza el relleno visual de un input range
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
      #555 ${value}%,
      #555 100%
    )`;
}

/**
 * Convierte segundos a formato mm:ss
 * @param {number} seconds
 * @returns {string}
 */
function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${min}:${sec}`;
}

//TODO: Al pulsar fuera del video que se cierre solo **Mejora por implementar
/* =========================
   HTML DEL TUTORIAL
   ========================= */

/**
 * HTML principal del tutorial "Cómo funciona"
 * Contiene la sección principal, pestañas para participante/organizador,
 * pasos numerados y enlace para abrir el vídeo.
 * @type {string}
 */
const howHTML = `...`; // Tu HTML aquí

/**
 * HTML del reproductor de vídeo del tutorial
 * Contiene overlay, reproductor, controles y botón de cerrar
 * @type {string}
 */
const videoHTML = `...`; // Tu HTML aquí

/* =========================
   INICIALIZACIÓN
   ========================= */

/**
 * Inicializa los eventos del tutorial al cargar el DOM
 * - Muestra el tutorial al pulsar "Cómo Funciona"
 * - Abre el vídeo al pulsar el enlace
 */
document.addEventListener("DOMContentLoaded", () => {
  const howBtn = document.getElementById("how");
  const tutorialContainer = document.getElementById("tutorial-container");
  if (!tutorialContainer) return;

  howBtn?.addEventListener("click", e => {
    e.preventDefault();
    showHowItWorks(tutorialContainer);
  });

  document.addEventListener("click", e => {
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
 * Renderiza el HTML del tutorial en el contenedor y activa su lógica.
 * @param {HTMLElement} container - Contenedor donde se muestra el tutorial
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
 * Permite cambiar entre participante/organizador y seleccionar los pasos
 */
function activateHowItWorks() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const stepButtons = document.querySelectorAll(".step-number");
  const card = document.getElementById("hiw-card");
  if (!card) return;

  let mode = "participante";
  let currentStep = 0;

  const getSteps = () => mode === "participante" ? stepsParticipante : stepsOrganizadores;

  tabButtons.forEach(btn => {
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
  container.innerHTML = `<div class="how-it-works">${videoHTML}</div>`;

  const video = container.querySelector("#hiwVideo");
  const playBtn = container.querySelector(".play");
  const progress = container.querySelector(".progress");
  const volume = container.querySelector(".volume");
  const time = container.querySelector(".time");
  const closeBtn = container.querySelector(".close-video");
  const overlay = document.querySelector("html");
  const videoWrapper = container.querySelector(".hiw-video-wrapper");
  if (!video) return;

  const closeVideo = () => {
    video.pause();
    container.innerHTML = howHTML;
    activateHowItWorks();
    document.removeEventListener("keydown", escClose);
  };

  const escClose = e => { if (e.key === "Escape") closeVideo(); };

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
  overlay?.addEventListener("click", closeVideo);
  videoWrapper?.addEventListener("click", e => e.stopPropagation());
  document.addEventListener("keydown", escClose);

  updateRangeFill(progress);
  updateRangeFill(volume);
}

/* =========================
   UTILITIES
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
    )
  `;
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

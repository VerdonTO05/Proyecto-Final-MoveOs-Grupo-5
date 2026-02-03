/** Html del tutorial que se añadirá al pulsar 'Cómo Funciona' */
const howHTML = `<main class="how-it-works">
        <section class="hiw-header">
            <h1>¿Cómo Funciona MOVEos?</h1>
            <p>Una plataforma simple e intuitiva para participar o crear actividades increíbles</p>

            <div class="tab-switch">
                <button class="tab-btn active" id="p">Soy Participante</button>
                <button class="tab-btn" id="o">Soy Organizador</button>
            </div>
        </section>

        <section class="hiw-steps">
            <button class="step-number active">1</button>
            <button class="step-number">2</button>
            <button class="step-number">3</button>
            <button class="step-number">4</button>
        </section>

        <section id="hiw-card" class="hiw-card"></section>
        <a href="#" id="openVideo">Ver cómo funciona</a>
    </main>`;

/** HTML del video modal */
const videoHTML = `
<div class="video-wrapper">
    <video id="miVideo" preload="metadata">
        <source src="assets/video/video.mp4" type="video/mp4">
        Tu navegador no soporta video.
    </video>

    <div class="controles-personalizados">
        <button id="btnPlayPause" class="control-btn">
            <i class="fas fa-play"></i>
        </button>

        <span id="tiempoActual">0:00</span>

        <input type="range" id="barraProgreso" min="0" max="100" value="0">

        <span id="duracion">0:00</span>

        <button id="btnMute" class="control-btn">
            <i class="fas fa-volume-up"></i>
        </button>

        <input type="range" id="barraVolumen" min="0" max="1" step="0.01" value="1">

        <button id="btnFullScreen" class="control-btn">
            <i class="fas fa-expand"></i>
        </button>
    </div>
</div>
`;


//Cuando aparezca el tutorial, que haga scroll hasta el
document.addEventListener("DOMContentLoaded", () => {
    const howWork = document.getElementById("how");
    const tutorial = document.getElementById("tutorial-container");

    howWork.addEventListener("click", () => {
        tutorial.innerHTML = howHTML;

        requestAnimationFrame(() => {
            const ultimo = tutorial.lastElementChild;
            if (ultimo) ultimo.scrollIntoView({ behavior: "smooth", block: "end" });

            activateHowItWorks();
        });
    });

    document.addEventListener("click", (e) => {
        if (e.target.id === "openVideo") {
            e.preventDefault();
            openVideo();
        }
    });
});


/** Funcion que  renderiza el contenido de tutorial */
function renderStep(card, step) {

    card.innerHTML = `
    <div class="hiw-card">

        <div class="hiw-card-content">
            <div>
                <div style="flex: 1;">
                    <h2>${step.title}</h2>
                    <p class="subtitle">${step.subtitle}</p>

                    <ul class="hiw-list">
                        ${step.list.map(item => `
                            <li>
                                <div>
                                    <i class="fa-solid fa-star"></i>
                                </div>
                                <span>${item}</span>
                            </li>
                        `).join("")}
                    </ul>
                </div>
            </div>
        </div>

    </div>
    `;


}

/**
 * Función que activa los botones para modificar su visualización, además del contenido que se muestra
 */
function activateHowItWorks() {
    const tabButtons = document.querySelectorAll(".tab-btn");
    const stepButtons = document.querySelectorAll(".step-number");
    const card = document.getElementById("hiw-card");

    let mode = "participante"; // por defecto
    let currentStep = 0;

    // --- Botones de modo (participante/organizador)
    tabButtons.forEach((btn, index) => {
        btn.addEventListener("click", () => {
            tabButtons.forEach(b => b.classList.remove("active"));
            console.log("Clases tras remover:", Array.from(tabButtons).map(b => b.className));
            btn.classList.add("active");
            console.log("Clases tras agregar active:", btn.className);

            mode = index === 0 ? "participante" : "organizador";
            currentStep = 0;

            const steps = mode === "participante" ? stepsParticipante : stepsOrganizadores;
            renderStep(card, steps[currentStep]);

            stepButtons.forEach(b => b.classList.remove("active"));
            stepButtons[currentStep].classList.add("active");
        });
    });

    // --- Botones de pasos (1-4)
    stepButtons.forEach((btn, index) => {
        btn.addEventListener("click", () => {
            stepButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            currentStep = index;
            const steps = mode === "participante" ? stepsParticipante : stepsOrganizadores;
            renderStep(card, steps[currentStep]);
        });
    });

    // Render inicial
    const steps = stepsParticipante;
    renderStep(card, steps[0]);
}


function openVideo() {
    const container = document.getElementById("tutorial-container");
    if (!container) return;

    // Limpiar contenido previo del modal
    container.innerHTML = videoHTML;

    // Mostrar modal usando tu sistema
    container.classList.remove("invisible");
    container.classList.add("visible");

    // Inicializar reproductor custom
    initVideoPlayer();

    // Cerrar al click fuera
    container.addEventListener("click", closeVideo);
}

function closeVideo(e) {
    if (e.target.id !== "tutorial-container") return;

    const video = document.getElementById("miVideo");
    video?.pause();

    const container = document.getElementById("tutorial-container");
    container.classList.remove("visible");
    container.classList.add("invisible");

    container.innerHTML = "";
    container.removeEventListener("click", closeVideo);
}

function initVideoPlayer() {

  const video = document.getElementById('miVideo');
  const btnPlayPause = document.getElementById('btnPlayPause');
  const barra = document.getElementById('barraProgreso');
  const barraVolumen = document.getElementById('barraVolumen');
  const btnMute = document.getElementById('btnMute');
  const btnFullScreen = document.getElementById('btnFullScreen');
  const tiempoActual = document.getElementById('tiempoActual');
  const duracion = document.getElementById('duracion');

  if (!video) return;

  /* ▶️ PLAY / PAUSE */
  btnPlayPause?.addEventListener('click', () => {
    if (video.paused) {
      video.play();
      btnPlayPause.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
      video.pause();
      btnPlayPause.innerHTML = '<i class="fas fa-play"></i>';
    }
  });

  /* 📊 BARRA DE PROGRESO */
  video.addEventListener('timeupdate', () => {
    if (!isNaN(video.duration)) {
      barra.value = (video.currentTime / video.duration) * 100;
      tiempoActual.textContent = formatearTiempo(video.currentTime);
    }
  });

  barra?.addEventListener('input', () => {
    video.currentTime = (barra.value * video.duration) / 100;
  });

  /* ⏱️ DURACIÓN */
  video.addEventListener('loadedmetadata', () => {
    duracion.textContent = formatearTiempo(video.duration);
  });

  /* 🔊 VOLUMEN */
  barraVolumen?.addEventListener('input', () => {
    video.volume = barraVolumen.value;
    actualizarIconoVolumen();
  });

  btnMute?.addEventListener('click', () => {
    video.muted = !video.muted;
    actualizarIconoVolumen();
  });

  function actualizarIconoVolumen() {
    if (video.muted || video.volume === 0) {
      btnMute.innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else if (video.volume < 0.5) {
      btnMute.innerHTML = '<i class="fas fa-volume-down"></i>';
    } else {
      btnMute.innerHTML = '<i class="fas fa-volume-up"></i>';
    }
  }

  /* ⛶ PANTALLA COMPLETA */
  btnFullScreen?.addEventListener('click', () => {
    video.requestFullscreen?.();
  });

  /* 💡 DOBLE CLICK → ±10s */
  video.addEventListener('dblclick', (e) => {
    const mitad = video.clientWidth / 2;
    video.currentTime += e.offsetX < mitad ? -10 : 10;
  });
}

/* ⏱️ FORMATEAR TIEMPO */
function formatearTiempo(segundos) {
  const min = Math.floor(segundos / 60);
  const sec = Math.floor(segundos % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
}




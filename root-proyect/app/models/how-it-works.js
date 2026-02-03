/** Html del tutorial que se añadirá al pulsar 'Cómo Funciona' */
const howHTML = `
<main class="how-it-works">
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
</main>
`;

/** HTML del video */
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

/* ========================= */
/* INICIO */
document.addEventListener("DOMContentLoaded", () => {

    const howWork = document.getElementById("how");
    const tutorial = document.getElementById("tutorial-container");

    howWork.addEventListener("click", () => {
        tutorial.innerHTML = howHTML;

        requestAnimationFrame(() => {
            tutorial.scrollIntoView({ behavior: "smooth", block: "end" });
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

/* ========================= */
/* FUNCIONES VIDEO */

// Función para actualizar el relleno de la barra
function updateRangeFill(range) {
    const value = range.value;
    range.style.background = `linear-gradient(to right, var(--brand-primary) 0%, var(--brand-primary) ${value}%, #555 ${value}%, #555 100%)`;
}

function openVideo() {
    const container = document.getElementById("tutorial-container");
    if (!container) return;

    container.innerHTML = `<div class="how-it-works">${videoHTML}</div>`;
    container.classList.remove("invisible");
    container.classList.add("visible");

    const video = document.getElementById("hiwVideo");
    const playBtn = container.querySelector(".play");
    const progress = container.querySelector(".progress");
    const volume = container.querySelector(".volume");
    const time = container.querySelector(".time");
    const closeBtn = container.querySelector(".close-video");

    // ▶️ PLAY / PAUSE
    playBtn.addEventListener("click", () => {
        if (video.paused) {
            video.play();
            playBtn.textContent = "⏸";
        } else {
            video.pause();
            playBtn.textContent = "▶";
        }
    });

    // ⏱️ PROGRESO
    video.addEventListener("timeupdate", () => {
        if (!isNaN(video.duration)) {
            const percent = (video.currentTime / video.duration) * 100;
            progress.value = percent;
            updateRangeFill(progress);
            time.textContent = formatTime(video.currentTime);
        }
    });

    // Inicializar barra de progreso
    updateRangeFill(progress);

    // Cuando el usuario mueve la barra de progreso
    progress.addEventListener("input", () => {
        video.currentTime = (progress.value / 100) * video.duration;
        updateRangeFill(progress);
    });

    // 🔊 VOLUMEN
    volume.addEventListener("input", () => {
        video.volume = volume.value / 100;
        updateRangeFill(volume);
    });

    // Inicializar barra de volumen
    updateRangeFill(volume);

    // ❌ CERRAR VIDEO
    closeBtn.addEventListener("click", () => {
        video.pause();
        container.innerHTML = howHTML;  // vuelve al tutorial de texto
        activateHowItWorks();
    });
}

/* ========================= */
/* TUTORIAL */
function activateHowItWorks() {

    const tabButtons = document.querySelectorAll(".tab-btn");
    const stepButtons = document.querySelectorAll(".step-number");
    const card = document.getElementById("hiw-card");

    let mode = "participante";
    let currentStep = 0;

    tabButtons.forEach((btn, index) => {
        btn.addEventListener("click", () => {
            tabButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            mode = index === 0 ? "participante" : "organizador";
            currentStep = 0;

            const steps = mode === "participante"
                ? stepsParticipante
                : stepsOrganizadores;

            renderStep(card, steps[currentStep]);

            stepButtons.forEach(b => b.classList.remove("active"));
            stepButtons[currentStep].classList.add("active");
        });
    });

    stepButtons.forEach((btn, index) => {
        btn.addEventListener("click", () => {
            stepButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            currentStep = index;
            const steps = mode === "participante"
                ? stepsParticipante
                : stepsOrganizadores;

            renderStep(card, steps[currentStep]);
        });
    });

    renderStep(card, stepsParticipante[0]);
}

/* ========================= */
/* RENDER STEP */
function renderStep(card, step) {
    card.innerHTML = `
    <div class="hiw-card">
        <div class="hiw-card-content">
            <div>
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
    </div>`;
}

/* ========================= */
/* UTILS */
function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
}

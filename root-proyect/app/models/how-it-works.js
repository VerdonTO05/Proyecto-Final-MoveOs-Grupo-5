/** Html del tutorial que se añadirá al pulsar 'Cómo Funciona' */
const howHTML = `<main class="how-it-works">

        <!-- ENCABEZADO -->
        <section class="hiw-header">
            <h1>¿Cómo Funciona MOVEos?</h1>
            <p>Una plataforma simple e intuitiva para participar o crear actividades increíbles</p>

            <div class="tab-switch">
                <button class="tab-btn active" id="p">Soy Participante</button>
                <button class="tab-btn" id="o">Soy Organizador</button>
            </div>
        </section>

        <!-- PASOS -->
        <section class="hiw-steps">
            <button class="step-number active">1</button>
            <button class="step-number">2</button>
            <button class="step-number">3</button>
            <button class="step-number">4</button>
        </section>

        <!-- TARJETA PRINCIPAL -->
        <section id="hiw-card" class="hiw-card"></section>
    </main>`;


//Cuando aparezca el tutorial, que haga scroll hasta el
document.addEventListener("DOMContentLoaded", () => {
    const howWork = document.getElementById("how");
    const tutorial = document.getElementById("tutorial-container");
    const buttonP = document.getElementById("p");
    const buttonO = document.getElementById("o");


    howWork.addEventListener("click", () => {
        tutorial.innerHTML = howHTML;

        requestAnimationFrame(() => {
            const ultimo = tutorial.lastElementChild;
            if (ultimo) ultimo.scrollIntoView({ behavior: "smooth", block: "end" });

            activateHowItWorks();
        });
    });

});

/** Funcion que  renderiza el contenido de tutorial */ 
function renderStep(card, step) {

    card.innerHTML = `
    <div class="hiw-card">

        <div class="hiw-card-content">
            <div>
                <!-- TEXTO -->
                <div style="flex: 1;">
                    <h2>${step.title}</h2>
                    <p class="subtitle">${step.subtitle}</p>

                    <ul class="hiw-list">
                        ${step.list.map(item => `
                            <li>
                                <div>
                                    <i class="fas fa-check"></i>
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

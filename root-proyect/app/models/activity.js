/** Clase Activity donde se guarda la información */
class Activity {
  constructor({ id, title, description, image, alt, label, labelClass, details, price, activate }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.image = image;
    this.alt = alt;
    this.label = label;
    this.labelClass = labelClass;
    this.details = details;
    this.price = price;
    this.activate = activate;
  }

  /**
   * Crea la estructura HTML de la actividad
   * @returns {HTMLElement} article
   */
  render() {
    const article = document.createElement("article");
    article.classList.add("activity");

    // usa la propiedad real de la actividad
    const isActive = !!this.activate;
    const contentClass = isActive ? "activity-content" : "activity-content desactivate";
    const img = isActive
      ? `<img src="assets/img/original/${this.image}" alt="${this.alt}">`
      : `<img src="assets/img/editada/${this.image}" alt="${this.alt}">`;

    article.innerHTML = `
    <div class="activity-image">
      ${img}
      ${this.label ? `<span class="tag ${this.labelClass}">${this.label}</span>` : ""}
    </div>

    <div class="${contentClass}">
      <h3>${this.title}</h3>
      <p>${this.description}</p>

      <ul class="details">
        ${this.details.map(d => `<li>${d}</li>`).join("")}
      </ul>

      ${this.price ? `<div class="price">${this.price}</div>` : ""}

      <div class="actions">
        <button class="btn-detail" data-id="${this.id}">Ver Detalles</button>
        <button class="btn-signup" data-id="${this.id}" ${!isActive ? "disabled" : ""}>Inscribirse</button>
      </div>
    </div>
  `;

    const btnDetail = article.querySelector(".btn-detail");
    btnDetail.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      this.loadDetails(id);
    });

    const btnSignup = article.querySelector(".btn-signup");
    btnSignup.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      this.signup(id);
    });

    return article;
  }

}

async function signup(activityId) {
  try {
    const response = await fetch("../controllers/inscription-controller.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        activity_id: activityId
      })
    });

    const result = await response.json();

    if (result.success) {
      showSuccess(result.message);
    } else {
      showError(result.message);
    }

  } catch (error) {
    showError("Error de conexión con el servidor");
  }
}

function showSuccess(message) {
  alert(message);
  // ejemplo:
  // desactivar botón
  // cambiar texto a "Inscrito"
}

function showError(message) {
  alert(message);
}
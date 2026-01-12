/** Clase Activity donde se guarda la información */
class Activity {
  constructor({ title, description, image, alt, label, labelClass, details, price, activate }) {
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

    article.innerHTML = `
    <div class="activity-image">
      <img src="${this.image}" alt="${this.alt}">
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
        <button class="btn-detail">Ver Detalles</button>
        <button class="btn-signup" ${!isActive ? "disabled" : ""}>Inscribirse</button>
      </div>
    </div>
  `;

    return article;
  }



}

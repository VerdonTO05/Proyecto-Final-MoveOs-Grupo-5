/** Clase Actividad donde se cuarda la información  */
class Activity {
  constructor({ title, description, image, alt, label, labelClass, details, price }) {
    this.title = title;
    this.description = description;
    this.image = image;
    this.alt = alt;
    this.label = label;
    this.labelClass = labelClass;
    this.details = details;
    this.price = price;
  }

  /**
   * Método que crea la estructura html de la actividad
   * @returns devuelve un elemento del documento (article)
   */
  render() {
    const article = document.createElement("article");
    article.classList.add("activity");

    article.innerHTML = `
      <div class="activity-image">
        <img src="${this.image}" alt="${this.alt}">
        ${this.label ? `<span class="tag ${this.labelClass}">${this.label}</span>` : ""}
      </div>
      <div class="activity-content">
        <h3>${this.title}</h3>
        <p>${this.description}</p>
        <ul class="details">
          ${this.details.map(d => `<li>${d}</li>`).join("")}
        </ul>
        ${this.price ? `<div class="price">${this.price}</div>` : ""}
        <div class="actions">
          <button class="btn-detail">Ver Detalles</button>
          <button class="btn-signup">Inscribirse</button>
        </div>
      </div>
    `;
    return article;
  }
}

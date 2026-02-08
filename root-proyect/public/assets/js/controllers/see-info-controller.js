document.addEventListener("DOMContentLoaded", () => {
  const closeBtn = document.querySelector('.close-btn');

  // Botón cerrar
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      window.location.href = "index.php";
    });
  }

});

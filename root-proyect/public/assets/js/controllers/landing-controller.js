document.addEventListener("DOMContentLoaded", () => {
  const currentUser = window.CURRENT_USER;
  const buttonExplore = document.getElementById("button-explore");
  const buttonPost = document.getElementById("button-post");

  if (buttonExplore) {
    buttonExplore.addEventListener("click", (event) => {
      event.preventDefault();
      if (!currentUser) {
        alert("Debes iniciar sesión o registrarte para explorar.");
        window.location.href = "index.php?accion=loginView";
      } else {
        if (currentUser.role != 'administrador') {
          window.location.href = "index.php?accion=seeActivities";
        } else {
          window.location.href = "index.php?accion=seeBoth";
        }
      }
    });
  }

  if (buttonPost) {
    buttonPost.addEventListener("click", (event) => {
      event.preventDefault();
      if (!currentUser) {
        alert("Debes iniciar sesión o registrarte para crear.");
        window.location.href = "index.php?accion=loginView";
      } else {
        window.location.href = "index.php?accion=createActivity";
      }
    });
  }

});


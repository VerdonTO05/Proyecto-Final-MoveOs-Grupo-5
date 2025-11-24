/** main.js que controla el tema de la página (claro u oscuro), ya que en todas las ventanas se podrá realizar*/
document.addEventListener('DOMContentLoaded', () => {
  const toggleSwitch = document.getElementById('theme-toggle');
  const html = document.documentElement;
  const darkModeEnabled = localStorage.getItem('mode') === 'dark';

  html.classList.toggle('dark-mode', darkModeEnabled);
  html.classList.toggle('light-mode', !darkModeEnabled);
  toggleSwitch.checked = darkModeEnabled;

  toggleSwitch.addEventListener('change', () => {
    const isDark = toggleSwitch.checked;
    html.classList.toggle('dark-mode', isDark);
    html.classList.toggle('light-mode', !isDark);
    localStorage.setItem('mode', isDark ? 'dark' : 'light');
  });
});

/**
 * Función que permite visualizar la contraseña en el registro
 */
function togglePassword() {
    const passwordInput = document.getElementById("password");
    const icon = document.querySelector(".toggle-password i");

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    } else {
        passwordInput.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
}
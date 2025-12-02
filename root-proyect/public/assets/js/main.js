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
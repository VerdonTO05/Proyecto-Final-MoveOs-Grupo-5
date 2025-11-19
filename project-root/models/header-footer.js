/* Se crea el footer y header para añadirlo a todas las ventanas necesarios y evitar duplicar código  */
const headerHTML = `<header>
    <nav>
        <div class="logo-container">
            <a href="#">
                <img src="../ico/icono.png" alt="Logo MOVEos">
                <span>MOVEos</span>
            </a>
        </div>
        <ul id="list">
            <li><a href="landing.html">Inicio</a></li>
            <li id="how"><a href="#">Cómo Funciona</a></li>
        </ul>
        <div class="icons">
            <label class="switch">
                <input type="checkbox" id="theme-toggle">
                <span class="slider"></span>
            </label>
            <a href="login.html"><i class="fas fa-user"></i></a>
        </div>
    </nav>
</header>`;

const footerHTML = `<footer>
    <section>
        <div class="logo-container">
            <a href="#">
                <img src="../ico/icono.png" alt="Logo MOVEos">
                <span>MOVEos</span>
            </a>
            <p>Dinamismo, cambio y participación activa en cada experiencia.</p>
        </div>

        <div>
            <h4>Plataforma</h4>
            <ul>
                <li><a href="#">Explorar</a></li>
                <li><a href="#">Cómo Funciona</a></li>
                <li><a href="#">Para Organizadores</a></li>
                <li><a href="#">Precios</a></li>
            </ul>
        </div>

        <div>
            <h4>Soporte</h4>
            <ul>
                <li><a href="#">Centro de Ayuda</a></li>
                <li><a href="#">Contacto</a></li>
                <li><a href="#">Condiciones</a></li>
                <li><a href="#">Privacidad</a></li>
            </ul>
        </div>

        <div>
            <h4>Comunidad</h4>
            <ul>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Historias</a></li>
                <li><a href="#">Eventos</a></li>
                <li><a href="#">Newsletter</a></li>
            </ul>
        </div>
    </section>

    <p>© 2025 MOVEos. Todos los derechos reservados.</p>
</footer>`;

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('header').innerHTML = headerHTML;
    document.getElementById('footer').innerHTML = footerHTML;
});
document.addEventListener("DOMContentLoaded", () => {
    const currentUser = sessionStorage.getItem('currentUser');
    const buttonExplore = document.getElementById("button-explore");
    const buttonPost = document.getElementById("button-post");

    /* Si el usuario está logeado */
    if (currentUser) {
        const ul = document.getElementById("list");

        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '../../../../app/views/home.php';
        a.textContent = 'Explorar Actividades';

        li.appendChild(a);
        ul.appendChild(li);

        const aExplore = document.getElementById("a-explore");     
        aExplore.href = '../../../../app/views/home.php';
    }

    // Si pulsa el botón de Explorar actividades
    buttonExplore.addEventListener("click", () => {
        if (!currentUser) {
            alert("Debes iniciar sesión o registrarte para explorar actividades");
            window.location.href = "../../../../app/views/login.php";
        }
    });

    // ============================
    // POPUP BOM PARA PUBLICAR ACTIVIDAD
    // ============================
    buttonPost.addEventListener("click", () => {

        const popup = window.open(
    "",
    "popupActividad",
    "width=520,height=300,top=150,left=350,resizable=yes"
);

popup.document.write(`
    <html>
    <head>
        <title>Publicar Actividad</title>
        <style>

            /* Variables de color iguales que tu web */
            :root {
                --bg-main: #ffffff;
                --bg-surface: #fef8f8;
                --bg-muted: #f3e9ea;
                --text-primary: #333333;
                --text-secondary: #666666;
                --text-on-primary: #ffffff;
                --brand-primary: #6c2d3a;
                --brand-dark: #3f0f1a;
                --border-color: #e0e0e0;
            }

            body {
                font-family: "Inter", Arial, sans-serif;
                background-color: var(--bg-surface);
                color: var(--text-primary);
                padding: 2rem;
                margin: 0;
            }

            h2 {
                color: var(--brand-primary);
                font-size: 1.8rem;
                margin-bottom: 1rem;
                text-align: center;
            }

            p {
                color: var(--text-secondary);
                font-size: 1rem;
                text-align: center;
                margin-bottom: 2rem;
            }

            .popup-box {
                background: var(--bg-main);
                border: 1px solid var(--border-color);
                border-radius: 12px;
                padding: 2rem;
                box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            }

            button {
                display: block;
                margin: 2rem auto 0;
                padding: 0.7rem 1.4rem;
                background-color: var(--brand-primary);
                color: var(--text-on-primary);
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                font-size: 1rem;
                transition: opacity 0.2s ease;
            }

            button:hover {
                opacity: 0.85;
            }

        </style>
    </head>
    <body>
        <div class="popup-box">
            <h2>Publicar Actividad</h2>
            <p>Aquí puedes añadir el contenido que quieras: formulario, texto, imágenes, etc.</p>
            <button onclick="window.close()">Cerrar ventana</button>
        </div>
    </body>
    </html>
`);

    });

});

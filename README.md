# MOVE.os | Grupo 5 - 2º DAW

> Plataforma web integral para la gestión, publicación y participación en actividades, talleres y eventos formativos, fomentando el dinamismo y la comunidad local.

## 📖 Descripción del Proyecto

**MOVE.os** es un proyecto desarrollado por el Grupo 5 del curso de **Desarrollo de Aplicaciones Web**. 

El objetivo principal es centralizar la oferta y demanda de actividades de ocio y formación. La plataforma soluciona la dispersión existente en la gestión de eventos, permitiendo a los **organizadores** publicar sus propuestas y a los **participantes** inscribirse de forma sencilla. Todo ello bajo un entorno moderado por **administradores** para garantizar la seguridad y calidad del contenido.

## 🚀 Tecnologías Utilizadas

Este proyecto combina tecnologías de Front-end y Back-end para crear una aplicación dinámica completa:

### Frontend
* **HTML5:** Estructuración semántica del contenido.
* **CSS3:** Diseño responsivo, estilos visuales y maquetación.
* **JavaScript (ES6+):** Interactividad del lado del cliente y manipulación del DOM.

### Backend & Persistencia
* **PHP:** Lógica del servidor, procesamiento de formularios y gestión de sesiones.
* **MySQL:** Base de datos relacional para gestionar usuarios, roles, actividades e inscripciones.
* **Apache (XAMPP):** Servidor web para el despliegue local.

### Herramientas de Desarrollo
* **Figma:** Prototipado y diseño de interfaces (Mockups).
* **Jira:** Gestión ágil de tareas y sprints.
* **Git/GitHub:** Control de versiones.

## 📂 Estructura y Arquitectura

El proyecto sigue una arquitectura organizada para separar la lógica de negocio de la interfaz:

* **Assets/Public:** Archivos estáticos (imágenes, hojas de estilo CSS, scripts JS).
* **Core/Includes:** Fragmentos de código PHP reutilizables (cabeceras, pies de página, conexiones a BBDD).
* **Views:** Archivos que renderizan las diferentes pantallas para el usuario (Login, Dashboard, Catálogo).
* **Database:** Scripts SQL para la creación y población inicial de la base de datos.

## 🔧 Instalación y Despliegue

A diferencia de un proyecto estático, MOVE.os requiere un entorno de servidor (Stack LAMP/WAMP/XAMPP).

1.  **Requisitos previos:**
    * Tener instalado [XAMPP](https://www.apachefriends.org/es/index.html) (o similar con Apache y MySQL).

2.  **Clonar el repositorio:**
    Navega a la carpeta `htdocs` de tu instalación de XAMPP y clona el proyecto allí:
    ```bash
    cd C:/xampp/htdocs
    git clone [https://github.com/VerdonTO05/MOVE.os.git](https://github.com/VerdonTO05/MOVE.os.git)
    ```

3.  **Configurar la Base de Datos:**
    * Abre **XAMPP Control Panel** e inicia los módulos **Apache** y **MySQL**.
    * Ve a `http://localhost/phpmyadmin`.
    * Crea una nueva base de datos llamada `move_os_db`.
    * Importa el archivo `database.sql` ubicado en la carpeta `/sql` del proyecto.

4.  **Ejecución:**
    * Abre tu navegador y accede a:
        `http://localhost/MOVE.os`

## 💻 Utilización y Roles

La plataforma gestiona diferentes niveles de acceso mediante roles de usuario. Para probar la aplicación, puedes usar los flujos de registro o las credenciales de administrador predeterminadas.

### 1. Visitante (Sin registro)
* Visualización del "Landing Page".
* Acceso a tutoriales en la sección "Cómo funciona".
* Exploración limitada de actividades públicas.

### 2. Participante
* Inscripción a talleres y eventos.
* Visualización de historial de inscripciones.
* Creación de **peticiones** (propuestas de actividades) para que los organizadores las vean.
* Gestión de perfil propio.

### 3. Organizador
* Publicación de nuevas actividades (requieren validación).
* Gestión de asistentes.
* Visualización de peticiones de la comunidad para crear eventos a medida.

### 4. Administrador
* **Credenciales de prueba:** `User: admin` | `Pass: admin123`
* Panel de control para **validar o rechazar** actividades y peticiones.
* Moderación de usuarios y contenido.

## 📋 Guía de Commits

Para mantener un historial limpio en el desarrollo colaborativo, utilizamos la siguiente convención:

`tipo(alcance): descripción corta`

| Tipo | Descripción / Uso | Emoji (Opcional) |
| :--- | :--- | :---: |
| **`feat`** | **Nueva funcionalidad**. Añadir una característica (ej. Login, Filtros). | ✨ |
| **`fix`** | **Corrección de errores**. Solución a un bug encontrado. | 🐛 |
| **`docs`** | **Documentación**. Cambios en el README, manuales, etc. | 📝 |
| **`style`** | **Estilo**. CSS, formato de código, indentación (sin cambios de lógica). | 💄 |
| **`refactor`** | **Refactorización**. Mejoras de código PHP/JS sin cambiar funcionalidad. | ♻️ |
| **`db`** | **Base de Datos**. Cambios en el esquema SQL o migraciones. | 🗄️ |
| **`chore`** | **Mantenimiento**. Configuración de entorno, actualizaciones. | 🔧 |

**Ejemplos:**
* `feat(auth): implementar sistema de login con roles`
* `db(schema): añadir tabla de inscripciones`
* `style(nav): corregir espaciado en barra de navegación móvil`

## 🎨 Prototipo y Diseño

El diseño de la interfaz de usuario (UI) y la experiencia de usuario (UX) han sido elaborados previamente en Figma para garantizar la usabilidad antes de la codificación.

* **Ver Prototipo en Figma:** [MOVE.os Platform Development](https://www.figma.com/make/4lG0w2wX0BJ293Qo0oCtUj/MOVE.os-Platform-Development?node-id=0-1&t=ylrb2UJsruqVfndY-1) *(Enlace al prototipo interactivo)*

## Documentación T. 6, 7 y 8 

### 1. Diseño, Maquetación y Estilos
#### Estructura Responsive
Para esta sección, hemos refactorizado la estructura principal de la web utilizando **CSS Grid** y **Flexbox**, combinando lo mejor de ambos para lograr un diseño limpio, modular y fácilmente escalable. CSS Grid se utiliza principalmente para organizar la disposición general de los contenedores principales, mientras que Flexbox se aplica a elementos internos para alinear y distribuir contenido de manera flexible.

Además, la interfaz se ha hecho **responsive**, asegurando que se vea correctamente en distintas resoluciones. Para cubrir la mayor parte de los dispositivos, se implementó una **media query para pantallas de 576px**, que es el punto de quiebre más representativo para móviles y tablets pequeños. Esto permite que el diseño se ajuste fluidamente, reorganizando y adaptando los elementos sin perder la coherencia visual ni la usabilidad.

En conjunto, esta combinación garantiza que la web mantenga un comportamiento consistente y agradable tanto en desktop como en dispositivos móviles, optimizando la experiencia del usuario.

### 2. Preprocesadores
Para este proyecto hemos utilizado **SASS** con sintaxis **SCSS** como preprocesador de CSS. Esto nos permite escribir estilos de manera más **modular, organizada y reutilizable**, facilitando el mantenimiento y la escalabilidad del código.

#### Instalación
Para usar SASS en el proyecto se siguieron los siguientes pasos:

1. Instalar SASS globalmente usando npm:
   ```bash
   npm install -g sass
2. Compilar los archivos SCSS a CSS:
   sass --watch scss/main.scss:css/main.css
   
#### Uso de SCSS en el proyecto
En el proyecto se aplicaron las siguientes funcionalidades de SCSS:
- **Variables**: para mantener colores de manera centralizada.
- **Anidamiento**: para estructurar los selectores de forma jerárquica, reflejando la estructura HTML.
- **Mixins**: para reutilizar fragmentos de código comunes, como estilos de botones o contenedores.
- **Partials y modularidad**: los estilos se organizaron en varios archivos parciales (_base.scss, _forms.scss, etc.), importados luego en un archivo principal.

#### Beneficios de SASS/SCSS
El uso de SASS/SCSS aporta varias ventajas:
- **Código más limpio y mantenible**, evitando repeticiones innecesarias.
- **Facilidad para cambios globales** mediante variables.
- **Reutilización de estilos** mediante mixins.
- **Organización modular**, lo que facilita trabajar en equipo y en proyectos grandes.
En conjunto, SASS nos ha permitido generar un CSS final **optimizado, limpio y escalable**, mejorando la productividad y la consistencia visual del proyecto.

### Dinamismo y Manipulación del DOM 

#### Manipulación estructural del DOM
La aplicación genera contenido HTML de forma **dinámica** a partir de datos almacenados en estructuras JavaScript. En concreto, se implementó una **lista de actividades** que se carga dinámicamente en el DOM, evitando tener el contenido hardcodeado en el HTML.  
Este enfoque mejora la flexibilidad, escalabilidad y mantenimiento del código, permitiendo modificar los datos sin afectar a la estructura base de la página.

#### Control de ventanas y navegador (BOM)
Se ha implementado una **ventana emergente (modal) personalizada** que se muestra al pulsar un botón, interactuando directamente con el **Browser Object Model (BOM)**.  
Esta funcionalidad permite controlar la visualización de la ventana en función del estado de la página y del usuario, mejorando la experiencia de uso sin recurrir a métodos básicos como `alert`.

Además, se aprovechan propiedades del objeto `window` para adaptar el comportamiento de la interfaz según el contexto del navegador.

#### Persistencia de datos
Para mantener la información del usuario entre recargas, se ha implementado persistencia de datos utilizando:

- **localStorage:** para guardar preferencias permanentes como el tema (claro/oscuro).
- **sessionStorage:** para almacenar datos temporales como el usuario registrado durante la sesión.

Esta separación permite gestionar correctamente la duración de los datos según su finalidad, mejorando la usabilidad y el control del estado de la aplicación.

En conjunto, estas funcionalidades demuestran el uso correcto del DOM, BOM y los mecanismos de almacenamiento del navegador, aportando una aplicación más dinámica, interactiva y centrada en el usuario.

### Interacción y Formularios 

#### Gestión de eventos
El sistema reacciona a distintos tipos de **eventos del usuario** para mejorar la experiencia de uso (UX), incluyendo eventos de **ratón**, **teclado** y **foco**.  
Estas interacciones permiten ofrecer respuestas inmediatas a las acciones del usuario, como mostrar u ocultar elementos, validar campos o controlar comportamientos personalizados.

Cuando ha sido necesario, se ha evitado el comportamiento por defecto del navegador mediante `preventDefault()`, garantizando un mayor control sobre la lógica de la aplicación y una interacción más fluida y guiada.

#### Validación avanzada de formularios
En los formularios clave del proyecto, como el **registro de usuario**, se ha implementado una **validación en tiempo real** utilizando JavaScript. Esta validación se realiza a medida que el usuario interactúa con los campos, proporcionando feedback inmediato y mejorando la usabilidad.

Para los campos que requieren un mayor nivel de control, como **correo electrónico**, **contraseñas seguras** o datos sensibles, se han utilizado **expresiones regulares (Regex)**, asegurando que los datos introducidos cumplen con el formato y los requisitos establecidos.

Todos los campos han sido definidos en función de las necesidades del proyecto, integrándose de forma coherente en la lógica de la aplicación.

En conjunto, esta implementación refuerza la robustez del sistema, mejora la experiencia del usuario y demuestra un uso avanzado de eventos y validaciones en JavaScript.

### Gestión Multimedia 

#### Optimización y formatos de imagen
Se ha realizado una revisión y optimización de los recursos gráficos utilizados en el proyecto para garantizar un buen rendimiento y una correcta visualización en la web.

Los formatos empleados han sido seleccionados en función de sus ventajas:

- **SVG:** empleado para iconos, ya que es un formato vectorial, escalable y ligero, ideal para interfaces responsive.
- **PNG/JPG optimizados:** utilizados en casos donde se requiere compatibilidad total o transparencia (PNG) o una buena relación calidad/peso (JPG).

La elección de estos formatos permite mejorar el rendimiento general de la aplicación y optimizar la experiencia del usuario.

#### Edición de contenido multimedia
Las imágenes utilizadas en el proyecto han sido obtenidas de **fuentes externas en internet** y posteriormente **editadas de forma manual** para adaptarlas al diseño visual de la aplicación.

Las operaciones realizadas incluyen:
- Ajuste de color para obtener un **acabado en tonos grises**.
- Optimización del peso de los archivos.
- Adaptación de dimensiones para su correcta visualización en distintos dispositivos.

Para garantizar la trazabilidad del proceso, se incluyen tanto los **archivos originales (antes)** como los **archivos editados (después)**, permitiendo verificar las modificaciones realizadas.

Las herramientas utilizadas para la edición han sido seleccionadas por su accesibilidad y precisión en el tratamiento de imágenes, facilitando un control detallado del color y la optimización del peso final.


#### Derechos de autor y licencias
Todos los recursos gráficos utilizados han sido seleccionados respetando los **derechos de autor**. Las imágenes proceden de bancos de recursos que permiten su uso bajo licencias abiertas o de uso libre.

En cada caso se ha tenido en cuenta:
- El tipo de **licencia** del recurso (por ejemplo, uso libre, Creative Commons o similar).
- El **uso permitido**, asegurando que las imágenes puedan ser modificadas y utilizadas en un proyecto educativo sin fines comerciales.
- La correcta atribución cuando la licencia lo requiere.

Estas licencias permiten el uso, modificación y adaptación del material siempre que se respeten las condiciones establecidas por el autor original, garantizando un uso legal y responsable de los recursos multimedia.

## 👥 Autores - Grupo 5

* **Manuel Verdón** - [GitHub](https://github.com/VerdonTO05)
* **Irene Osuna** - [GitHub](https://github.com/ireneosuna)
* **Alejandro Montesinos** - [GitHub](https://github.com/AleejandroMontesinos)


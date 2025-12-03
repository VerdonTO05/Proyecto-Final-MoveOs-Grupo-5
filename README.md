# MOVE.os | Grupo 5 - 2º DAW

> Plataforma web integral para la gestión, publicación y participación en actividades, talleres y eventos formativos, fomentando el dinamismo y la comunidad local.

## 📖 Descripción del Proyecto

**MOVE.os** (del inglés *move*: mover, cambiar, actuar) es un proyecto desarrollado por el Grupo 5 del curso de **Desarrollo de Aplicaciones Web**. 

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

## 👥 Autores - Grupo 5

* **Manuel Verdón** - [GitHub](https://github.com/VerdonTO05)
* **Irene Osuna** - [GitHub](https://github.com/ireneosuna)
* **Alejandro Montesinos** - [GitHub](https://github.com/AleejandroMontesinos)

---
IES Isidro de Arcenegui y Carmona | Curso 2025/2026
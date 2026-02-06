# MOVE.os | Grupo 5 - 2º DAW

> Plataforma web integral para la gestión, publicación y participación en actividades, talleres y eventos formativos, fomentando el dinamismo y la comunidad local.

## 📖 Descripción del Proyecto

**MOVE.os** es un proyecto desarrollado por el Grupo 5 del curso de **Desarrollo de Aplicaciones Web**. 

El objetivo principal es centralizar la oferta y demanda de actividades de ocio y formación. La plataforma soluciona la dispersión existente en la gestión de eventos, permitiendo a los **organizadores** publicar sus propuestas y a los **participantes** inscribirse de forma sencilla. Todo ello bajo un entorno moderado por **administradores** para garantizar la seguridad y calidad del contenido.

## 🚀 Tecnologías Utilizadas

Este proyecto combina tecnologías de Front-end y Back-end para crear una aplicación dinámica completa:

### Frontend
* **HTML5:** Estructuración semántica del contenido.
* **CSS3 / SCSS:** Diseño responsivo con preprocesadores, estilos visuales y maquetación modular.
* **JavaScript (ES6+):** Interactividad del lado del cliente, manipulación del DOM y validación en tiempo real.

### Backend & Persistencia
* **PHP (Arquitectura MVC):** Lógica del servidor con patrón Modelo-Vista-Controlador.
* **MySQL:** Base de datos relacional con triggers y auditoría automática.
* **Sessions PHP:** Gestión de autenticación y control de acceso basado en roles.
* **Apache (XAMPP):** Servidor web para el despliegue local.

### Herramientas de Desarrollo
* **Figma:** Prototipado y diseño de interfaces (Mockups).
* **Jira:** Gestión ágil de tareas y sprints.
* **Git/GitHub:** Control de versiones.
* **NPM/SASS:** Compilación de preprocesadores CSS.

## 📂 Estructura y Arquitectura

El proyecto sigue una **arquitectura MVC (Modelo-Vista-Controlador)** para separar la lógica de negocio, la presentación y el acceso a datos:

```
root-proyect/
├── app/
│   ├── controllers/      # Controladores (lógica de negocio)
│   │   ├── activity-controller.php
│   │   ├── login-controller.php
│   │   ├── register-controller.php
│   │   ├── inscription-controller.php
│   │   ├── approve-activity.php
│   │   └── ...
│   ├── models/           # Modelos (acceso a datos)
│   ├── views/            # Vistas (interfaz de usuario)
│   │   ├── home.php
│   │   ├── login.php
│   │   ├── register.php
│   │   ├── create-activity.php
│   │   ├── control.php (Panel Admin)
│   │   └── ...
│   └── middleware/       # Control de acceso y autenticación
├── config/               # Configuración de base de datos
├── database/             # Scripts SQL
│   └── moveos.sql
└── public/               # Archivos públicos
    ├── assets/           # CSS, JS, imágenes
    ├── uploads/          # Imágenes subidas por usuarios
    └── index.php         # Punto de entrada
```

### Características de la arquitectura:
* **Controladores RESTful:** Endpoints API para operaciones CRUD
* **Separación de responsabilidades:** Lógica, presentación y datos independientes
* **Sistema de rutas:** Enrutamiento centralizado en `index.php`
* **Middleware de autenticación:** Control de acceso basado en roles
* **Upload de archivos:** Sistema de gestión de imágenes en `public/uploads/`

## 🔧 Instalación y Despliegue

A diferencia de un proyecto estático, MOVE.os requiere un entorno de servidor (Stack LAMP/WAMP/XAMPP).

1.  **Requisitos previos:**
    * Tener instalado [XAMPP](https://www.apachefriends.org/es/index.html) (o similar con Apache y MySQL).
    * PHP 7.4 o superior
    * MySQL 5.7 o superior

2.  **Clonar el repositorio:**
    Navega a la carpeta `htdocs` de tu instalación de XAMPP y clona el proyecto allí:
    ```bash
    cd C:/xampp/htdocs
    git clone https://github.com/VerdonTO05/Proyecto-Final-MoveOs-Grupo-5.git
    cd Proyecto-Final-MoveOs-Grupo-5/root-proyect
    ```

3.  **Configurar la Base de Datos:**
    * Abre **XAMPP Control Panel** e inicia los módulos **Apache** y **MySQL**.
    * Ve a `http://localhost/phpmyadmin`.
    * Importa el archivo `moveos.sql` ubicado en la carpeta `/database` del proyecto.
    * El script creará automáticamente la base de datos `moveos` con todas las tablas, triggers y datos de ejemplo.

4.  **Configurar la conexión:**
    * Verifica que el archivo `config/database.php` tenga la configuración correcta:
    ```php
    $host = 'localhost';
    $dbname = 'moveos';
    $username = 'root';
    $password = '';  // Deja vacío si usas XAMPP por defecto
    ```

5.  **Ejecución:**
    * Abre tu navegador y accede a:
        `http://localhost/Proyecto-Final-MoveOs-Grupo-5/root-proyect/public/`

## 💻 Utilización y Roles

La plataforma gestiona diferentes niveles de acceso mediante roles de usuario. Para probar la aplicación, puedes usar los flujos de registro o las credenciales predefinidas.

### 1. Visitante (Sin registro)
* Visualización del "Landing Page".
* Acceso a tutoriales en la sección "Cómo funciona".
* Exploración limitada de actividades públicas.
* Registro de nueva cuenta con validación en tiempo real.

### 2. Participante
* **Inscripción y gestión:**
  * Inscripción a talleres y eventos aprobados.
  * Visualización de historial de inscripciones.
  * Cancelación de inscripciones (dar de baja).
* **Peticiones (Requests):**
  * Creación de **peticiones** (propuestas de actividades) para que los organizadores las vean.
  * Upload de imágenes para las peticiones.
  * Seguimiento del estado de las peticiones (pendiente/aprobada/rechazada).
* **Perfil:**
  * Gestión de información personal.

### 3. Organizador
* **Publicación de actividades:**
  * Creación de nuevas actividades con formulario completo.
  * Upload de imágenes para cada actividad.
  * Las actividades quedan en estado "pendiente" hasta validación del administrador.
* **Gestión:**
  * Visualización de mis actividades publicadas.
  * Visualización de asistentes a cada actividad.
  * Consulta de peticiones de la comunidad para crear eventos a medida.
* **Dashboard:**
  * Panel con todas las actividades propias.
  * Estadísticas de inscripciones en tiempo real.

### 4. Administrador
* **Credenciales de prueba:** 
  * `Usuario: admin` | `Contraseña: admin123`
* **Panel de control (`control.php`):**
  * **Validación de actividades:** Aprobar o rechazar actividades pendientes.
  * **Moderación de peticiones:** Gestión de requests de participantes.
  * **Actualización en tiempo real:** Las acciones de aprobar/rechazar actualizan la UI sin recargar página.
  * **Vista de auditoría:** Registro de todas las acciones realizadas.
* **Gestión de usuarios:**
  * Visualización de todos los usuarios registrados.
  * Moderación de contenido reportado.

## ✨ Funcionalidades Principales Implementadas

### 🔐 Sistema de Autenticación y Autorización
* **Registro de usuarios:**
  * Validación en tiempo real con expresiones regulares (email, contraseña segura).
  * Hash de contraseñas con `password_hash()` (bcrypt).
  * Asignación automática de roles.
* **Login seguro:**
  * Verificación con `password_verify()`.
  * Gestión de sesiones PHP.
  * Recordar sesión entre navegaciones.
* **Middleware de protección:**
  * Control de acceso basado en roles (RBAC).
  * Redirección automática según privilegios.
  * Protección de rutas sensibles.

### 📝 Sistema de Actividades
* **Creación y publicación:**
  * Formulario completo con múltiples campos (título, descripción, fecha, hora, precio, ubicación, etc.).
  * Upload de imágenes con validación de tipo y tamaño.
  * Estado inicial "pendiente" para moderación.
  * Almacenamiento de imágenes en filesystem (`public/uploads/`).
* **Sistema de aprobación:**
  * Panel de administración para aprobar/rechazar actividades.
  * Cambio de estado de "pendiente" a "aprobada".
  * Notificaciones visuales de estado.
* **Visualización:**
  * Listado dinámico de actividades aprobadas en `home.php`.
  * Renderizado dinámico con JavaScript (fetch API).
  * Filtrado por categorías (Taller, Clase, Evento, Excursión, etc.).
  * Vista detallada de cada actividad.

### 📢 Sistema de Peticiones (Requests)
* **Creación de peticiones:**
  * Los participantes pueden proponer actividades que desean.
  * Formulario similar al de actividades.
  * Upload de imágenes ilustrativas.
* **Gestión:**
  * Los organizadores pueden ver las peticiones.
  * Los administradores pueden aprobar/rechazar peticiones.
  * Sistema de estados (pendiente/aprobada/rechazada).

### 👥 Sistema de Inscripciones
* **Inscripción a actividades:**
  * Los participantes pueden inscribirse a actividades aprobadas.
  * Control de plazas disponibles.
  * Contador de inscripciones en tiempo real.
* **Triggers de MySQL:**
  * Actualización automática del contador `current_registrations`.
  * Incremento al inscribirse, decremento al darse de baja.
* **Gestión de inscripciones:**
  * Vista de "Mis actividades" para participantes.
  * Opción de dar de baja (unsubscribe).
  * Prevención de inscripciones duplicadas (constraint UNIQUE).

### 🗄️ Base de Datos
* **Triggers automáticos:**
  * Auditoría de cambios en actividades y peticiones.
  * Actualización automática de contadores de inscripciones.
* **Tabla de auditoría (`audit_logs`):**
  * Registro de todas las operaciones INSERT/UPDATE/DELETE.
  * Almacenamiento en formato JSON de valores antiguos y nuevos.
  * Timestamp y usuario de base de datos.
* **Relaciones:**
  * Foreign keys con `ON DELETE CASCADE`.
  * Integridad referencial completa.

### 🎨 Interfaz de Usuario Moderna
* **Diseño responsive:**
  * CSS Grid + Flexbox para layouts adaptativos.
  * Media queries para móviles (576px breakpoint).
  * Optimizado para desktop, tablet y móvil.
* **Preprocesadores SCSS:**
  * Variables para colores y estilos centralizados.
  * Mixins reutilizables.
  * Modularización con partials.
* **Interactividad JavaScript:**
  * Manipulación del DOM dinámicamente.
  * Fetch API para comunicación con backend.
  * Validación de formularios en tiempo real.
  * Modales personalizados sin `alert()`.
  * Persistencia con localStorage/sessionStorage.

### 🖼️ Gestión de Multimedia
* **Upload de imágenes:**
  * Sistema de subida para actividades y peticiones.
  * Validación de formatos permitidos (JPG, PNG, SVG).
  * Almacenamiento en `public/uploads/`.
  * Prevención de sobrescritura con nombres únicos.
* **Optimización:**
  * Uso de formatos SVG para iconos (escalable y ligero).
  * Imágenes editadas manualmente para reducir peso.
  * Adaptación responsive de imágenes.


### Tablas principales:
* **`users`**: Usuarios registrados con sus credenciales y rol asignado
* **`roles`**: Roles del sistema (participante, organizador, administrador)
* **`activities`**: Actividades publicadas por organizadores
* **`requests`**: Peticiones de actividades creadas por participantes
* **`registrations`**: Inscripciones de participantes a actividades
* **`categories`**: Categorías de actividades (Taller, Clase, Evento, etc.)
* **`audit_logs`**: Registro de auditoría de todas las operaciones

### Funcionalidades de base de datos:
* **Triggers automáticos** para auditoría y actualización de contadores
* **Foreign Keys** con `ON DELETE CASCADE` para mantener integridad
* **Constraints UNIQUE** para evitar duplicados
* **Índices** en campos frecuentemente consultados

## 🔒 Seguridad Implementada

### Autenticación y Autorización
* **Hash de contraseñas:** Uso de `password_hash()` con bcrypt (coste 10)
* **Sesiones seguras:** Configuración de sesiones PHP con regeneración de ID
* **Control de acceso basado en roles (RBAC):** Middleware que verifica permisos antes de acceder a rutas
* **Protección CSRF:** Tokens de validación en formularios críticos

### Validación de Datos
* **Validación cliente-lado:** JavaScript con expresiones regulares para feedback inmediato
* **Validación servidor-lado:** PHP valida todos los datos antes de procesarlos
* **Sanitización de inputs:** Uso de `htmlspecialchars()` y prepared statements
* **Prepared Statements:** PDO con parámetros preparados para prevenir SQL Injection

### Upload de Archivos
* **Validación de tipo MIME:** Solo se aceptan formatos permitidos (JPG, PNG, SVG)
* **Validación de tamaño:** Límite de tamaño de archivo configurable
* **Nombres únicos:** Generación de nombres únicos para prevenir sobrescritura
* **Directorio protegido:** Los uploads se almacenan fuera de la raíz web cuando es posible

## 📊 Gestión del Proyecto


### Control de Versiones
* **Git Flow:** Uso de ramas feature, develop y main
* **Commits semánticos:** Siguiendo la convención detallada más abajo
* **Pull Requests:** Revisión de código antes de merge
* **GitHub:** Repositorio centralizado con protección de rama main

## 🌐 APIs REST Implementadas

El backend expone varios endpoints API para operaciones CRUD:

### Actividades
* **`GET /controllers/get-activities.php`** - Obtener todas las actividades aprobadas
* **`GET /controllers/get-pending-activities.php`** - Obtener actividades pendientes (admin)
* **`GET /controllers/get-my-activities.php`** - Obtener mis actividades (organizador)
* **`POST /controllers/activity-controller.php`** - Crear nueva actividad
* **`POST /controllers/approve-activity.php`** - Aprobar actividad (admin)
* **`POST /controllers/reject-activity.php`** - Rechazar actividad (admin)

### Peticiones (Requests)
* **`GET /controllers/get-requests.php`** - Obtener todas las peticiones
* **`POST /controllers/request-controller.php`** - Crear nueva petición
* **`POST /controllers/approve-request.php`** - Aprobar petición (admin)
* **`POST /controllers/reject-request.php`** - Rechazar petición (admin)

### Inscripciones
* **`POST /controllers/inscription-controller.php`** - Inscribirse a una actividad
* **`POST /controllers/unsubscribe-controller.php`** - Darse de baja de una actividad

### Autenticación
* **`POST /controllers/login-controller.php`** - Iniciar sesión
* **`POST /controllers/register-controller.php`** - Registrar nuevo usuario
* **`POST /controllers/logout.php`** - Cerrar sesión

Todas las APIs retornan respuestas en formato JSON y utilizan códigos de estado HTTP apropiados.

## 🚧 Mejoras Futuras

### Funcionalidades Planificadas
* **Sistema de notificaciones:**
  * Notificaciones en tiempo real para nuevas actividades
  * Emails automáticos al aprobar/rechazar actividades
  * Recordatorios de actividades próximas
* **Sistema de valoraciones:**
  * Calificación de actividades completadas
  * Reseñas y comentarios de participantes
  * Reputación de organizadores
* **Chat en tiempo real:**
  * Mensajería entre participantes y organizadores
  * WebSockets o Socket.io para comunicación instantánea
* **Panel de estadísticas:**
  * Gráficas de actividades más populares
  * Métricas de participación
  * Dashboard analítico para administradores
* **Sistema de pagos:**
  * Integración con pasarelas de pago (Stripe, PayPal)
  * Gestión de reembolsos
  * Facturación automática
* **Búsqueda avanzada:**
  * Filtros múltiples (fecha, precio, ubicación, categoría)
  * Búsqueda por texto con coincidencias parciales
  * Ordenamiento por relevancia, fecha, precio
* **Mapa interactivo:**
  * Visualización de actividades en mapa (Google Maps/Leaflet)
  * Filtrado por distancia
  * Geolocalización del usuario

### Mejoras Técnicas
* **Testing:**
  * Unit tests con PHPUnit
  * Tests de integración
  * Tests E2E con Selenium
* **CI/CD:**
  * Pipeline de integración continua (GitHub Actions)
  * Despliegue automático a staging/producción
  * Tests automáticos en cada PR
* **Optimización de rendimiento:**
  * Caché de consultas frecuentes (Redis)
  * CDN para assets estáticos
  * Lazy loading de imágenes
  * Paginación de resultados
* **Accesibilidad:**
  * Cumplimiento WCAG 2.1 nivel AA
  * Navegación por teclado completa
  * Lectores de pantalla compatibles
* **Internacionalización:**
  * Soporte multiidioma (i18n)
  * Formato de fechas y monedas por región
* **API Documentation:**
  * Documentación Swagger/OpenAPI
  * Ejemplos de uso con Postman
  * Versionado de API





## �📋 Guía de Commits

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


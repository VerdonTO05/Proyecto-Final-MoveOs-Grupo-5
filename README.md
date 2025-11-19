
# GRUPO_5_2DAW_DWEC_T030405_A01

> Mini proyecto para la asignatura DWEC (Desarrollo Web en Entorno Cliente) que implementa la estructura de un proyecto siguiendo el patrón Modelo-Vista-Controlador (MVC).

## Descripción del Proyecto

Este repositorio contiene un proyecto desarrollado como parte de la asignatura DWEC. El objetivo principal es aplicar y comprender la arquitectura de software **Modelo-Vista-Controlador (MVC)** en un entorno de desarrollo web front-end, utilizando tecnologías web estándar. 

## 🚀 Tecnologías Utilizadas

Este proyecto está construido con tecnologías front-end:

* **HTML:** Para la estructura y el contenido semántico de la aplicación.
* **CSS:** Para el diseño, la presentación y los estilos visuales.
* **JavaScript (ES6+):** Para la lógica de la aplicación, la manipulación del DOM y la implementación del patrón MVC.
* Tambien en JavaScript implementaremos funcionalidades como, guardar los usuarios registrados en el LocalStorage y arrays para la persistencia de datos.
* Con LocalStorage tambien almacenamos el modo de vista de la página (Claro u oscuro).

## 📂 Estructura del Proyecto

El código fuente sigue una organización basada en el patrón Modelo-Vista-Controlador:

* **Modelo (Model):** Contiene la lógica de negocio y los datos de la aplicación. Se encarga de gestionar el estado.
* **Vista (View):** Es la capa de presentación. Se encarga de renderizar la interfaz de usuario (UI) y mostrar los datos del modelo.
* **Controlador (Controller):** Actúa como intermediario entre el Modelo y la Vista. Maneja las interacciones del usuario, actualiza el modelo y, a su vez, hace que la vista se actualice.

La carpeta principal del código fuente es `project-root/`.

## 🔧 Instalación y Uso

Dado que es un proyecto basado en HTML, CSS y JavaScript puros, no requiere un proceso de instalación complejo ni dependencias de servidor.

1.  **Clona el repositorio** en tu máquina local:
    ```bash
    git clone [https://github.com/VerdonTO05/GRUPO_5_2DAW_DWEC_T030405_A01.git](https://github.com/VerdonTO05/GRUPO_5_2DAW_DWEC_T030405_A01.git)
    ```

2.  **Navega a la carpeta** del proyecto:
    ```bash
    cd GRUPO_5_2DAW_DWEC_T030405_A01
    ```
    Aquí tienes una representación visual de un repositorio siendo clonado y la navegación en la terminal: 
3.  **Abre el archivo `landing.html` directamente en tu navegador web preferido (como Chrome, Firefox o Edge).

## Utilización ✍️
Nuestra plataforma web requiere registro e inicio de sesión para acceder a la página principal (Home). Este acceso protegido se verifica usando una variable en sessionStorage.

En el Home, las actividades se generan dinámicamente, ya que cada una es una instancia de una clase, permitiendo añadirlas en tiempo real, en un futuro se seguira implementando de esa manera.

La web también incluye una sección "Cómo funciona" (para roles de Organizador y Participante) y guarda la preferencia del tema (claro/oscuro) en localStorage para mantener la elección del usuario.

## 📋 Guía de Commits

Para mantener un historial limpio y comprensible, utilizamos la siguiente convención para los mensajes de commit:

`tipo(alcance): descripción corta`

### Tipos de Commit

| Tipo | Descripción / Uso | Emoji (Opcional) |
| :--- | :--- | :---: |
| **`feat`** | **Nueva funcionalidad**. Una nueva característica para el usuario. | ✨ |
| **`fix`** | **Corrección de errores**. Solución a un bug. | 🐛 |
| **`docs`** | **Documentación**. Cambios en el README, comentarios, etc. | 📝 |
| **`style`** | **Estilo**. Formato en general, CSS. | 💄 |
| **`refactor`** | **Refactorización**. Cambios de código que no añaden features ni arreglan bugs. | ♻️ |
| **`test`** | **Tests**. Añadir o corregir pruebas unitarias/integración. | ✅ |
| **`chore`** | **Mantenimiento**. Actualización de tareas de build, paquetes, configs. | 🔧 |
| **`del`** | **Eliminación**. Borrado de código o archivos obsoletos. | 🔥 |

### Ejemplos

* `feat(auth): implementar login con Google`
* `fix(api): corregir error 500 en endpoint de usuarios`
* `del(assets): eliminar imágenes no utilizadas`
    
## Imagenes
**https://imgur.com/gallery/imagenes-grupo-5-v1-3-92sLKTH**


## 👥 Propietarios

* **[VerdonTO05](https://github.com/VerdonTO05)** (Propietario)
* **[ireneosuna](https://github.com/ireneosuna)** (Propietario)
* **[AleejandroMontesinos](https://github.com/AleejandroMontesinos)** (Propietario)

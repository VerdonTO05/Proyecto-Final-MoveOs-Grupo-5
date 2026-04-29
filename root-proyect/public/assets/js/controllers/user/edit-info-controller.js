// document.addEventListener("DOMContentLoaded", () => {

//   // ===== ERRORES DESDE PHP =====
//   const phpErrors = window.__PHP_FORM_ERRORS__ ?? [];
//   if (phpErrors.length > 0) {
//     showAlert(
//       "Errores en el formulario:",
//       `<ul>${phpErrors.map(err => `<li>${err}</li>`).join('')}</ul>`,
//       "error",
//       4000
//     );
//   }

//   const editForm = document.getElementById("edit-form");
//   const closeBtn = document.querySelector('.close-btn');

//   // Botón cerrar
//   if (closeBtn) {
//     closeBtn.addEventListener('click', () => {
//       window.location.href = "index.php";
//     });
//   }

//   // ===== AVATAR UPLOAD =====
//   const avatarWrapper = document.getElementById('avatarWrapper');
//   const avatarInput   = document.getElementById('avatarInput');
//   const profileAvatar = document.getElementById('profileAvatar');

//   if (avatarWrapper && avatarInput) {
//     // Clic en el avatar abre el selector de archivos
//     avatarWrapper.addEventListener('click', () => avatarInput.click());

//     avatarInput.addEventListener('change', async () => {
//       const file = avatarInput.files[0];
//       if (!file) return;

//       // Validar tamaño (2 MB)
//       if (file.size > 2 * 1024 * 1024) {
//         showAlert('Error', 'La imagen no puede superar los 2 MB.', 'error');
//         return;
//       }

//       // Previsualizar la imagen inmediatamente
//       const reader = new FileReader();
//       reader.onload = (e) => { profileAvatar.src = e.target.result; };
//       reader.readAsDataURL(file);

//       // Subir vía AJAX
//       const formData = new FormData();
//       formData.append('avatar', file);

//       try {
//         const response = await fetch('index.php?accion=uploadAvatar', {
//           method: 'POST',
//           body: formData
//         });
//         const result = await response.json();

//         if (result.success) {
//           showAlert('¡Listo!', result.message, 'success');
//           // Actualizar también el avatar del navbar
//           const navAvatar = document.getElementById('nav-avatar');
//           if (navAvatar) {
//             navAvatar.src = result.image_url + '?t=' + Date.now();
//           }
//         } else {
//           showAlert('Error', result.message, 'error');
//         }
//       } catch (err) {
//         showAlert('Error', 'No se pudo subir la imagen.', 'error');
//       }
//     });
//   }

//   // Campos de contraseña opcionales
//   const changePasswordCheckbox = document.getElementById('changePassword');
//   const passwordFields = document.getElementById('passwordFields');
//   const currentPassword = document.getElementById('current_password');
//   const newPassword = document.getElementById('new_password');

//   if (changePasswordCheckbox && passwordFields) {
//     passwordFields.style.display = 'none';

//     // Si volvemos con error y el checkbox estaba marcado, mostramos los campos
//     if (changePasswordCheckbox.checked) {
//       passwordFields.style.display = 'block';
//     }

//     changePasswordCheckbox.addEventListener('change', () => {
//       passwordFields.style.display = changePasswordCheckbox.checked ? 'block' : 'none';

//       if (!changePasswordCheckbox.checked) {
//         currentPassword.value = '';
//         newPassword.value = '';
//       }
//     });
//   }

//   // Toggle ver/ocultar contraseña
//   const toggleButtons = document.querySelectorAll(".toggle-password");
//   toggleButtons.forEach((button) => {
//     const input = button.closest(".div-password").querySelector("input");
//     const icon = button.querySelector("i");

//     button.addEventListener("click", (e) => {
//       e.preventDefault();
//       if (input.type === "password") {
//         input.type = "text";
//         icon.classList.remove("fa-eye");
//         icon.classList.add("fa-eye-slash");
//       } else {
//         input.type = "password";
//         icon.classList.remove("fa-eye-slash");
//         icon.classList.add("fa-eye");
//       }
//     });
//   });

//   // Validación del formulario
//   if (editForm) {
//     editForm.addEventListener("submit", (event) => {
//       event.preventDefault();

//       const fullname = document.getElementById("fullname").value.trim();
//       const username = document.getElementById("username").value.trim();
//       const email    = document.getElementById("email").value.trim();

//       let errors = [];

//       if (!validateFullName(fullname)) {
//         errors.push("Por favor, introduce nombre y apellido.");
//       }

//       // Corregido: era < 0, nunca se cumplía
//       if (username.length < 3) {
//         errors.push("El nombre de usuario debe tener al menos 3 caracteres.");
//       }

//       if (!validateEmail(email)) {
//         errors.push("El formato del correo electrónico no es válido.");
//       }

//       if (changePasswordCheckbox && changePasswordCheckbox.checked) {
//         if (!currentPassword.value) {
//           errors.push("Debes introducir tu contraseña actual.");
//         }

//         if (!newPassword.value) {
//           errors.push("Debes introducir la nueva contraseña.");
//         }

//         if (newPassword.value && !validatePassword(newPassword.value)) {
//           errors.push("La nueva contraseña debe tener al menos 8 caracteres.");
//         }
//       }

//       if (errors.length > 0) {
//         return showAlert(
//           "Errores en el formulario:",
//           `<ul>${errors.map(err => `<li>${err}</li>`).join('')}</ul>`,
//           "error",
//           4000
//         );
//       }

//       editForm.submit();
//     });
//   }
// });


document.addEventListener('DOMContentLoaded', () => {

    // ===== BOTÓN VOLVER =====
    document.querySelector('.back-btn')?.addEventListener('click', () => {
        history.back();
    });

    const form = document.querySelector('.form-activity');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        let errors = [];

        // ===== OBTENER VALORES =====
        const titulo = form.querySelector('[name="title"]')?.value.trim() || '';
        const descripcion = form.querySelector('[name="description"]')?.value.trim() || '';
        const categoria = form.querySelector('#category')?.value || '';
        const ubicacion = form.querySelector('[name="location"]')?.value.trim() || '';
        const fecha = form.querySelector('[name="date"]')?.value || '';
        const hora = form.querySelector('[name="time"]')?.value || '';

        const edad = form.querySelector('[name="min_age"]')?.value || '';
        const edadNum = parseInt(edad) || 0;

        const max_people = form.querySelector('[name="max_people"]')?.value || '';
        const maxPeopleNum = parseInt(max_people) || 0;

        const precioInput = form.querySelector('[name="price"]');
        if (precioInput && !precioInput.value.trim()) {
            precioInput.value = 0;
        }
        const precio = precioInput ? parseFloat(precioInput.value) || 0 : 0;

        const imagenInput = document.getElementById('image_file');
        const imagen = imagenInput?.files[0];
        const currentImage = form.querySelector('[name="current_image"]')?.value || '';

        // ===== VALIDACIONES =====
        if (!titulo) errors.push("El título no puede estar vacío.");
        else if (titulo.length < 5) errors.push("El título debe tener al menos 5 caracteres.");
        else if (titulo.length > 50) errors.push("El título debe tener menos de 50 caracteres.");

        if (!descripcion) errors.push("La descripción no puede estar vacía.");
        else if (descripcion.length < 15) errors.push("La descripción es demasiado breve.");

        if (!categoria) errors.push("Debes seleccionar una categoría.");
        if (!ubicacion) errors.push("La ubicación es obligatoria.");
        if (!fecha) errors.push("La fecha es obligatoria.");
        if (!hora) errors.push("La hora es obligatoria.");

        if (fecha) {
            const hoy = new Date();
            const fechaInput = new Date(fecha);
            const hoyStr = hoy.toISOString().split('T')[0];

            const maxFecha = new Date();
            maxFecha.setFullYear(hoy.getFullYear() + 2);

            if (fecha < hoyStr) errors.push("La fecha no puede ser anterior a hoy.");
            if (fechaInput > maxFecha) errors.push("La fecha no puede ser superior a 2 años.");
        }

        if (hora) {
            const [h, m] = hora.split(':').map(Number);
            if (h < 8 || h > 23 || (h === 23 && m > 0)) {
                errors.push("La hora debe estar entre las 08:00 y las 23:00.");
            }
        }

        if (edadNum > 18) errors.push("La edad mínima no puede ser mayor a 18 años.");
        if (maxPeopleNum > 500) errors.push("El máximo de participantes es 500.");
        if (precio > 1000) errors.push("El precio no puede ser mayor a 1000€.");

        if (!imagen && !currentImage) {
            errors.push("Debes subir una imagen.");
        } else if (imagen) {
            const tiposValidos = ['image/jpeg', 'image/png', 'image/jpg'];
            if (!tiposValidos.includes(imagen.type)) {
                errors.push("Formato de imagen inválido (solo JPG o PNG).");
            }
            if (imagen.size > 5 * 1024 * 1024) {
                errors.push("La imagen no puede superar 5MB.");
            }
        }

        // ===== MOSTRAR ERRORES =====
        if (errors.length > 0) {
            showAlert(
                "Errores en el formulario:",
                `<ul>${errors.map(err => `<li>${err}</li>`).join('')}</ul>`,
                "error",
                4000
            );
            return;
        }

        // ===== ENVÍO =====
        const formData = new FormData(form);

        fetch(form.action, {
            method: "POST",
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(res => {
            const contentType = res.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
                throw new Error('El servidor no devolvió JSON.');
            }
            return res.json();
        })
        .then(data => {

            if (!data.success) {

                if (data.errors && data.errors.length > 0) {
                    showAlert(
                        data.message || "Errores en el formulario:",
                        `<ul>${data.errors.map(err => `<li>${err}</li>`).join('')}</ul>`,
                        "error",
                        4000
                    );
                    return;
                }

                showAlert("Error", data.message || "Ha ocurrido un error", "error", 4000);
                return;
            }

            showAlert("Éxito", data.message, "success", 1800);

            setTimeout(() => {
                window.location.href = "?accion=seeMyActivities";
            }, 1800);

        })
        .catch(error => {
            console.error('Error fetch:', error);
            showAlert("Error", "No se pudo conectar con el servidor", "error", 4000);
        });
    });

    // ===== TRANSPORTE =====
    const transportToggle = document.getElementById('transport_toggle');
    const box = document.getElementById('departure_box');

    if (transportToggle && box) {
        box.style.display = transportToggle.checked ? 'block' : 'none';

        transportToggle.addEventListener('change', function () {
            box.style.display = this.checked ? 'block' : 'none';
        });
    }

});
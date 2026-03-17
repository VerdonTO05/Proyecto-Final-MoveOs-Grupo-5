        document.addEventListener('DOMContentLoaded', async () => {
            const grid = document.getElementById('chatHubGrid');
            
            try {
                const response = await fetch('index.php?accion=getChatHub');
                const data = await response.json();

                if (!data.success) {
                    throw new Error(data.message || 'Error al cargar contenido');
                }

                grid.innerHTML = '';

                // Fragmento para construir el DOM
                const fragment = document.createDocumentFragment();

                // 1. Añadir chat de soporte
                if (data.support_room) {
                    const supportHTML = `
                        <a href="index.php?accion=userAdminChat" class="chat-card chat-card--support">
                            <div class="chat-card__header">
                                <div class="chat-card__icon"><i class="fas fa-headset"></i></div>
                                <div>
                                    <h2 class="chat-card__title">Soporte MOVEos</h2>
                                    <span class="chat-card__type">Chat con administración</span>
                                </div>
                            </div>
                            <div class="chat-card__body">
                                <p class="chat-card__preview">"${escapeHtml(data.support_room.last_message)}"</p>
                                ${data.support_room.updated_at ? `<span class="chat-card__time"><i class="far fa-clock"></i> ${formatTime(data.support_room.updated_at)}</span>` : ''}
                            </div>
                        </a>
                    `;
                    const template = document.createElement('template');
                    template.innerHTML = supportHTML.trim();
                    fragment.appendChild(template.content.firstChild);
                }

                // 2. Añadir chats de actividades
                if (data.activities && data.activities.length > 0) {
                    data.activities.forEach(act => {
                        const fallbackImg = 'assets/img/default-activity.jpg';
                        const imageHtml = act.image_url 
                            ? `<img src="${act.image_url}" class="chat-card__img" alt="${escapeHtml(act.title)}" onerror="this.src='${fallbackImg}'">`
                            : `<div class="chat-card__icon"><i class="fas fa-users"></i></div>`;

                        const actHTML = `
                            <a href="index.php?accion=chatActivity&activity_id=${act.room_id}" class="chat-card">
                                <div class="chat-card__header">
                                    ${imageHtml}
                                    <div style="min-width: 0;">
                                        <h2 class="chat-card__title" title="${escapeHtml(act.title)}">${escapeHtml(act.title)}</h2>
                                        <span class="chat-card__type">Grupo de Actividad</span>
                                    </div>
                                </div>
                                <div class="chat-card__body">
                                    <p class="chat-card__preview">"${escapeHtml(act.last_message)}"</p>
                                    ${act.updated_at ? `<span class="chat-card__time"><i class="far fa-clock"></i> ${formatTime(act.updated_at)}</span>` : ''}
                                </div>
                            </a>
                        `;
                        const template = document.createElement('template');
                        template.innerHTML = actHTML.trim();
                        fragment.appendChild(template.content.firstChild);
                    });
                }

                grid.appendChild(fragment);

            } catch (error) {
                console.error(error);
                grid.innerHTML = `
                    <div style="text-align: center; color: var(--brand-primary); padding: 2rem; grid-column: 1/-1;">
                        <i class="fas fa-exclamation-circle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                        <p>No se pudieron cargar las conversaciones.</p>
                    </div>
                `;
            }
        });

        // Utilidades JS en la vista (simples)
        function escapeHtml(str) {
            if (!str) return '';
            return String(str).replace(/[&<>"']/g, function(match) {
                const escape = {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#039;'
                };
                return escape[match];
            });
        }

        function formatTime(dateStr) {
            const date = new Date(dateStr.replace(' ', 'T'));
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString();
        }

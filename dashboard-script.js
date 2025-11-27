const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('current-date').textContent = new Date().toLocaleDateString('es-ES', options);

        // --- LÓGICA DE DATOS ---
        // Importante: Usamos la misma clave 'adminPro_users' que el otro archivo para compartir datos
        const defaultUsers = [
            { id: 1, name: "Carlos Ruiz", role: "Administrador", sede: "San Isidro", status: "Active" },
            { id: 2, name: "Ana Gómez", role: "Analitica", sede: "Lima Sur", status: "Active" },
            { id: 3, name: "Luis Torres", role: "Call Center", sede: "Colombia", status: "Inactive" },
            { id: 4, name: "Maria Lopez", role: "Supervisor", sede: "San Isidro", status: "Active" },
            { id: 5, name: "Roberto Diaz", role: "Call Center", sede: "Lima Sur", status: "Active" }
        ];

        // Cargar datos del LocalStorage (compartido)
        let users;
        try {
            const stored = localStorage.getItem('adminPro_users');
            users = stored ? JSON.parse(stored) : defaultUsers;
        } catch (e) {
            console.error('Error cargando datos del dashboard:', e);
            users = defaultUsers;
        }

        // --- CÁLCULO DE ESTADÍSTICAS ---
        function loadDashboard() {
            const total = users.length;
            const active = users.filter(u => u.status === 'Active').length;
            const inactive = total - active;
            
            // 1. KPIs Principales
            animateValue("stat-total", 0, total, 1000);
            animateValue("stat-active", 0, active, 1000);
            animateValue("stat-inactive", 0, inactive, 1000);

            // Barra de progreso Activos
            const percentActive = total > 0 ? (active / total) * 100 : 0;
            setTimeout(() => {
                document.getElementById('bar-active').style.width = `${percentActive}%`;
            }, 200);

            // 2. Sede Principal (Moda)
            if (total > 0) {
                const sedes = users.map(u => u.sede);
                const modeSede = sedes.sort((a,b) =>
                    sedes.filter(v => v===a).length - sedes.filter(v => v===b).length
                ).pop();
                document.getElementById('stat-top-sede').textContent = modeSede;
            } else {
                document.getElementById('stat-top-sede').innerText = "Sin datos";
            }

            // 3. Generar Gráficos de Roles (Barras)
            const rolesCount = {};
            users.forEach(u => { rolesCount[u.role] = (rolesCount[u.role] || 0) + 1; });
            
            // Ordenar roles por cantidad
            const sortedRoles = Object.keys(rolesCount).sort((a, b) => rolesCount[b] - rolesCount[a]);

            const rolesContainer = document.getElementById('roles-list');
            rolesContainer.innerHTML = ''; // Limpiar placeholders

            sortedRoles.forEach((role, index) => {
                const count = rolesCount[role];
                const percent = (count / total) * 100;
                
                // Colores dinámicos para las barras
                const colors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-pink-500'];
                const barColor = colors[index % colors.length];

                const item = document.createElement('div');
                item.innerHTML = `
                    <div>
                        <div class="flex justify-between text-sm mb-2">
                            <span class="text-slate-300 font-medium text-content"></span>
                            <span class="text-slate-400"><span class="count-content"></span> usuarios (<span class="percent-content"></span>%)</span>
                        </div>
                        <div class="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
                            <div class="${barColor} h-2.5 rounded-full transition-all duration-1000 ease-out" style="width: 0%" id="role-bar-${index}"></div>
                        </div>
                    </div>
                `;
                // Usar textContent para texto puro y evitar XSS
                item.querySelector('.text-content').textContent = role;
                item.querySelector('.count-content').textContent = count;
                item.querySelector('.percent-content').textContent = Math.round(percent);
                rolesContainer.appendChild(item);

                // Animación de la barra
                setTimeout(() => {
                    document.getElementById(`role-bar-${index}`).style.width = `${percent}%`;
                }, 100 + (index * 100));
            });

            // 4. Generar Lista de Sedes (Reemplazo de Actividad)
            const sedesCount = {};
            users.forEach(u => { sedesCount[u.sede] = (sedesCount[u.sede] || 0) + 1; });
            const sortedSedes = Object.keys(sedesCount).sort((a, b) => sedesCount[b] - sedesCount[a]);
            
            const sedesContainer = document.getElementById('sedes-list');
            sedesContainer.innerHTML = '';

            if (sortedSedes.length === 0) {
                sedesContainer.innerHTML = '<div class="text-center text-slate-500 text-sm">No hay datos de sedes</div>';
            } else {
                sortedSedes.forEach((sede) => {
                    const count = sedesCount[sede];
                    const percent = (count / total) * 100;
                    
                    const item = document.createElement('div');
                    item.className = "flex items-center justify-between p-3 rounded-lg bg-slate-700/30 border border-slate-700/50 hover:border-purple-500/30 transition-colors group";
                    
                    item.innerHTML = `
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:text-purple-300 group-hover:bg-purple-500/20 transition-all">
                                <i data-lucide="map-pin" class="w-4 h-4"></i>
                            </div>
                            <div>
                                <h4 class="text-sm font-medium text-slate-200 sede-name"></h4>
                                <div class="text-xs text-slate-500 font-medium"><span class="percent-val"></span>% del total</div>
                            </div>
                        </div>
                        <div class="text-right">
                            <span class="text-lg font-bold text-white count-val"></span>
                            <span class="text-xs text-slate-500 block">usuarios</span>
                        </div>
                    `;
                    // Usar textContent para valores dinámicos
                    item.querySelector('.sede-name').textContent = sede;
                    item.querySelector('.percent-val').textContent = Math.round(percent);
                    item.querySelector('.count-val').textContent = count;
                    sedesContainer.appendChild(item);
                });
            }
        }

        // Función para animar números (contador)
        function animateValue(id, start, end, duration) {
            if (start === end) return;
            const range = end - start;
            let current = start;
            const increment = end > start ? 1 : -1;
            const stepTime = Math.abs(Math.floor(duration / range));
            const obj = document.getElementById(id);
            const timer = setInterval(function() {
                current += increment;
                obj.textContent = current;
                if (current === end) {
                    clearInterval(timer);
                }
            }, Math.max(stepTime, 50));
        }

        // Inicializar iconos y dashboard
        document.addEventListener('DOMContentLoaded', () => {
            lucide.createIcons();
            loadDashboard();
        });
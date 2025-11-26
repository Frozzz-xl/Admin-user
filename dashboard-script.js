const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('current-date').innerText = new Date().toLocaleDateString('es-ES', options);

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
        let users = JSON.parse(localStorage.getItem('adminPro_users')) || defaultUsers;

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
                document.getElementById('stat-top-sede').innerText = modeSede;
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
                            <span class="text-slate-300 font-medium">${role}</span>
                            <span class="text-slate-400">${count} usuarios (${Math.round(percent)}%)</span>
                        </div>
                        <div class="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
                            <div class="${barColor} h-2.5 rounded-full transition-all duration-1000 ease-out" style="width: 0%" id="role-bar-${index}"></div>
                        </div>
                    </div>
                `;
                rolesContainer.appendChild(item);

                // Animación de la barra
                setTimeout(() => {
                    document.getElementById(`role-bar-${index}`).style.width = `${percent}%`;
                }, 100 + (index * 100));
            });
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
                obj.innerHTML = current;
                if (current == end) {
                    clearInterval(timer);
                }
            }, Math.max(stepTime, 50)); // Mínimo 50ms para que se vea la animación
        }

        // Inicializar iconos y dashboard
        document.addEventListener('DOMContentLoaded', () => {
            lucide.createIcons();
            loadDashboard();
        });
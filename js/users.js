        // --- CONFIGURACIÓN Y CONSTANTES ---
        const ROLE_COLORS = {
            'Administrador': 'text-red-300 bg-red-900/30 border-red-900/50',
            'Gerencia': 'text-purple-300 bg-purple-900/30 border-purple-900/50',
            'Analitica': 'text-teal-300 bg-teal-900/30 border-teal-900/50',
            'Supervisor': 'text-blue-300 bg-blue-900/30 border-blue-900/50',
            'Call Center': 'text-amber-300 bg-amber-900/30 border-amber-900/50'
        };

        const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const MIN_PASSWORD_LENGTH = 6;

        // --- DATA POR DEFECTO ---
        const defaultUsers = [
            { id: 1, name: "Carlos Ruiz", username: "cruiz", password: "password123", email: "carlos@tech.com", role: "Administrador", sede: "San Isidro", status: "Active", date: "2023-10-15" },
            { id: 2, name: "Ana Gómez", username: "agomez", password: "password123", email: "ana@design.com", role: "Analitica", sede: "Lima Sur", status: "Active", date: "2023-11-02" },
            { id: 3, name: "Luis Torres", username: "ltorres", password: "password123", email: "luis@viewer.com", role: "Call Center", sede: "Colombia", status: "Inactive", date: "2023-09-20" },
            { id: 4, name: "Maria Lopez", username: "mlopez", password: "password123", email: "maria@mkting.com", role: "Supervisor", sede: "San Isidro", status: "Active", date: "2023-12-10" },
            { id: 5, name: "Roberto Diaz", username: "rdiaz", password: "password123", email: "robert@dev.com", role: "Call Center", sede: "Lima Sur", status: "Active", date: "2024-01-05" }
        ];

        // --- ESTADO GLOBAL CENTRALIZADO ---
        const appState = {
            currentPage: 1,
            itemsPerPage: 7,
            sortConfig: { key: null, dir: 1 },
            userIdToDelete: null,
            users: [],
            dom: {
                tableBody: document.getElementById('userTableBody'),
                userModal: document.getElementById('userModal'),
                deleteModal: document.getElementById('deleteModal'),
                modalTitle: document.getElementById('modalTitle'),
                userForm: document.getElementById('userForm'),
                searchInput: document.getElementById('searchInput'),
                roleFilter: document.getElementById('roleFilter'),
                statusFilter: document.getElementById('statusFilter'),
                emptyState: document.getElementById('emptyState'),
                toastContainer: document.getElementById('toast-container'),
                userPasswordInput: document.getElementById('userPassword'),
                passwordIcon: document.getElementById('passwordIcon'),
                totalRecordsEl: document.getElementById('totalRecords'),
                pageIndicatorEl: document.getElementById('pageIndicator'),
                totalPagesEl: document.getElementById('totalPages'),
                btnPrev: document.getElementById('btnPrev'),
                btnNext: document.getElementById('btnNext')
            }
        };

        // --- SISTEMA DE PERSISTENCIA (LOCALSTORAGE) ---
        function loadUsers() {
            try {
                const stored = localStorage.getItem('adminPro_users');
                appState.users = stored ? JSON.parse(stored) : [...defaultUsers];
            } catch (e) {
                console.error('Error cargando usuarios de localStorage:', e);
                appState.users = [...defaultUsers];
                showToast('Error al cargar datos. Se usarán datos por defecto.', 'error');
            }
        }

        function saveToLocalStorage() {
            try {
                localStorage.setItem('adminPro_users', JSON.stringify(appState.users));
            } catch (e) {
                console.error('Error guardando usuarios en localStorage:', e);
                showToast('Error al guardar datos.', 'error');
            }
        }

        function resetData() {
            if(window.confirm('¿Restaurar datos de ejemplo? Esto borrará tus cambios actuales.')){
                appState.users = [...defaultUsers];
                appState.currentPage = 1;
                appState.sortConfig = { key: null, dir: 1 };
                saveToLocalStorage();
                renderTable();
                showToast('Datos restaurados de fábrica', 'neutral');
            }
        }

        // --- FUNCIÓN PARA INICIALIZAR SELECTS DINÁMICOS ---
        function initializeRoleSelect() {
            const roleSelect = document.getElementById('userRole');
            if (!roleSelect) return;
            
            roleSelect.innerHTML = '';
            Object.keys(ROLE_COLORS).forEach(role => {
                const option = document.createElement('option');
                option.value = role;
                option.textContent = role;
                roleSelect.appendChild(option);
            });
        }

        // --- CARGAR SEDES DINÁMICAS EN EL SELECT ---
        function initializeSedeSelect() {
            const sedeSelect = document.getElementById('userSede');
            if (!sedeSelect) return;
            
            let sedes = [];
            try {
                const stored = localStorage.getItem('adminPro_sedes');
                if (stored) {
                    sedes = JSON.parse(stored);
                } else {
                    // Fallback to defaults if not yet initialized in localStorage
                    sedes = [
                        { name: "San Isidro" },
                        { name: "Lima Sur" },
                        { name: "Colombia" }
                    ];
                }
            } catch(e) {
                console.error("Error loading sedes", e);
            }

            sedeSelect.innerHTML = '';
            sedes.forEach(sede => {
                const option = document.createElement('option');
                option.value = sede.name;
                option.textContent = sede.name;
                sedeSelect.appendChild(option);
            });
        }

        // --- INICIALIZACIÓN ---
        document.addEventListener('DOMContentLoaded', () => {
            loadUsers();
            initializeRoleSelect();
            initializeSedeSelect();
            renderTable();
            lucide.createIcons();
        });

        // --- FUNCIONES AUXILIARES DE VALIDACIÓN ---
        function isValidEmail(email) {
            return EMAIL_REGEX.test(email.trim());
        }

        function isValidPassword(password) {
            return password && password.length >= MIN_PASSWORD_LENGTH;
        }

        // --- GENERADOR DE CONTRASEÑAS ---
        function generateRandomPassword() {
            const length = 12;
            const lower = "abcdefghijklmnopqrstuvwxyz";
            const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            const numbers = "0123456789";
            const special = "!@#$%^&*()_+~`|}{[]:;?><,./-=";
            
            let password = "";
            password += lower.charAt(Math.floor(Math.random() * lower.length));
            password += upper.charAt(Math.floor(Math.random() * upper.length));
            password += numbers.charAt(Math.floor(Math.random() * numbers.length));
            password += special.charAt(Math.floor(Math.random() * special.length));
            
            const all = lower + upper + numbers + special;
            for (let i = 4; i < length; i++) {
                password += all.charAt(Math.floor(Math.random() * all.length));
            }
            
            return password.split('').sort(() => 0.5 - Math.random()).join('');
        }

        // Make it available globally so the HTML button can call it
        window.setGeneratedPassword = function() {
            const password = generateRandomPassword();
            appState.dom.userPasswordInput.value = password;
            // Mostramos la contraseña para que el usuario pueda verla
            appState.dom.userPasswordInput.type = 'text';
            appState.dom.passwordIcon.setAttribute('data-lucide', 'eye-off');
            lucide.createIcons();
            showToast('Contraseña generada', 'neutral');
        }

        function isValidUsername(username) {
            return username && username.trim().length >= 3;
        }

        function findUserByEmail(email, excludeId = null) {
            return appState.users.find(u => 
                u.email.toLowerCase() === email.toLowerCase() && 
                (excludeId === null || u.id !== excludeId)
            );
        }

        function findUserByUsername(username, excludeId = null) {
            return appState.users.find(u => 
                u.username.toLowerCase() === username.toLowerCase() && 
                (excludeId === null || u.id !== excludeId)
            );
        }

        // --- FUNCIONES DE PROCESAMIENTO DE DATOS ---
        function applyFiltersAndSort() {
            const searchTerm = appState.dom.searchInput.value.toLowerCase();
            const roleValue = appState.dom.roleFilter.value;
            const statusValue = appState.dom.statusFilter.value;

            let filtered = appState.users.filter(user => {
                const matchesSearch = user.name.toLowerCase().includes(searchTerm) || 
                                    user.email.toLowerCase().includes(searchTerm) ||
                                    user.username.toLowerCase().includes(searchTerm);
                                    
                const matchesRole = roleValue === 'all' || user.role === roleValue;
                const matchesStatus = statusValue === 'all' || user.status === statusValue;
                return matchesSearch && matchesRole && matchesStatus;
            });

            // Aplicar ordenamiento
            if (appState.sortConfig.key) {
                filtered.sort((a, b) => {
                    let va = a[appState.sortConfig.key];
                    let vb = b[appState.sortConfig.key];

                    if (appState.sortConfig.key === 'date') {
                        const da = new Date(va || 0).getTime();
                        const db = new Date(vb || 0).getTime();
                        return appState.sortConfig.dir * (da - db);
                    }

                    va = (va || '').toString().toLowerCase();
                    vb = (vb || '').toString().toLowerCase();

                    if (va < vb) return -1 * appState.sortConfig.dir;
                    if (va > vb) return 1 * appState.sortConfig.dir;
                    return 0;
                });
            }

            return filtered;
        }

        function calculatePagination(filteredUsers) {
            const totalRecords = filteredUsers.length;
            const totalPages = Math.ceil(totalRecords / appState.itemsPerPage) || 1;
            
            if (appState.currentPage > totalPages) appState.currentPage = totalPages;
            if (appState.currentPage < 1) appState.currentPage = 1;

            const startIndex = (appState.currentPage - 1) * appState.itemsPerPage;
            const endIndex = startIndex + appState.itemsPerPage;
            const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

            return { totalRecords, totalPages, paginatedUsers };
        }

        function updatePaginationUI(totalRecords, totalPages) {
            appState.dom.totalRecordsEl.textContent = totalRecords;
            appState.dom.pageIndicatorEl.textContent = appState.currentPage;
            appState.dom.totalPagesEl.textContent = totalPages;

            appState.dom.btnPrev.disabled = appState.currentPage === 1;
            appState.dom.btnNext.disabled = appState.currentPage === totalPages;
        }

        function updateSortIcons() {
            const headers = document.querySelectorAll('th.sortable');
            headers.forEach(h => {
                const onclick = h.getAttribute('onclick') || '';
                const m = onclick.match(/sortTable\('\s*([^']+)\s*'\)/);
                const icon = h.querySelector('.sort-icon');
                if (icon) {
                    if (m && m[1] && appState.sortConfig.key === m[1]) {
                        icon.setAttribute('data-lucide', appState.sortConfig.dir === 1 ? 'chevron-up' : 'chevron-down');
                    } else {
                        icon.setAttribute('data-lucide', 'arrow-up-down');
                    }
                }
            });
            lucide.createIcons();
        }

        function renderRows(paginatedUsers) {
            appState.dom.tableBody.innerHTML = '';
            
            if (paginatedUsers.length === 0) {
                appState.dom.emptyState.classList.remove('hidden');
                return;
            }

            appState.dom.emptyState.classList.add('hidden');

            paginatedUsers.forEach(user => {
                const row = document.createElement('tr');
                row.className = 'hover:bg-slate-700/30 transition-colors group border-b border-slate-700/50 last:border-b-0';
                
                const statusClass = user.status === 'Active' 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-slate-700/50 text-slate-400 border border-slate-600';
                
                const roleColor = ROLE_COLORS[user.role] || 'text-slate-300 bg-slate-700/50 border-slate-600';

                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="flex-shrink-0 h-10 w-10">
                                <img class="h-10 w-10 rounded-full object-cover ring-2 ring-slate-700 shadow-sm" 
                                    src="https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&bold=true" 
                                    alt="${user.name}">
                            </div>
                            <div class="ml-4">
                                <div class="text-sm font-semibold text-slate-200">${escapeHTML(user.name)}</div>
                                <div class="text-xs text-slate-500">${escapeHTML(user.email)}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-300 font-mono bg-slate-900/30 rounded-lg m-1">
                        ${escapeHTML(user.username)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium border ${roleColor}">
                            ${escapeHTML(user.role)}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        <div class="flex items-center gap-1.5">
                            <i data-lucide="map-pin" class="w-3.5 h-3.5 text-slate-500"></i>
                            ${escapeHTML(user.sede)}
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass}">
                            <span class="w-1.5 h-1.5 mr-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-400' : 'bg-slate-500'}"></span>
                            ${user.status === 'Active' ? 'Activo' : 'Inactivo'}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        ${escapeHTML(user.date)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onclick="editUser(${user.id})" class="text-blue-400 hover:text-blue-300 mr-2 p-1.5 rounded-full hover:bg-blue-900/30 transition-colors" title="Editar">
                            <i data-lucide="pencil" class="w-4 h-4"></i>
                        </button>
                        <button onclick="deleteUser(${user.id})" class="text-red-400 hover:text-red-300 p-1.5 rounded-full hover:bg-red-900/30 transition-colors" title="Eliminar">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </td>
                `;
                appState.dom.tableBody.appendChild(row);
            });
            
            lucide.createIcons();
        }

        // --- FUNCIÓN PRINCIPAL DE RENDERIZADO ---
        function renderTable() {
            const filteredUsers = applyFiltersAndSort();
            const { totalRecords, totalPages, paginatedUsers } = calculatePagination(filteredUsers);
            
            updatePaginationUI(totalRecords, totalPages);
            updateSortIcons();
            renderRows(paginatedUsers);
        }

        // --- FUNCIÓN DE CAMBIO DE PÁGINA ---
        function changePage(direction) {
            appState.currentPage += direction;
            renderTable();
        }

        // --- FUNCIÓN DE ORDENAMIENTO ---
        function sortTable(column) {
            if (!column) return;
            if (appState.sortConfig.key === column) {
                appState.sortConfig.dir = appState.sortConfig.dir * -1;
            } else {
                appState.sortConfig.key = column;
                appState.sortConfig.dir = 1;
            }
            appState.currentPage = 1;
            renderTable();
        }

        // --- GESTIÓN DE MODAL USUARIO ---
        function openModal(isEdit = false) {
            appState.dom.userModal.classList.remove('hidden');
            setTimeout(() => appState.dom.userModal.classList.add('active'), 10);
            
            appState.dom.userPasswordInput.type = 'password';
            appState.dom.passwordIcon.setAttribute('data-lucide', 'eye');
            lucide.createIcons();

            if (!isEdit) {
                appState.dom.modalTitle.textContent = "Nuevo Usuario";
                appState.dom.userForm.reset();
                document.getElementById('userId').value = '';
                document.getElementById('userRole').value = 'Gerencia'; 
                document.getElementById('userSede').value = 'San Isidro';
                // Reset password input type to password
                appState.dom.userPasswordInput.type = 'password';
                appState.dom.passwordIcon.setAttribute('data-lucide', 'eye');
                lucide.createIcons();
            }
        }

        function closeModal() {
            appState.dom.userModal.classList.remove('active');
            setTimeout(() => {
                appState.dom.userModal.classList.add('hidden');
            }, 300);
        }

        function togglePasswordVisibility() {
            if (appState.dom.userPasswordInput.type === 'password') {
                appState.dom.userPasswordInput.type = 'text';
                appState.dom.passwordIcon.setAttribute('data-lucide', 'eye-off');
            } else {
                appState.dom.userPasswordInput.type = 'password';
                appState.dom.passwordIcon.setAttribute('data-lucide', 'eye');
            }
            lucide.createIcons();
        }

        // --- GESTIÓN DE MODAL ELIMINAR ---
        function deleteUser(id) {
            const user = appState.users.find(u => u.id === id);
            if (user) {
                appState.userIdToDelete = id;
                // Mostrar nombre del usuario en el modal
                const confirmText = document.getElementById('confirmText');
                if (confirmText) {
                    confirmText.innerHTML = `Esta acción es irreversible. ¿Estás seguro de que deseas eliminar a <strong>${escapeHTML(user.name)}</strong> permanentemente?`;
                }
                appState.dom.deleteModal.classList.remove('hidden');
                setTimeout(() => appState.dom.deleteModal.classList.add('active'), 10);
            }
        }

        function closeDeleteModal() {
            appState.dom.deleteModal.classList.remove('active');
            setTimeout(() => {
                appState.dom.deleteModal.classList.add('hidden');
                appState.userIdToDelete = null;
            }, 300);
        }

        function confirmDelete() {
            if (appState.userIdToDelete) {
                appState.users = appState.users.filter(u => u.id !== appState.userIdToDelete);
                saveToLocalStorage();
                appState.currentPage = 1;
                renderTable();
                showToast('Usuario eliminado correctamente', 'neutral');
            }
            closeDeleteModal();
        }

        // --- LÓGICA CRUD ---
        function saveUser() {
            const id = document.getElementById('userId').value;
            const name = document.getElementById('userName').value.trim();
            const username = document.getElementById('userUsername').value.trim();
            const password = document.getElementById('userPassword').value.trim();
            const email = document.getElementById('userEmail').value.trim();
            const role = document.getElementById('userRole').value;
            const sede = document.getElementById('userSede').value;
            const status = document.querySelector('input[name="userStatus"]:checked').value;

            // Validaciones
            if(!name || !email || !username) {
                showToast('Por favor completa todos los campos requeridos', 'error');
                return;
            }

            if (!isValidUsername(username)) {
                showToast('El usuario debe tener al menos 3 caracteres', 'error');
                return;
            }

            if (!isValidEmail(email)) {
                showToast('El email no tiene un formato válido', 'error');
                return;
            }

            if (id) {
                // Edición: validar solo duplicados si cambió
                const existing = appState.users.find(u => u.id === parseInt(id, 10));
                
                if (username !== existing.username && findUserByUsername(username)) {
                    showToast('Este usuario ya está registrado', 'error');
                    return;
                }
                
                if (email !== existing.email && findUserByEmail(email)) {
                    showToast('Este email ya está registrado', 'error');
                    return;
                }

                if (password && !isValidPassword(password)) {
                    showToast(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`, 'error');
                    return;
                }

                const index = appState.users.findIndex(u => u.id === parseInt(id, 10));
                if (index !== -1) {
                    appState.users[index] = { 
                        ...appState.users[index], 
                        name, username, email, role, sede, status,
                        password: password || appState.users[index].password
                    };
                    showToast('Usuario actualizado correctamente', 'success');
                }
            } else {
                // Crear nuevo: validar duplicados
                if (findUserByUsername(username)) {
                    showToast('Este usuario ya está registrado', 'error');
                    return;
                }
                
                if (findUserByEmail(email)) {
                    showToast('Este email ya está registrado', 'error');
                    return;
                }

                if (password && !isValidPassword(password)) {
                    showToast(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`, 'error');
                    return;
                }

                const newUser = {
                    id: Date.now(),
                    name,
                    username,
                    password: password || 'TempPass123',
                    email,
                    role,
                    sede,
                    status,
                    date: new Date().toISOString().split('T')[0]
                };
                appState.users.unshift(newUser);
                showToast('Usuario creado correctamente', 'success');
            }

            saveToLocalStorage();
            closeModal();
            appState.currentPage = 1;
            renderTable();
        }

        function editUser(id) {
            const user = appState.users.find(u => u.id === id);
            if (user) {
                document.getElementById('userId').value = user.id;
                document.getElementById('userName').value = user.name;
                document.getElementById('userUsername').value = user.username;
                document.getElementById('userPassword').value = user.password || ''; 
                document.getElementById('userEmail').value = user.email;
                document.getElementById('userRole').value = user.role;
                document.getElementById('userSede').value = user.sede;
                
                const radios = document.getElementsByName('userStatus');
                for(let radio of radios) {
                    if(radio.value === user.status) radio.checked = true;
                }

                appState.dom.modalTitle.textContent = "Editar Usuario";
                openModal(true);
            }
        }

        // --- UTILIDADES DE SEGURIDAD ---
        function escapeHTML(text) {
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return String(text).replace(/[&<>"']/g, m => map[m]);
        }

        // --- GESTIÓN DE NOTIFICACIONES ---
        function showToast(message, type = 'success') {
            const toast = document.createElement('div');
            let colors = type === 'error' ? 'bg-red-900/90 text-red-100 border border-red-800' : type === 'neutral' ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'bg-emerald-900/90 text-emerald-100 border border-emerald-800';
            let icon = type === 'error' ? 'alert-circle' : type === 'neutral' ? 'trash' : 'check-circle';

            toast.className = `toast flex items-center w-full max-w-xs p-4 space-x-3 shadow-lg shadow-slate-950/50 rounded-lg ${colors} backdrop-blur-md`;
            toast.innerHTML = `
                <i data-lucide="${icon}" class="w-5 h-5"></i>
                <div class="text-sm font-medium">${escapeHTML(message)}</div>
            `;

            appState.dom.toastContainer.appendChild(toast);
            lucide.createIcons();

            requestAnimationFrame(() => {
                toast.classList.add('show');
            });

            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 400);
            }, 3000);
        }

        // --- EVENT LISTENERS ---
        appState.dom.searchInput.addEventListener('input', () => { 
            appState.currentPage = 1; 
            renderTable(); 
        });
        appState.dom.roleFilter.addEventListener('change', () => { 
            appState.currentPage = 1; 
            renderTable(); 
        });
        appState.dom.statusFilter.addEventListener('change', () => { 
            appState.currentPage = 1; 
            renderTable(); 
        });

        appState.dom.userModal.addEventListener('click', (e) => {
            if (e.target === appState.dom.userModal) closeModal();
        });
        appState.dom.deleteModal.addEventListener('click', (e) => {
            if (e.target === appState.dom.deleteModal) closeDeleteModal();
        });

        // --- SINCRONIZACIÓN DE LOCALSTORAGE ENTRE PESTAÑAS ---
        window.addEventListener('storage', (e) => {
            if (e.key === 'adminPro_users' && e.newValue) {
                try {
                    appState.users = JSON.parse(e.newValue);
                    appState.currentPage = 1;
                    renderTable();
                    showToast('Datos actualizados desde otra pestaña', 'neutral');
                } catch (err) {
                    console.error('Error actualizando datos desde storage:', err);
                }
            }
        });

        
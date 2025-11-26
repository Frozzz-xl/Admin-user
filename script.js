const defaultUsers = [
            { id: 1, name: "Carlos Ruiz", username: "cruiz", password: "password123", email: "carlos@tech.com", role: "Administrador", sede: "San Isidro", status: "Active", date: "2023-10-15" },
            { id: 2, name: "Ana Gómez", username: "agomez", password: "password123", email: "ana@design.com", role: "Analitica", sede: "Lima Sur", status: "Active", date: "2023-11-02" },
            { id: 3, name: "Luis Torres", username: "ltorres", password: "password123", email: "luis@viewer.com", role: "Call Center", sede: "Colombia", status: "Inactive", date: "2023-09-20" },
            { id: 4, name: "Maria Lopez", username: "mlopez", password: "password123", email: "maria@mkting.com", role: "Supervisor", sede: "San Isidro", status: "Active", date: "2023-12-10" },
            { id: 5, name: "Roberto Diaz", username: "rdiaz", password: "password123", email: "robert@dev.com", role: "Call Center", sede: "Lima Sur", status: "Active", date: "2024-01-05" }
        ];

        // --- SISTEMA DE PERSISTENCIA (LOCALSTORAGE) ---
        let users = JSON.parse(localStorage.getItem('adminPro_users')) || [...defaultUsers];

        function saveToLocalStorage() {
            localStorage.setItem('adminPro_users', JSON.stringify(users));
        }

        // --- REFERENCIAS DOM ---
        const tableBody = document.getElementById('userTableBody');
        const userModal = document.getElementById('userModal');
        const deleteModal = document.getElementById('deleteModal');
        const modalTitle = document.getElementById('modalTitle');
        const userForm = document.getElementById('userForm');
        const searchInput = document.getElementById('searchInput');
        const roleFilter = document.getElementById('roleFilter');
        const statusFilter = document.getElementById('statusFilter');
        const emptyState = document.getElementById('emptyState');
        const toastContainer = document.getElementById('toast-container');
        const userPasswordInput = document.getElementById('userPassword');
        const passwordIcon = document.getElementById('passwordIcon');
        
        // ELEMENTOS DE PAGINACIÓN
        const totalRecordsEl = document.getElementById('totalRecords');
        const pageIndicatorEl = document.getElementById('pageIndicator');
        const totalPagesEl = document.getElementById('totalPages');
        const btnPrev = document.getElementById('btnPrev');
        const btnNext = document.getElementById('btnNext');

        let userIdToDelete = null;

        // --- ESTADO PAGINACIÓN ---
        let currentPage = 1;
        const itemsPerPage = 7; // Cantidad de usuarios por página

        // --- INICIALIZACIÓN ---
        document.addEventListener('DOMContentLoaded', () => {
            lucide.createIcons();
            renderTable();
        });

        // --- FUNCIÓN DE CAMBIO DE PÁGINA ---
        function changePage(direction) {
            currentPage += direction;
            renderTable();
        }

        // --- FUNCIONES DE RENDERIZADO ---
        function renderTable() {
            tableBody.innerHTML = '';
            
            // 1. Filtrado
            const searchTerm = searchInput.value.toLowerCase();
            const roleValue = roleFilter.value;
            const statusValue = statusFilter.value;

            const filteredUsers = users.filter(user => {
                const matchesSearch = user.name.toLowerCase().includes(searchTerm) || 
                                      user.email.toLowerCase().includes(searchTerm) ||
                                      user.username.toLowerCase().includes(searchTerm);
                                      
                const matchesRole = roleValue === 'all' || user.role === roleValue;
                const matchesStatus = statusValue === 'all' || user.status === statusValue;
                return matchesSearch && matchesRole && matchesStatus;
            });

            // 2. Cálculo de Paginación
            const totalRecords = filteredUsers.length;
            const totalPages = Math.ceil(totalRecords / itemsPerPage) || 1;
            
            // Asegurar que la página actual sea válida
            if (currentPage > totalPages) currentPage = totalPages;
            if (currentPage < 1) currentPage = 1;

            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

            // 3. Actualizar UI de Paginación
            totalRecordsEl.innerText = totalRecords;
            pageIndicatorEl.innerText = currentPage;
            totalPagesEl.innerText = totalPages;

            btnPrev.disabled = currentPage === 1;
            btnNext.disabled = currentPage === totalPages;

            // 4. Renderizar Filas
            if (totalRecords === 0) {
                emptyState.classList.remove('hidden');
            } else {
                emptyState.classList.add('hidden');
                
                paginatedUsers.forEach(user => {
                    const row = document.createElement('tr');
                    row.className = 'hover:bg-gray-50 transition-colors group';
                    
                    const statusClass = user.status === 'Active' 
                        ? 'bg-emerald-100 text-emerald-700 ring-emerald-600/20' 
                        : 'bg-gray-100 text-gray-600 ring-gray-500/10';
                    
                    // Colores por Rol
                    let roleColor = 'text-gray-700 bg-gray-50 ring-gray-700/10';
                    if (user.role === 'Administrador') roleColor = 'text-red-700 bg-red-50 ring-red-700/10';
                    else if (user.role === 'Gerencia') roleColor = 'text-purple-700 bg-purple-50 ring-purple-700/10';
                    else if (user.role === 'Analitica') roleColor = 'text-teal-700 bg-teal-50 ring-teal-700/10';
                    else if (user.role === 'Supervisor') roleColor = 'text-blue-700 bg-blue-50 ring-blue-700/10';
                    else if (user.role === 'Call Center') roleColor = 'text-amber-700 bg-amber-50 ring-amber-700/10';

                    row.innerHTML = `
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                                <div class="flex-shrink-0 h-10 w-10">
                                    <img class="h-10 w-10 rounded-full object-cover ring-2 ring-white" 
                                         src="https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random" 
                                         alt="${user.name}">
                                </div>
                                <div class="ml-4">
                                    <div class="text-sm font-medium text-gray-900">${user.name}</div>
                                    <div class="text-sm text-gray-500">${user.email}</div>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                            ${user.username}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${roleColor}">
                                ${user.role}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            <div class="flex items-center gap-1.5">
                                <i data-lucide="map-pin" class="w-3.5 h-3.5 text-gray-400"></i>
                                ${user.sede}
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusClass}">
                                <span class="w-1.5 h-1.5 mr-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-600' : 'bg-gray-500'}"></span>
                                ${user.status === 'Active' ? 'Activo' : 'Inactivo'}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${user.date}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button onclick="editUser(${user.id})" class="text-indigo-600 hover:text-indigo-900 mr-3 p-1 rounded hover:bg-indigo-50 transition-colors" title="Editar">
                                <i data-lucide="pencil" class="w-4 h-4"></i>
                            </button>
                            <button onclick="deleteUser(${user.id})" class="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors" title="Eliminar">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });
                lucide.createIcons();
            }
        }

        // --- GESTIÓN DE MODAL USUARIO ---
        function openModal(isEdit = false) {
            userModal.classList.remove('hidden');
            setTimeout(() => userModal.classList.add('active'), 10);
            
            userPasswordInput.type = 'password';
            passwordIcon.setAttribute('data-lucide', 'eye');
            lucide.createIcons();

            if (!isEdit) {
                modalTitle.innerText = "Nuevo Usuario";
                userForm.reset();
                document.getElementById('userId').value = '';
                document.getElementById('userRole').value = 'Gerencia'; 
                document.getElementById('userSede').value = 'San Isidro';
            }
        }

        function closeModal() {
            userModal.classList.remove('active');
            setTimeout(() => {
                userModal.classList.add('hidden');
            }, 300);
        }

        function togglePasswordVisibility() {
            if (userPasswordInput.type === 'password') {
                userPasswordInput.type = 'text';
                passwordIcon.setAttribute('data-lucide', 'eye-off');
            } else {
                userPasswordInput.type = 'password';
                passwordIcon.setAttribute('data-lucide', 'eye');
            }
            lucide.createIcons();
        }

        // --- GESTIÓN DE MODAL ELIMINAR ---
        function deleteUser(id) {
            userIdToDelete = id;
            deleteModal.classList.remove('hidden');
            setTimeout(() => deleteModal.classList.add('active'), 10);
        }

        function closeDeleteModal() {
            deleteModal.classList.remove('active');
            setTimeout(() => {
                deleteModal.classList.add('hidden');
                userIdToDelete = null;
            }, 300);
        }

        function confirmDelete() {
            if (userIdToDelete) {
                users = users.filter(u => u.id !== userIdToDelete);
                saveToLocalStorage();
                renderTable();
                showToast('Usuario eliminado correctamente', 'neutral');
            }
            closeDeleteModal();
        }

        // --- LÓGICA CRUD ---
        function saveUser() {
            const id = document.getElementById('userId').value;
            const name = document.getElementById('userName').value;
            const username = document.getElementById('userUsername').value;
            const password = document.getElementById('userPassword').value;
            const email = document.getElementById('userEmail').value;
            const role = document.getElementById('userRole').value;
            const sede = document.getElementById('userSede').value;
            const status = document.querySelector('input[name="userStatus"]:checked').value;

            if(!name || !email || !username) {
                showToast('Por favor completa todos los campos requeridos', 'error');
                return;
            }
            
            if (id) {
                const index = users.findIndex(u => u.id == id);
                if (index !== -1) {
                    users[index] = { 
                        ...users[index], 
                        name, username, email, role, sede, status,
                        password: password || users[index].password
                    };
                    showToast('Usuario actualizado correctamente', 'success');
                }
            } else {
                const newUser = {
                    id: Date.now(),
                    name,
                    username,
                    password: password || '123456',
                    email,
                    role,
                    sede,
                    status,
                    date: new Date().toISOString().split('T')[0]
                };
                users.unshift(newUser);
                showToast('Usuario creado correctamente', 'success');
            }

            saveToLocalStorage();
            closeModal();
            renderTable();
        }

        function editUser(id) {
            const user = users.find(u => u.id === id);
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

                modalTitle.innerText = "Editar Usuario";
                openModal(true);
            }
        }

        function showToast(message, type = 'success') {
            const toast = document.createElement('div');
            let colors = type === 'error' ? 'bg-red-500' : type === 'neutral' ? 'bg-gray-800' : 'bg-emerald-500';
            let icon = type === 'error' ? 'alert-circle' : type === 'neutral' ? 'trash' : 'check-circle';

            toast.className = `toast flex items-center w-full max-w-xs p-4 space-x-3 text-white ${colors} rounded-lg shadow-lg`;
            toast.innerHTML = `
                <i data-lucide="${icon}" class="w-5 h-5"></i>
                <div class="text-sm font-medium">${message}</div>
            `;

            toastContainer.appendChild(toast);
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
        searchInput.addEventListener('input', () => { currentPage = 1; renderTable(); });
        roleFilter.addEventListener('change', () => { currentPage = 1; renderTable(); });
        statusFilter.addEventListener('change', () => { currentPage = 1; renderTable(); });

        userModal.addEventListener('click', (e) => {
            if (e.target === userModal) closeModal();
        });
        deleteModal.addEventListener('click', (e) => {
            if (e.target === deleteModal) closeDeleteModal();
        });
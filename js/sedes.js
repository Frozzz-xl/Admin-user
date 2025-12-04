        // --- CONFIGURACIÓN Y CONSTANTES ---
        const ITEMS_PER_PAGE = 7;

        // --- DATA POR DEFECTO ---
        const defaultSedes = [
            { id: 1, name: "San Isidro", address: "Av. Rivera Navarrete 123", date: "2023-01-10" },
            { id: 2, name: "Lima Sur", address: "Av. Los Heroes 456", date: "2023-02-15" },
            { id: 3, name: "Colombia", address: "Calle 100 #15-20, Bogotá", date: "2023-03-20" }
        ];

        // --- ESTADO GLOBAL CENTRALIZADO ---
        let appState = {
            currentPage: 1,
            itemsPerPage: ITEMS_PER_PAGE,
            sortConfig: { key: null, dir: 1 },
            itemToDeleteId: null,
            sedes: [],
            dom: {}
        };

        // --- LOCALSTORAGE ---
        function loadSedes() {
            try {
                const stored = localStorage.getItem('adminPro_sedes');
                appState.sedes = stored ? JSON.parse(stored) : [...defaultSedes];
            } catch (e) {
                console.error('Error cargando sedes:', e);
                appState.sedes = [...defaultSedes];
            }
        }

        function saveToLocalStorage() {
            localStorage.setItem('adminPro_sedes', JSON.stringify(appState.sedes));
        }

        // --- INICIALIZACIÓN ---
        document.addEventListener('DOMContentLoaded', () => {
            // Initialize DOM references
            appState.dom = {
                tableBody: document.getElementById('sedeTableBody'),
                sedeModal: document.getElementById('sedeModal'),
                deleteModal: document.getElementById('deleteModal'),
                modalTitle: document.getElementById('modalTitle'),
                sedeForm: document.getElementById('sedeForm'),
                searchInput: document.getElementById('searchInput'),
                emptyState: document.getElementById('emptyState'),
                toastContainer: document.getElementById('toast-container'),
                totalRecordsEl: document.getElementById('totalRecords'),
                pageIndicatorEl: document.getElementById('pageIndicator'),
                totalPagesEl: document.getElementById('totalPages'),
                btnPrev: document.getElementById('btnPrev'),
                btnNext: document.getElementById('btnNext')
            };

            // Setup Search Listener
            if (appState.dom.searchInput) {
                appState.dom.searchInput.addEventListener('input', () => { appState.currentPage = 1; renderTable(); });
            }

            loadSedes();
            renderTable();
            lucide.createIcons();
            
            // Mobile Menu
            const mobileMenuBtn = document.getElementById('mobileMenuBtn');
            const sidebar = document.getElementById('sidebar');
            if (mobileMenuBtn && sidebar) {
                mobileMenuBtn.addEventListener('click', () => {
                    sidebar.classList.toggle('hidden');
                    sidebar.classList.toggle('absolute');
                    sidebar.classList.toggle('h-full');
                });
            }
        });

        // --- RENDERIZADO ---
        function renderTable() {
            const searchTerm = appState.dom.searchInput.value.toLowerCase();
            let filtered = appState.sedes.filter(s => 
                s.name.toLowerCase().includes(searchTerm) || 
                s.address.toLowerCase().includes(searchTerm)
            );

            // Sort
            if (appState.sortConfig.key) {
                filtered.sort((a, b) => {
                    let va = a[appState.sortConfig.key].toLowerCase();
                    let vb = b[appState.sortConfig.key].toLowerCase();
                    if (va < vb) return -1 * appState.sortConfig.dir;
                    if (va > vb) return 1 * appState.sortConfig.dir;
                    return 0;
                });
            }

            // Pagination
            const totalRecords = filtered.length;
            const totalPages = Math.ceil(totalRecords / appState.itemsPerPage) || 1;
            if (appState.currentPage > totalPages) appState.currentPage = totalPages;
            if (appState.currentPage < 1) appState.currentPage = 1;

            const startIndex = (appState.currentPage - 1) * appState.itemsPerPage;
            const paginated = filtered.slice(startIndex, startIndex + appState.itemsPerPage);

            // Update UI
            appState.dom.totalRecordsEl.textContent = totalRecords;
            appState.dom.pageIndicatorEl.textContent = appState.currentPage;
            appState.dom.totalPagesEl.textContent = totalPages;
            appState.dom.btnPrev.disabled = appState.currentPage === 1;
            appState.dom.btnNext.disabled = appState.currentPage === totalPages;

            // Render Rows
            appState.dom.tableBody.innerHTML = '';
            if (paginated.length === 0) {
                appState.dom.emptyState.classList.remove('hidden');
            } else {
                appState.dom.emptyState.classList.add('hidden');
                paginated.forEach(sede => {
                    const row = document.createElement('tr');
                    row.className = 'hover:bg-slate-700/30 transition-colors group border-b border-slate-700/50';
                    row.innerHTML = `
                        <td class="px-6 py-4 text-sm font-semibold text-slate-200">${escapeHTML(sede.name)}</td>
                        <td class="px-6 py-4 text-sm text-slate-400">${escapeHTML(sede.address)}</td>
                        <td class="px-6 py-4 text-sm text-slate-500">${escapeHTML(sede.date)}</td>
                        <td class="px-6 py-4 text-right">
                            <button onclick="editSede(${sede.id})" class="text-blue-400 hover:text-blue-300 mr-2"><i data-lucide="pencil" class="w-4 h-4"></i></button>
                            <button onclick="deleteSede(${sede.id})" class="text-red-400 hover:text-red-300"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                        </td>
                    `;
                    appState.dom.tableBody.appendChild(row);
                });
            }
            lucide.createIcons();
            updateSortIcons();
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

        function sortTable(key) {
            if (appState.sortConfig.key === key) {
                appState.sortConfig.dir *= -1;
            } else {
                appState.sortConfig.key = key;
                appState.sortConfig.dir = 1;
            }
            renderTable();
        }

        function changePage(dir) {
            appState.currentPage += dir;
            renderTable();
        }

        // --- CRUD ---
        function openModal(isEdit = false) {
            appState.dom.sedeModal.classList.remove('hidden');
            setTimeout(() => appState.dom.sedeModal.classList.add('active'), 10);
            
            if (!isEdit) {
                appState.dom.modalTitle.textContent = "Nueva Sede";
                appState.dom.sedeForm.reset();
                document.getElementById('sedeId').value = '';
            }
        }

        function closeModal() {
            appState.dom.sedeModal.classList.remove('active');
            setTimeout(() => {
                appState.dom.sedeModal.classList.add('hidden');
            }, 300);
        }

        function saveSede() {
            const id = document.getElementById('sedeId').value;
            const name = document.getElementById('sedeName').value.trim();
            const address = document.getElementById('sedeAddress').value.trim();

            if (!name) {
                showToast('El nombre es obligatorio', 'error');
                return;
            }

            if (id) {
                // Edit
                const idx = appState.sedes.findIndex(s => s.id == id);
                if (idx !== -1) {
                    appState.sedes[idx].name = name;
                    appState.sedes[idx].address = address;
                    showToast('Sede actualizada', 'success');
                }
            } else {
                // Create
                const newSede = {
                    id: Date.now(),
                    name,
                    address,
                    date: new Date().toISOString().split('T')[0]
                };
                appState.sedes.unshift(newSede);
                showToast('Sede creada', 'success');
            }
            saveToLocalStorage();
            closeModal();
            renderTable();
        }

        function editSede(id) {
            const sede = appState.sedes.find(s => s.id === id);
            if (sede) {
                document.getElementById('sedeId').value = sede.id;
                document.getElementById('sedeName').value = sede.name;
                document.getElementById('sedeAddress').value = sede.address;
                appState.dom.modalTitle.textContent = "Editar Sede";
                openModal(true);
            }
        }

        function deleteSede(id) {
            appState.itemToDeleteId = id;
            appState.dom.deleteModal.classList.remove('hidden');
        }

        function closeDeleteModal() {
            appState.dom.deleteModal.classList.add('hidden');
            appState.itemToDeleteId = null;
        }

        function confirmDelete() {
            if (appState.itemToDeleteId) {
                appState.sedes = appState.sedes.filter(s => s.id !== appState.itemToDeleteId);
                saveToLocalStorage();
                renderTable();
                showToast('Sede eliminada', 'neutral');
            }
            closeDeleteModal();
        }

        // --- UTILS ---
        function escapeHTML(str) {
            return String(str).replace(/[&<>"']/g, function(m) {
                const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
                return map[m];
            });
        }

        function showToast(msg, type = 'success') {
            const toast = document.createElement('div');
            const colorClass = type === 'error' ? 'bg-red-600' : type === 'neutral' ? 'bg-slate-600' : 'bg-emerald-600';
            toast.className = `p-4 mb-2 rounded-lg text-white shadow-lg transition-all transform translate-x-full ${colorClass}`;
            toast.textContent = msg;
            appState.dom.toastContainer.appendChild(toast);
            
            requestAnimationFrame(() => {
                toast.classList.remove('translate-x-full');
            });

            setTimeout(() => {
                toast.classList.add('translate-x-full');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        // --- LISTENERS ---
        // Moved to DOMContentLoaded

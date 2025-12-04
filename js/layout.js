// Layout Manager to handle Sidebar and Header rendering

const CURRENT_PAGE = window.location.pathname.split("/").pop() || "index.html";

function renderSidebar() {
    const sidebar = document.createElement('aside');
    sidebar.className = "w-64 bg-slate-800 border-r border-slate-700/50 hidden md:flex flex-col z-10 transition-all duration-300 shadow-xl shadow-slate-900/20";
    sidebar.id = "sidebar";

    sidebar.innerHTML = `
        <div class="h-16 flex items-center px-6 border-b border-slate-700/50">
            <div class="flex items-center gap-2">
                <div class="bg-gradient-primary p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
                    <i data-lucide="shield" class="text-white w-5 h-5"></i>
                </div>
                <span class="text-lg font-bold tracking-tight text-white">Admin<span class="text-gradient-primary">Pro</span></span>
            </div>
        </div>

        <nav class="flex-1 overflow-y-auto py-4 custom-scrollbar">
            <ul class="space-y-1 px-3">
                <li class="mb-2 border-b border-slate-700/50 pb-2">
                    <a href="home.html" class="nav-link w-full flex items-center px-3 py-3 text-slate-300 rounded-lg hover:bg-slate-700/50 hover:text-white transition-all group ${CURRENT_PAGE === 'home.html' ? 'active' : ''}">
                        <i data-lucide="home" class="w-6 h-6 mr-3 ${CURRENT_PAGE === 'home.html' ? 'text-blue-400' : 'text-slate-500 group-hover:text-blue-400'}"></i>
                        <span class="font-bold text-base tracking-wide">Home</span>
                    </a>
                </li>
                <li>
                    <a href="dashboard.html" class="nav-link w-full flex items-center px-3 py-2.5 text-slate-400 rounded-lg hover:bg-slate-700/50 hover:text-white transition-all group ${CURRENT_PAGE === 'dashboard.html' ? 'active' : ''}">
                        <i data-lucide="layout-dashboard" class="w-5 h-5 mr-3 ${CURRENT_PAGE === 'dashboard.html' ? 'text-blue-400' : 'text-slate-500 group-hover:text-blue-400'} transition-colors"></i>
                        <span class="font-medium">Dashboard</span>
                    </a>
                </li>
                <li>
                    <a href="users.html" class="nav-link w-full flex items-center px-3 py-2.5 text-slate-400 rounded-lg hover:bg-slate-700/50 hover:text-white transition-all group ${CURRENT_PAGE === 'users.html' ? 'active' : ''}">
                        <i data-lucide="users" class="w-5 h-5 mr-3 ${CURRENT_PAGE === 'users.html' ? 'text-blue-400' : 'text-slate-500 group-hover:text-blue-400'} transition-colors"></i>
                        <span class="font-medium">Usuarios</span>
                    </a>
                </li>
                <li>
                    <a href="sedes.html" class="nav-link w-full flex items-center px-3 py-2.5 text-slate-400 rounded-lg hover:bg-slate-700/50 hover:text-white transition-all group ${CURRENT_PAGE === 'sedes.html' ? 'active' : ''}">
                        <i data-lucide="map-pin" class="w-5 h-5 mr-3 ${CURRENT_PAGE === 'sedes.html' ? 'text-blue-400' : 'text-slate-500 group-hover:text-blue-400'} transition-colors"></i>
                        <span class="font-medium">Sedes</span>
                    </a>
                </li>
            </ul>

            <div class="mt-auto p-4 border-t border-slate-700/50">
                <button onclick="logout()" class="w-full flex items-center px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all group">
                    <i data-lucide="log-out" class="w-5 h-5 mr-3 group-hover:text-red-400 transition-colors"></i>
                    <span class="font-medium">Cerrar Sesión</span>
                </button>
            </div>
        </nav>
    `;

    document.body.prepend(sidebar);
}

function renderHeader(title = "AdminPro", subtitle = "Estudio Galicia Corp.") {
    const headerHTML = `
        <header class="h-16 bg-slate-800/90 backdrop-blur-md border-b border-slate-700/50 flex items-center justify-between px-4 sm:px-6 z-20 sticky top-0">
            <div class="flex items-center">
                <button id="mobileMenuBtn" class="md:hidden p-2 rounded-md hover:bg-slate-700 text-slate-300 mr-2">
                    <i data-lucide="menu" class="w-6 h-6"></i>
                </button>
                <div class="md:hidden flex items-center gap-2">
                    <div class="bg-gradient-primary p-1 rounded-md">
                        <i data-lucide="shield" class="text-white w-4 h-4"></i>
                    </div>
                    <h2 class="text-lg font-bold text-white">AdminPro</h2>
                </div>
            </div>
            
            <div class="flex items-center gap-4">
                <button onclick="toggleTheme()" class="p-2 rounded-full hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors">
                    <i id="theme-icon" data-lucide="sun" class="w-5 h-5"></i>
                </button>
                <div class="flex flex-col items-end justify-center">
                    <h1 class="text-sm md:text-lg font-bold text-white leading-none tracking-tight">${title}</h1>
                    <span class="text-xs text-slate-400 font-medium mt-0.5 tracking-wide">${subtitle}</span>
                </div>
            </div>
        </header>
    `;

    // Inject into the main content area (first child of the .flex-1 div)
    const mainContainer = document.querySelector('.flex-1');
    if(mainContainer) {
        mainContainer.insertAdjacentHTML('afterbegin', headerHTML);
    }
}

// Initialize layout on load
document.addEventListener('DOMContentLoaded', () => {
    renderSidebar();
    
    // Setup Mobile Menu Logic (Global)
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('sidebar');
    
    // We need to delegate or wait for elements to exist, but renderSidebar runs immediately.
    // However, the event listener needs to be attached after the element is in DOM.
    // Since we prepend, it should be there.
    
    // Note: renderHeader also inserts #mobileMenuBtn.
    // So we should attach listener after both are rendered.
});

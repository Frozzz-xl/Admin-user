// --- THEME LOGIC ---
const THEME_KEY = 'adminPro_theme';

function toggleTheme() {
    const html = document.documentElement;
    const isDark = !html.hasAttribute('data-theme');
    const icon = document.getElementById('theme-icon');

    if (isDark) {
        html.setAttribute('data-theme', 'light');
        localStorage.setItem(THEME_KEY, 'light');
        if (icon) icon.setAttribute('data-lucide', 'moon');
    } else {
        html.removeAttribute('data-theme');
        localStorage.setItem(THEME_KEY, 'dark');
        if (icon) icon.setAttribute('data-lucide', 'sun');
    }
    lucide.createIcons();
}

function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const html = document.documentElement;
    const icon = document.getElementById('theme-icon');
    
    if (savedTheme === 'light') {
        html.setAttribute('data-theme', 'light');
        if (icon) icon.setAttribute('data-lucide', 'moon');
    } else {
        html.removeAttribute('data-theme');
        if (icon) icon.setAttribute('data-lucide', 'sun');
    }
    lucide.createIcons();
}

function logout() {
    sessionStorage.removeItem('isLoggedIn');
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', initTheme);

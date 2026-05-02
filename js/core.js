// ===== SHARED API KEY =====
const apiKey = '8a0ce814';
// ===== USER MENU (AVATAR + DROPDOWN) =====
function updateUserMenu() {
    const userArea = document.getElementById('userArea');
    if (!userArea) return;

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (currentUser && currentUser.fullname) {
        const firstName = currentUser.fullname.split(' ')[0];
        const initial = firstName.charAt(0).toUpperCase();

        userArea.innerHTML = `
            <div class="user-avatar" id="userAvatar">
                <div class="avatar-circle">${initial}</div>
                <div class="dropdown-menu" id="dropdownMenu">
                    <a href="account.html">👤 My Account</a>
                    <hr>
                    <button id="logoutBtn">🚪 Logout</button>
                </div>
            </div>
        `;

        const avatar = document.getElementById('userAvatar');
        const dropdown = document.getElementById('dropdownMenu');
        const logoutBtn = document.getElementById('logoutBtn');

        if (avatar && dropdown) {
            avatar.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('show');
            });
            document.addEventListener('click', (e) => {
                if (!avatar.contains(e.target)) {
                    dropdown.classList.remove('show');
                }
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                localStorage.removeItem('currentUser');
                window.location.href = "login.html";
            });
        }
    } else {
        userArea.innerHTML = `<a href="login.html" class="login-btn">Sign In</a>`;
    }
}

// ===== THEME MANAGEMENT =====
function initTheme() {
    const savedTheme = localStorage.getItem('nxtwatch-theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
    } else {
        document.body.classList.remove('light-mode');
    }
    updateAllThemeButtons();
}

function toggleTheme() {
    const isLight = document.body.classList.toggle('light-mode');
    localStorage.setItem('nxtwatch-theme', isLight ? 'light' : 'dark');
    updateAllThemeButtons();
}

function updateAllThemeButtons() {
    const isLight = document.body.classList.contains('light-mode');
    const buttons = document.querySelectorAll('.theme-toggle-nav, .theme-toggle-btn');
    buttons.forEach(btn => {
        btn.textContent = isLight ? '🌙' : '☀️';
        btn.title = isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode';
    });
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    updateUserMenu();
    initTheme();
});

window.addEventListener('pageshow', updateUserMenu);
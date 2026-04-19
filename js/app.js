/* =============================================
   LAMIM — MAIN APP ROUTER & INIT
   ============================================= */
const App = {
  currentSection: 'home',

  // Section labels for the topbar
  sectionLabels: {
    home: 'Home', salah: '🕋 Salah Tracker', dhikr: '📿 Dhikr Counter',
    goals: '🎯 Goals', akhlaq: '🤲 Akhlaq', finance: '💰 Finance',
    tazkiyah: '🧠 Tazkiyah', ilm: '📚 Knowledge', analysis: '📊 Analysis',
    profile: '👤 Profile'
  },

  init() {
    // Apply saved theme
    const settings = DB.getSettings();
    document.documentElement.setAttribute('data-theme', settings.theme || 'dark');

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    // Splash → route
    setTimeout(() => {
      document.getElementById('splash')?.classList.add('hidden');
      const user = DB.getUser();
      if (user) this.showDashboard();
      else this.showPage('login');
    }, 1800);

    // Nav bindings
    this.bindNav();
    this.bindSidebarToggle();
    this.bindInstallPrompt();
  },

  showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const el = document.getElementById('page-' + page);
    if (el) el.classList.add('active');
    if (page === 'login')   Auth.bindLogin();
    if (page === 'signup')  Auth.bindSignup();
    if (page === 'forgot')  Auth.bindForgot();
  },

  showDashboard() {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const dash = document.getElementById('page-dashboard');
    if (dash) dash.classList.add('active');
    this.navigateTo('home');
    // Update topbar avatars
    this.updateAvatars();
  },

  updateAvatars() {
    const user = DB.getUser();
    if (!user) return;
    const initials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
    const html = user.avatar
      ? `<img src="${user.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%" alt="">`
      : initials;
    ['topbar-avatar', 'topbar-avatar-section'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = html;
    });
  },

  navigateTo(section) {
    this.currentSection = section;

    // Active nav items
    document.querySelectorAll('.nav-item, .bottom-nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.section === section);
    });

    // Show panel
    document.querySelectorAll('.section-panel').forEach(p => p.classList.remove('active'));
    const panel = document.getElementById('section-' + section);
    if (panel) panel.classList.add('active');

    // Toggle topbars: logo topbar for home, section topbar for others
    const topbar = document.getElementById('topbar');
    const topbarSection = document.getElementById('topbar-section');
    if (topbar && topbarSection) {
      if (section === 'home') {
        topbar.style.display = '';
        topbarSection.style.display = 'none';
      } else {
        topbar.style.display = 'none';
        topbarSection.style.display = '';
        const titleEl = document.getElementById('topbar-section-title');
        if (titleEl) titleEl.textContent = this.sectionLabels[section] || section;
      }
    }

    // Init section
    const inits = { home: Home, salah: Salah, dhikr: Dhikr, goals: Goals, analysis: Analysis, profile: Profile, akhlaq: typeof Akhlaq !== 'undefined' ? Akhlaq : null, finance: typeof Finance !== 'undefined' ? Finance : null, tazkiyah: typeof Tazkiyah !== 'undefined' ? Tazkiyah : null, ilm: typeof Ilm !== 'undefined' ? Ilm : null };
    inits[section]?.init();

    // Close sidebar on mobile
    if (window.innerWidth <= 1024) this.closeSidebar();

    // Scroll top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  bindNav() {
    document.querySelectorAll('[data-section]').forEach(el => {
      el.addEventListener('click', () => this.navigateTo(el.dataset.section));
    });
  },

  bindSidebarToggle() {
    // Both topbar hamburger buttons open sidebar
    ['sidebar-toggle', 'sidebar-toggle-section'].forEach(id => {
      document.getElementById(id)?.addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        sidebar?.classList.toggle('open');
        overlay?.classList.toggle('show');
      });
    });
    document.getElementById('sidebar-overlay')?.addEventListener('click', () => this.closeSidebar());
  },

  closeSidebar() {
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('sidebar-overlay')?.classList.remove('show');
  },

  bindInstallPrompt() {
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      deferredPrompt = e;
      const banner = document.getElementById('install-banner');
      if (banner) banner.classList.remove('hidden');
    });
    document.getElementById('install-btn')?.addEventListener('click', () => {
      deferredPrompt?.prompt();
      deferredPrompt?.userChoice.then(() => {
        document.getElementById('install-banner')?.classList.add('hidden');
      });
    });
    document.getElementById('install-dismiss')?.addEventListener('click', () => {
      document.getElementById('install-banner')?.classList.add('hidden');
    });
  }
};

// Bootstrap
document.addEventListener('DOMContentLoaded', () => App.init());

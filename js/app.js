/* =============================================
   LAMIM — MAIN APP ROUTER & INIT
   ============================================= */
const App = {
  currentSection: '',
  lang: localStorage.getItem('lamim_lang') || 'en',

  // UI Dictionary (loaded from lang.js)
  dict: typeof Translations !== 'undefined' ? Translations : {},

  toggleLang() {
    this.setLang(this.lang === 'en' ? 'bn' : 'en');
  },

  setLang(lang) {
    if (this.lang === lang) return;
    this.lang = lang;
    DB.rawSet('lamim_lang', this.lang);
    document.documentElement.setAttribute('lang', this.lang);
    this.applyTranslations();
    Utils.toast(this.lang === 'bn' ? 'বাংলা ভাষা নির্বাচন করা হয়েছে' : 'Language set to English', 'success');
  },

  applyTranslations() {
    const isBn = this.lang === 'bn';

    // 1. Update dynamic module renders FIRST so they inject fresh English text
    this.updateSectionTitle();
    const current = this.currentSection;
    if (current === 'dhikr' && typeof Dhikr !== 'undefined') { Dhikr.renderMarquee(); Dhikr.renderSessionHistory(); Dhikr.renderHero(); Dhikr.renderPresetRow(); }
    if (current === 'profile' && typeof Profile !== 'undefined') { Profile.renderSettings(); }
    if (current === 'home' && typeof Home !== 'undefined') { Home.render(); }
    if (current === 'salah' && typeof Salah !== 'undefined') { Salah.renderAll(); }
    if (current === 'nafl' && typeof Goals !== 'undefined') { Goals.render(); }
    if (current === 'finance' && typeof Finance !== 'undefined') { Finance.render(); }
    if (current === 'analysis' && typeof Analysis !== 'undefined') { Analysis.init(); }
    if (current === 'mujahid' && typeof Mujahid !== 'undefined') { Mujahid.render(); }


    // Pre-calculate reverse dictionary for fast translation lookup (O(1))
    this.reverseDict = new Map();
    Object.keys(this.dict).forEach(k => this.reverseDict.set(this.dict[k], k));

    // 2. Translate explicit data-i18n elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (this.dict[key]) {
        el.textContent = isBn ? this.dict[key] : key;
      }
    });

    // 3. Fallback TreeWalker for everything else without data-i18n
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let n;
    while (n = walk.nextNode()) {
      if (n.parentElement && (n.parentElement.tagName === 'SCRIPT' || n.parentElement.hasAttribute('data-i18n') || n.parentElement.closest('[data-i18n]'))) continue;

      let text = n.nodeValue.trim();
      if (!text) continue;

      // Store original English text in dataset if not present
      if (n.parentElement && !n.parentElement.dataset.enText) {
        if (this.dict[text]) {
          n.parentElement.dataset.enText = text;
        } else {
          // Use O(1) Map for reverse lookup
          const engKey = this.reverseDict.get(text);
          if (engKey) n.parentElement.dataset.enText = engKey;
        }
      }

      // Translate if original English text is found
      let original = n.parentElement ? n.parentElement.dataset.enText : null;
      if (original && this.dict[original]) {
        n.nodeValue = isBn ? this.dict[original] : original;
      }
    }
  },

  updateSectionTitle() {
    const titleEl = document.getElementById('topbar-section-title');
    if (titleEl && this.currentSection !== 'home') {
      const labelObj = this.sectionLabels[this.lang] || this.sectionLabels['en'];
      titleEl.textContent = labelObj[this.currentSection] || this.currentSection;
    }
  },

  // Section labels for the topbar
  sectionLabels: {
    en: { home: 'Home', salah: 'Salah Tracker', dhikr: 'Dhikr Counter', nafl: 'Nafl Salah', mujahid: 'Mujahid', finance: 'Islamic Finance', analysis: 'Analysis', profile: 'Profile' },
    bn: { home: 'হোম', salah: 'সালাত ট্র্যাকার', dhikr: 'যিকির কাউন্টার', nafl: 'নফল সালাত', mujahid: 'মুজাহিদ', finance: 'ইসলামিক অর্থনীতি', analysis: 'বিশ্লেষণ', profile: 'প্রোফাইল' }
  },

  async init() {
    // Wait for IndexedDB cache load and migration
    await DB.init();

    // 0. AGGRESSIVE RECOVERY & CACHE BUSTING CHECK
    if (DB.rawGet('lamim_needs_reload')) {
      DB.remove('lamim_needs_reload');
      window.location.reload(true);
    }
    
    // Force clear old service workers and caches ONCE to ensure the bug fix applies
    if (!DB.rawGet('lamim_cache_cleared_v36')) {
      DB.rawSet('lamim_cache_cleared_v36', 'true');

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
          for (let registration of registrations) {
            registration.unregister();
          }
        });
      }
      caches.keys().then(keys => {
        keys.forEach(key => { try { caches.delete(key); } catch(e) {} });
      });
      setTimeout(() => window.location.reload(true), 500);
      return; // Stop initialization until reload
    }

    // Check for Service Worker Updates is handled automatically by the browser

    // Apply saved theme
    const settings = DB.getSettings();
    document.documentElement.setAttribute('data-theme', settings.theme || 'dark');
    // Sync theme icon
    const moon = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
    const sun = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
    document.querySelectorAll('#theme-icon-top, #theme-icon-section').forEach(el => el.innerHTML = settings.theme === 'dark' ? moon : sun);

    // Check if running on localhost/development environment
    const isLocalhost = Boolean(
      window.location.hostname === 'localhost' ||
      window.location.hostname === '[::1]' ||
      window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
    );

    if ('serviceWorker' in navigator) {
      if (isLocalhost) {
        // Auto-unregister Service Worker on localhost to make development hassle-free
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (let registration of registrations) {
            registration.unregister();
            console.log('[Dev] Unregistered Service Worker on localhost');
          }
        });
      } else {
        // Register service worker with auto-update system on production
        navigator.serviceWorker.register('/sw.js').catch(() => { });

        // Listen for SW update notifications — auto-refresh silently only if version changed
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'SW_UPDATED') {
            const currentVersion = DB.rawGet('lamim_current_sw_version');
            if (currentVersion !== event.data.version) {
              DB.rawSet('lamim_current_sw_version', event.data.version);
              console.log('[App] New version detected:', event.data.version, '— auto-refreshing...');
              window.location.reload();
            }
          }
        });
      }
    }

    // Apply translations after a short delay to allow DOM to settle
    setTimeout(() => this.applyTranslations(), 50);

    // Global Midnight Rollover Detector - ensures app state resets if left open overnight
    const startupDate = Utils.todayStr();
    setInterval(() => {
      if (Utils.todayStr() !== startupDate) {
        if (document.activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
        console.log("[App] Midnight rollover detected. Reloading app state...");
        window.location.reload();
      }
    }, 60000);

    // Splash → route (offline boot sequence)
    this._bootComplete = false;
    setTimeout(() => {
      console.log('[Boot] Starting initialization...');
      document.getElementById('splash')?.classList.add('hidden');
      
      const user = DB.getUser();
      
      if (user) {
        console.log('[Boot] Local user found:', user.name);
        if (DB.refreshSpiritScore) DB.refreshSpiritScore();
        this.showDashboard();
        console.log('[Boot] Dashboard loaded successfully');
        this.checkBackupReminder();
      } else {
        console.log('[Boot] No local user → setup');
        this.showPage('setup');
      }
      this._bootComplete = true;
    }, 1800);

    // Safety fallback
    setTimeout(() => {
      if (this._bootComplete) return; 
      console.warn('[Boot] Safety fallback triggered');
      document.getElementById('splash')?.classList.add('hidden');
      if (DB.getUser()) {
        this.showDashboard();
        this.checkBackupReminder();
      }
      else this.showPage('setup');
      this._bootComplete = true;
    }, 8000);

    // Nav bindings
    this.bindNav();
    this.bindSidebarToggle();
    this.bindInstallPrompt();
    this.bindConnectivity();

    // Ensure setup form is always bound
    if (typeof Auth !== 'undefined') Auth.init();

    // Network status indicators for PWA
    window.addEventListener('online', () => {
      Utils.toast(this.lang === 'bn' ? 'ইন্টারনেট কানেকশন ফিরেছে!' : 'Back Online!', 'success');
    });
    window.addEventListener('offline', () => {
      Utils.toast(this.lang === 'bn' ? 'আপনি এখন অফলাইনে আছেন। ডাটা লোকালি সেভ হবে।' : 'You are offline. Data will be saved locally.', 'warning');
    });

    // Android hardware back button support
    let processingPop = false;
    window.addEventListener('popstate', (e) => {
      if (processingPop) return;
      processingPop = true;
      // Close any open modal first
      const openModal = document.querySelector('.modal-overlay:not(.hidden)');
      if (openModal) {
        Utils.closeModal(openModal);
        history.pushState({ section: this.currentSection }, '', '');
        setTimeout(() => { processingPop = false; }, 100);
        return;
      }
      // Close sidebar if open
      const sidebar = document.getElementById('sidebar');
      if (sidebar && sidebar.classList.contains('open')) {
        this.closeSidebar();
        history.pushState({ section: this.currentSection }, '', '');
        setTimeout(() => { processingPop = false; }, 100);
        return;
      }
      processingPop = false;
      // Navigate back to previous section or home
      if (e.state && e.state.section) {
        this.navigateTo(e.state.section, true);
      } else if (this.currentSection !== 'home') {
        this.navigateTo('home', true);
      }
    });
  },

  showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const el = document.getElementById('page-' + page);
    if (el) el.classList.add('active');
    if (page === 'setup' && typeof Auth !== 'undefined') Auth.bindSetup();
  },

  showDashboard(initialSection = 'home') {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const dash = document.getElementById('page-dashboard');
    if (dash) dash.classList.add('active');
    this.navigateTo(initialSection);
    // Update topbar avatars
    this.updateAvatars();
    // Initialize Prayer Notifier
    if (typeof PrayerNotifier !== 'undefined') {
      PrayerNotifier.init();
    }
    // Initialize Home section listeners (data-updated event)
    if (typeof Home !== 'undefined') Home.init();
  },



  updateAvatars() {
    const user = DB.getUser();
    if (!user) return;
    const safeInitials = Utils.escapeHTML(user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?');
    const html = user.avatar
      ? `<img src="${Utils.escapeHTML(user.avatar)}" 
              style="width:100%;height:100%;object-fit:cover;border-radius:50%" 
              alt="Avatar" 
              data-fallback="${safeInitials}"
              onerror="this.parentElement.textContent=this.dataset.fallback;this.remove()">`
      : safeInitials;

    ['topbar-avatar', 'topbar-avatar-section'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.innerHTML = html;
        el.style.display = 'flex';
      }
    });
  },

  navigateTo(sectionId, isBackNav = false) {
    if (this.currentSection === sectionId) {
      return;
    }

    // Cleanup previous section's resources (e.g., Home rAF loops)
    if (this.currentSection === 'home' && typeof Home !== 'undefined') Home.cleanup();

    this.currentSection = sectionId;

    // Push history state for Android back button (skip if this IS a back navigation)
    if (!isBackNav) {
      history.pushState({ section: sectionId }, '', '');
    }

    // Active nav items
    document.querySelectorAll('.nav-item, .bottom-nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.section === sectionId);
    });

    // Show panel with smooth transition
    const oldPanel = document.querySelector('.section-panel.active');
    const newPanel = document.getElementById('section-' + sectionId);
    if (oldPanel && oldPanel !== newPanel) {
      oldPanel.classList.add('leaving');
      setTimeout(() => {
        oldPanel.classList.remove('leaving', 'active');
      }, 250);
    }
    document.querySelectorAll('.section-panel').forEach(p => p.classList.remove('active'));
    if (newPanel) newPanel.classList.add('active');

    // Section accent color
    const accents = {
      home: '#10B981', salah: '#3B82F6', dhikr: '#A855F7',
      nafl: '#F59E0B', analysis: '#EC4899', mujahid: '#EF4444',
      finance: '#14B8A6', 'year-review': '#EAB308', profile: '#6B7280'
    };
    document.documentElement.style.setProperty('--section-accent', accents[sectionId] || '#10B981');

    // Toggle topbars: logo topbar for home, section topbar for others
    const topbar = document.getElementById('topbar');
    const topbarSection = document.getElementById('topbar-section');
    if (topbar && topbarSection) {
      if (sectionId === 'home') {
        topbar.style.display = '';
        topbarSection.style.display = 'none';
      } else {
        topbar.style.display = 'none';
        topbarSection.style.display = '';
        this.updateSectionTitle();
      }
    }

    // Init section
    const inits = { home: Home, salah: Salah, dhikr: Dhikr, nafl: Goals, analysis: Analysis, 'year-review': YearReview, profile: Profile, mujahid: Mujahid, finance: Finance };
    inits[sectionId]?.init();

    // Close sidebar on mobile
    if (window.innerWidth <= 1024) this.closeSidebar();

    // Scroll top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },


  bindNav() {
    document.querySelectorAll('[data-section]').forEach(el => {
      el.addEventListener('click', () => this.navigateTo(el.dataset.section));
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.navigateTo(el.dataset.section);
        }
      });
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
    if (localStorage.getItem('lamim_install_dismissed')) return;
    if (window.matchMedia('(display-mode: standalone)').matches) return;
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
        localStorage.setItem('lamim_install_dismissed', '1');
      });
    });
    document.getElementById('install-dismiss')?.addEventListener('click', () => {
      document.getElementById('install-banner')?.classList.add('hidden');
      localStorage.setItem('lamim_install_dismissed', '1');
    });
  },

  checkBackupReminder() {
    if (this.backupPromptedToday) return;
    
    const settings = DB.getSettings();
    const lastBackup = settings.lastBackupDate;
    const today = Utils.todayStr();

    if (!lastBackup) {
      settings.lastBackupDate = today;
      DB.setSettings(settings);
      return;
    }

    const lastDate = new Date(lastBackup);
    const currDate = new Date(today);
    const diffTime = Math.abs(currDate - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= 30) {
      this.backupPromptedToday = true;
      setTimeout(() => {
        const title = this.lang === 'bn' ? 'ডেটা ব্যাকআপ নিন' : 'Backup Your Data';
        const desc = this.lang === 'bn' 
          ? 'আপনার ৩০ দিনেরও বেশি সময় ধরে কোনো ব্যাকআপ নেওয়া হয়নি। ব্রাউজার ক্যাশ ক্লিয়ার হলে আপনার প্রগ্রেস ডিলিট হতে পারে। এখনই ব্যাকআপ ফাইলটি এক্সপোর্ট করে সুরক্ষিত রাখুন।' 
          : 'You haven\'t backed up your data in over 30 days. To prevent data loss if your browser cache is cleared, please export a backup file now.';
        
        Utils.confirm(title, desc, () => {
          if (typeof Profile !== 'undefined' && Profile.exportData) {
            Profile.exportData();
            const s = DB.getSettings();
            s.lastBackupDate = Utils.todayStr();
            DB.setSettings(s);
          }
        }, 'info');
      }, 5000);
    }
  },

  refreshCurrentPage() {
    const s = this.currentSection;
    const inits = { home: Home, salah: Salah, dhikr: Dhikr, nafl: Goals, analysis: Analysis, 'year-review': YearReview, profile: Profile, mujahid: Mujahid, finance: Finance };
    if (inits[s]) inits[s].init();
    this.updateAvatars();
  },

  bindConnectivity() {
    const showToast = (msg, type) => {
      if (typeof Utils !== 'undefined' && Utils.toast) Utils.toast(msg, type);
    };
    window.addEventListener('offline', () => showToast('You are offline', 'error'));
    window.addEventListener('online', () => showToast('Back online', 'success'));
    if (!navigator.onLine) showToast('You are offline', 'error');
  }
};

// Bootstrap with readyState safeguard
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}

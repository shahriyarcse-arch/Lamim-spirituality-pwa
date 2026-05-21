/* =============================================
   LAMIM — MAIN APP ROUTER & INIT
   ============================================= */
const App = {
  currentSection: '',
  lang: DB.rawGet('lamim_lang') || 'en',

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
    if (current === 'leaderboard' && typeof Leaderboard !== 'undefined') { Leaderboard.render(); }

    // Pre-calculate reverse dictionary for fast translation lookup (O(1))
    if (!this.reverseDict) {
      this.reverseDict = new Map();
      Object.keys(this.dict).forEach(k => this.reverseDict.set(this.dict[k], k));
    }

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
    en: { home: 'Home', salah: 'Salah Tracker', dhikr: 'Dhikr Counter', nafl: 'Nafl Salah', mujahid: 'Mujahid', finance: 'Islamic Finance', analysis: 'Analysis', profile: 'Profile', leaderboard: 'Vanguard' },
    bn: { home: 'হোম', salah: 'সালাত ট্র্যাকার', dhikr: 'যিকির কাউন্টার', nafl: 'নফল সালাত', mujahid: 'মুজাহিদ', finance: 'ইসলামিক অর্থনীতি', analysis: 'বিশ্লেষণ', profile: 'প্রোফাইল', leaderboard: 'অগ্রসেনা' }
  },

  init() {
    // 0. AGGRESSIVE RECOVERY & CACHE BUSTING CHECK
    if (DB.rawGet('lamim_needs_reload')) {
      DB.remove('lamim_needs_reload');
      window.location.reload(true);
    }
    
    // Force clear old service workers and caches ONCE to ensure the bug fix applies
    if (!DB.rawGet('lamim_cache_cleared_v34')) {
      DB.rawSet('lamim_cache_cleared_v34', 'true');
      localStorage.removeItem('lamim_leaderboard_cache'); // Clear broken SVG avatar cache
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
          for (let registration of registrations) {
            registration.unregister();
          }
        });
      }
      caches.keys().then(keys => {
        keys.forEach(key => caches.delete(key));
      });
      setTimeout(() => window.location.reload(true), 500);
      return; // Stop initialization until reload
    }

    // Check for Service Worker Updates is handled automatically by the browser

    const isError = window.location.hash.includes('error=access_denied') || window.location.hash.includes('expired');
    if (isError) {
      Utils.toast("This reset link has expired. Please request a new one.", "error");
      // Clean the URL to stop the error from repeating
      history.replaceState(null, null, window.location.pathname);
    }

    if (window.location.hash.includes('type=recovery') || window.location.href.includes('type=recovery')) {
      console.log("CRITICAL: Recovery detected. Forcing UI state...");
      document.documentElement.setAttribute('data-theme', 'dark'); // Ensure visibility

      // Keep forcing it for a few seconds
      let forceCount = 0;
      const forceInterval = setInterval(() => {
        document.getElementById('splash')?.classList.add('hidden');
        this.showPage('forgot');
        const s1 = document.getElementById('forgot-step1');
        const s2 = document.getElementById('forgot-step2');
        const s3 = document.getElementById('forgot-step3');
        if (s1) s1.classList.add('hidden');
        if (s2) s2.classList.add('hidden');
        if (s3) s3.classList.remove('hidden');

        forceCount++;
        if (forceCount > 20) clearInterval(forceInterval);
      }, 200);

      this.bindNav();
      this.bindSidebarToggle();
      return;
    }

    // Apply saved theme
    const settings = DB.getSettings();
    document.documentElement.setAttribute('data-theme', settings.theme || 'dark');

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
        console.log("[App] Midnight rollover detected. Reloading app state...");
        window.location.reload();
      }
    }, 60000);

    // Splash → route
    setTimeout(async () => {
      document.getElementById('splash')?.classList.add('hidden');
      const user = DB.getUser();
      const isOnline = navigator.onLine;
      let hasCloudSession = false;

      let cloudUser = null;
      if (isOnline && window.supabaseClient) {
        try {
          const { data } = await window.supabaseClient.auth.getSession();
          cloudUser = data?.session?.user || null;
          hasCloudSession = !!cloudUser;
        } catch (e) { console.warn("Session check failed", e); }
      }

      // If user exists locally, we allow entry (even if offline or cloud session fails)
      if (user) {
        // If online, require a valid verified Supabase session for stored local users.
        if (isOnline && window.supabaseClient) {
          if (!cloudUser) {
            DB.clearUser();
            Utils.toast('Session expired. Please login again with your verified account.', 'warning');
            this.showPage('login');
            return;
          }

          if (Auth.requiresEmailVerification(cloudUser)) {
            await window.supabaseClient.auth.signOut().catch(() => {});
            DB.clearUser();
            Utils.toast('Your account is not verified or needs re-verification. Please verify your email before logging in.', 'warning');
            this.showPage('login');
            return;
          }
        }

        // Refresh role if online
        if (isOnline && window.supabaseClient && hasCloudSession) {
          try {
            const { data: prof, error: roleErr } = await window.supabaseClient
              .from('profiles')
              .select('role')
              .eq('id', user.id)
              .single();

            if (!roleErr && prof && prof.role) {
              user.role = prof.role;
              DB.setUser(user);
            }
          } catch (e) { console.warn("Background role refresh failed", e); }
        }

        // Failsafe admin check
        if (user.email === 'shamimshahriyar.cse@gmail.com' || user.role === 'admin') {
          user.role = 'admin';
          DB.setUser(user);
        }
        if (DB.refreshSpiritScore) DB.refreshSpiritScore();
        this.checkAdminUI();

        if (user.role === 'admin') {
          this.showDashboard('admin');
        } else {
          this.showDashboard();
          if (isOnline && window.Sync) window.Sync.pullAll();
        }
      } else {
        this.showPage('login');
      }
    }, 1800);

    // Safety fallback: if splash is still visible after a longer timeout,
    // force-hide it and show the login page to avoid infinite loading state.
    setTimeout(() => {
      try {
        const sp = document.getElementById('splash');
        if (sp && !sp.classList.contains('hidden')) {
          console.warn('[App] Splash still visible after fallback timeout — forcing hide and showing login.');
          sp.classList.add('hidden');
          try { if (window.Sync) window.Sync.isSubscribed = false; } catch (e) {}
          App.showPage('login');
        }
      } catch (e) { console.warn('Splash fallback error', e); }
    }, 8000);

    // Nav bindings
    this.bindNav();
    this.bindSidebarToggle();
    this.bindInstallPrompt();

    // Network status indicators for PWA
    window.addEventListener('online', () => {
      Utils.toast(this.lang === 'bn' ? 'ইন্টারনেট কানেকশন ফিরেছে!' : 'Back Online!', 'success');
      if (window.Sync) window.Sync.pullAll(); // Auto-sync when back online
    });
    window.addEventListener('offline', () => {
      Utils.toast(this.lang === 'bn' ? 'আপনি এখন অফলাইনে আছেন। ডাটা লোকালি সেভ হবে।' : 'You are offline. Data will be saved locally.', 'warning');
    });

    // Android hardware back button support
    window.addEventListener('popstate', (e) => {
      // Close any open modal first
      const openModal = document.querySelector('.modal-overlay:not(.hidden)');
      if (openModal) {
        openModal.classList.add('hidden');
        history.pushState({ section: this.currentSection }, '', '');
        return;
      }
      // Close sidebar if open
      const sidebar = document.getElementById('sidebar');
      if (sidebar && sidebar.classList.contains('open')) {
        this.closeSidebar();
        history.pushState({ section: this.currentSection }, '', '');
        return;
      }
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
    if (page === 'login') Auth.bindLogin();
    if (page === 'signup') Auth.bindSignup();
    if (page === 'forgot') Auth.bindForgot();
  },

  showDashboard(initialSection = 'home') {
    this.checkAdminUI();
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
  },

  checkAdminUI() {
    const user = DB.getUser();
    // console.log("Checking Admin UI Visibility for:", user ? user.email : 'No User');
    const isAdmin = user && (user.role === 'admin' || user.email === 'shamimshahriyar.cse@gmail.com');
    
    const adminNav = document.getElementById('admin-nav-item');
    if (adminNav) {
      if (isAdmin) {
        console.log("Admin privileges confirmed. Showing panel.");
        adminNav.classList.remove('hidden');
        adminNav.style.display = 'flex';
      } else {
        adminNav.classList.add('hidden');
        adminNav.style.display = 'none';
      }
    }

    const vangNav = document.getElementById('vanguard-nav-item');
    const vangBnav = document.getElementById('vanguard-bnav-item');
    if (vangNav) vangNav.style.display = isAdmin ? 'flex' : 'none';
    if (vangBnav) vangBnav.style.display = isAdmin ? 'flex' : 'none';
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
      if (sectionId === 'home') this.showBroadcasts();
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

    // Show panel
    document.querySelectorAll('.section-panel').forEach(p => p.classList.remove('active'));
    const panel = document.getElementById('section-' + sectionId);
    if (panel) panel.classList.add('active');

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
    const inits = { home: Home, salah: Salah, dhikr: Dhikr, nafl: Goals, analysis: Analysis, profile: Profile, mujahid: Mujahid, finance: Finance, admin: Admin, leaderboard: Leaderboard };
    inits[sectionId]?.init();

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
  },

  refreshCurrentPage() {
    const s = this.currentSection;
    const inits = { home: Home, salah: Salah, dhikr: Dhikr, nafl: Goals, analysis: Analysis, profile: Profile, mujahid: Mujahid, finance: Finance, admin: Admin, leaderboard: Leaderboard };
    if (inits[s]) inits[s].init();
    this.updateAvatars();
  }
};

// Bootstrap with readyState safeguard
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}

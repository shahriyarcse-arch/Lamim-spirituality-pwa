/* =============================================
   LAMIM — DB LAYER (IndexedDB Cache Engine)
   ============================================= */
const DB = {
  _cache: {},
  _db: null,
  _channel: null,

  init() {
    if (typeof BroadcastChannel !== 'undefined' && !this._channel) {
      this._channel = new BroadcastChannel('lamim_db_sync');
      this._channel.onmessage = (e) => {
        const { type, key, val } = e.data;
        if (type === 'set') {
          this._cache[key] = val;
          if (key === 'lamim_lang') {
            try {
              const newLang = JSON.parse(val);
              if (window.App) {
                window.App.lang = newLang;
                document.documentElement.setAttribute('lang', newLang);
                window.App.applyTranslations();
              }
            } catch (err) {}
          }
          if (key === 'lamim_settings') {
            try {
              const settings = JSON.parse(val);
              document.documentElement.setAttribute('data-theme', settings.theme || 'dark');
              const moon = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
              const sun = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
              document.querySelectorAll('#theme-icon-top, #theme-icon-section').forEach(el => el.innerHTML = settings.theme === 'dark' ? moon : sun);
              if (window.Profile && document.getElementById('section-profile')?.classList.contains('active')) {
                Profile.renderSettings();
              }
            } catch (err) {}
          }
          if (key === 'lamim_user') {
            if (window.Profile && document.getElementById('section-profile')?.classList.contains('active')) {
              Profile.renderProfile();
              Profile.renderSettings();
            }
          }
          if (key.startsWith('lamim_salah_')) {
            this._streakCache = null;
          }
          window.dispatchEvent(new CustomEvent('lamim:data-updated'));
        } else if (type === 'remove') {
          delete this._cache[key];
          if (key.startsWith('lamim_salah_')) {
            this._streakCache = null;
          }
          window.dispatchEvent(new CustomEvent('lamim:data-updated'));
        } else if (type === 'clear') {
          this._cache = {};
          this._streakCache = null;
          window.dispatchEvent(new CustomEvent('lamim:data-updated'));
        }
      };
    }

    return new Promise((resolve) => {
      let resolved = false;
      const done = (fallback = false) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeoutId);
        if (fallback) {
          this._fallbackToLocalStorage();
        }
        resolve();
      };

      // Safety timeout: fallback to localStorage if IndexedDB takes more than 2 seconds
      const timeoutId = setTimeout(() => {
        console.warn("[DB] IndexedDB initialization timed out. Falling back to localStorage.");
        done(true);
      }, 2000);

      // 1. Open IndexedDB
      let request;
      try {
        request = indexedDB.open('lamim_db', 1);
      } catch (err) {
        console.error("IndexedDB.open failed, falling back to localStorage", err);
        done(true);
        return;
      }

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('keyvalue')) {
          db.createObjectStore('keyvalue');
        }
      };

      request.onsuccess = (e) => {
        this._db = e.target.result;
        this._loadCache()
          .then(() => this._migrateFromLocalStorage())
          .then(() => {
            this.migrate();
            done(false);
          })
          .catch((err) => {
            console.error("IndexedDB cache loading/migration failed, falling back", err);
            done(true);
          });
      };

      request.onerror = (e) => {
        console.error("IndexedDB onerror, falling back to localStorage", e);
        done(true);
      };
    });
  },

  _fallbackToLocalStorage() {
    this._cache = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('lamim_')) {
        this._cache[k] = localStorage.getItem(k);
      }
    }
  },

  _loadCache() {
    return new Promise((resolve, reject) => {
      if (!this._db) {
        reject(new Error("No database connection"));
        return;
      }
      try {
        const transaction = this._db.transaction(['keyvalue'], 'readonly');
        const store = transaction.objectStore('keyvalue');
        const request = store.openCursor();
        this._cache = {};

        request.onsuccess = (e) => {
          const cursor = e.target.result;
          if (cursor) {
            this._cache[cursor.key] = cursor.value;
            cursor.continue();
          } else {
            resolve();
          }
        };

        request.onerror = (e) => {
          reject(e.target.error);
        };
      } catch (err) {
        reject(err);
      }
    });
  },

  _migrateFromLocalStorage() {
    const keysToMigrate = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('lamim_')) {
        keysToMigrate.push(k);
      }
    }

    if (keysToMigrate.length === 0) return Promise.resolve();

    console.log(`[DB] Migrating ${keysToMigrate.length} keys from localStorage to IndexedDB...`);

    return new Promise((resolve) => {
      try {
        const transaction = this._db.transaction(['keyvalue'], 'readwrite');
        const store = transaction.objectStore('keyvalue');

        keysToMigrate.forEach(key => {
          const val = localStorage.getItem(key);
          store.put(val, key);
          this._cache[key] = val;
        });

        transaction.oncomplete = () => {
          console.log("[DB] Migration transaction complete. Clearing localStorage...");
          keysToMigrate.forEach(key => {
            if (key !== 'lamim_lang' && key !== 'lamim_settings') {
              localStorage.removeItem(key);
            }
          });
          resolve();
        };

        transaction.onerror = (e) => {
          console.error("[DB] Migration transaction failed:", e.target.error);
          resolve();
        };
      } catch (err) {
        console.error("[DB] Migration execution error:", err);
        resolve();
      }
    });
  },

  _asyncWrite(key, val) {
    if (!this._db) return;
    try {
      const transaction = this._db.transaction(['keyvalue'], 'readwrite');
      const store = transaction.objectStore('keyvalue');
      const req = store.put(val, key);
      
      req.onerror = (e) => {
        const err = e.target.error;
        console.error(`[DB] Async write failed for key: ${key}`, err);
        if (err && (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
          if (typeof Utils !== 'undefined') {
            Utils.toast('Storage limit reached! Please backup and clear some data.', 'error');
          }
        }
      };
    } catch (e) {
      console.error(`[DB] Async write failed for key: ${key}`, e);
    }
  },

  _asyncDelete(key) {
    if (!this._db) return;
    try {
      const transaction = this._db.transaction(['keyvalue'], 'readwrite');
      const store = transaction.objectStore('keyvalue');
      store.delete(key);
    } catch (e) {
      console.error(`[DB] Async delete failed for key: ${key}`, e);
    }
  },

  _asyncClear() {
    if (!this._db) return;
    try {
      const transaction = this._db.transaction(['keyvalue'], 'readwrite');
      const store = transaction.objectStore('keyvalue');
      store.clear();
    } catch (e) {
      console.error('[DB] Async clear failed:', e);
    }
  },

  get(key) {
    const val = this._cache[key];
    if (!val) return null;
    try {
      return JSON.parse(val);
    } catch {
      return null;
    }
  },

  set(key, val) {
    try {
      const strVal = JSON.stringify(val);
      this._cache[key] = strVal;

      if (key === 'lamim_lang' || key === 'lamim_settings') {
        try { localStorage.setItem(key, strVal); } catch {}
      }

      this._asyncWrite(key, strVal);
      if (this._channel) {
        try { this._channel.postMessage({ type: 'set', key, val: strVal }); } catch(err) {}
      }
      return true;
    } catch (e) {
      console.error(`[DB] Error in set for key: ${key}`, e);
      return false;
    }
  },

  remove(key) {
    delete this._cache[key];
    if (key === 'lamim_lang' || key === 'lamim_settings' || key === 'lamim_cache_cleared_v36') {
      try { localStorage.removeItem(key); } catch {}
    }
    this._asyncDelete(key);
    if (this._channel) {
      try { this._channel.postMessage({ type: 'remove', key }); } catch(err) {}
    }
  },

  rawGet(key) {
    return key in this._cache ? this._cache[key] : null;
  },

  rawSet(key, val) {
    try {
      this._cache[key] = val;

      if (key === 'lamim_lang' || key === 'lamim_settings' || key === 'lamim_cache_cleared_v36') {
        try { localStorage.setItem(key, val); } catch {}
      }

      this._asyncWrite(key, val);
      if (this._channel) {
        try { this._channel.postMessage({ type: 'set', key, val }); } catch(err) {}
      }
      return true;
    } catch (e) {
      console.error(`[DB] Error in rawSet for key: ${key}`, e);
      return false;
    }
  },

  clear() {
    this._cache = {};
    try { localStorage.clear(); } catch {}
    this._asyncClear();
    if (this._channel) {
      try { this._channel.postMessage({ type: 'clear' }); } catch(err) {}
    }
  },

  keys() {
    return Object.keys(this._cache);
  },

  // User
  getUser()      { return this.get('lamim_user'); },
  setUser(u)     { return this.set('lamim_user', u); },
  clearUser()    { this.remove('lamim_user'); },
  
  clearAllUserData() {
    const keys = this.keys();
    keys.forEach(k => {
      if (k.startsWith('lamim_') && k !== 'lamim_settings') {
        this.remove(k);
      }
    });
  },

  // Settings
  getSettings()  {
    const defaultTheme = (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
    return this.get('lamim_settings') || { theme: defaultTheme, notifications: true, jumuahMode: true, language: 'en', currency: 'USD', lat: 23.8103, lng: 90.4125, calcMethod: 'mwl' };
  },
  setSettings(s) { return this.set('lamim_settings', s); },

  // Salah — keyed by date YYYY-MM-DD
  getSalah(date)  { return this.get(`lamim_salah_${date}`) || { fajr: null, dhuhr: null, asr: null, maghrib: null, isha: null, tahajjud: false, jummah: false, notes: {} }; },
  setSalah(date, d) { 
    const res = this.set(`lamim_salah_${date}`, d); 
    this._streakCache = null; // Invalidate streak cache
    this.refreshSpiritScore();
    return res;
  },

  // Dhikr — keyed by date
  getDhikr(date)  { return this.get(`lamim_dhikr_${date}`) || {}; },
  setDhikr(date, d) { 
    const res = this.set(`lamim_dhikr_${date}`, d);
    this.refreshSpiritScore();
    return res;
  },

  // Goals
  getGoals()     { return this.get('lamim_goals') || []; },
  setGoals(g)    { return this.set('lamim_goals', g); },
  
  // Mujahid
  getMujahid()    { return this.get('lamim_mujahid_habits') || []; },
  setMujahid(h)   {
    const res = this.set('lamim_mujahid_habits', h);
    this.refreshSpiritScore();
    return res;
  },
  addGoal(goal)  { const g = this.getGoals(); g.push(goal); return this.setGoals(g); },
  updateGoal(id, patch) {
    const goals = this.getGoals();
    const idx = goals.findIndex(g => g.id === id);
    if (idx !== -1) { goals[idx] = { ...goals[idx], ...patch }; this.setGoals(goals); }
  },
  deleteGoal(id) { this.setGoals(this.getGoals().filter(g => g.id !== id)); },

  // Dhikr custom presets
  getDhikrPresets() { return this.get('lamim_dhikr_presets') || []; },
  setDhikrPresets(p) { return this.set('lamim_dhikr_presets', p); },

  _streakCache: null,
  getSalahStreak() {
    const today = Utils.todayStr();
    if (this._streakCache && this._streakCache.date === today) {
      return this._streakCache.data;
    }

    let perfect = 0; let consistency = 0;
    let perfectActive = true; let consistencyActive = true;
    let d = Utils.getOffsetDate();
    
    for (let i = 0; i < 365; i++) {
      const ds = Utils.dateStr(d);
      const salah = this.getSalah(ds);
      let done = 0;
      ['fajr','dhuhr','asr','maghrib','isha'].forEach(p => { 
        if (salah[p] && salah[p] !== 'missed') done++; 
      });
      
      const isPerfect = done === 5;
      const isConsistent = done >= 4;

      if (ds === today) {
        if (isPerfect) perfect++;
        if (isConsistent) consistency++;
      } else {
        if (perfectActive) {
          if (isPerfect) perfect++; else perfectActive = false;
        }
        if (consistencyActive) {
          if (isConsistent) consistency++; else consistencyActive = false;
        }
      }
      
      if (!perfectActive && !consistencyActive) break;
      d.setDate(d.getDate() - 1);
    }
    
    const result = { perfect, consistency };
    this._streakCache = { date: today, data: result };
    return result;
  },

  // Salah history for last N days (LIFO - newest first)
  getSalahHistory(days = 30) {
    const result = [];
    const d = Utils.getOffsetDate();
    for (let i = days - 1; i >= 0; i--) {
      const dd = new Date(d); dd.setDate(d.getDate() - i);
      const ds = Utils.dateStr(dd);
      result.push({ date: ds, data: this.getSalah(ds) });
    }
    return result.reverse();
  },

  // Dhikr history
  getDhikrHistory(days = 30) {
    const result = [];
    const d = typeof Utils.getOffsetDate === 'function' ? Utils.getOffsetDate() : new Date();
    for (let i = days - 1; i >= 0; i--) {
      const dd = new Date(d); dd.setDate(d.getDate() - i);
      const ds = Utils.dateStr(dd);
      const dhikr = this.getDhikr(ds);
      const total = Object.values(dhikr).reduce((a, b) => a + (b || 0), 0);
      result.push({ date: ds, total });
    }
    return result;
  },

  refreshSpiritScore() {
    if (this._shsDebounce) clearTimeout(this._shsDebounce);
    this._shsDebounce = setTimeout(() => {
      if (typeof Analysis !== 'undefined' && Analysis.calculateSHS) {
        const shs = Analysis.calculateSHS();
        const user = this.getUser();
        const roundedScore = Math.round(shs.total || 0);
        if (user && (user.spirit_score !== roundedScore || user.spirit_level !== shs.rating.label)) {
          user.spirit_score = roundedScore;
          user.spirit_level = shs.rating.label;
          this.setUser(user);
        }
      }
    }, 500);
  },

  // Finance & Zakat
  getFinance() { return this.get('lamim_finance') || { nisab: 600, cash: 0, gold: 0, silver: 0, business: 0, stocks: 0, debts: [], savings_goals: [] }; },
  setFinance(d) { return this.set('lamim_finance', d); },

  // Migration & Housekeeping
  migrate() {
    const oldFin = this.rawGet('lamim_finance_data');
    if (oldFin) {
      if (!this.rawGet('lamim_finance')) {
        this.rawSet('lamim_finance', oldFin);
        console.log("Finance data migrated to new key.");
      }
      this.remove('lamim_finance_data');
    }
    
    console.log("LAMIM: Storage housekeeping complete.");
  }
};

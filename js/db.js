/* =============================================
   LAMIM — DB LAYER (IndexedDB Cache Engine)
   ============================================= */
const DB = {
  _cache: {},
  _db: null,

  init() {
    return new Promise((resolve) => {
      // 1. Open IndexedDB
      let request;
      try {
        request = indexedDB.open('lamim_db', 1);
      } catch (err) {
        console.error("IndexedDB.open failed, falling back to localStorage", err);
        this._fallbackToLocalStorage();
        resolve();
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
            resolve();
          })
          .catch((err) => {
            console.error("IndexedDB cache loading/migration failed, falling back", err);
            this._fallbackToLocalStorage();
            resolve();
          });
      };

      request.onerror = (e) => {
        console.error("IndexedDB onerror, falling back to localStorage", e);
        this._fallbackToLocalStorage();
        resolve();
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
      return true;
    } catch (e) {
      console.error(`[DB] Error in set for key: ${key}`, e);
      return false;
    }
  },

  remove(key) {
    delete this._cache[key];
    if (key === 'lamim_lang' || key === 'lamim_settings') {
      try { localStorage.removeItem(key); } catch {}
    }
    this._asyncDelete(key);
  },

  rawGet(key) {
    return key in this._cache ? this._cache[key] : null;
  },

  rawSet(key, val) {
    try {
      this._cache[key] = val;

      if (key === 'lamim_lang' || key === 'lamim_settings') {
        try { localStorage.setItem(key, val); } catch {}
      }

      this._asyncWrite(key, val);
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
  getSettings()  { return this.get('lamim_settings') || { theme: 'light', notifications: true, jumuahMode: true, language: 'en', currency: 'USD', lat: 23.8103, lng: 90.4125, calcMethod: 'mwl' }; },
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

/* =============================================
   LAMIM — DB LAYER (localStorage abstraction)
   ============================================= */
const DB = {
  get(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
  set(key, val) { 
    try { 
      localStorage.setItem(key, JSON.stringify(val)); 
      return true; 
    } catch (e) { 
      if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        if (typeof Utils !== 'undefined') Utils.toast('Storage limit reached! Please backup and clear some data.', 'error');
        console.error('LAMIM DB: QuotaExceededError', e);
      }
      return false; 
    } 
  },
  remove(key) { localStorage.removeItem(key); },
  rawGet(key) { return localStorage.getItem(key); },
  rawSet(key, val) { localStorage.setItem(key, val); return true; },
  clear() { localStorage.clear(); },
  keys() { return Object.keys(localStorage); },

  // User
  getUser()      { return this.get('lamim_user'); },
  setUser(u, skipSync = false)     { 
    const res = this.set('lamim_user', u); 
    if (res && !skipSync && window.Sync) window.Sync.queueSync('profile', 'all', u);
    return res;
  },
  clearUser()    { this.remove('lamim_user'); },
  
  clearAllUserData() {
    // Clear all local data except settings (so theme/currency preferences remain)
    const keys = Object.keys(localStorage);
    keys.forEach(k => {
      if (k.startsWith('lamim_') && k !== 'lamim_settings') {
        localStorage.removeItem(k);
      }
    });
  },

  // Settings
  getSettings()  { return this.get('lamim_settings') || { theme: 'dark', notifications: true, jumuahMode: true, language: 'en', currency: 'USD', lat: 23.8103, lng: 90.4125 }; },
  setSettings(s, skipSync = false) { 
    const res = this.set('lamim_settings', s); 
    if (res && !skipSync && window.Sync) window.Sync.queueSync('settings', 'all', s);
    return res;
  },

  // Salah — keyed by date YYYY-MM-DD
  getSalah(date)  { return this.get(`lamim_salah_${date}`) || { fajr: null, dhuhr: null, asr: null, maghrib: null, isha: null, tahajjud: false, jummah: false, notes: {} }; },
  setSalah(date, d, skipSync = false) { 
    const res = this.set(`lamim_salah_${date}`, d); 
    if (res && !skipSync && window.Sync) {
      window.Sync.queueSync('salah', date, d);
    }
    this._streakCache = null; // Invalidate streak cache
    this.refreshSpiritScore();
    return res;
  },

  // Dhikr — keyed by date
  getDhikr(date)  { return this.get(`lamim_dhikr_${date}`) || {}; },
  setDhikr(date, d, skipSync = false) { 
    const res = this.set(`lamim_dhikr_${date}`, d);
    if (res && !skipSync && window.Sync) {
      window.Sync.queueSync('dhikr', date, d);
    }
    this.refreshSpiritScore();
    return res;
  },

  // Goals
  getGoals()     { return this.get('lamim_goals') || []; },
  setGoals(g, skipSync = false)    { 
    const res = this.set('lamim_goals', g); 
    if (res && !skipSync && window.Sync) {
      window.Sync.queueSync('goals', 'all', g);
    }
    return res;
  },
  
  // Mujahid
  getMujahid()    { return this.get('lamim_mujahid_habits') || []; },
  setMujahid(h, skipSync = false) {
    const res = this.set('lamim_mujahid_habits', h);
    if (res && !skipSync && window.Sync) {
      window.Sync.queueSync('mujahid', 'all', h);
    }
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
  setDhikrPresets(p, skipSync = false) { 
    const res = this.set('lamim_dhikr_presets', p); 
    if (res && !skipSync && window.Sync) window.Sync.queueSync('dhikr_presets', 'all', p);
    return res;
  },

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
    const d = new Date();
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
  setFinance(d, skipSync = false) { 
    const res = this.set('lamim_finance', d); 
    if (res && !skipSync && window.Sync) {
      window.Sync.queueSync('finance', 'all', d);
    }
    return res;
  },

  // Migration & Housekeeping
  migrate() {
    // 1. Finance Migration: lamim_finance_data -> lamim_finance
    const oldFin = localStorage.getItem('lamim_finance_data');
    if (oldFin) {
      if (!localStorage.getItem('lamim_finance')) {
        localStorage.setItem('lamim_finance', oldFin);
        console.log("Finance data migrated to new sync-ready key.");
      }
      localStorage.removeItem('lamim_finance_data');
    }
    
    // 2. Clean up any other dead keys if found in the future
    console.log("LAMIM: Storage housekeeping complete.");
  }
};

// Auto-run migration on load
DB.migrate();

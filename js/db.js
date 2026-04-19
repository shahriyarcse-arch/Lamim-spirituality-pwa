/* =============================================
   LAMIM — DB LAYER (localStorage abstraction)
   ============================================= */
const DB = {
  get(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
  set(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch { return false; } },
  remove(key) { localStorage.removeItem(key); },

  // User
  getUser()      { return this.get('lamim_user'); },
  setUser(u)     { return this.set('lamim_user', u); },
  clearUser()    { this.remove('lamim_user'); },

  // Settings
  getSettings()  { return this.get('lamim_settings') || { theme: 'dark', notifications: true, madhab: 'Hanafi', calcMethod: 'MWL', language: 'en' }; },
  setSettings(s) { return this.set('lamim_settings', s); },

  // Salah — keyed by date YYYY-MM-DD
  getSalah(date)  { return this.get(`lamim_salah_${date}`) || { fajr: null, dhuhr: null, asr: null, maghrib: null, isha: null, tahajjud: false, jummah: false, notes: {} }; },
  setSalah(date, d) { return this.set(`lamim_salah_${date}`, d); },

  // Dhikr — keyed by date
  getDhikr(date)  { return this.get(`lamim_dhikr_${date}`) || {}; },
  setDhikr(date, d) { return this.set(`lamim_dhikr_${date}`, d); },

  // Goals
  getGoals()     { return this.get('lamim_goals') || []; },
  setGoals(g)    { return this.set('lamim_goals', g); },
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

  // Streak
  getSalahStreak() {
    const today = Utils.todayStr();
    let perfect = 0; let consistency = 0;
    let perfectActive = true; let consistencyActive = true;
    let d = new Date();
    
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
    return { perfect, consistency };
  },

  // Salah history for last N days
  getSalahHistory(days = 30) {
    const result = [];
    const d = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const dd = new Date(d); dd.setDate(d.getDate() - i);
      const ds = Utils.dateStr(dd);
      result.push({ date: ds, data: this.getSalah(ds) });
    }
    return result;
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

  // Akhlaq (Habits & Sunnahs) - keyed by date
  getAkhlaq(date) { return this.get(`lamim_akhlaq_${date}`) || { morning_adhkar: false, evening_adhkar: false, gratitude: ['', '', ''], wudu_sleep: false, sadaqah: 0, bad_habit_avoided: false, rating: 0 }; },
  setAkhlaq(date, d) { return this.set(`lamim_akhlaq_${date}`, d); },

  // Finance & Zakat
  getFinance() { return this.get('lamim_finance') || { nisab: 600, cash: 0, gold: 0, silver: 0, business: 0, stocks: 0, debts: [], savings_goals: [] }; },
  setFinance(d) { return this.set('lamim_finance', d); },

  // Tazkiyah (Mental Health) - keyed by date
  getTazkiyah(date) { return this.get(`lamim_tazkiyah_${date}`) || { mood: null, letting_go: '', anger_managed: false, ruqyah: false }; },
  setTazkiyah(date, d) { return this.set(`lamim_tazkiyah_${date}`, d); },
  getTazkiyahHistory(days = 7) {
    const result = [];
    const d = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const dd = new Date(d); dd.setDate(d.getDate() - i);
      const ds = Utils.dateStr(dd);
      result.push({ date: ds, data: this.getTazkiyah(ds) });
    }
    return result;
  },

  // Ilm (Knowledge Library)
  getIlm() { return this.get('lamim_ilm') || { memorized_duas: [], reading_books: [], notes: [] }; },
  setIlm(d) { return this.set('lamim_ilm', d); }
};

/* =============================================
   LAMIM — UTILITIES
   ============================================= */
const Utils = {
  // 3:00 AM Offset (Waking Day logic)
  // If the time is before 3:00 AM, it counts as the previous calendar day.
  getOffsetDate() {
    return new Date(Date.now() - (3 * 60 * 60 * 1000));
  },

  todayStr() { 
    return this.dateStr(this.getOffsetDate()); 
  },

  // Use local date components to avoid timezone shift
  dateStr(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  },

  formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  },

  escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  },

  timeToMin(date) {
    return date.getHours() * 60 + date.getMinutes();
  },

  formatDate(date, opts = {}) {
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', ...opts });
  },

  // Hijri date (simple approximation)
  toHijri(date) {
    const settings = DB.getSettings();
    const offset = settings.hijriOffset || 0;
    
    // Convert to modified Julian Day
    const jd = Math.floor((date.getTime() / 86400000) + 2440588) + offset;
    let l = jd - 1948440 + 10632;
    const n = Math.floor((l - 1) / 10631);
    l = l - 10631 * n + 354;
    const j = (Math.floor((10985 - l) / 5316)) * (Math.floor((50 * l) / 17719)) +
              (Math.floor(l / 5670)) * (Math.floor((43 * l) / 15238));
    l = l - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) -
        (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
    const month = Math.floor((24 * l) / 709);
    const day = l - Math.floor((709 * month) / 24);
    const year = 30 * n + j - 30;
    const months = ['Muharram','Safar','Rabi al-Awwal','Rabi al-Thani','Jumada al-Awwal','Jumada al-Thani','Rajab',"Sha'ban",'Ramadan','Shawwal',"Dhu al-Qi'dah",'Dhu al-Hijjah'];
    let monthName = months[month - 1];
    let dateStr = `${day} ${monthName} ${year} AH`;
    
    if (typeof App !== 'undefined' && App.lang === 'bn') {
      const bnMonths = ['মুহাররম','সফর','রবিউল আউয়াল','রবিউস সানি','জুমাদাল উলা','জুমাদাস সানি','রজব','শাবান','রমজান','শাওয়াল','জিলকদ','জিলহজ'];
      monthName = bnMonths[month - 1];
      const bnNums = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
      const bnDay = String(day).split('').map(d => bnNums[d]).join('');
      const bnYear = String(year).split('').map(d => bnNums[d]).join('');
      dateStr = `${bnDay} ${monthName} ${bnYear} হিজরি`;
    } else if (typeof window.t === 'function') {
      monthName = window.t(monthName);
      dateStr = `${day} ${monthName} ${year} AH`;
    }
    
    return dateStr;
  },

  /* ---- Accurate Prayer Times (Sun-angle based) ---- */
  _cachedTimes: null,
  _cachedTimesAt: 0,
  calcPrayerTimes() {
    const nowMs = Date.now();
    // Cache for 1 minute
    if (this._cachedTimes && nowMs - this._cachedTimesAt < 60000) {
      return this._cachedTimes;
    }
    
    const settings = DB.getSettings();
    
    // Fallback coordinates (Dhaka)
    let lat = settings.lat || 23.8103;
    let lng = settings.lng || 90.4125;

    // Automatic Location Detection (if not set)
    if (!settings.lat && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const newSettings = { ...settings, lat: pos.coords.latitude, lng: pos.coords.longitude };
        DB.setSettings(newSettings);
        window.dispatchEvent(new CustomEvent('lamim:data-updated'));
      }, null, { timeout: 5000 });
    }
    
    const now = new Date();
    const dayOfYear = this._dayOfYear(now);
    const tzOffset = now.getTimezoneOffset() / -60;

    // Solar calculations
    const D = dayOfYear;
    const g = 357.529 + 0.98560028 * D; // mean anomaly
    const gRad = g * Math.PI / 180;
    const q = 280.459 + 0.98564736 * D;
    const L = q + 1.915 * Math.sin(gRad) + 0.020 * Math.sin(2 * gRad); // ecliptic longitude
    const LRad = L * Math.PI / 180;
    const e = 23.439 - 0.00000036 * D; // obliquity
    const eRad = e * Math.PI / 180;
    const decl = Math.asin(Math.sin(eRad) * Math.sin(LRad)); // declination
    
    // Equation of time (simplified)
    const RA = Math.atan2(Math.cos(eRad) * Math.sin(LRad), Math.cos(LRad));
    const EqT = (q - (RA * 180 / Math.PI)) / 360 * 24 * 60; // in minutes
    const eqtCorrected = ((EqT % 1440) + 1440) % 1440;
    const eqt = eqtCorrected > 720 ? eqtCorrected - 1440 : eqtCorrected;

    // Dhuhr (solar noon)
    const dhuhr = 12 + (-lng / 15) - (eqt / 60) + tzOffset;

    const latRad = lat * Math.PI / 180;

    // Helper: hour angle for a given sun altitude
    const hourAngle = (angle) => {
      const angleRad = angle * Math.PI / 180;
      const cosHA = (Math.sin(angleRad) - Math.sin(latRad) * Math.sin(decl)) /
                    (Math.cos(latRad) * Math.cos(decl));
      if (cosHA > 1 || cosHA < -1) return 0;
      return Math.acos(cosHA) * 180 / Math.PI / 15; // in hours
    };

    // Fajr: Sun at -18° (Muslim World League)
    const fajrHA = hourAngle(-18);
    const fajr = dhuhr - fajrHA;

    // Asr: Hanafi method (shadow = 2x object + noon shadow)
    const asrAngle = Math.atan(1 / (2 + Math.tan(Math.abs(latRad - decl)))) * 180 / Math.PI;
    const asrHA = hourAngle(asrAngle);
    const asr = dhuhr + asrHA;

    // Maghrib: Sun at -0.833° (accounting for refraction)
    const maghribHA = hourAngle(-0.833);
    const maghrib = dhuhr + maghribHA;

    // Isha: Sun at -17° (MWL)
    const ishaHA = hourAngle(-17);
    const isha = dhuhr + ishaHA;

    const makeTime = (hours) => {
      const h = Math.floor(hours);
      const m = Math.round((hours - h) * 60);
      const d = new Date(now);
      d.setHours(h, m, 0, 0);
      return d;
    };

    const times = [
      { name: 'fajr',    time: makeTime(fajr),    label: this.formatTime(makeTime(fajr)) },
      { name: 'dhuhr',   time: makeTime(dhuhr),   label: this.formatTime(makeTime(dhuhr)) },
      { name: 'asr',     time: makeTime(asr),     label: this.formatTime(makeTime(asr)) },
      { name: 'maghrib', time: makeTime(maghrib), label: this.formatTime(makeTime(maghrib)) },
      { name: 'isha',    time: makeTime(isha),     label: this.formatTime(makeTime(isha)) },
    ];
    this._cachedTimes = times;
    this._cachedTimesAt = nowMs;
    return times;
  },

  _dayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    return Math.floor(diff / 86400000);
  },

  getNextPrayer(times) {
    const now = new Date();
    for (const t of times) {
      if (t.time > now) return t;
    }
    // After Isha, next is tomorrow's Fajr — approximate by adding 24h
    const tomorrowFajr = new Date(times[0].time);
    tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
    return { ...times[0], time: tomorrowFajr, label: times[0].label };
  },

  countdownTo(target) {
    const now = Date.now();
    const diff = target.getTime() - now;
    if (diff <= 0) return '00:00:00';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  },

  uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); },

  // Toast
  toast(msg, type = 'info', duration = 3000) {
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    const container = document.getElementById('toast-container');
    if (!container) return;
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `<span class="toast-icon">${icons[type]}</span><span>${msg}</span>`;
    container.appendChild(el);
    setTimeout(() => { el.classList.add('hiding'); setTimeout(() => el.remove(), 350); }, duration);
  },

  // Confetti
  confetti() {
    const colors = ['#d4a843','#f0c456','#3fb950','#58a6ff','#bc8cff','#f85149'];
    for (let i = 0; i < 60; i++) {
      setTimeout(() => {
        const el = document.createElement('div');
        el.className = 'confetti-piece';
        const size = Math.random() * 10 + 6;
        el.style.cssText = `
          left:${Math.random()*100}vw; width:${size}px; height:${size}px;
          background:${colors[Math.floor(Math.random()*colors.length)]};
          animation-delay:${Math.random()*1}s;
          animation-duration:${2 + Math.random()*1.5}s;
        `;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 4000);
      }, i * 30);
    }
  },

  // Date display
  getDayName(dateStr) {
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    return days[new Date(dateStr + 'T00:00:00').getDay()];
  },

  // Salah completion score for a day
  salahScore(salahData) {
    const prayers = ['fajr','dhuhr','asr','maghrib','isha'];
    let done = 0;
    let pctScore = 0;
    prayers.forEach(p => { 
      const s = salahData[p];
      if (s && s !== 'missed') {
        done++;
        if (s === 'jamaat' || s === 'alone') pctScore += 20;
        else if (s === 'qaza') pctScore += 10;
      }
    });
    return { done, total: 5, pct: pctScore };
  },

  // Motivational quotes
  getQuote() {
    const quotes = [
      { arabic: 'إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا', translation: 'Indeed, prayer has been decreed upon the believers a decree of specified times. (4:103)' },
      { arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ', translation: 'Verily, in the remembrance of Allah do hearts find rest. (13:28)' },
      { arabic: 'وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ', translation: 'Seek help through patience and prayer. (2:45)' },
      { arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا', translation: 'Indeed, with hardship comes ease. (94:6)' },
      { arabic: 'رَبِّ اشْرَحْ لِي صَدْرِي', translation: 'My Lord, expand for me my breast. (20:25)' },
    ];
    return quotes[new Date().getDate() % quotes.length];
  },

  // Accurate Confirmation Modal
  confirm(title, msg, onConfirm, type = 'warning') {
    const modal = document.getElementById('confirm-modal');
    const titleEl = document.getElementById('confirm-title');
    const msgEl = document.getElementById('confirm-msg');
    const iconEl = document.getElementById('confirm-icon-box');
    const btn = document.getElementById('confirm-yes-btn');
    
    if (!modal || !titleEl || !msgEl || !btn) {
      if (window.confirm(msg)) onConfirm();
      return;
    }

    const types = {
      danger: { icon: '🗑️', color: '#ff3b30', bg: 'rgba(255, 59, 48, 0.1)', btn: '#ff3b30' },
      warning: { icon: '⚠️', color: '#ff9500', bg: 'rgba(255, 149, 0, 0.1)', btn: '#ff9500' },
      info: { icon: 'ℹ️', color: '#007aff', bg: 'rgba(0, 122, 255, 0.1)', btn: '#007aff' }
    };

    const config = types[type] || types.warning;
    
    titleEl.textContent = title;
    msgEl.textContent = msg;
    if (iconEl) {
      iconEl.textContent = config.icon;
      iconEl.style.color = config.color;
      iconEl.style.background = config.bg;
    }
    btn.style.background = config.btn;

    modal.classList.remove('hidden');

    btn.onclick = () => {
      this.closeConfirm();
      onConfirm();
    };
  },

  closeConfirm() {
    const modal = document.getElementById('confirm-modal');
    if (modal) modal.classList.add('hidden');
  },

  timeAgo(d) {
    if (!d) return '—';
    const s = (Date.now() - new Date(d).getTime()) / 1000;
    if (s < 0) return 'now';
    if (s < 60) return 'now';
    if (s < 3600) return Math.floor(s / 60) + 'm ago';
    if (s < 86400) return Math.floor(s / 3600) + 'h ago';
    if (s < 604800) return Math.floor(s / 86400) + 'd ago';
    return new Date(d).toLocaleDateString();
  },

  // NOTE: escapeHTML is defined once above (line 27). Do NOT add it again here.

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

const UI = {
  showSettingsModal(opts) {
    const modal = document.getElementById('section-settings-modal');
    const title = document.getElementById('settings-modal-title');
    const desc = document.getElementById('settings-modal-desc');
    const confirmBtn = document.getElementById('settings-confirm-btn');
    const iconOrb = document.getElementById('settings-modal-icon');

    if (!modal) return;

    if (opts.title) title.textContent = opts.title;
    if (opts.desc) desc.textContent = opts.desc;
    if (opts.confirmText) confirmBtn.textContent = opts.confirmText;
    
    // Dynamic Icon/Color
    if (opts.type === 'danger') {
      iconOrb.style.background = 'rgba(248,113,113,0.1)';
      iconOrb.style.color = '#f87171';
      confirmBtn.style.background = '#f87171';
    }

    // Set callback
    confirmBtn.onclick = () => {
      if (opts.onConfirm) opts.onConfirm();
      this.hideSettingsModal();
    };

    modal.classList.remove('hidden');
  },

  hideSettingsModal() {
    const modal = document.getElementById('section-settings-modal');
    if (modal) modal.classList.add('hidden');
  }
};

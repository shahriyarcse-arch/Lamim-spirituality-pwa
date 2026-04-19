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

  formatDate(date, opts = {}) {
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', ...opts });
  },

  // Hijri date (simple approximation)
  toHijri(date) {
    const jd = Math.floor((date.getTime() / 86400000) + 2440588);
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
    return `${day} ${months[month - 1]} ${year} AH`;
  },

  /* ---- Accurate Prayer Times (Sun-angle based for Dhaka, BD) ---- */
  calcPrayerTimes(lat = 23.8103, lng = 90.4125) {
    const now = new Date();
    const dayOfYear = this._dayOfYear(now);
    const tzOffset = now.getTimezoneOffset() / -60; // +6 for BD

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
  }
};

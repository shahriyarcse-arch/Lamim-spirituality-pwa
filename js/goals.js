/* =============================================
   LAMIM — NAFL SALAH MODULE
   ============================================= */
// Cache migration: ensure sparkle/confetti exist even if stale utils.js served
if (!Utils.sparkle) Utils.sparkle = function() {};
if (!Utils.confetti) Utils.confetti = function() {};

const Goals = {
  currentDate: Utils.todayStr(),

  sunnahList: [
    {
      id: 'fajr_s', label: 'Fajr', rakat: 2,
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M18 22H6M12 18V2M4.93 10.93l1.41 1.41M17.66 10.93l-1.41 1.41M2 18h20M16 18a4 4 0 0 0-8 0"/></svg>`,
      glow: '0 4px 12px rgba(244,114,182,0.3)'
    },
    {
      id: 'dhuhr_s_b', label: 'Dhuhr (B)', rakat: 4,
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M5.64 18.36l-1.42 1.42M19.78 4.22l-1.42 1.42"/></svg>`,
      glow: '0 4px 12px rgba(251,191,36,0.3)'
    },
    {
      id: 'dhuhr_s_a', label: 'Dhuhr (A)', rakat: 2,
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="6"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`,
      glow: '0 4px 12px rgba(255,138,0,0.3)'
    },
    {
      id: 'maghrib_s', label: 'Maghrib', rakat: 2,
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M12 2v2M4.93 4.93l1.41 1.41M17.66 4.93l-1.41 1.41M2 18h20M16 18a4 4 0 0 0-8 0"/></svg>`,
      glow: '0 4px 12px rgba(168,85,247,0.3)'
    },
    {
      id: 'isha_s', label: 'Isha', rakat: 2,
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
      glow: '0 4px 12px rgba(99,102,241,0.3)'
    },
  ],

  init() {
    this.render(false);
    if (!this._dataUpdateBound) {
      window.addEventListener('lamim:data-updated', () => {
        if (document.getElementById('section-nafl')?.classList.contains('active')) {
          this.render(true);
        }
      });
      this._dataUpdateBound = true;
    }
  },

  render(skipAnim = false) {
    this.updateHomeSummary();

    const isToday = this.currentDate === Utils.todayStr();
    const label = document.getElementById('nafl-date-label');
    if (label) {
      if (isToday) {
        label.textContent = window.t ? window.t('Today') : 'Today';
      } else {
        label.textContent = Utils.formatDate(new Date(this.currentDate + 'T00:00:00'), {month:'short', day:'numeric'});
      }
    }

    // TEMPORAL LOCK: Use explicit ID
    const nextBtn = document.getElementById('nafl-next-btn');
    if (nextBtn) {
      nextBtn.style.display = isToday ? 'none' : 'flex';
    }

    const data = DB.getSalah(this.currentDate);
    if (!data.sunnah) data.sunnah = {};
    if (data.witr === undefined) data.witr = 0;
    if (data.tahajjud_rakat === undefined) data.tahajjud_rakat = 0;

    this.renderSunnah(data.sunnah, skipAnim);
    this.renderTahajjud(data.tahajjud, data.tahajjud_rakat);
    this.renderWitr(data.witr);
    this.renderCelestialProgress(data, skipAnim);
  },

  renderCelestialProgress(data, skipAnim = false) {
    const hero = document.getElementById('nafl-hero-banner');
    if (!hero) return;
    
    // Calculate Completion
    let done = 0;
    if (data.sunnah) Object.values(data.sunnah).forEach(v => { if (v === true || v === 'prayed') done++; });
    if (data.tahajjud_rakat > 0) done++;
    if (data.witr > 0) done++;
    
    const total = this.sunnahList.length + 2;
    const pct = (done / total) * 100;

    const deedsTemplate = window.t ? window.t('{done} / {total} Deeds Complete') : '{done} / {total} Deeds Complete';
    const doneTrans = window.n ? window.n(done) : done;
    const totalTrans = window.n ? window.n(total) : total;
    const progressText = deedsTemplate.replace('{done}', doneTrans).replace('{total}', totalTrans);
    
    hero.innerHTML = `
      <div class="nafl-celestial-glass ${skipAnim ? '' : 'anim-scale-up'}">
        <div class="celestial-moon-wrap">
          <div class="celestial-moon-glow" style="opacity: ${0.2 + (pct/200)}"></div>
          <svg class="celestial-moon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="rgba(255,255,255,${0.1 + (pct/200)})" />
          </svg>
        </div>
        <div class="nafl-hero-content">
          <h1 class="nafl-hero-title">${window.t ? window.t('Celestial Deeds') : 'Celestial Deeds'}</h1>
          <p class="nafl-hero-subtitle">${window.t ? window.t('Light up your path with Sunnah & Nafl') : 'Light up your path with Sunnah & Nafl'}</p>
          <div class="nafl-progress-track">
            <div class="nafl-progress-bar" style="width: ${pct}%"></div>
          </div>
          <div class="nafl-progress-stat">${progressText}</div>
        </div>
      </div>
    `;
  },

  // --- DASHBOARD SUMMARY ---
  updateHomeSummary() {
    const today = Utils.todayStr();
    const salah = DB.getSalah(today);
    const dhikr = DB.getDhikr(today);

    let sCount = 0;
    ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].forEach(p => { if (salah[p] && salah[p] !== 'missed') sCount++; });
    const dTotal = Object.values(dhikr).reduce((a, b) => a + (b || 0), 0);

    const sEl = document.getElementById('journey-salah-focus');
    const dEl = document.getElementById('journey-dhikr-focus');
    if (sEl) sEl.textContent = `${window.n ? window.n(sCount) : sCount} / ${window.n ? window.n(5) : 5}`;
    
    const dTotalFormatted = dTotal > 999 ? (dTotal / 1000).toFixed(1) + 'k' : dTotal;
    const dTotalTrans = window.n ? window.n(dTotalFormatted) : dTotalFormatted;
    if (dEl) dEl.textContent = `${dTotalTrans} / ${window.n ? window.n(100) : 100}`;

    const history = DB.getSalahHistory(7);
    let activeDays = history.filter(d => {
      let done = 0;
      ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].forEach(p => { if (d.data[p] && d.data[p] !== 'missed') done++; });
      return done >= 1;
    }).length;

    const mEl = document.getElementById('home-mentor-message');
    if (mEl) {
      let msg = "Start your day with Bismillah... ✨";
      if (activeDays >= 6) msg = "Excellent consistency this week! 🌟";
      else if (activeDays >= 3) msg = "You're building a strong habit. Keep it up! 🤍";
      else if (activeDays > 0) msg = "Every prayer is a step closer to peace. 🕊️";
      
      const msgTrans = window.t ? window.t(msg) : msg;
      mEl.textContent = `"${msgTrans}"`;
    }
  },

  // --- NAFL LOGIC ---
  changeDate(days) {
    const d = new Date(this.currentDate);
    d.setDate(d.getDate() + days);
    const nextDate = Utils.dateStr(d);
    if (nextDate > Utils.todayStr()) return;
    this.currentDate = nextDate;
    this.render(false); // Play animations on date change
  },

  resetToday() {
    const dateFormatted = Utils.formatDate(new Date(this.currentDate + 'T00:00:00'), {day:'numeric', month:'short'});
    const title = window.t ? window.t('Reset Nafl Data?') : 'Reset Nafl Data?';
    const msgTemplate = window.t ? window.t('Clear all Sunnah & Nafl records for {date}?') : 'Clear all Sunnah & Nafl records for {date}?';
    const msg = msgTemplate.replace('{date}', dateFormatted);

    Utils.confirm(
      title,
      msg,
      () => {
        const data = DB.getSalah(this.currentDate);
        // Explicitly clear all Nafl fields
        data.sunnah = {};
        data.tahajjud = false;
        data.tahajjud_rakat = 0;
        data.witr = 0;
        
        DB.setSalah(this.currentDate, data);
        window.dispatchEvent(new CustomEvent('lamim:data-updated'));
        this.render(true);
        Utils.toast(window.t ? window.t('Nafl data cleared') : 'Nafl data cleared', 'info');
        console.log("[Goals] Data reset for sync:", this.currentDate);
      },
      'danger'
    );
  },

  renderSunnah(sunnahData, skipAnim = false) {
    const container = document.getElementById('nafl-sunnah-grid');
    if (!container) return;
    const isFuture = this.currentDate > Utils.todayStr();

    container.innerHTML = this.sunnahList.map((item, idx) => {
      const status = sunnahData[item.id];
      const isLocked = status === 'prayed' || status === 'missed';
      const isPrayed = status === true || status === 'prayed';
      const isMissed = status === 'missed';
      const pts = 2;

      let bgGradient = item.id.includes('fajr') ? 'linear-gradient(135deg, #f472b6, #ec4899)' : item.id.includes('dhuhr') ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : item.id.includes('maghrib') ? 'linear-gradient(135deg, #a855f7, #8b5cf6)' : 'linear-gradient(135deg, #6366f1, #4f46e5)';

      const labelTrans = window.t ? window.t(item.label) : item.label;
      const rakatTrans = window.n ? window.n(item.rakat) : item.rakat;
      const typeTrans = window.t ? window.t("Sunnah Mu'akkadah") : "Sunnah Mu'akkadah";

      return `
        <div class="salah-prayer-card nafl-sunnah-card-modern ${skipAnim ? '' : 'anim-fade-in'} ${isLocked ? (isPrayed ? 'has-status status-jamaat active' : 'has-status status-missed') : ''}" 
             id="sunnah-card-${item.id}"
             style="${skipAnim ? '' : `animation-delay: ${idx * 0.04}s;`} ${isFuture ? 'opacity: 0.7; pointer-events: none;' : ''}">
          
          <!-- Prayer Header -->
          <div class="salah-prayer-header">
            <div class="salah-prayer-icon-wrap" style="background: ${bgGradient}; box-shadow: ${item.glow}">
              <span class="salah-prayer-emoji">${item.icon}</span>
            </div>
            <div class="salah-prayer-info">
              <div class="salah-prayer-name">${labelTrans}</div>
              <div class="salah-prayer-time">${rakatTrans} ${window.t ? window.t('Rakat') : 'Rakat'} · ${typeTrans}</div>
            </div>
            <div class="salah-prayer-status-badge">
               ${isLocked 
                 ? (isPrayed 
                     ? `<div class="salah-status-chip" style="background: rgba(52,211,153,0.15); border-color: rgba(52,211,153,0.4); color: #34d399; box-shadow: 0 0 12px rgba(52,211,153,0.4)">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg> ${window.t ? window.t('Prayed') : 'Prayed'}
                        </div>`
                     : `<div class="salah-status-chip" style="background: rgba(248,81,73,0.15); border-color: rgba(248,81,73,0.4); color: #f85149; box-shadow: 0 0 12px rgba(248,81,73,0.4)">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> ${window.t ? window.t('Missed') : 'Missed'}
                        </div>`)
                 : `<div class="salah-status-chip salah-status-pending">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${window.t ? window.t('Pending') : 'Pending'}
                    </div>`
               }
            </div>
          </div>

          <!-- Status Selection or Locked Result -->
          ${isLocked 
            ? `<div class="salah-locked-result" onclick="Goals.toggleSunnah('${item.id}')" style="cursor: pointer;">
                 <div class="salah-locked-icon" style="color: ${isPrayed ? '#34d399' : '#f85149'}; filter: drop-shadow(0 0 8px ${isPrayed ? 'rgba(52,211,153,0.5)' : 'rgba(248,81,73,0.5)'})">
                   ${isPrayed ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'}
                 </div>
                 <div class="salah-locked-info">
                   <div class="salah-locked-status" style="color: ${isPrayed ? '#34d399' : '#f85149'}">${isPrayed ? (window.t ? window.t('Sunnah Prayed') : 'Sunnah Prayed') : (window.t ? window.t('Sunnah Missed') : 'Sunnah Missed')}</div>
                   <div class="salah-locked-desc" style="display:flex;align-items:center;gap:3px">
                     ${isPrayed ? `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-accent-green);filter:drop-shadow(0 0 4px rgba(16,185,129,0.6))"><polyline points="20 6 9 17 4 12"></polyline></svg> ${window.t ? window.t('Successful') : 'Successful'}` : `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-accent-red);filter:drop-shadow(0 0 4px rgba(248,81,73,0.6))"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> ${window.t ? window.t('Unsuccessful') : 'Unsuccessful'}`}
                     <span style="opacity:0.5;margin:0 2px">•</span> +${isPrayed ? (window.n ? window.n(pts) : pts) : 0} ${window.t ? window.t('Points') : 'pts'}
                   </div>
                 </div>
                 <svg class="salah-lock-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: lockPulse 2s ease-in-out infinite"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
               </div>`
            : `<div class="salah-status-selector">
                 <div class="salah-options-label">${window.t ? window.t('Did you pray this Sunnah?') : 'Did you pray this Sunnah?'}</div>
                 <div class="salah-options-grid" style="grid-template-columns: repeat(2, 1fr);">
                    <button class="salah-option-btn" data-nafl="sunnah" data-id="${item.id}" data-action="prayed" style="border-color: rgba(52,211,153,0.3); background: rgba(52,211,153,0.05);">
                      <span class="salah-opt-icon" style="filter: drop-shadow(0 0 8px rgba(52,211,153,0.5)); display:flex; align-items:center; justify-content:center;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:20px; height:20px; color:#34d399"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/></svg></span>
                      <span class="salah-opt-label" style="color: #34d399; margin-top:4px;">${window.t ? window.t('Prayed') : 'Prayed'}</span>
                      <span class="salah-opt-desc">${typeTrans}</span>
                      <span class="salah-opt-pts">+${window.n ? window.n(pts) : pts} ${window.t ? window.t('Points') : 'pts'}</span>
                    </button>
                    <button class="salah-option-btn" data-nafl="sunnah" data-id="${item.id}" data-action="missed" style="border-color: rgba(248,81,73,0.3); background: rgba(248,81,73,0.05);">
                      <span class="salah-opt-icon" style="filter: drop-shadow(0 0 8px rgba(248,81,73,0.5)); display:flex; align-items:center; justify-content:center;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:20px; height:20px; color:#f85149"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></span>
                      <span class="salah-opt-label" style="color: #f85149; margin-top:4px;">${window.t ? window.t('Missed') : 'Missed'}</span>
                      <span class="salah-opt-desc">${window.t ? window.t('Not prayed') : 'Not prayed'}</span>
                      <span class="salah-opt-pts">+${window.n ? window.n(0) : 0} ${window.t ? window.t('Points') : 'pts'}</span>
                    </button>
                 </div>
               </div>`
          }
        </div>
      `;
    }).join('');
    container.querySelectorAll('[data-nafl="sunnah"]').forEach(btn => {
      console.log('[Goals] bind sunnah btn', btn.dataset.id, btn.dataset.action);
      btn.onclick = (e) => {
        e.preventDefault();
        console.log('[Goals] sunnah clicked', btn.dataset.id, btn.dataset.action);
        const id = btn.dataset.id;
        const action = btn.dataset.action;
        if (id && action) this.selectSunnah(id, action);
      };
    });
  },

  selectSunnah(id, status) {
    try {
      if (this.currentDate > Utils.todayStr()) {
        Utils.toast(window.t ? window.t("Cannot edit future dates") : "Cannot edit future dates", "error");
        return;
      }
      const data = DB.getSalah(this.currentDate);
      if (!data.sunnah) data.sunnah = {};
      const item = this.sunnahList.find(s => s.id === id);

      Utils.sparkle(document.getElementById('sunnah-card-' + id) || document.body, 4);

      data.sunnah[id] = status;
      DB.setSalah(this.currentDate, data);
      window.dispatchEvent(new CustomEvent('lamim:data-updated'));
      this.render(true);
      Utils.toast(window.t ? window.t('Sunnah recorded') : 'Sunnah recorded', 'success');

      // Check if all sunnah, tahajjud, witr complete
      const done = Object.values(data.sunnah || {}).filter(v => v === true || v === 'prayed').length;
      const allSunnah = done === this.sunnahList.length;
      if (allSunnah && data.tahajjud_rakat > 0 && data.witr > 0) {
        setTimeout(() => Utils.confetti(24), 400);
      }
    } catch(e) { console.error('[Goals] selectSunnah error:', e); }
  },

  toggleSunnah(id) {
    if (this.currentDate > Utils.todayStr()) {
      Utils.toast(window.t ? window.t("Cannot edit future dates") : "Cannot edit future dates", "error");
      return;
    }
    const data = DB.getSalah(this.currentDate);
    if (!data.sunnah) data.sunnah = {};
    const item = this.sunnahList.find(s => s.id === id);

    if (data.sunnah[id]) {
      const name = item ? item.label : 'this Sunnah';
      const nameTrans = window.t ? window.t(name) : name;
      const title = window.t ? window.t('Unlock Sunnah') : 'Unlock Sunnah';
      const msgTemplate = window.t ? window.t('Unlock and reset {sunnah}?') : 'Unlock and reset {sunnah}?';

      Utils.confirm(
        title,
        msgTemplate.replace('{sunnah}', nameTrans),
        () => {
          delete data.sunnah[id];
          DB.setSalah(this.currentDate, data);
          window.dispatchEvent(new CustomEvent('lamim:data-updated'));
          this.render(true);
        },
        'warning'
      );
      return;
    }
  },

  renderTahajjud(active, rakat) {
    const container = document.getElementById('tahajjud-card-container');
    if (!container) return;

    const isFuture = this.currentDate > Utils.todayStr();
    const isLocked = rakat > 0 || rakat === -1;
    const isPrayed = rakat > 0;
    const isMissed = rakat === -1;

    let bgGradient = 'linear-gradient(135deg, #818cf8, #6366f1)';

    const rakatTrans = window.n ? window.n(rakat) : rakat;
    const titleTrans = window.t ? window.t('Tahajjud') : 'Tahajjud';
    const subtrans = window.t ? window.t('Night Vigils · Nafl') : 'Night Vigils · Nafl';

    let html = `
      <div class="salah-prayer-card nafl-sunnah-card-modern anim-fade-in ${isLocked ? (isPrayed ? 'has-status status-jamaat active' : 'has-status status-missed') : ''}" 
           id="tahajjud-salah-card"
           style="${isFuture ? 'opacity: 0.7; pointer-events: none;' : ''}">
        
        <!-- Prayer Header -->
        <div class="salah-prayer-header">
          <div class="salah-prayer-icon-wrap" style="background: ${bgGradient}; box-shadow: 0 4px 12px rgba(129,140,248,0.3)">
            <span class="salah-prayer-emoji"><svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/><path d="M19 3v4M17 5h4"/></svg></span>
          </div>
          <div class="salah-prayer-info">
            <div class="salah-prayer-name">${titleTrans}</div>
            <div class="salah-prayer-time">${subtrans}</div>
          </div>
          <div class="salah-prayer-status-badge">
            ${isLocked 
              ? (isPrayed 
                  ? `<div class="salah-status-chip" style="background: rgba(52,211,153,0.15); border-color: rgba(52,211,153,0.4); color: #34d399; box-shadow: 0 0 12px rgba(52,211,153,0.4)">
                       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg> ${window.t ? window.t('Prayed') : 'Prayed'} (${rakatTrans} ${window.t ? window.t('RK') : 'RK'})
                     </div>`
                  : `<div class="salah-status-chip" style="background: rgba(248,81,73,0.15); border-color: rgba(248,81,73,0.4); color: #f85149; box-shadow: 0 0 12px rgba(248,81,73,0.4)">
                       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> ${window.t ? window.t('Missed') : 'Missed'}
                     </div>`)
              : `<div class="salah-status-chip salah-status-pending">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${window.t ? window.t('Pending') : 'Pending'}
                 </div>`
            }
          </div>
        </div>

        <!-- Status Selection or Locked Result -->
        ${isLocked 
          ? `<div class="salah-locked-result" onclick="Goals.unlockTahajjud()" style="cursor: pointer;">
               <div class="salah-locked-icon" style="color: ${isPrayed ? '#34d399' : '#f85149'}; filter: drop-shadow(0 0 8px ${isPrayed ? 'rgba(52,211,153,0.5)' : 'rgba(248,81,73,0.5)'})">
                 ${isPrayed ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'}
               </div>
               <div class="salah-locked-info">
                 <div class="salah-locked-status" style="color: ${isPrayed ? '#34d399' : '#f85149'}">
                   ${isPrayed 
                     ? (window.t ? window.t('Tahajjud Prayed ({rakat} RK)').replace('{rakat}', rakatTrans) : `Tahajjud Prayed (${rakatTrans} RK)`)
                     : (window.t ? window.t('Tahajjud Missed') : 'Tahajjud Missed')}
                 </div>
                 <div class="salah-locked-desc" style="display:flex;align-items:center;gap:3px">
                   ${isPrayed ? `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-accent-green);filter:drop-shadow(0 0 4px rgba(16,185,129,0.6))"><polyline points="20 6 9 17 4 12"></polyline></svg> ${window.t ? window.t('Successful') : 'Successful'}` : `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-accent-red);filter:drop-shadow(0 0 4px rgba(248,81,73,0.6))"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> ${window.t ? window.t('Unsuccessful') : 'Unsuccessful'}`}
                   <span style="opacity:0.5;margin:0 2px">•</span> +${isPrayed ? (window.n ? window.n(3) : 3) : 0} ${window.t ? window.t('Points') : 'pts'}
                 </div>
               </div>
               <svg class="salah-lock-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: lockPulse 2s ease-in-out infinite"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
             </div>`
          : `<div class="salah-status-selector">
               <div class="salah-options-label" style="display:flex; justify-content:space-between; align-items:center;">
                 <span>${window.t ? window.t('How many Rakat did you pray?') : 'How many Rakat did you pray?'}</span>
                  <button data-nafl="tahajjud" data-action="missed" style="background:rgba(248,81,73,0.1); border:1px solid rgba(248,81,73,0.3); color:#f85149; padding:2px 8px; border-radius:12px; font-size:10px; font-weight:bold; cursor:pointer; display:inline-flex; align-items:center; gap:4px;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:10px; height:10px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> ${window.t ? window.t('Missed') : 'Missed'}</button>
               </div>
               <div class="salah-options-grid" style="grid-template-columns: repeat(3, 1fr); gap:8px; margin-top:8px;">
                 ${[2, 4, 6, 8, 10, 12].map(opt => `
                    <button class="salah-option-btn" data-nafl="tahajjud" data-rakat="${opt}" style="border-color: rgba(129,140,248,0.3); background: rgba(129,140,248,0.05); min-height:55px; padding:8px;">
                      <span class="salah-opt-label" style="color: #818cf8; font-size:13px">${window.n ? window.n(opt) : opt} ${window.t ? window.t('RK') : 'RK'}</span>
                      <span class="salah-opt-pts">+${window.n ? window.n(3) : 3} ${window.t ? window.t('Points') : 'pts'}</span>
                    </button>
                 `).join('')}
                  <button class="salah-option-btn" data-nafl="tahajjud" data-action="custom" style="grid-column: span 3; border-color: rgba(129,140,248,0.3); background: rgba(129,140,248,0.05); min-height:40px; flex-direction:row; gap:6px; padding:6px; display:flex; align-items:center; justify-content:center;">
                   <span class="salah-opt-icon" style="display:flex; align-items:center; justify-content:center;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px; height:14px; color:#818cf8"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></span>
                   <span class="salah-opt-label" style="color: #818cf8; margin-top:0;">${window.t ? window.t('Custom Rakat') : 'Custom Rakat'}</span>
                 </button>
               </div>
             </div>`
        }
      </div>
    `;

    container.innerHTML = html;
    container.querySelectorAll('[data-nafl="tahajjud"]').forEach(btn => {
      console.log('[Goals] bind tahajjud btn', btn.dataset.rakat || btn.dataset.action);
      btn.onclick = (e) => {
        e.preventDefault();
        console.log('[Goals] tahajjud clicked', btn.dataset.rakat || btn.dataset.action);
        const rakat = btn.dataset.rakat;
        const action = btn.dataset.action;
        if (rakat) this.setTahajjudRakat(Number(rakat));
        else if (action === 'missed') this.setTahajjudMissed();
        else if (action === 'custom') this.promptCustomTahajjud();
      };
    });
  },

  setTahajjudRakat(rakat) {
    if (this.currentDate > Utils.todayStr()) {
      Utils.toast(window.t ? window.t("Cannot edit future dates") : "Cannot edit future dates", "error");
      return;
    }
    const data = DB.getSalah(this.currentDate);
    if (data.tahajjud_rakat !== 0 && data.tahajjud_rakat != null) {
      return;
    }
    data.tahajjud = true;
    data.tahajjud_rakat = rakat;
    DB.setSalah(this.currentDate, data);
    window.dispatchEvent(new CustomEvent('lamim:data-updated'));
    this.render(true);
    Utils.toast(window.t ? window.t('Tahajjud recorded') : 'Tahajjud recorded', 'success');
  },

  setTahajjudMissed() {
    if (this.currentDate > Utils.todayStr()) {
      Utils.toast(window.t ? window.t("Cannot edit future dates") : "Cannot edit future dates", "error");
      return;
    }
    const data = DB.getSalah(this.currentDate);
    if (data.tahajjud_rakat !== 0 && data.tahajjud_rakat != null) {
      return;
    }
    data.tahajjud = false;
    data.tahajjud_rakat = -1;
    DB.setSalah(this.currentDate, data);
    window.dispatchEvent(new CustomEvent('lamim:data-updated'));
    this.render(true);
    Utils.toast(window.t ? window.t('Tahajjud recorded as missed') : 'Tahajjud recorded as missed', 'info');
  },

  promptCustomTahajjud() {
    if (this.currentDate > Utils.todayStr()) {
      Utils.toast(window.t ? window.t("Cannot edit future dates") : "Cannot edit future dates", "error");
      return;
    }
    const data = DB.getSalah(this.currentDate);
    if (data.tahajjud_rakat !== 0 && data.tahajjud_rakat != null) {
      return;
    }
    const promptMsg = window.t ? window.t("Enter custom Rakat number (e.g. 14, 20):") : "Enter custom Rakat number (e.g. 14, 20):";
    const r = prompt(promptMsg);
    if (r) {
      const num = parseInt(r);
      if (!isNaN(num) && num > 0) {
        this.setTahajjudRakat(num);
      } else {
        Utils.toast(window.t ? window.t("Invalid number") : "Invalid number", "error");
      }
    }
  },

  unlockTahajjud() {
    if (this.currentDate > Utils.todayStr()) {
      Utils.toast(window.t ? window.t("Cannot edit future dates") : "Cannot edit future dates", "error");
      return;
    }
    const data = DB.getSalah(this.currentDate);
    Utils.confirm(
      window.t ? window.t('Unlock Tahajjud') : 'Unlock Tahajjud',
      window.t ? window.t('Unlock and reset Tahajjud status?') : 'Unlock and reset Tahajjud status?',
      () => {
        data.tahajjud = false;
        data.tahajjud_rakat = 0;
        DB.setSalah(this.currentDate, data);
        window.dispatchEvent(new CustomEvent('lamim:data-updated'));
        this.render(true);
        Utils.toast(window.t ? window.t('Tahajjud unlocked') : 'Tahajjud unlocked', 'info');
      },
      'warning'
    );
  },

  renderWitr(rakat) {
    const container = document.getElementById('witr-card-container');
    if (!container) return;

    const isFuture = this.currentDate > Utils.todayStr();
    const isLocked = rakat > 0 || rakat === -1;
    const isPrayed = rakat > 0;
    const isMissed = rakat === -1;

    let bgGradient = 'linear-gradient(135deg, #fbbf24, #f59e0b)';

    const labelTrans = window.t ? window.t('Witr') : 'Witr';
    const subtrans = window.t ? window.t('3 Rakat · Wajib') : '3 Rakat · Wajib';

    let html = `
      <div class="salah-prayer-card nafl-sunnah-card-modern anim-fade-in ${isLocked ? (isPrayed ? 'has-status status-jamaat active' : 'has-status status-missed') : ''}" 
           id="witr-salah-card"
           style="${isFuture ? 'opacity: 0.7; pointer-events: none;' : ''}">
        
        <!-- Prayer Header -->
        <div class="salah-prayer-header">
          <div class="salah-prayer-icon-wrap" style="background: ${bgGradient}; box-shadow: 0 4px 12px rgba(251,191,36,0.3)">
            <span class="salah-prayer-emoji"><svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></span>
          </div>
          <div class="salah-prayer-info">
            <div class="salah-prayer-name">${labelTrans}</div>
            <div class="salah-prayer-time">${subtrans}</div>
          </div>
          <div class="salah-prayer-status-badge">
            ${isLocked 
              ? (isPrayed 
                  ? `<div class="salah-status-chip" style="background: rgba(52,211,153,0.15); border-color: rgba(52,211,153,0.4); color: #34d399; box-shadow: 0 0 12px rgba(52,211,153,0.4)">
                       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg> ${window.t ? window.t('Prayed') : 'Prayed'}
                     </div>`
                  : `<div class="salah-status-chip" style="background: rgba(248,81,73,0.15); border-color: rgba(248,81,73,0.4); color: #f85149; box-shadow: 0 0 12px rgba(248,81,73,0.4)">
                       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> ${window.t ? window.t('Missed') : 'Missed'}
                     </div>`)
              : `<div class="salah-status-chip salah-status-pending">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${window.t ? window.t('Pending') : 'Pending'}
                 </div>`
            }
          </div>
        </div>

        <!-- Status Selection or Locked Result -->
        ${isLocked 
          ? `<div class="salah-locked-result" onclick="Goals.unlockWitr()" style="cursor: pointer;">
               <div class="salah-locked-icon" style="color: ${isPrayed ? '#34d399' : '#f85149'}; filter: drop-shadow(0 0 8px ${isPrayed ? 'rgba(52,211,153,0.5)' : 'rgba(248,81,73,0.5)'})">
                 ${isPrayed ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'}
               </div>
               <div class="salah-locked-info">
                 <div class="salah-locked-status" style="color: ${isPrayed ? '#34d399' : '#f85149'}">${isPrayed ? (window.t ? window.t('Witr Prayed') : 'Witr Prayed') : (window.t ? window.t('Witr Missed') : 'Witr Missed')}</div>
                 <div class="salah-locked-desc" style="display:flex;align-items:center;gap:3px">
                   ${isPrayed ? `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-accent-green);filter:drop-shadow(0 0 4px rgba(16,185,129,0.6))"><polyline points="20 6 9 17 4 12"></polyline></svg> ${window.t ? window.t('Successful') : 'Successful'}` : `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-accent-red);filter:drop-shadow(0 0 4px rgba(248,81,73,0.6))"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> ${window.t ? window.t('Unsuccessful') : 'Unsuccessful'}`}
                   <span style="opacity:0.5;margin:0 2px">•</span> +${isPrayed ? (window.n ? window.n(2) : 2) : 0} ${window.t ? window.t('Points') : 'pts'}
                 </div>
               </div>
               <svg class="salah-lock-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: lockPulse 2s ease-in-out infinite"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
             </div>`
          : `<div class="salah-status-selector">
               <div class="salah-options-label">${window.t ? window.t('Did you pray Witr?') : 'Did you pray Witr?'}</div>
               <div class="salah-options-grid" style="grid-template-columns: repeat(2, 1fr);">
                  <button class="salah-option-btn" data-nafl="witr" data-action="prayed" style="border-color: rgba(52,211,153,0.3); background: rgba(52,211,153,0.05);">
                    <span class="salah-opt-icon" style="filter: drop-shadow(0 0 8px rgba(52,211,153,0.5)); display:flex; align-items:center; justify-content:center;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:20px; height:20px; color:#34d399"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/></svg></span>
                    <span class="salah-opt-label" style="color: #34d399; margin-top:4px;">${window.t ? window.t('Prayed') : 'Prayed'}</span>
                    <span class="salah-opt-desc">${window.t ? window.t('3 Rakat Wajib') : '3 Rakat Wajib'}</span>
                    <span class="salah-opt-pts">+${window.n ? window.n(2) : 2} ${window.t ? window.t('Points') : 'pts'}</span>
                  </button>
                  <button class="salah-option-btn" data-nafl="witr" data-action="missed" style="border-color: rgba(248,81,73,0.3); background: rgba(248,81,73,0.05);">
                    <span class="salah-opt-icon" style="filter: drop-shadow(0 0 8px rgba(248,81,73,0.5)); display:flex; align-items:center; justify-content:center;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:20px; height:20px; color:#f85149"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></span>
                    <span class="salah-opt-label" style="color: #f85149; margin-top:4px;">${window.t ? window.t('Missed') : 'Missed'}</span>
                    <span class="salah-opt-desc">${window.t ? window.t('Not prayed') : 'Not prayed'}</span>
                    <span class="salah-opt-pts">+${window.n ? window.n(0) : 0} ${window.t ? window.t('Points') : 'pts'}</span>
                  </button>
               </div>
             </div>`
        }
      </div>
    `;

    container.innerHTML = html;
    container.querySelectorAll('[data-nafl="witr"]').forEach(btn => {
      console.log('[Goals] bind witr btn', btn.dataset.action);
      btn.onclick = (e) => {
        e.preventDefault();
        console.log('[Goals] witr clicked', btn.dataset.action);
        const action = btn.dataset.action;
        if (action === 'prayed') this.toggleWitr();
        else if (action === 'missed') this.toggleWitrMissed();
      };
    });
  },

  toggleWitr() {
    if (this.currentDate > Utils.todayStr()) {
      Utils.toast(window.t ? window.t("Cannot edit future dates") : "Cannot edit future dates", "error");
      return;
    }
    const data = DB.getSalah(this.currentDate);
    if (data.witr !== 0 && data.witr !== undefined) {
      return;
    }
    data.witr = 3;
    DB.setSalah(this.currentDate, data);
    window.dispatchEvent(new CustomEvent('lamim:data-updated'));
    Utils.sparkle(document.getElementById('witr-salah-card') || document.body, 4);
    this.render(true);
    Utils.toast(window.t ? window.t('Witr recorded') : 'Witr recorded', 'success');
  },

  toggleWitrMissed() {
    if (this.currentDate > Utils.todayStr()) {
      Utils.toast(window.t ? window.t("Cannot edit future dates") : "Cannot edit future dates", "error");
      return;
    }
    const data = DB.getSalah(this.currentDate);
    if (data.witr !== 0 && data.witr !== undefined) {
      return;
    }
    data.witr = -1;
    DB.setSalah(this.currentDate, data);
    window.dispatchEvent(new CustomEvent('lamim:data-updated'));
    this.render(true);
    Utils.toast(window.t ? window.t('Witr marked as missed') : 'Witr marked as missed', 'info');
  },

  unlockWitr() {
    if (this.currentDate > Utils.todayStr()) {
      Utils.toast(window.t ? window.t("Cannot edit future dates") : "Cannot edit future dates", "error");
      return;
    }
    const data = DB.getSalah(this.currentDate);
    Utils.confirm(
      window.t ? window.t('Unlock Witr') : 'Unlock Witr',
      window.t ? window.t('Unlock and reset Witr status?') : 'Unlock and reset Witr status?',
      () => {
        data.witr = 0;
        DB.setSalah(this.currentDate, data);
        window.dispatchEvent(new CustomEvent('lamim:data-updated'));
        this.render(true);
        Utils.toast(window.t ? window.t('Witr unlocked') : 'Witr unlocked', 'info');
      },
      'warning'
    );
  },

  // Keep backward compatibility
  setWitrRakat(rakat) {
    this.toggleWitr();
  },

  // --- SOPHISTICATED HISTORY ---
  showHistory() {
    const modal = document.getElementById('nafl-history-modal');
    const list = document.getElementById('nafl-history-list');
    if (!modal || !list) return;

    const history = DB.getSalahHistory(30);

    let totalRakat = 0;
    let totalPoints = 0;
    let streak = 0;
    let streakActive = true;
    
    // Find the first day the user ever used the app (within the last 30 days)
    let firstActiveIndex = -1;
    for (let i = history.length - 1; i >= 0; i--) {
      const day = history[i];
      const isActive = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].some(p => day.data[p]) || (day.data.sunnah && Object.values(day.data.sunnah).some(v => v === true || v === 'prayed' || v === 'missed')) || day.data.tahajjud_rakat > 0 || day.data.witr > 0;
      if (isActive && firstActiveIndex === -1) {
        firstActiveIndex = i;
      }
    }
    
    const trackingDays = firstActiveIndex !== -1 ? (firstActiveIndex + 1) : 0;
    const MAX_PTS_PER_DAY = 15; // 10 (sunnahs) + 3 (tahajjud) + 2 (witr)

    for (let i = 0; i < history.length; i++) {
      const day = history[i];
      let dayPoints = 0;

      // Sunnahs: 2 pts each
      if (day.data.sunnah) {
        Object.keys(day.data.sunnah).forEach(id => {
          if (day.data.sunnah[id] === true || day.data.sunnah[id] === 'prayed') {
            dayPoints += 2;
          }
        });
      }

      // Tahajjud: 3 pts
      if (day.data.tahajjud_rakat > 0) {
        dayPoints += 3;
      }

      // Witr: 2 pts
      if (day.data.witr > 0) {
        dayPoints += 2;
      }

      totalPoints += dayPoints;

      // Track total rakat for display
      let dayRakat = 0;
      if (day.data.sunnah) {
        Object.keys(day.data.sunnah).forEach(id => {
          if (day.data.sunnah[id] === true || day.data.sunnah[id] === 'prayed') {
            const item = this.sunnahList.find(s => s.id === id);
            if (item) dayRakat += item.rakat;
          }
        });
      }
      dayRakat += (day.data.tahajjud_rakat > 0 ? day.data.tahajjud_rakat : 0);
      dayRakat += (day.data.witr > 0 ? day.data.witr : 0);
      totalRakat += dayRakat;

      if (streakActive) {
        if (dayPoints > 0) {
          streak++;
        } else if (day.date !== Utils.todayStr()) {
          streakActive = false;
        }
      }
    }

    const TOTAL_MAX = trackingDays * MAX_PTS_PER_DAY;
    const completion = TOTAL_MAX > 0 ? ((totalPoints / TOTAL_MAX) * 100).toFixed(1) : '0.0';

    const labelRK = window.t ? window.t('RK') : 'RK';
    const labelDays = window.t ? window.t('d') : 'd';
    
    document.getElementById('h-sum-total').textContent = (window.n ? window.n(totalRakat) : totalRakat) + ' ' + labelRK;
    document.getElementById('h-sum-streak').textContent = (window.n ? window.n(streak) : streak) + labelDays;
    document.getElementById('h-sum-avg').textContent = (window.n ? window.n(completion) : completion) + '%';

    list.innerHTML = history.map(day => {
      const isPastDay = day.date !== Utils.todayStr();
      let sunnahDone = [];
      let sunnahMissed = [];
      let dayRakat = 0;

      if (day.data.sunnah) {
        Object.keys(day.data.sunnah).forEach(id => {
          const item = this.sunnahList.find(s => s.id === id);
          if (item) {
            const labelTrans = window.t ? window.t(item.label) : item.label;
            if (day.data.sunnah[id] === true || day.data.sunnah[id] === 'prayed') {
              sunnahDone.push(labelTrans);
              dayRakat += item.rakat;
            } else if (day.data.sunnah[id] === 'missed' || isPastDay) {
              sunnahMissed.push(labelTrans);
            }
          }
        });
      }

      if (isPastDay) {
        this.sunnahList.forEach(s => {
          if (!day.data.sunnah || day.data.sunnah[s.id] === undefined) {
            const labelTrans = window.t ? window.t(s.label) : s.label;
            sunnahMissed.push(labelTrans);
          }
        });
      }

      const tRakat = day.data.tahajjud_rakat > 0 ? day.data.tahajjud_rakat : 0;
      const wRakat = day.data.witr > 0 ? day.data.witr : 0;
      const total = dayRakat + tRakat + wRakat;
      const allSunnahMissed = sunnahDone.length === 0 && sunnahMissed.length > 0;

      if (total === 0 && sunnahDone.length === 0 && sunnahMissed.length === 0) return '';

      const labelTahajjud = window.t ? window.t('Tahajjud') : 'Tahajjud';
      const labelWitr = window.t ? window.t('Witr') : 'Witr';
      const dateText = day.date === Utils.todayStr() ? (window.t ? window.t('Today') : 'Today') : Utils.formatDate(new Date(day.date), { day: 'numeric', month: 'short' });

      return `
        <div class="history-item-modern ${allSunnahMissed ? 'all-missed' : ''}">
          <div class="h-item-date">${dateText}</div>
          <div class="h-item-content">
            <div class="h-item-main">
               ${sunnahDone.map(name => `<div class="h-pill"><span class="dot" style="background:#34d399"></span>${name}</div>`).join('')}
               ${sunnahMissed.map(name => `<div class="h-pill missed"><span class="dot" style="background:rgba(255,255,255,0.15)"></span>${name}</div>`).join('')}
               ${tRakat > 0 ? `<div class="h-pill"><span class="dot" style="background:#818cf8"></span>${labelTahajjud} (${window.n ? window.n(tRakat) : tRakat})</div>` : ''}
               ${wRakat > 0 ? `<div class="h-pill"><span class="dot" style="background:#fbbf24"></span>${labelWitr} (${window.n ? window.n(wRakat) : wRakat})</div>` : ''}
            </div>
          </div>
          <div class="h-item-total">${window.n ? window.n(total) : total}<small>${labelRK}</small></div>
        </div>
      `;
    }).join('') || `<div class="empty-state">${window.t ? window.t('No history recorded yet.') : 'No history recorded yet.'}</div>`;

    Utils.openModal(modal);
  },

  hideHistory() {
    Utils.closeModal(document.getElementById('nafl-history-modal'));
  }
};

/* =============================================
   LAMIM — SALAH MODULE (Farz Only)
   Only 5 waqt farz namaz. No sunnah/nafl/tahajjud here.
   Once selected, cannot be changed.
   ============================================= */
const Salah = {
  prayers: ['fajr','dhuhr','asr','maghrib','isha'],
  prayerMeta: {
    fajr:    { label: 'Fajr',    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><defs><linearGradient id="fajrGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#f472b6"/><stop offset="100%" style="stop-color:#ec4899"/></linearGradient></defs><g><animateTransform attributeName="transform" type="translate" values="0,1; 0,-1; 0,1" dur="4s" repeatCount="indefinite"/><path d="M16 18a4 4 0 0 0-8 0"/></g><g><animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/><path d="M12 2v8"/><path d="m4.93 10.93 1.41 1.41"/><path d="m17.66 12.34 1.41-1.41"/><path d="M8 6l4-4 4 4"/><path d="M2 18h20"/><path d="M22 22H2"/></path></g><circle cx="12" cy="3" r="1" fill="#f472b6"><animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite"/></circle><circle cx="6" cy="6" r="0.8" fill="#f472b6"><animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/></circle><circle cx="18" cy="7" r="0.6" fill="#f472b6"><animate attributeName="opacity" values="0.5;1;0.5" dur="2.5s" repeatCount="indefinite"/></circle></svg>', gradient: 'linear-gradient(135deg, #f472b6, #ec4899)', timeLabel: 'Dawn', glow: '0 0 20px rgba(244,114,182,0.5)' },
    dhuhr:   { label: 'Dhuhr',   icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><g style="transform-origin: 12px 12px"><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="10s" repeatCount="indefinite"/><circle cx="12" cy="12" r="4"><animate attributeName="r" values="3.5; 4.5; 3.5" dur="3s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite"/></circle><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></g></svg>', gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)', timeLabel: 'Midday', glow: '0 0 20px rgba(251,191,36,0.5)' },
    asr:     { label: 'Asr',     icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><g><animateTransform attributeName="transform" type="translate" values="-1,0; 1,0; -1,0" dur="5s" repeatCount="indefinite"/><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"/></g><g style="transform-origin: 12px 12px"><animateTransform attributeName="transform" type="rotate" values="-15; 15; -15" dur="4s" repeatCount="indefinite"/><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/></g></svg>', gradient: 'linear-gradient(135deg, #fb923c, #f97316)', timeLabel: 'Afternoon', glow: '0 0 20px rgba(251,146,60,0.5)' },
    maghrib: { label: 'Maghrib', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><g><animateTransform attributeName="transform" type="translate" values="0,-1; 0,1.5; 0,-1" dur="5s" repeatCount="indefinite"/><path d="M16 18a4 4 0 0 0-8 0"/><path d="M12 10v4"/><path d="m4.93 10.93 1.41 1.41"/><path d="m17.66 12.34 1.41-1.41"/><path d="M8 14l4 4 4-4"/><path d="M2 18h20"/><path d="M22 22H2"/></path></g><circle cx="6" cy="17" r="1.5" fill="#a855f7"><animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite"/></circle><circle cx="18" cy="16" r="1" fill="#a855f7"><animate attributeName="opacity" values="1;0.4;1" dur="2.3s" repeatCount="indefinite"/></circle><circle cx="12" cy="4" r="0.8" fill="#a855f7"><animate attributeName="opacity" values="0.6;1;0.6" dur="1.8s" repeatCount="indefinite"/></circle></svg>', gradient: 'linear-gradient(135deg, #a855f7, #8b5cf6)', timeLabel: 'Sunset', glow: '0 0 20px rgba(168,85,247,0.5)' },
    isha:    { label: 'Isha',    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><g style="transform-origin: 12px 12px"><animateTransform attributeName="transform" type="rotate" values="-10; 10; -10" dur="6s" repeatCount="indefinite"/><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/><animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite"/></g><circle cx="20" cy="4" r="1.2" fill="#6366f1"><animate attributeName="opacity" values="0.2;1;0.2" dur="3s" repeatCount="indefinite"/></circle><circle cx="4" cy="18" r="1" fill="#6366f1"><animate attributeName="opacity" values="1;0.2;1" dur="4s" repeatCount="indefinite"/></circle><circle cx="8" cy="6" r="0.7" fill="#6366f1"><animate attributeName="opacity" values="0.5;1;0.5" dur="2.5s" repeatCount="indefinite"/></circle><circle cx="16" cy="20" r="0.6" fill="#6366f1"><animate attributeName="opacity" values="1;0.4;1" dur="3.5s" repeatCount="indefinite"/></circle></svg>', gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)', timeLabel: 'Night', glow: '0 0 20px rgba(99,102,241,0.5)' }
  },
  statuses: ['jamaat','alone','qaza','missed'],
  statusMeta: {
    jamaat: { label: "Jama'at", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><g><animateTransform attributeName="transform" type="translate" values="0,0; 0,-1.5; 0,0" dur="2.5s" repeatCount="indefinite"/><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><circle cx="9" cy="7" r="3"><animate attributeName="r" values="2.5;3.5;2.5" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite"/></circle></g><g><animateTransform attributeName="transform" type="translate" values="0,-1; 0,0.5; 0,-1" dur="3s" repeatCount="indefinite"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></g></svg>', color: '#3fb950', bgAlpha: 'rgba(63,185,80,0.12)', borderAlpha: 'rgba(63,185,80,0.4)', desc: 'Congregation', result: 'successful', points: 10, glow: '0 0 12px rgba(63,185,80,0.6)' },
    alone:  { label: 'Alone',   icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><g style="transform-origin: center"><animateTransform attributeName="transform" type="scale" values="1; 1.08; 1" dur="3.5s" repeatCount="indefinite"/><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle><circle cx="12" cy="7" r="2.5"><animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite"/></circle></g></svg>', color: '#58a6ff', bgAlpha: 'rgba(88,166,255,0.12)', borderAlpha: 'rgba(88,166,255,0.4)', desc: 'Individual',   result: 'successful', points: 7, glow: '0 0 12px rgba(88,166,255,0.6)' },
    qaza:   { label: 'Qaza',    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" stroke-dasharray="60" stroke-dashoffset="0"><animate attributeName="stroke-dashoffset" values="0;-60" dur="2s" repeatCount="indefinite"/></circle><g style="transform-origin: 12px 12px"><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="4s" repeatCount="indefinite"/><line x1="12" y1="12" x2="16" y2="12"></line></g><line x1="12" y1="6" x2="12" y2="12"></line><circle cx="12" cy="12" r="2"><animate attributeName="opacity" values="0.5;1;0.5" dur="1s" repeatCount="indefinite"/></circle></svg>', color: '#d29922', bgAlpha: 'rgba(210,153,34,0.12)', borderAlpha: 'rgba(210,153,34,0.4)', desc: 'Made up later', result: 'qaza',       points: 3, glow: '0 0 12px rgba(210,153,34,0.6)' },
    missed: { label: 'Missed',  icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"><animate attributeName="opacity" values="1; 0.6; 1" dur="1.5s" repeatCount="indefinite"/></circle><line x1="15" y1="9" x2="9" y2="15"><animate attributeName="opacity" values="1; 0.5; 1" dur="1.2s" repeatCount="indefinite"/></line><line x1="9" y1="9" x2="15" y2="15"><animate attributeName="opacity" values="0.5; 1; 0.5" dur="1.2s" repeatCount="indefinite"/></line></svg>', color: '#f85149', bgAlpha: 'rgba(248,81,73,0.12)', borderAlpha: 'rgba(248,81,73,0.4)', desc: 'Not prayed',    result: 'unsuccessful', points: 0, glow: '0 0 12px rgba(248,81,73,0.6)' }
  },

  // Backward compat labels
  prayerLabels: { fajr:'Fajr', dhuhr:'Dhuhr', asr:"Asr", maghrib:'Maghrib', isha:'Isha' },
  statusLabels: { jamaat:'Jama\'at', alone:'Alone', qaza:'Qaza', missed:'Missed' },

  init() {
    this.selectedDate = Utils.todayStr();
    this.renderAll();
    
    // Listen for local data updates
    // Listen for local data updates
    if (!this._dataUpdateBound) {
      this._debouncedRender = Utils.debounce(() => {
        if (document.getElementById('section-salah')?.classList.contains('active')) {
          this.renderAll(true);
        }
      }, 300);
      window.addEventListener('lamim:data-updated', () => this._debouncedRender());
      this._dataUpdateBound = true;
    }

    if (!this.navBound) {
      this.bindDateNav();
      this.navBound = true;
    }
    this.initCalendarTooltip();
  },

  renderAll(skipAnim = false) {
    this.renderHeader();
    this.renderPrayerTimes();
    this.renderStats();
    this.renderPrayerCards(this.selectedDate, skipAnim);
    this.renderCalendar();
  },

  /* ---- HEADER ---- */
  renderHeader() {
    const date = this.selectedDate;
    const isToday = date === Utils.todayStr();
    const dateLabel = document.getElementById('salah-date-label');
    const nextBtn = document.getElementById('salah-next-day');

    if (dateLabel) {
      if (isToday) {
        dateLabel.textContent = 'Today';
      } else {
        dateLabel.textContent = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    }

    if (nextBtn) {
      nextBtn.style.display = isToday ? 'none' : 'inline-flex';
    }
  },

  /* ---- Prayer time pills ---- */
  renderPrayerTimes() {
    const times = Utils.calcPrayerTimes();
    const next  = Utils.getNextPrayer(times);
    const row   = document.getElementById('salah-times-row');
    if (!row) return;
    row.innerHTML = times.map((t, idx) => {
      const meta = this.prayerMeta[t.name];
      const isNext = t.name === next.name;
      return `
        <div class="prayer-time-pill ${isNext ? 'next' : ''}" 
             onclick="Salah.scrollToPrayer('${t.name}')"
             style="animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both; animation-delay: ${idx * 0.05}s;">
          <div class="pill-icon" style="filter:drop-shadow(${meta.glow})">${meta.icon}</div>
          <div class="pill-name">${meta.label}</div>
          <div class="pill-time">${t.label}</div>
          ${isNext ? '<div class="pill-next-badge" style="animation: pulse 1.5s ease-in-out infinite">Next</div>' : ''}
        </div>
      `;
    }).join('');
  },

  scrollToPrayer(prayer) {
    const el = document.getElementById(`salah-card-${prayer}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  },

  /* ---- Stats ---- */
  renderStats(date) {
    date = date || this.selectedDate;
    const statsEl = document.getElementById('salah-stats');
    if (!statsEl) return;

    const salah = DB.getSalah(date);
    const score = Utils.salahScore(salah);
    const streak = DB.getSalahStreak();
    const points = this.calcDayPoints(salah);

    // Empty state logic (Keep it but in old style if desired, or just show zeros)
    // The user image shows 2/5 prayed, so they have some data.
    
    statsEl.innerHTML = `
      <div class="salah-stats-grid">
        <div class="salah-stat-card stat-prayed">
          <div class="salah-stat-ring">
            ${this._miniRing(salah)}
          </div>
          <div class="salah-stat-info">
            <div class="salah-stat-val">${score.done}/5</div>
            <div class="salah-stat-label">Prayed</div>
          </div>
        </div>
        <div class="salah-stat-card stat-perfect">
          <div class="salah-stat-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-accent-orange);filter:drop-shadow(0 0 8px rgba(251,146,60,0.5))"><g style="transform-origin: center"><animateTransform attributeName="transform" type="scale" values="1; 1.15; 1" dur="1.2s" repeatCount="indefinite"/><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></g></svg></div>
          <div class="salah-stat-info">
            <div class="salah-stat-val">${streak.perfect}d</div>
            <div class="salah-stat-label">Perfect</div>
          </div>
        </div>
        <div class="salah-stat-card stat-consistent">
          <div class="salah-stat-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-accent-green);filter:drop-shadow(0 0 8px rgba(16,185,129,0.5))"><g style="transform-origin: center"><animateTransform attributeName="transform" type="translate" values="0,0; 0,-2; 0,0" dur="2s" repeatCount="indefinite"/><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></g></svg></div>
          <div class="salah-stat-info">
            <div class="salah-stat-val">${streak.consistency}d</div>
            <div class="salah-stat-label">Consistent</div>
          </div>
        </div>
        <div class="salah-stat-card stat-points">
          <div class="salah-stat-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-accent-gold);filter:drop-shadow(0 0 8px rgba(234,179,8,0.5))"><g style="transform-origin: center"><animateTransform attributeName="transform" type="rotate" values="0; 360" dur="8s" repeatCount="indefinite"/><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></g></svg></div>
          <div class="salah-stat-info">
            <div class="salah-stat-val">${points}</div>
            <div class="salah-stat-label">Points</div>
          </div>
        </div>
        <div class="salah-stat-card stat-consistent">
          <div class="salah-stat-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-accent-blue);filter:drop-shadow(0 0 8px rgba(59,130,246,0.5))"><line x1="18" y1="20" x2="18" y2="10"><animate attributeName="y2" values="10; 6; 14; 10" dur="2s" repeatCount="indefinite"/></line><line x1="12" y1="20" x2="12" y2="4"><animate attributeName="y2" values="4; 12; 4" dur="2.5s" repeatCount="indefinite"/></line><line x1="6" y1="20" x2="6" y2="14"><animate attributeName="y2" values="14; 8; 16; 14" dur="3s" repeatCount="indefinite"/></line></svg></div>
          <div class="salah-stat-info">
            <div class="salah-stat-val">${score.pct}%</div>
            <div class="salah-stat-label">Score</div>
          </div>
        </div>
      </div>
    `;
  },

  calcDayPoints(salah) {
    let pts = 0;
    this.prayers.forEach(p => {
      if (salah[p] && this.statusMeta[salah[p]]) {
        pts += this.statusMeta[salah[p]].points;
      }
    });
    return pts;
  },

  _miniRing(salahData) {
    const r = 22, c = 2 * Math.PI * r;
    const segmentLen = c / 5;
    const gap = 4;
    
    let svgSegments = '';
    const prayers = ['fajr','dhuhr','asr','maghrib','isha'];
    prayers.forEach((p, i) => {
      const status = salahData[p];
      let color = 'transparent';
      if (status === 'jamaat') color = 'var(--color-jamaat)';
      else if (status === 'alone') color = 'var(--color-alone)';
      else if (status === 'qaza') color = 'var(--color-qaza)';
      else if (status === 'missed') color = 'var(--color-missed)';
      
      const offset = c - segmentLen + gap;
      const rotate = -90 + (i * 72) + (gap/c * 360 / 2);
      
      svgSegments += `
        <circle cx="28" cy="28" r="${r}" fill="none" stroke="${color}" stroke-width="5"
          stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${offset}"
          transform="rotate(${rotate} 28 28)" style="transition:stroke 0.4s ease"/>
      `;
    });
    
    return `
      <svg width="56" height="56" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r="${r}" fill="none" stroke="var(--color-divider-subtle)" stroke-width="5"/>
        ${svgSegments}
      </svg>
    `;
  },

  /* ---- Prayer cards (Farz only, no edit after selection) ---- */
  renderPrayerCards(date, skipAnim = false) {
    date = date || this.selectedDate;
    this.selectedDate = date;
    const salah = DB.getSalah(date);
    const settings = DB.getSettings();
    const isFriday = new Date(date + 'T00:00:00').getDay() === 5;
    const showJumuah = settings.jumuahMode !== false && isFriday; // default true if undefined
    const container = document.getElementById('salah-cards');
    if (!container) return;

    const nextPrayer = Utils.getNextPrayer(Utils.calcPrayerTimes());
    const isToday = date === Utils.todayStr();
    const isFuture = date > Utils.todayStr();

    container.innerHTML = `
      <div class="salah-cards-container">
        ${isFuture ? `
          <div class="salah-empty-stats anim-fade-in" style="grid-column: 1 / -1; margin: 0;">
            <div class="salah-empty-title">🔒 Future Date Locked</div>
            <div class="salah-empty-subtitle">You can only record prayers for today or past dates.</div>
          </div>
        ` : ''}
        ${this.prayers.map((p, idx) => {
          const meta = { ...this.prayerMeta[p] };
          if (p === 'dhuhr' && showJumuah) {
            meta.label = "Jumu'ah";
          }
          const currentStatus = salah[p];
          const isLocked = !!currentStatus;
          const statusInfo = currentStatus ? this.statusMeta[currentStatus] : null;
          
          const isNext = isToday && nextPrayer && nextPrayer.name === p;

          return `
            <div class="salah-prayer-card ${skipAnim ? '' : 'anim-fade-in'} ${currentStatus ? 'has-status status-' + currentStatus : ''} ${isNext && !isLocked ? 'is-next' : ''}"
                 id="salah-card-${p}"
                 style="${skipAnim ? '' : `animation-delay: ${idx * 0.04}s;`} ${isFuture ? 'opacity: 0.7; pointer-events: none;' : ''}">
               
              <!-- Prayer Header -->
              <div class="salah-prayer-header">
                <div class="salah-prayer-icon-wrap" style="background: ${meta.gradient}; box-shadow: ${meta.glow}">
                  <span class="salah-prayer-emoji">${meta.icon}</span>
                </div>
                <div class="salah-prayer-info">
                  <div class="salah-prayer-name">
                    ${meta.label}
                    ${isNext && !isLocked ? `<span class="salah-next-badge-inline">NEXT</span>` : ''}
                  </div>
                  <div class="salah-prayer-time">${this.getPrayerTime(p)} · ${meta.timeLabel}</div>
                </div>
                <div class="salah-prayer-status-badge">
                  ${currentStatus
                    ? `<div class="salah-status-chip" style="background:${statusInfo.bgAlpha};border-color:${statusInfo.borderAlpha};color:${statusInfo.color};box-shadow:${statusInfo.glow}">
                         <span>${statusInfo.icon}</span> ${statusInfo.label}
                       </div>`
                    : `<div class="salah-status-chip salah-status-pending">
                         <span>⏳</span> Pending
                       </div>`
                  }
                </div>
              </div>

              <!-- Status Selection or Locked Result -->
              ${isLocked
                ? `<div class="salah-locked-result">
                     <div class="salah-locked-icon" style="color:${statusInfo.color};filter:drop-shadow(${statusInfo.glow})">${statusInfo.icon}</div>
                     <div class="salah-locked-info">
                       <div class="salah-locked-status" style="color:${statusInfo.color}">${statusInfo.label}</div>
                       <div class="salah-locked-desc" style="display:flex;align-items:center;gap:3px">
                         ${statusInfo.result === 'successful' ? '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-accent-green);filter:drop-shadow(0 0 4px rgba(16,185,129,0.6))"><polyline points="20 6 9 17 4 12"></polyline></svg> Successful' : statusInfo.result === 'qaza' ? '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-accent-amber);filter:drop-shadow(0 0 4px rgba(251,191,36,0.6))"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> Qaza' : '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-accent-red);filter:drop-shadow(0 0 4px rgba(248,81,73,0.6))"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Unsuccessful'} 
                         <span style="opacity:0.5;margin:0 2px">•</span> +${statusInfo.points} pts
                       </div>
                     </div>
                     <svg class="salah-lock-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: lockPulse 2s ease-in-out infinite"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                   </div>`
                : `<div class="salah-status-selector">
                     <div class="salah-options-label">How did you pray?</div>
                     <div class="salah-options-grid">
                       ${this.statuses.map((s, btnIdx) => {
                         const sm = this.statusMeta[s];
                         return `
                           <button class="salah-option-btn"
                                   style="${skipAnim ? '' : `animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both; animation-delay: ${0.2 + (btnIdx * 0.05)}s;`}"
                                   onclick="Salah.selectStatus('${p}','${s}','${date}')">
                             <span class="salah-opt-icon" style="filter:drop-shadow(${sm.glow})">${sm.icon}</span>
                             <span class="salah-opt-label">${sm.label}</span>
                             <span class="salah-opt-desc">${sm.desc}</span>
                             <span class="salah-opt-pts">+${sm.points} pts</span>
                           </button>
                         `;
                       }).join('')}
                     </div>
                   </div>`
              }
            </div>
          `;
        }).join('')}
      </div>
    `;

    this.renderHeader();
    this.renderStats();
  },

  /* ---- Select status (permanent — no undo) ---- */
  selectStatus(prayer, status, date) {
    const salah = DB.getSalah(date);
    // Allow updates even if already set, so user can correct mistakes
    salah[prayer] = status;
    DB.setSalah(date, salah);

    // Partial update instead of full renderAll to prevent blinking
    this.renderPrayerCards(date, true); // true = skipAnim
    this.renderCalendar(); // Calendar needs update too, but we can make it smooth
    Home.render();

    const sm = this.statusMeta[status];
    const result = sm.result === 'successful' ? '✅' : sm.result === 'qaza' ? '⏰' : '❌';
    // Utils.toast(`${this.prayerMeta[prayer].label} — ${sm.label} ${result} (+${sm.points} pts)`, status === 'missed' ? 'warning' : 'success');

    // Celebrate all 5 done
    const score = Utils.salahScore(DB.getSalah(date));
    if (score.done === 5) {
      setTimeout(() => {
        Utils.toast('🎉 MashaAllah! All 5 farz prayers logged!', 'success');
        Utils.confetti();
      }, 500);
    }
  },

  /* ---- Backward compat ---- */
  setStatus(prayer, status, date) { this.selectStatus(prayer, status, date); },
  quickLog(prayer) { this.selectStatus(prayer, 'jamaat', Utils.todayStr()); },
  statusColor(s) { return { jamaat:'green', alone:'blue', qaza:'amber', missed:'red' }[s] || 'blue'; },

  getPrayerTime(p) {
    const times = Utils.calcPrayerTimes();
    const t = times.find(x => x.name === p);
    return t ? t.label : '';
  },

  /* ---- Date nav ---- */
  bindDateNav() {
    if (this.navBound) return; // Guard against duplicate listeners
    
    document.getElementById('salah-prev-day')?.addEventListener('click', (e) => {
      e.preventDefault();
      const d = new Date(this.selectedDate + 'T00:00:00');
      d.setDate(d.getDate() - 1);
      this.selectedDate = Utils.dateStr(d);
      this.renderAll(false); // full animation when navigating dates
    });
    document.getElementById('salah-next-day')?.addEventListener('click', (e) => {
      e.preventDefault();
      const d = new Date(this.selectedDate + 'T00:00:00');
      d.setDate(d.getDate() + 1);
      if (Utils.dateStr(d) <= Utils.todayStr()) {
        this.selectedDate = Utils.dateStr(d);
        this.renderAll(false);
      }
    });
  },

  updateDateLabel() { this.renderHeader(); },

  /* ---- Calendar ---- */
  renderCalendar() {
    const cal = document.getElementById('salah-calendar');
    if (!cal) return;

    // Get the year and month of the currently selected date
    const [y, m, d] = this.selectedDate.split('-');
    const year = parseInt(y, 10);
    const month = parseInt(m, 10) - 1; // 0-indexed month

    const firstDayDate = new Date(year, month, 1);
    const lastDayDate = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDayDate.getDate();
    const startDayOfWeek = firstDayDate.getDay();

    let html = `
      <div style="display:contents;">
        <div style="font-size:10px; font-weight:var(--fw-bold); color:var(--color-text-secondary); text-align:center; padding-bottom:8px">S</div>
        <div style="font-size:10px; font-weight:var(--fw-bold); color:var(--color-text-secondary); text-align:center; padding-bottom:8px">M</div>
        <div style="font-size:10px; font-weight:var(--fw-bold); color:var(--color-text-secondary); text-align:center; padding-bottom:8px">T</div>
        <div style="font-size:10px; font-weight:var(--fw-bold); color:var(--color-text-secondary); text-align:center; padding-bottom:8px">W</div>
        <div style="font-size:10px; font-weight:var(--fw-bold); color:var(--color-text-secondary); text-align:center; padding-bottom:8px">T</div>
        <div style="font-size:10px; font-weight:var(--fw-bold); color:var(--color-text-secondary); text-align:center; padding-bottom:8px">F</div>
        <div style="font-size:10px; font-weight:var(--fw-bold); color:var(--color-text-secondary); text-align:center; padding-bottom:8px">S</div>
      </div>
    `;

    for (let i = 0; i < startDayOfWeek; i++) {
      html += `<div class="salah-cal-cell empty" style="background: var(--color-glass); box-shadow: none; cursor: default;"></div>`;
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dayStr = String(i).padStart(2, '0');
      const monthStr = String(month + 1).padStart(2, '0');
      const dateStr = `${year}-${monthStr}-${dayStr}`;
      
      const data = DB.getSalah(dateStr);
      const score = Utils.salahScore(data);
      
      const isToday = dateStr === Utils.todayStr();
      const isFuture = dateStr > Utils.todayStr();

      let color = 'var(--color-glass)';
      let opacity = 1;
      let glow = '';
      let extraClass = '';

      if (!isFuture) {
        if (score.done === 5) {
          color = '#10b981'; 
          
          // 0 or 1 Qaza (90-100 pts) -> Maximum (Live glossy animation)
          if (score.pct >= 90) {
            extraClass = ' tier-max';
          } 
          // 2 or 3 Qaza (70-89 pts) -> High (Just shine, no animation)
          else if (score.pct >= 70) {
            extraClass = ' tier-high';
          }
          // 4 or 5 Qaza (<70 pts) -> Base (Solid green)
          else {
            extraClass = ' tier-base';
          }
          glow = ''; 
        }
        else if (score.done >= 3) {
          const avg = score.pct / score.done;
          if (avg >= 15) {
            color = '#38bdf8'; // Solid Blue (Mostly on-time)
            glow = 'box-shadow:0 0 4px rgba(56,189,248,0.3);';
          } else {
            color = 'rgba(56,189,248,0.15)'; // Hollow Blue (Mostly Qaza)
            glow = 'box-shadow: inset 0 0 0 2px #38bdf8;';
          }
        }
        else if (score.done > 0) {
          const avg = score.pct / score.done;
          if (avg >= 15) {
            color = '#fbbf24'; // Solid Amber (Mostly on-time)
            glow = 'box-shadow:0 0 4px rgba(251,191,36,0.3);';
          } else {
            color = 'rgba(251,191,36,0.15)'; // Hollow Amber (Mostly Qaza)
            glow = 'box-shadow: inset 0 0 0 2px #fbbf24;';
          }
        }
        else {
          const hasLoggedAny = ['fajr','dhuhr','asr','maghrib','isha'].some(p => data[p]);
          if (isToday && !hasLoggedAny) {
            color = 'var(--color-glass)';
          } else {
            color = 'var(--color-accent-red)';
            opacity = 0.85;
          }
        }
      } else {
         opacity = 0.5; // Future days should be visible in light mode too
      }

      html += `<div class="salah-cal-cell ${isToday ? 'today' : ''}${extraClass}" 
                   data-date="${dateStr}" 
                   style="background:${color};opacity:${opacity};${glow}">
                <span class="salah-cal-day">${i}</span>
              </div>`;
    }

    cal.innerHTML = html;
    this.initCalendarTooltip();
  },

  jumpToDate(date) {
    this.selectedDate = date;
    this.renderAll(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  /* ---- Export PDF (Billion Dollar Company Style) ---- */
  exportPDF() {
    const safeStatusMeta = (status) => {
      return this.statusMeta[status] || { color: '#999', label: 'Unknown', points: 0 };
    };

    const [yearStr, monthStr] = this.selectedDate.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let totalPrayed = 0;
    let totalPoints = 0;
    let tableRows = '';

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
      const data = DB.getSalah(dateStr);
      const score = Utils.salahScore(data);
      totalPrayed += score.done;
      totalPoints += this.calcDayPoints(data);

      const dayOfWeek = new Date(year, month, d).toLocaleDateString('en-US', { weekday: 'short' });

      let rowCells = '<td class="cell-date"><span class="date-day">' + d + '</span><span class="date-weekday">' + dayOfWeek + '</span></td>';

      this.prayers.forEach(p => {
        const s = data[p];
        if (!s) {
          rowCells += '<td class="cell-empty">&mdash;</td>';
        } else {
          const meta = safeStatusMeta(s);
          rowCells += '<td><span class="status-dot-cell" style="background:' + meta.color + '; color:' + meta.color + '"></span></td>';
        }
      });

      const rowClass = (d % 2 === 0) ? 'row-alt' : '';
      tableRows += '<tr class="' + rowClass + '">' + rowCells + '</tr>';
    }

    const monthlyConsistency = parseFloat(((totalPrayed / (daysInMonth * 5)) * 100).toFixed(1));
    const user = DB.getUser() || { name: 'Servant of Allah' };

    let statusLabel = 'VULNERABLE';
    let statusColor = '#ef4444';
    let statusBg = '#fef2f2';
    let statusBorder = '#fecaca';
    if (monthlyConsistency >= 90) {
      statusLabel = 'EXCELLENT';
      statusColor = '#059669';
      statusBg = '#ecfdf5';
      statusBorder = '#a7f3d0';
    } else if (monthlyConsistency >= 70) {
      statusLabel = 'GOOD';
      statusColor = '#0891b2';
      statusBg = '#ecfeff';
      statusBorder = '#a5f3fc';
    } else if (monthlyConsistency >= 50) {
      statusLabel = 'NEEDS IMPROVEMENT';
      statusColor = '#d97706';
      statusBg = '#fffbeb';
      statusBorder = '#fde68a';
    }

    const generatedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const css = `
      @page { size: A4; margin: 0; }
      * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: #ffffff; color: #0f172a; font-size: 10px; line-height: 1.4; }
      .page { max-width: 210mm; margin: 0 auto; padding: 28px 32px; }

      /* Header */
      .report-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 20px; border-bottom: 2px solid #e2e8f0; margin-bottom: 22px; }
      .brand-section { display: flex; align-items: center; gap: 14px; }
      .brand-logo { width: 42px; height: 42px; background: linear-gradient(135deg, #6366f1, #a855f7); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 17px; font-weight: 900; letter-spacing: -1px; }
      .brand-text h1 { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #0f172a; line-height: 1.1; }
      .brand-text p { font-size: 9px; color: #64748b; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 3px; }
      .report-meta { text-align: right; }
      .report-meta .user-name { font-size: 14px; font-weight: 700; color: #0f172a; }
      .report-meta .report-period { font-size: 11px; color: #6366f1; font-weight: 700; margin-top: 2px; }
      .report-meta .report-ref { font-size: 8px; color: #94a3b8; margin-top: 5px; font-family: 'SF Mono', 'Fira Code', monospace; letter-spacing: 0.5px; }
      .report-meta .report-date { font-size: 8px; color: #94a3b8; margin-top: 2px; }

      /* Summary Cards */
      .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 24px; }
      .summary-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 10px; text-align: center; }
      .summary-card.primary { background: ${statusBg}; border-color: ${statusBorder}; }
      .summary-card .card-value { font-size: 26px; font-weight: 800; color: #0f172a; line-height: 1; }
      .summary-card.primary .card-value { color: ${statusColor}; }
      .summary-card .card-badge { display: inline-block; font-size: 7px; font-weight: 800; letter-spacing: 1.2px; padding: 3px 8px; border-radius: 6px; margin-top: 6px; background: ${statusBg}; color: ${statusColor}; border: 1px solid ${statusBorder}; }
      .summary-card .card-title { font-size: 8px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin-top: 8px; }

      /* Section Title */
      .section-title { font-size: 10px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0; }

      /* Legend */
      .legend { display: flex; gap: 16px; margin-bottom: 14px; padding: 8px 14px; background: #f1f5f9; border-radius: 8px; border: 1px solid #e2e8f0; }
      .legend-item { display: flex; align-items: center; gap: 5px; font-size: 8px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; }
      .legend-dot { width: 8px; height: 8px; border-radius: 50%; }

      /* Table */
      .data-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; table-layout: fixed; }
      .data-table thead th { font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #475569; padding: 10px 6px; border-bottom: 2px solid #0f172a; text-align: center; background: #f8fafc; }
      .data-table thead th:first-child { text-align: left; padding-left: 12px; width: 14%; }
      .data-table tbody tr { border-bottom: 1px solid #f1f5f9; }
      .data-table tbody tr.row-alt { background: #fafbfd; }
      .data-table tbody td { padding: 8px 6px; text-align: center; vertical-align: middle; font-size: 10px; }
      .data-table tbody td:first-child { text-align: left; padding-left: 12px; }

      .cell-date { display: flex; align-items: baseline; gap: 5px; }
      .date-day { font-size: 12px; font-weight: 700; color: #0f172a; }
      .date-weekday { font-size: 8px; color: #94a3b8; font-weight: 600; }

      .status-dot-cell { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }

      .cell-empty { color: #cbd5e1; font-size: 10px; }

      /* Footer */
      .report-footer { padding-top: 16px; border-top: 1px solid #e2e8f0; }
      .ayah-box { background: linear-gradient(135deg, #f5f3ff, #eef2ff); border-left: 3px solid #6366f1; padding: 12px 16px; border-radius: 0 10px 10px 0; margin-bottom: 14px; }
      .ayah-text { font-size: 10px; color: #475569; font-style: italic; line-height: 1.6; }
      .ayah-ref { font-size: 9px; color: #6366f1; font-weight: 600; margin-top: 4px; font-style: normal; }
      .footer-brand { display: flex; justify-content: space-between; align-items: center; }
      .footer-left { font-size: 8px; color: #94a3b8; letter-spacing: 0.5px; }
      .footer-right { font-size: 8px; color: #94a3b8; font-weight: 600; }

      @media print {
        body { padding: 0; }
        .page { padding: 20mm 18mm; }
        .summary-card { break-inside: avoid; }
        .data-table thead { display: table-row-group; }
        .data-table tbody tr { break-inside: avoid; }
      }
    `;

    const bodyHTML = `
      <div class="page">
        <div class="report-header">
          <div class="brand-section">
            <div class="brand-logo">L</div>
            <div class="brand-text">
              <h1>LAMIM</h1>
              <p>Salah Performance Report</p>
            </div>
          </div>
          <div class="report-meta">
            <div class="user-name">${user.name}</div>
            <div class="report-period">${monthName} ${year}</div>
            <div class="report-ref">REF: ${Date.now().toString(36).toUpperCase()}</div>
            <div class="report-date">Generated: ${generatedDate}</div>
          </div>
        </div>

        <div class="summary-grid">
          <div class="summary-card primary">
            <div class="card-value">${monthlyConsistency}%</div>
            <div class="card-badge">${statusLabel}</div>
            <div class="card-title">Consistency</div>
          </div>
          <div class="summary-card">
            <div class="card-value">${totalPrayed}</div>
            <div class="card-title">Prayers Completed</div>
          </div>
          <div class="summary-card">
            <div class="card-value">${totalPoints}</div>
            <div class="card-title">Deed Points</div>
          </div>
          <div class="summary-card">
            <div class="card-value">${daysInMonth}</div>
            <div class="card-title">Days in Month</div>
          </div>
        </div>

        <div class="section-title">Daily Prayer Record</div>

        <div class="legend">
          <div class="legend-item"><span class="legend-dot" style="background:#3fb950"></span>Jama'at</div>
          <div class="legend-item"><span class="legend-dot" style="background:#58a6ff"></span>Alone</div>
          <div class="legend-item"><span class="legend-dot" style="background:#d29922"></span>Qaza</div>
          <div class="legend-item"><span class="legend-dot" style="background:#f85149"></span>Missed</div>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th style="width:15%">Date</th>
              <th style="width:17%">Fajr</th>
              <th style="width:17%">Dhuhr</th>
              <th style="width:17%">Asr</th>
              <th style="width:17%">Maghrib</th>
              <th style="width:17%">Isha</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <div class="report-footer">
          <div class="ayah-box">
            <div class="ayah-text">"Indeed, prayer prohibits immorality and wrongdoing, and the remembrance of Allah is greater."</div>
            <div class="ayah-ref">— Al-Quran, Surah Al-Ankabut (29:45)</div>
          </div>
          <div class="footer-brand">
            <div class="footer-left">LAMIM ECOSYSTEM • SECURE REPORT</div>
            <div class="footer-right">v4.0.0</div>
          </div>
        </div>
      </div>
    `;

    const closeBtn = '<div id="lamim-close-bar" style="position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:2px solid #e2e8f0;padding:14px 20px;text-align:center;z-index:99999;box-shadow:0 -4px 20px rgba(0,0,0,0.08);display:flex;align-items:center;justify-content:space-between;">'
      + '<span style="font-size:12px;font-weight:600;color:#64748b;">LAMIM Report</span>'
      + '<div style="display:flex;gap:10px;">'
      + '<button onclick="window.print()" style="background:#10b981;color:#fff;border:none;padding:10px 20px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:6px;box-shadow:0 4px 12px rgba(16,185,129,0.3);">'
      + '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>'
      + 'Print / PDF</button>'
      + '<button onclick="window.close()" style="background:#64748b;color:#fff;border:none;padding:10px 16px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;">'
      + '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>'
      + 'Close</button></div></div>';

    const fullHTML = '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"><title>LAMIM - Salah Report ' + monthName + ' ' + year + '</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"><style>' + css + ' body { padding-bottom: 70px; } @media print { #lamim-close-bar { display: none !important; } body { padding-bottom: 0; } }</style></head><body>' + bodyHTML + closeBtn + '</body></html>';

    // Open in new window
    const winName = 'lamim_pdf_' + Date.now();
    const printWindow = window.open('', winName);
    if (!printWindow) {
      Utils.toast('Popup blocked. Please allow popups and try again.', 'error');
      return;
    }

    printWindow.document.open();
    printWindow.document.write(fullHTML);
    printWindow.document.close();
  },

  /* ---- TOOLTIP LOGIC ---- */
  initCalendarTooltip() {
    const cal = document.getElementById('salah-calendar');
    const tooltip = document.getElementById('salah-cal-tooltip');
    if (!cal || !tooltip) return;

    // Prevent duplicate listeners when rendering calendar multiple times
    if (tooltip.dataset.initialized) return;
    tooltip.dataset.initialized = 'true';

    // Move tooltip to body to fix position:fixed issues with transformed parents
    if (tooltip.parentElement !== document.body) {
      document.body.appendChild(tooltip);
    }

    let hideTimeout;

    const showTooltip = (e) => {
      const cell = e.target.closest('.salah-cal-cell');
      if (!cell || !cell.dataset.date) return;
      
      clearTimeout(hideTimeout);
      
      const dateStr = cell.dataset.date;
      tooltip.dataset.activeDate = dateStr;
      
      const data = DB.getSalah(dateStr);
      const score = Utils.salahScore(data);
      
      let html = `
        <div class="tt-header">
          <span class="tt-date">${Utils.formatDate(new Date(dateStr), {month:'short', day:'numeric', year:'numeric'})}</span>
          <span class="tt-score">${score.done}/5</span>
        </div>
        <div class="tt-body">
      `;
      
      this.prayers.forEach(p => {
        const meta = this.prayerMeta[p];
        let statusKey = data[p] || 'pending';
        const isFuture = dateStr > Utils.todayStr();
        const isToday = dateStr === Utils.todayStr();
        
        let sLabel = 'Pending';
        let sColor = 'rgba(255,255,255,0.2)';
        
        if (isFuture) {
          sLabel = 'Future';
        } else if (statusKey !== 'pending') {
          if (this.statusMeta[statusKey]) {
            sLabel = this.statusMeta[statusKey].label;
            sColor = this.statusMeta[statusKey].color;
          }
        } else {
          sLabel = 'Pending';
          sColor = 'var(--color-text-muted)';
        }

        const emojis = { fajr:'🌅', dhuhr:'☀️', asr:'🌤️', maghrib:'🌇', isha:'🌌' };
        
        html += `
          <div class="tt-row">
            <span class="tt-prayer">${emojis[p]} ${meta.label}</span>
            <span class="tt-status" style="color:${sColor}">
              <div class="tt-status-dot" style="background:${sColor}"></div>
              ${sLabel}
            </span>
          </div>
        `;
      });
      html += `</div>`;
      
      tooltip.innerHTML = html;
      tooltip.classList.remove('hidden');
      
      // Force reflow for accurate measurements
      void tooltip.offsetWidth;
      
      const rect = cell.getBoundingClientRect();
      const ttRect = tooltip.getBoundingClientRect();
      
      let top = rect.top - ttRect.height - 10;
      let left = rect.left + (rect.width / 2) - (ttRect.width / 2);
      
      if (top < 10) top = rect.bottom + 10;
      if (left < 10) left = 10;
      if (left + ttRect.width > window.innerWidth - 10) left = window.innerWidth - ttRect.width - 10;
      
      tooltip.style.top = `${top}px`;
      tooltip.style.left = `${left}px`;
      tooltip.style.transform = `scale(1) translateY(0)`;
    };

    cal.addEventListener('mouseover', (e) => {
      if (window.matchMedia("(pointer: coarse)").matches) return; // Ignore on touch
      showTooltip(e);
    });

    cal.addEventListener('click', (e) => {
      const cell = e.target.closest('.salah-cal-cell');
      if (!cell || !cell.dataset.date) return;
      
      const dateStr = cell.dataset.date;
      const isFuture = dateStr > Utils.todayStr();
      if (isFuture) return;

      const isMobile = window.matchMedia("(pointer: coarse)").matches || window.innerWidth <= 768;
      
      if (isMobile) {
        if (tooltip.dataset.activeDate === dateStr && !tooltip.classList.contains('hidden')) {
          Salah.jumpToDate(dateStr);
          tooltip.classList.add('hidden');
        } else {
          showTooltip(e);
        }
      } else {
        Salah.jumpToDate(dateStr);
      }
    });

    cal.addEventListener('mouseout', (e) => {
      if (window.matchMedia("(pointer: coarse)").matches) return;
      const cell = e.target.closest('.salah-cal-cell');
      if (cell) {
        hideTimeout = setTimeout(() => {
          tooltip.classList.add('hidden');
          tooltip.style.transform = `scale(0.95) translateY(10px)`;
          tooltip.dataset.activeDate = '';
        }, 100);
      }
    });

    // Dismiss on mobile when clicking outside
    document.addEventListener('click', (e) => {
      const isMobile = window.matchMedia("(pointer: coarse)").matches || window.innerWidth <= 768;
      if (isMobile) {
        if (!e.target.closest('.salah-cal-cell') && !e.target.closest('#salah-cal-tooltip')) {
           tooltip.classList.add('hidden');
           tooltip.dataset.activeDate = '';
        }
      }
    });
  },

  resetToday() {
    UI.showSettingsModal({
      title: 'Reset Salah Data?',
      desc: `Clear all records for ${Utils.formatDate(new Date(this.selectedDate + 'T00:00:00'), {day:'numeric', month:'short'})}?`,
      confirmText: 'Yes, Reset',
      type: 'danger',
      onConfirm: () => {
        const data = DB.getSalah(this.selectedDate);
        ['fajr','dhuhr','asr','maghrib','isha'].forEach(p => delete data[p]);
        DB.setSalah(this.selectedDate, data);
        this.renderAll(true);
        Home.render(); // Also update home stats
        Utils.toast('Salah data cleared', 'info');
      }
    });
  }
};

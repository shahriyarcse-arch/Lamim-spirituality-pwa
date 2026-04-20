/* =============================================
   LAMIM — SALAH MODULE (Farz Only)
   Only 5 waqt farz namaz. No sunnah/nafl/tahajjud here.
   Once selected, cannot be changed.
   ============================================= */
const Salah = {
  prayers: ['fajr','dhuhr','asr','maghrib','isha'],
  prayerMeta: {
    fajr:    { label: 'Fajr',    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><g><animateTransform attributeName="transform" type="translate" values="0,1; 0,-1; 0,1" dur="4s" repeatCount="indefinite"/><path d="M16 18a4 4 0 0 0-8 0"/></g><g><animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/><path d="M12 2v8"/><path d="m4.93 10.93 1.41 1.41"/><path d="m17.66 12.34 1.41-1.41"/><path d="M8 6l4-4 4 4"/></g><path d="M2 18h20"/><path d="M22 22H2"/></svg>', gradient: 'linear-gradient(135deg, #f472b6, #ec4899)', timeLabel: 'Dawn' },
    dhuhr:   { label: 'Dhuhr',   icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><g style="transform-origin: 12px 12px"><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="10s" repeatCount="indefinite"/><circle cx="12" cy="12" r="4"><animate attributeName="r" values="3.5; 4.5; 3.5" dur="3s" repeatCount="indefinite"/></circle><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></g></svg>', gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)', timeLabel: 'Midday' },
    asr:     { label: 'Asr',     icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><g><animateTransform attributeName="transform" type="translate" values="-1,0; 1,0; -1,0" dur="5s" repeatCount="indefinite"/><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"/></g><g style="transform-origin: 12px 12px"><animateTransform attributeName="transform" type="rotate" values="-15; 15; -15" dur="4s" repeatCount="indefinite"/><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/></g></svg>', gradient: 'linear-gradient(135deg, #fb923c, #f97316)', timeLabel: 'Afternoon' },
    maghrib: { label: 'Maghrib', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><g><animateTransform attributeName="transform" type="translate" values="0,-1; 0,1.5; 0,-1" dur="5s" repeatCount="indefinite"/><path d="M16 18a4 4 0 0 0-8 0"/><path d="M12 10v4"/><path d="m4.93 10.93 1.41 1.41"/><path d="m17.66 12.34 1.41-1.41"/><path d="M8 14l4 4 4-4"/></g><path d="M2 18h20"/><path d="M22 22H2"/></svg>', gradient: 'linear-gradient(135deg, #a855f7, #8b5cf6)', timeLabel: 'Sunset' },
    isha:    { label: 'Isha',    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><g style="transform-origin: 12px 12px"><animateTransform attributeName="transform" type="rotate" values="-10; 10; -10" dur="6s" repeatCount="indefinite"/><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></g><circle cx="20" cy="4" r="1"><animate attributeName="opacity" values="0.2;1;0.2" dur="3s" repeatCount="indefinite"/></circle><circle cx="4" cy="18" r="1"><animate attributeName="opacity" values="1;0.2;1" dur="4s" repeatCount="indefinite"/></circle></svg>', gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)', timeLabel: 'Night' }
  },
  statuses: ['jamaat','alone','qaza','missed'],
  statusMeta: {
    jamaat: { label: "Jama'at", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><g><animateTransform attributeName="transform" type="translate" values="0,0; 0,-1.5; 0,0" dur="2.5s" repeatCount="indefinite"/><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></g><g><animateTransform attributeName="transform" type="translate" values="0,-1; 0,0.5; 0,-1" dur="3s" repeatCount="indefinite"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></g></svg>', color: '#3fb950', bgAlpha: 'rgba(63,185,80,0.12)', borderAlpha: 'rgba(63,185,80,0.4)', desc: 'Congregation', result: 'successful', points: 10 },
    alone:  { label: 'Alone',   icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><g style="transform-origin: center"><animateTransform attributeName="transform" type="scale" values="1; 1.08; 1" dur="3.5s" repeatCount="indefinite"/><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></g></svg>', color: '#58a6ff', bgAlpha: 'rgba(88,166,255,0.12)', borderAlpha: 'rgba(88,166,255,0.4)', desc: 'Individual',   result: 'successful', points: 7 },
    qaza:   { label: 'Qaza',    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><g style="transform-origin: 12px 12px"><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="4s" repeatCount="indefinite"/><line x1="12" y1="12" x2="16" y2="12"></line></g><line x1="12" y1="6" x2="12" y2="12"></line></svg>', color: '#d29922', bgAlpha: 'rgba(210,153,34,0.12)', borderAlpha: 'rgba(210,153,34,0.4)', desc: 'Made up later', result: 'qaza',       points: 3 },
    missed: { label: 'Missed',  icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><g><animate attributeName="opacity" values="1; 0.5; 1" dur="1.5s" repeatCount="indefinite"/><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></g></svg>', color: '#f85149', bgAlpha: 'rgba(248,81,73,0.12)', borderAlpha: 'rgba(248,81,73,0.4)', desc: 'Not prayed',    result: 'unsuccessful', points: 0 }
  },

  // Backward compat labels
  prayerLabels: { fajr:'Fajr', dhuhr:'Dhuhr', asr:"Asr", maghrib:'Maghrib', isha:'Isha' },
  statusLabels: { jamaat:'Jama\'at', alone:'Alone', qaza:'Qaza', missed:'Missed' },

  init() {
    this.selectedDate = Utils.todayStr();
    this.renderAll();
    this.bindDateNav();
    this.initCalendarTooltip();
  },

  renderAll() {
    this.renderHeader();
    this.renderPrayerTimes();
    this.renderStats();
    this.renderPrayerCards();
    this.renderCalendar();
  },

  /* ---- HEADER ---- */
  renderHeader() {
    const date = this.selectedDate;
    const isToday = date === Utils.todayStr();
    const dateLabel = document.getElementById('salah-date-label');
    if (dateLabel) {
      if (isToday) {
        dateLabel.textContent = 'Today';
        dateLabel.className = 'badge badge-blue';
      } else {
        dateLabel.textContent = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        dateLabel.className = 'badge badge-amber';
      }
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
          <div class="pill-icon">${meta.icon}</div>
          <div class="pill-name">${meta.label}</div>
          <div class="pill-time">${t.label}</div>
          ${isNext ? '<div class="pill-next-badge">Next</div>' : ''}
        </div>
      `;
    }).join('');
  },

  scrollToPrayer(prayer) {
    const el = document.getElementById(`salah-card-${prayer}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  },

  /* ---- Stats ---- */
  renderStats() {
    const date = this.selectedDate;
    const salah = DB.getSalah(date);
    const score = Utils.salahScore(salah);
    const streak = DB.getSalahStreak();
    const points = this.calcDayPoints(salah);

    const el = document.getElementById('salah-stats');
    if (!el) return;
    el.innerHTML = `
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
          <div class="salah-stat-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-accent-orange)"><g style="transform-origin: center"><animateTransform attributeName="transform" type="scale" values="1; 1.15; 1" dur="1.2s" repeatCount="indefinite"/><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></g></svg></div>
          <div class="salah-stat-info">
            <div class="salah-stat-val">${streak.perfect}d</div>
            <div class="salah-stat-label">Perfect</div>
          </div>
        </div>
        <div class="salah-stat-card stat-consistent">
          <div class="salah-stat-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-accent-green)"><g style="transform-origin: center"><animateTransform attributeName="transform" type="translate" values="0,0; 0,-2; 0,0" dur="2s" repeatCount="indefinite"/><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></g></svg></div>
          <div class="salah-stat-info">
            <div class="salah-stat-val">${streak.consistency}d</div>
            <div class="salah-stat-label">Consistent</div>
          </div>
        </div>
        <div class="salah-stat-card stat-points">
          <div class="salah-stat-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-accent-gold)"><g style="transform-origin: center"><animateTransform attributeName="transform" type="rotate" values="0; 360" dur="8s" repeatCount="indefinite"/><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></g></svg></div>
          <div class="salah-stat-info">
            <div class="salah-stat-val">${points}</div>
            <div class="salah-stat-label">Points</div>
          </div>
        </div>
        <div class="salah-stat-card">
          <div class="salah-stat-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-accent-blue)"><line x1="18" y1="20" x2="18" y2="10"><animate attributeName="y2" values="10; 6; 14; 10" dur="2s" repeatCount="indefinite"/></line><line x1="12" y1="20" x2="12" y2="4"><animate attributeName="y2" values="4; 12; 4" dur="2.5s" repeatCount="indefinite"/></line><line x1="6" y1="20" x2="6" y2="14"><animate attributeName="y2" values="14; 8; 16; 14" dur="3s" repeatCount="indefinite"/></line></svg></div>
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
        <circle cx="28" cy="28" r="${r}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="5"/>
        ${svgSegments}
      </svg>
    `;
  },

  /* ---- Prayer cards (Farz only, no edit after selection) ---- */
  renderPrayerCards(date) {
    date = date || this.selectedDate;
    this.selectedDate = date;
    const salah = DB.getSalah(date);
    const container = document.getElementById('salah-cards');
    if (!container) return;

    container.innerHTML = `
      <div class="salah-cards-container">
        ${this.prayers.map((p, idx) => {
          const meta = this.prayerMeta[p];
          const currentStatus = salah[p];
          const isLocked = !!currentStatus;
          const statusInfo = currentStatus ? this.statusMeta[currentStatus] : null;

          return `
            <div class="salah-prayer-card ${currentStatus ? 'has-status status-' + currentStatus : ''}"
                 id="salah-card-${p}"
                 style="animation-delay: ${idx * 0.06}s">
              
              <!-- Prayer Header -->
              <div class="salah-prayer-header">
                <div class="salah-prayer-icon-wrap" style="background: ${meta.gradient}">
                  <span class="salah-prayer-emoji">${meta.icon}</span>
                </div>
                <div class="salah-prayer-info">
                  <div class="salah-prayer-name">${meta.label}</div>
                  <div class="salah-prayer-time">${this.getPrayerTime(p)} · ${meta.timeLabel}</div>
                </div>
                <div class="salah-prayer-status-badge">
                  ${currentStatus
                    ? `<div class="salah-status-chip" style="background:${statusInfo.bgAlpha};border-color:${statusInfo.borderAlpha};color:${statusInfo.color}">
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
                     <div class="salah-locked-icon" style="color:${statusInfo.color}">${statusInfo.icon}</div>
                     <div class="salah-locked-info">
                       <div class="salah-locked-status" style="color:${statusInfo.color}">${statusInfo.label}</div>
                       <div class="salah-locked-desc" style="display:flex;align-items:center;gap:3px">
                         ${statusInfo.result === 'successful' ? '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-accent-green)"><polyline points="20 6 9 17 4 12"></polyline></svg> Successful' : statusInfo.result === 'qaza' ? '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-accent-amber)"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> Qaza' : '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-accent-red)"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Unsuccessful'} 
                         <span style="opacity:0.5;margin:0 2px">•</span> +${statusInfo.points} pts
                       </div>
                     </div>
                     <svg class="salah-lock-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                   </div>`
                : `<div class="salah-status-selector">
                     <div class="salah-options-label">How did you pray?</div>
                     <div class="salah-options-grid">
                       ${this.statuses.map((s, btnIdx) => {
                         const sm = this.statusMeta[s];
                         return `
                           <button class="salah-option-btn"
                                   style="animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both; animation-delay: ${0.2 + (btnIdx * 0.05)}s;"
                                   onclick="Salah.selectStatus('${p}','${s}','${date}')">
                             <span class="salah-opt-icon">${sm.icon}</span>
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
    if (salah[prayer]) return; // Already set, cannot change

    salah[prayer] = status;
    DB.setSalah(date, salah);

    this.renderPrayerCards(date);
    this.renderCalendar();
    Home.render();

    const sm = this.statusMeta[status];
    const result = sm.result === 'successful' ? '✅' : sm.result === 'qaza' ? '⏰' : '❌';
    Utils.toast(`${this.prayerMeta[prayer].label} — ${sm.label} ${result} (+${sm.points} pts)`, status === 'missed' ? 'warning' : 'success');

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
    document.getElementById('salah-prev-day')?.addEventListener('click', () => {
      const d = new Date(this.selectedDate + 'T00:00:00');
      d.setDate(d.getDate() - 1);
      this.selectedDate = Utils.dateStr(d);
      this.renderAll();
    });
    document.getElementById('salah-next-day')?.addEventListener('click', () => {
      const d = new Date(this.selectedDate + 'T00:00:00');
      d.setDate(d.getDate() + 1);
      if (Utils.dateStr(d) <= Utils.todayStr()) {
        this.selectedDate = Utils.dateStr(d);
        this.renderAll();
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
        <div style="font-size:10px; font-weight:var(--fw-bold); color:var(--color-text-muted); text-align:center; padding-bottom:8px">S</div>
        <div style="font-size:10px; font-weight:var(--fw-bold); color:var(--color-text-muted); text-align:center; padding-bottom:8px">M</div>
        <div style="font-size:10px; font-weight:var(--fw-bold); color:var(--color-text-muted); text-align:center; padding-bottom:8px">T</div>
        <div style="font-size:10px; font-weight:var(--fw-bold); color:var(--color-text-muted); text-align:center; padding-bottom:8px">W</div>
        <div style="font-size:10px; font-weight:var(--fw-bold); color:var(--color-text-muted); text-align:center; padding-bottom:8px">T</div>
        <div style="font-size:10px; font-weight:var(--fw-bold); color:var(--color-text-muted); text-align:center; padding-bottom:8px">F</div>
        <div style="font-size:10px; font-weight:var(--fw-bold); color:var(--color-text-muted); text-align:center; padding-bottom:8px">S</div>
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
    this.renderAll();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  /* ---- Export ---- */
  exportCSV() {
    const hist = DB.getSalahHistory(30);
    const rows = [['Date','Fajr','Dhuhr','Asr','Maghrib','Isha','Prayed','Score%','Points']];
    hist.forEach(({ date, data }) => {
      const score = Utils.salahScore(data);
      const pts = this.calcDayPoints(data);
      rows.push([date, data.fajr||'', data.dhuhr||'', data.asr||'', data.maghrib||'', data.isha||'', score.done, score.pct, pts]);
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'lamim_salah_log.csv'; a.click();
    Utils.toast('Salah log exported!', 'success');
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
          sColor = 'rgba(255,255,255,0.3)';
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
  }
};

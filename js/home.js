/* =============================================
   LAMIM — HOME MODULE
   ============================================= */
const Home = {
  countdownRAF: null,
  dateTimeRAF: null,

  init() { this.render(); },

  render() {
    const user = DB.getUser();
    if (!user) return;

    // Greeting
    const hour = new Date().getHours();
    const greet = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
    const el = document.getElementById('home-greeting');
    if (el) el.innerHTML = `
      <div class="greeting-text">As-salamu alaykum, <span style="background:linear-gradient(to right,#f0c456,#fbbf24);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${user.name?.split(' ')[0] || ''}</span> 👋</div>
      <div class="greeting-sub">${greet}</div>
    `;

    // Live Date Time (accurate, no lag)
    this.startLiveDateTime();

    // Date bar
    const db = document.getElementById('home-date-bar');
    if (db) db.innerHTML = `
      <div class="date-chip">🗓️ ${Utils.toHijri(Utils.getOffsetDate())}</div>
      <div class="streak-badge"><span class="fire">🔥</span>${DB.getSalahStreak().perfect}d Perfect</div>
      <div class="streak-badge" style="color:var(--color-accent-green)"><span style="margin-right:4px">🌱</span>${DB.getSalahStreak().consistency}d Consistent</div>
    `;

    // Next prayer banner
    this.startNextPrayerCountdown();

    // Salah ring
    this.renderSalahRing();

    // Quote
    const q = Utils.getQuote();
    const qEl = document.getElementById('home-quote');
    if (qEl) qEl.innerHTML = `
      <div class="quote-arabic">${q.arabic}</div>
      <div class="quote-translation">${q.translation}</div>
    `;

    // Mini heatmap
    this.renderMiniHeatmap();
  },

  /* ---- Live Date Time (using rAF for zero lag) ---- */
  startLiveDateTime() {
    const el = document.getElementById('home-live-datetime');
    if (!el) return;

    // Cancel any existing loop
    if (this.dateTimeRAF) cancelAnimationFrame(this.dateTimeRAF);

    let lastSec = -1;
    const tick = () => {
      const now = new Date();
      const sec = now.getSeconds();

      // Only update DOM when second changes
      if (sec !== lastSec) {
        lastSec = sec;
        const isMobile = window.innerWidth <= 768;
        
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const enDate = now.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: isMobile ? 'short' : 'long', 
          day: 'numeric' 
        });
        const bnDate = new Intl.DateTimeFormat('bn-BD', { 
          day: 'numeric', 
          month: isMobile ? 'short' : 'long', 
          year: 'numeric' 
        }).format(now);
        const hijriDate = Utils.toHijri(now);

        el.innerHTML = `
          <div class="live-time-text">${timeStr}</div>
          <div class="live-date-en">${enDate}</div>
          <div class="live-date-bn">${bnDate}</div>
          <div class="live-date-hj">${hijriDate}</div>
        `;
      }

      this.dateTimeRAF = requestAnimationFrame(tick);
    };

    this.dateTimeRAF = requestAnimationFrame(tick);
  },

  /* ---- Next Prayer Countdown (rAF — smooth, no lag) ---- */
  startNextPrayerCountdown() {
    const times = Utils.calcPrayerTimes();
    const next  = Utils.getNextPrayer(times);
    const el    = document.getElementById('home-next-prayer');
    if (!el) return;

    el.innerHTML = `
      <div class="next-prayer-info">
        <h3>Next Prayer</h3>
        <div class="next-prayer-name">${next.name.charAt(0).toUpperCase()+next.name.slice(1)}</div>
        <div class="next-prayer-time">${next.label}</div>
      </div>
      <div class="prayer-countdown">
        <div class="countdown" id="home-countdown">${Utils.countdownTo(next.time)}</div>
        <div class="countdown-label">Remaining</div>
      </div>
    `;

    // Cancel previous loop
    if (this.countdownRAF) cancelAnimationFrame(this.countdownRAF);

    let lastCountdown = '';
    const tickCountdown = () => {
      // Recalculate to stay accurate
      const t = Utils.calcPrayerTimes();
      const n = Utils.getNextPrayer(t);
      const cd = Utils.countdownTo(n.time);

      // Only touch DOM when value changes
      if (cd !== lastCountdown) {
        lastCountdown = cd;
        const cdEl = document.getElementById('home-countdown');
        if (cdEl) cdEl.textContent = cd;
      }

      this.countdownRAF = requestAnimationFrame(tickCountdown);
    };

    this.countdownRAF = requestAnimationFrame(tickCountdown);
  },

  renderSalahRing() {
    const today = DB.getSalah(Utils.todayStr());
    const score = Utils.salahScore(today);
    const el = document.getElementById('home-salah-ring');
    if (!el) return;
    const circumference = 2 * Math.PI * 54;
    const offset = circumference - (score.pct / 100) * circumference;
    const color = score.done === 5 ? 'var(--color-accent-green)' : score.done >= 3 ? 'var(--color-accent-amber)' : 'var(--color-accent-red)';
    el.innerHTML = `
      <div class="ring-chart" style="width:140px;height:140px">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle class="ring-chart-bg" cx="70" cy="70" r="54" stroke-width="12"/>
          <circle class="ring-chart-fill" cx="70" cy="70" r="54" stroke-width="12"
            stroke="${color}" stroke-dasharray="${circumference}"
            stroke-dashoffset="${offset}" style="transition:stroke-dashoffset 1s ease"/>
        </svg>
        <div class="ring-chart-label">
          <div style="font-size:2rem;font-weight:800;color:${color}">${score.done}</div>
          <div style="font-size:0.7rem;color:var(--color-text-muted)">of 5</div>
        </div>
      </div>
      <div style="text-align:center;">
        <div style="font-size:var(--text-lg);font-weight:700">Today's Salah</div>
        <div style="color:var(--color-text-muted);font-size:var(--text-sm);margin-top:4px">${score.done}/5 prayers completed</div>
        <div class="progress-bar mt-2" style="width:140px">
          <div class="progress-fill" style="width:${score.pct}%;background:${color}"></div>
        </div>
      </div>
    `;
  },

  renderMiniHeatmap() {
    const el = document.getElementById('home-mini-heatmap');
    if (!el) return;
    const history = DB.getSalahHistory(21);
    const today   = Utils.todayStr(); // Already uses 3AM offset
    el.innerHTML = history.map(({ date, data }) => {
      const score = Utils.salahScore(data);
      let cls = '';
      let glowCls = '';
      if (score.done === 5) {
        cls = 'full';
        if (score.pct >= 90) glowCls = 'glow-high';
        else if (score.pct >= 70) glowCls = 'glow-med';
        else glowCls = 'glow-low';
      }
      else if (score.done >= 3) cls = 'partial';
      else if (score.done > 0) cls = 'low';
      else if (date < today) cls = 'none';
      return `<div class="heatmap-cell ${cls} ${glowCls} ${date===today?'today':''}" title="${date}: ${score.done}/5 (${score.pct}%)"></div>`;
    }).join('');
  }
};

const Home = {
  countdownRAF: null,
  dateTimeRAF: null,
  insightInterval: null,
  insightTimeout: null,
  _cachedSHS: null,
  _lastPrayerName: null,

  init() { 
    this.render(); 
    if (!this._boundDataUpdated) {
      window.addEventListener('lamim:data-updated', () => {
        if (document.getElementById('section-home')?.classList.contains('active')) {
          this.render();
        }
      });
      this._boundDataUpdated = true;
    }
  },

  cleanup() {
    if (this.countdownRAF) { cancelAnimationFrame(this.countdownRAF); this.countdownRAF = null; }
    if (this.dateTimeRAF)  { cancelAnimationFrame(this.dateTimeRAF);  this.dateTimeRAF = null; }
    if (this.insightInterval) { clearInterval(this.insightInterval); this.insightInterval = null; }
    if (this.insightTimeout) { clearTimeout(this.insightTimeout); this.insightTimeout = null; }
  },

  render() {
    const user = DB.getUser();
    if (!user) return;

    const times = Utils.calcPrayerTimes();
    const now = new Date();
    const nowTime = Utils.timeToMin(now);

    const fajr = Utils.timeToMin(times[0].time);
    const dhuhr = Utils.timeToMin(times[1].time);
    const asr = Utils.timeToMin(times[2].time);
    const maghrib = Utils.timeToMin(times[3].time);
    const isha = Utils.timeToMin(times[4].time);

    let greet = 'Good Night';
    if (nowTime >= fajr && nowTime < dhuhr) greet = 'Good Morning';
    else if (nowTime >= dhuhr && nowTime < asr) greet = 'Good Noon';
    else if (nowTime >= asr && nowTime < maghrib) greet = 'Good Afternoon';
    else if (nowTime >= maghrib && nowTime < isha) greet = 'Good Evening';

    const rawName = (user && typeof user.name === 'string') ? user.name : 'User';
    const nameParts = rawName.trim().split(/\s+/);
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0];
    const safeLastName = Utils.escapeHTML(lastName);

    const el = document.getElementById('home-greeting');
    if (el) el.innerHTML = `
      <div class="greeting-container">
        <div class="greeting-badge">
          <span class="greeting-badge-dot"></span>
          <span class="greeting-badge-text">${window.t ? window.t(greet) : greet}</span>
        </div>
        <h2 class="greeting-title">
          ${window.t ? window.t('As-salamu alaykum, ') : 'As-salamu alaykum, '}<span class="greeting-name">${safeLastName}</span>
          <svg class="greeting-star" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-gold)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
        </h2>
      </div>
    `;

    this.startLiveDateTime();

    this._cachedSHS = Analysis.calculateSHS();

    const db = document.getElementById('home-date-bar');
    if (db) {
      const shs = this._cachedSHS;
      db.innerHTML = `
        <div class="shs-dashboard-card">
          <div class="shs-dashboard-left">
            <div class="shs-mini-title">${window.t ? window.t('SPIRITUAL ENERGY') : 'Spiritual Energy'}</div>
            <div class="shs-aura-wrapper">
              <div class="shs-aura mini" style="--aura-color: ${shs.rating.color}; box-shadow: 0 0 25px -5px ${shs.rating.color}cc;">
                <span class="shs-val-number">${window.n ? window.n(Math.round(shs.total)) : Math.round(shs.total)}</span>
              </div>
              <div class="shs-pulse-spot-wrap" id="shs-pulse-graph-spot"></div>
            </div>
          </div>
          <div class="shs-dashboard-right">
            <div class="shs-mini-title">${window.t ? window.t('ACTIVE STREAKS') : 'Active Streaks'}</div>
            <div class="shs-streaks-row">
              <div class="shs-streak-item perfect">
                <span class="shs-streak-icon">🔥</span>
                <div class="shs-streak-details">
                  <span class="shs-streak-value">${window.n ? window.n(DB.getSalahStreak().perfect) : DB.getSalahStreak().perfect}d</span>
                  <span class="shs-streak-label">${window.t ? window.t('Perfect') : 'Perfect'}</span>
                </div>
              </div>
              <div class="shs-streak-item consistent">
                <span class="shs-streak-icon">🍃</span>
                <div class="shs-streak-details">
                  <span class="shs-streak-value">${window.n ? window.n(DB.getSalahStreak().consistency) : DB.getSalahStreak().consistency}d</span>
                  <span class="shs-streak-label">${window.t ? window.t('Consistent') : 'Consistent'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    this.startNextPrayerCountdown();
    this.renderSalahRing();
    this.renderIhsanLevel();
    this.renderSpiritualPulse();
    this.renderAIInsight();
    this.renderNurParticles();
  },

  renderIhsanLevel() {
    const container = document.getElementById('home-level-progress-container');
    if (!container) return;
    
    const shs = this._cachedSHS || Analysis.calculateSHS();
    const ranks = [
      { min: 0,  label: 'Ghafil' },
      { min: 15, label: 'Musafir' },
      { min: 30, label: 'Murid' },
      { min: 50, label: 'Mujahid' },
      { min: 65, label: 'Mukhlis' },
      { min: 80, label: 'Muttaqi' },
      { min: 90, label: 'Muhsin' },
      { min: 101, label: 'Wali' }
    ];

    let curIdx = ranks.findIndex(r => shs.total < r.min) - 1;
    if (curIdx < 0) curIdx = 0;
    
    const current = ranks[curIdx];
    const next = ranks[curIdx + 1] || current;
    const diff = next.min - current.min;
    const prog = diff > 0 ? ((shs.total - current.min) / diff) * 100 : 100;

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; margin-bottom:8px; align-items:flex-end">
        <div style="display:flex; flex-direction:column">
          <span style="font-size:9px; font-weight:800; opacity:0.5; text-transform:uppercase; letter-spacing:1px">${window.t ? window.t('CURRENT RANK') : 'Current Rank'}</span>
          <span style="font-size:15px; font-weight:900; color:${shs.rating.color}">${window.t ? window.t(current.label) : current.label}</span>
        </div>
        <div style="text-align:right; display:flex; flex-direction:column">
          <span style="font-size:9px; font-weight:800; color:var(--color-text-muted); text-transform:uppercase; opacity:0.8">${window.t ? window.t('Next') : 'Next'}: ${window.t ? window.t(next.label) : next.label}</span>
          <span style="font-size:11px; font-weight:700; color:var(--color-text-secondary)">${window.n ? window.n(Math.round(prog)) : Math.round(prog)}%</span>
        </div>
      </div>
      <div style="height:6px; background:var(--color-divider-subtle); border-radius:10px; position:relative; overflow:visible">
        <div style="width:${prog}%; height:100%; background:linear-gradient(90deg, ${shs.rating.color}, var(--color-accent-gold)); border-radius:10px; position:relative; box-shadow:0 0 12px ${shs.rating.color}50">
          <div style="position:absolute; right:-5px; top:-4px; width:14px; height:14px; background:var(--color-bg-elevated); border-radius:50%; border:3px solid ${shs.rating.color}; box-shadow:0 0 10px ${shs.rating.color}"></div>
        </div>
      </div>
    `;
  },

  renderSpiritualPulse() {
    const container = document.getElementById('shs-pulse-graph-spot');
    if (!container) return;
    
    const color = (this._cachedSHS || Analysis.calculateSHS()).rating.color;
    container.style.overflow = 'visible';
    container.style.width = '80px'; 
    
    container.innerHTML = `
      <svg width="80" height="30" viewBox="0 0 100 30" style="opacity:0.8; filter: drop-shadow(0 0 5px ${color}40);">
        <defs>
          <linearGradient id="pGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:${color};stop-opacity:0" />
            <stop offset="50%" style="stop-color:${color};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${color};stop-opacity:0" />
          </linearGradient>
        </defs>
        <path d="M 0,15 Q 10,15 15,15 T 25,5 T 35,25 T 45,15 T 55,15 T 65,15 T 75,5 T 85,25 T 100,15" 
              fill="none" stroke="url(#pGrad)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <animate attributeName="stroke-dasharray" from="0,200" to="200,0" dur="3s" repeatCount="indefinite" />
        </path>
      </svg>
    `;
  },

  renderAIInsight() {
    const container = document.getElementById('home-ai-insight-container');
    if (!container) return;
    
    const quotes = [
      "Small consistent deeds are most beloved to Allah. You are building something beautiful.",
      "The sweetness of faith is found in the stillness of Salah. Breathe and focus today.",
      "Every step towards light is a step away from chaos. Keep moving forward.",
      "Spiritual growth is a quiet journey. Your effort is seen and cherished.",
      "Patience transforms trials into triumphs. Stay steadfast in your path.",
      "A moment of sincere Dhikr can purify a day of worldly dust.",
      "Your heart was made to hold the Infinite. Do not fill it with the temporary.",
      "Tawakkul is knowing that even in the storm, you are in His hands.",
      "Tears shed in repentance are the water that grows the garden of the soul.",
      "The heaviest deed on the scales is good character. Polish your manners today.",
      "A grateful heart is a magnet for miracles. Alhamdulillah for everything.",
      "When you feel distant, remember that He is closer to you than your jugular vein.",
      "Sujud is the only position where your brain is below your heart. Let it lead.",
      "Forgive others, so that you may be forgiven. Let go of the heavy burdens.",
      "The Qur'an is a compass for the lost soul. Read a page and find your direction.",
      "Do not let a bad day make you feel like you have a bad life. Trust His plan.",
      "Every test is an elevation in rank if endured with beautiful patience.",
      "A hidden good deed is like a hidden treasure. Build your secret reserves.",
      "Do not look at the smallness of the sin, but at the Greatness of Whom you disobeyed.",
      "The night is long; do not shorten it with sleep. The day is bright; do not darken it with sins.",
      "True wealth is the contentment of the soul. Seek richness within.",
      "Speak a good word or remain silent. Your words shape your spiritual reality.",
      "The best of you are those who are best to their families. Start charity at home.",
      "Never lose hope in the Mercy of Allah. It encompasses all things.",
      "A day without remembering Him is a day truly lost. Keep your tongue moist with Dhikr."
    ];
    let qIdx = Math.floor(Math.random() * quotes.length);

    container.innerHTML = `
      <style>
        .ai-insight-text {
           transition: opacity 0.6s ease, filter 0.6s ease, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
           opacity: 1;
           filter: blur(0px);
           transform: translateY(0);
        }
        .ai-insight-text.fade-out {
           opacity: 0;
           filter: blur(5px);
           transform: translateY(-5px);
        }
        .ai-insight-text.fade-in-prep {
           opacity: 0;
           filter: blur(5px);
           transform: translateY(5px);
           transition: none;
        }
        .ai-insight-icon-wrap {
           transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.5s ease;
        }
        .ai-insight-icon-wrap.pulse {
           transform: scale(1.1);
           box-shadow: 0 0 25px rgba(167,139,250,0.6) !important;
        }
      </style>
      <div class="card" style="background:linear-gradient(135deg, rgba(167,139,250,0.1) 0%, rgba(192,132,252,0.05) 100%); border:1px solid rgba(167,139,250,0.15); padding:16px; display:flex; align-items:center; gap:16px; backdrop-filter:blur(10px)">
        <div id="home-insight-icon" class="ai-insight-icon-wrap" style="width:36px; height:36px; background:var(--color-accent-primary); border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; box-shadow:0 0 15px rgba(167,139,250,0.3)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-bg-primary)" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        </div>
        <div style="display:flex; flex-direction:column; gap:2px; flex: 1;">
          <span style="font-size:9px; font-weight:800; text-transform:uppercase; letter-spacing:1.5px; color:var(--color-accent-primary)">${window.t ? window.t('SPIRITUAL INSIGHT') : 'Spiritual Insight'}</span>
          <div style="min-height: 34px; display: flex; align-items: center;">
            <p id="home-insight-text" class="ai-insight-text" style="font-size:12px; font-weight:600; margin:0; line-height:1.4; color:var(--color-text-secondary)">${window.t ? window.t(quotes[qIdx]) : quotes[qIdx]}</p>
          </div>
        </div>
      </div>
    `;

    if (this.insightInterval) clearInterval(this.insightInterval);
    if (this.insightTimeout) clearTimeout(this.insightTimeout);

    this.insightInterval = setInterval(() => {
      if (!document.getElementById('section-home')?.classList.contains('active')) {
        clearInterval(this.insightInterval);
        this.insightInterval = null;
        if (this.insightTimeout) {
          clearTimeout(this.insightTimeout);
          this.insightTimeout = null;
        }
        return;
      }

      const textEl = document.getElementById('home-insight-text');
      const iconEl = document.getElementById('home-insight-icon');
      if (!textEl) return;

      textEl.classList.add('fade-out');

      this.insightTimeout = setTimeout(() => {
        let newIdx = Math.floor(Math.random() * quotes.length);
        while (newIdx === qIdx && quotes.length > 1) {
          newIdx = Math.floor(Math.random() * quotes.length);
        }
        qIdx = newIdx;
        
        textEl.classList.remove('fade-out');
        textEl.classList.add('fade-in-prep');
        textEl.textContent = quotes[qIdx];
        
        if (iconEl) iconEl.classList.add('pulse');

        void textEl.offsetWidth;

        textEl.classList.remove('fade-in-prep');
        
        this.insightTimeout = setTimeout(() => {
          if (iconEl) iconEl.classList.remove('pulse');
          this.insightTimeout = null;
        }, 500);

      }, 600);
    }, 10000);
  },

  renderNurParticles() {
    const container = document.getElementById('nur-particles-container');
    if (!container || container.children.length > 0) return;
    
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 12; i++) {
      const p = document.createElement('div');
      const size = Math.random() * 3 + 2;
      p.style.cssText = `
        position:absolute; width:${size}px; height:${size}px; background:var(--color-accent-gold); border-radius:50%;
        filter:blur(1px); box-shadow:0 0 8px var(--color-accent-gold);
        top:${Math.random() * 100}%; left:${Math.random() * 100}%; opacity:${Math.random() * 0.3};
        animation:nurRise ${15 + Math.random() * 15}s linear infinite;
      `;
      fragment.appendChild(p);
    }
    container.appendChild(fragment);

    if (!document.getElementById('nur-rise-style')) {
      const s = document.createElement('style');
      s.id = 'nur-rise-style';
      s.textContent = `@keyframes nurRise { 0% { transform:translateY(0) scale(1); opacity:0 } 20% { opacity:0.3 } 80% { opacity:0.3 } 100% { transform:translateY(-100vh) scale(0.5); opacity:0 } }`;
      document.head.appendChild(s);
    }
  },

  startLiveDateTime() {
    const el = document.getElementById('home-live-datetime');
    if (!el) return;

    if (this.dateTimeRAF) cancelAnimationFrame(this.dateTimeRAF);

    if (!el.innerHTML.includes('chronometer-card')) {
      el.innerHTML = `
        <div class="chronometer-card">
          <div class="chronometer-main">
            <div class="chronometer-live">
              <span class="chronometer-dot"></span>
              <span class="chronometer-status-text">${window.t ? window.t('LIVE WAQT') : 'LIVE WAQT'}</span>
            </div>
            <div id="live-time-val" class="chronometer-time">--:--:--</div>
          </div>
          <div class="chronometer-divider"></div>
          <div class="chronometer-dates">
            <div id="live-date-en-val" class="chronometer-date-en"></div>
            <div id="live-date-hj-val" class="chronometer-date-hj"></div>
          </div>
        </div>
      `;
    }

    const timeVal = document.getElementById('live-time-val');
    const enVal = document.getElementById('live-date-en-val');
    const hjVal = document.getElementById('live-date-hj-val');

    let lastSec = -1;
    const tick = () => {
      if (!document.getElementById('section-home')?.classList.contains('active')) {
        this.dateTimeRAF = null;
        return;
      }

      const now = new Date();
      const sec = now.getSeconds();

      if (sec !== lastSec) {
        lastSec = sec;
        const isMobile = window.innerWidth <= 768;
        
        const locale = (typeof App !== 'undefined' && App.lang === 'bn') ? 'bn-BD' : 'en-US';
        const timeStr = now.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        if (timeVal) timeVal.textContent = window.n ? window.n(timeStr) : timeStr;

        const enDate = now.toLocaleDateString(locale, { year: 'numeric', month: isMobile ? 'short' : 'long', day: 'numeric' });
        if (enVal && enVal.textContent !== enDate) enVal.textContent = enDate;

        const hijriDate = Utils.toHijri(now);
        if (hjVal && hjVal.textContent !== hijriDate) hjVal.textContent = hijriDate;
      }
      this.dateTimeRAF = requestAnimationFrame(tick);
    };

    this.dateTimeRAF = requestAnimationFrame(tick);
  },

  startNextPrayerCountdown() {
    const times = Utils.calcPrayerTimes();
    const next  = Utils.getNextPrayer(times);
    const el    = document.getElementById('home-next-prayer');
    if (!el) return;

    const nextName = typeof next.name === 'string' && next.name ? next.name : 'Prayer';
    const nextLabel = typeof next.label === 'string' && next.label ? next.label : '--:--';

    el.innerHTML = `
      <div class="next-prayer-card-premium ${nextName.toLowerCase()}">
        <div class="next-prayer-header-row">
          <span class="next-prayer-badge">${window.t ? window.t('UPCOMING WAQT') : 'UPCOMING WAQT'}</span>
          <span class="next-prayer-pulse-dot"></span>
        </div>
        <div class="next-prayer-content">
          <div class="next-prayer-info-side">
            <div id="home-next-name" class="next-prayer-title">${window.t ? window.t(nextName) : nextName.charAt(0).toUpperCase() + nextName.slice(1)}</div>
            <div id="home-next-time" class="next-prayer-time-sub">${window.n ? window.n(next.timeStr) : next.timeStr}</div>
          </div>
          <div class="next-prayer-countdown-side">
            <div id="home-countdown" class="next-prayer-timer">--:--:--</div>
            <div class="next-prayer-timer-label">${window.t ? window.t('Remaining') : 'Remaining'}</div>
          </div>
        </div>
        <div class="next-prayer-progress-track">
          <div id="home-next-progress-fill" class="next-prayer-progress-fill" style="width: 0%;"></div>
        </div>
      </div>
    `;

    this._lastPrayerName = nextName;
    const nameEl = document.getElementById('home-next-name');
    const timeEl = document.getElementById('home-next-time');
    if (nameEl) nameEl.textContent = window.t ? window.t(nextName) : nextName.charAt(0).toUpperCase() + nextName.slice(1);
    if (timeEl) timeEl.textContent = window.n ? window.n(next.timeStr) : next.timeStr;

    if (this.countdownRAF) cancelAnimationFrame(this.countdownRAF);

    let lastCountdown = '';
    const tickCountdown = () => {
      if (!document.getElementById('section-home')?.classList.contains('active')) {
        this.countdownRAF = null;
        return;
      }

      const t = Utils.calcPrayerTimes();
      const n = Utils.getNextPrayer(t);
      const cd = Utils.countdownTo(n.time);

      if (n.name !== this._lastPrayerName) {
        this._lastPrayerName = n.name;
        const updatedName = document.getElementById('home-next-name');
        const updatedTime = document.getElementById('home-next-time');
        if (updatedName) updatedName.textContent = n.name.charAt(0).toUpperCase() + n.name.slice(1);
        if (updatedTime) updatedTime.textContent = n.label;
        
        const cardEl = document.querySelector('.next-prayer-card-premium');
        if (cardEl) {
          cardEl.className = `next-prayer-card-premium ${n.name.toLowerCase()}`;
        }
      }

      if (cd !== lastCountdown) {
        lastCountdown = cd;
        const cdEl = document.getElementById('home-countdown');
        if (cdEl) cdEl.textContent = window.n ? window.n(cd) : cd;

        const nextIdx = t.findIndex(x => x.name === n.name);
        const prevIdx = (nextIdx - 1 + 5) % 5;
        const prevWaqt = t[prevIdx];
        
        let prevMs = prevWaqt.time.getTime();
        const nextMs = n.time.getTime();
        const nowMs = Date.now();
        
        if (prevMs > nextMs) {
          const d = new Date(prevWaqt.time);
          d.setDate(d.getDate() - 1);
          prevMs = d.getTime();
        }

        let progressPct = 0;
        if (nextMs > prevMs && nowMs >= prevMs) {
          const total = nextMs - prevMs;
          const elapsed = nowMs - prevMs;
          progressPct = Math.min(100, Math.max(0, (elapsed / total) * 100));
        }

        const progressFill = document.getElementById('home-next-progress-fill');
        if (progressFill) {
          progressFill.style.width = `${progressPct}%`;
        }
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
    const visualPct = (score.done / 5) * 100;
    const circumference = 2 * Math.PI * 50;
    const offset = circumference - (visualPct / 100) * circumference;
    const color = score.done === 5 ? '#34d399' : score.done >= 3 ? '#fbbf24' : '#f87171';
    
    el.innerHTML = `
      <div class="salah-progress-ring-card">
        <div class="salah-ring-graphic-container">
          <div class="ring-chart" style="width:130px;height:130px">
            <svg width="130" height="130" viewBox="0 0 130 130">
              <defs>
                <linearGradient id="salahRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="${color}" />
                  <stop offset="100%" stop-color="var(--color-accent-primary)" />
                </linearGradient>
              </defs>
              <circle class="ring-chart-bg" cx="65" cy="65" r="50" stroke-width="10"/>
              <circle class="ring-chart-fill" id="salah-ring-fill" cx="65" cy="65" r="50" stroke-width="10"
                stroke-dasharray="${circumference}" style="transition:stroke-dashoffset 1s ease"/>
            </svg>
            <div class="ring-chart-label">
              <div id="salah-ring-count" class="salah-ring-count-val" style="color: ${color}">0</div>
              <div class="salah-ring-total-label">${window.t ? window.t('of 5') : 'of 5'}</div>
            </div>
          </div>
        </div>
        
        <div class="salah-ring-info-container">
          <div class="salah-ring-title">${window.t ? window.t("Today's Salah") : "Today's Salah"}</div>
          <div id="salah-ring-desc" class="salah-ring-subtitle">${window.n ? window.n('0/5') : '0/5'} ${window.t ? window.t('prayers completed') : 'prayers completed'}</div>
          
          <div class="salah-checklist-mini">
            ${['fajr','dhuhr','asr','maghrib','isha'].map(p => {
              const status = today[p];
              const label = window.t ? window.t(p.charAt(0).toUpperCase() + p.slice(1)) : p.charAt(0).toUpperCase() + p.slice(1);
              let dotHTML = '';
              if (status === 'jamaat') dotHTML = '<span class="checklist-dot logged jamaat" title="Jama\'at">✓</span>';
              else if (status === 'alone') dotHTML = '<span class="checklist-dot logged alone" title="Alone">✓</span>';
              else if (status === 'qaza') dotHTML = '<span class="checklist-dot logged qaza" title="Qaza">⏰</span>';
              else if (status === 'missed') dotHTML = '<span class="checklist-dot logged missed" title="Missed">✗</span>';
              else dotHTML = '<span class="checklist-dot pending" title="Pending"></span>';
              return `
                <div class="salah-checklist-item">
                  ${dotHTML}
                  <span class="salah-checklist-label">${label}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    const fill = document.getElementById('salah-ring-fill');
    const count = document.getElementById('salah-ring-count');
    const desc = document.getElementById('salah-ring-desc');

    if (fill) {
      fill.setAttribute('stroke', 'url(#salahRingGrad)');
      fill.style.strokeDashoffset = offset;
    }
    if (count) {
      count.textContent = window.n ? window.n(score.done) : score.done;
      count.style.color = color;
    }
    if (desc) desc.textContent = `${window.n ? window.n(score.done) : score.done}/${window.n ? window.n('5') : '5'} ${window.t ? window.t('prayers completed') : 'prayers completed'}`;
  }
};

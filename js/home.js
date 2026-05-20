const Home = {
  countdownRAF: null,
  dateTimeRAF: null,
  insightInterval: null,
  insightTimeout: null,
  _cachedSHS: null,
  _lastPrayerName: null,

  init() { 
    this.render(); 
    // Listen for cloud/local data updates to refresh dashboard live
    if (!this._boundDataUpdated) {
      window.addEventListener('lamim:data-updated', () => {
        if (document.getElementById('section-home')?.classList.contains('active')) {
          this.render();
        }
      });
      this._boundDataUpdated = true;
    }
  },

  /** Stop all rAF loops when leaving Home section (called by App.navigateTo) */
  cleanup() {
    if (this.countdownRAF) { cancelAnimationFrame(this.countdownRAF); this.countdownRAF = null; }
    if (this.dateTimeRAF)  { cancelAnimationFrame(this.dateTimeRAF);  this.dateTimeRAF = null; }
    if (this.insightInterval) { clearInterval(this.insightInterval); this.insightInterval = null; }
    if (this.insightTimeout) { clearTimeout(this.insightTimeout); this.insightTimeout = null; }
  },

  render() {
    const user = DB.getUser();
    if (!user) return;

    // Spiritual Dynamic Greeting (Linked to Prayer Times/Waqt)
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

    // Get Last Name (with safety)
    const rawName = (user && typeof user.name === 'string') ? user.name : 'User';
    const nameParts = rawName.trim().split(/\s+/);
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0];

    // Use global Utils.escapeHTML to prevent XSS attacks
    const safeLastName = Utils.escapeHTML(lastName);

    const el = document.getElementById('home-greeting');
    if (el) el.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 2px;">
        <h2 style="font-size: 1.3rem; font-weight: 700; line-height: 1.2; margin: 0; color: var(--home-salam-color);">
          ${window.t ? window.t('As-salamu alaykum, ') : 'As-salamu alaykum, '}<span style="color: var(--home-name-color);">${safeLastName}</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-gold)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; margin-left:4px; opacity:0.8"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
        </h2>
        <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: var(--color-accent-primary); opacity:0.8;">
          ${window.t ? window.t(greet) : greet}
        </div>
      </div>
    `;

    // Live Date Time (accurate, no lag)
    this.startLiveDateTime();

    // FIX #4: Compute SHS once and cache for sub-functions
    this._cachedSHS = Analysis.calculateSHS();

    // Date bar (Streaks + LSS Score Aura on the far right)
    const db = document.getElementById('home-date-bar');
    if (db) {
      const shs = this._cachedSHS;
      db.style.display = 'flex';
      db.style.justifyContent = 'space-between';
      db.style.alignItems = 'center';
      
      db.innerHTML = `
        <div style="display:flex; gap:var(--space-10); align-items: center; margin-top: -10px;">
          <div class="streak-badge" style="background: rgba(212,168,67,0.1); border: 1px solid rgba(212,168,67,0.2);">
            <div class="badge-icon-animated">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--color-accent-gold)">
                <path d="M12 2c0 0-4.5 5.5-4.5 10s3.5 8 4.5 8 4.5-3.5 4.5-8-4.5-10-4.5-10zm0 15c-1.5 0-2.5-1.5-2.5-3.5s1-3.5 2.5-3.5 2.5 1.5 2.5 3.5-1 3.5-2.5 3.5z"/>
                <path d="M12 22c5.523 0 10-4.477 10-10 0-1.657-.403-3.219-1.11-4.593L12 22z" opacity="0.2"/>
              </svg>
            </div>
            <span style="font-size: 12px; font-weight: 800; color: var(--color-accent-gold);">${window.n ? window.n(DB.getSalahStreak().perfect) : DB.getSalahStreak().perfect}d ${window.t ? window.t('Perfect') : 'Perfect'}</span>
          </div>
          <div class="shs-mini-aura-container" style="display: flex; align-items: center; justify-content: center;">
            <div class="shs-aura mini" style="--aura-color: ${shs.rating.color}; box-shadow: 0 0 40px ${shs.rating.color}60;">
              <div class="shs-val" style="font-size: 28px; font-weight: 900;">${window.n ? window.n(Math.round(shs.total)) : Math.round(shs.total)}</div>
            </div>
          </div>
        </div>
        <div id="shs-pulse-graph-spot" style="display: flex; align-items: center; justify-content: center; min-width: 80px; margin-right: 10px; opacity: 0.5;"></div>
      `;
    }

    // Next prayer banner
    this.startNextPrayerCountdown();

    // Salah ring
    this.renderSalahRing();

    // 1. Path to Ihsan (Level Progress Bar)
    this.renderIhsanLevel();

    // 3. Spiritual Pulse (Micro-Graph)
    this.renderSpiritualPulse();

    // 4. AI Spiritual Insight
    this.renderAIInsight();

    // Vanguard Rank Card
    this.renderVanguardCard();

    // 5. Nur Particles (Subtle Animation)
    this.renderNurParticles();
  },

  async renderVanguardCard() {
    const el = document.getElementById('home-vanguard-card');
    if (!el) return;
    
    const user = DB.getUser();
    if (!user) return;

    if (user.role !== 'admin' && user.email !== 'shamimshahriyar.cse@gmail.com') {
      el.style.display = 'none';
      return;
    }
    el.style.display = 'block';

    // Show loading first
    el.innerHTML = `
      <div class="card lb-item" style="padding:12px; cursor:pointer; opacity:0.8; border:1px solid var(--color-border);" onclick="App.navigateTo('leaderboard')">
        <div style="font-size:10px; color:var(--color-text-muted); text-transform:uppercase;">Vanguard Position</div>
        <div style="font-size:14px; font-weight:700; color:var(--color-text-primary)">Loading...</div>
      </div>
    `;

    if (typeof Leaderboard !== 'undefined') {
        // First try cached rank
        let rank = Leaderboard.myRank;
        
        // If no cached rank, fetch fresh
        if (!rank || rank === 0) {
            try {
                rank = await Leaderboard.getMyRank();
            } catch(e) {
                console.warn('Vanguard rank fetch failed:', e);
            }
        }
        
        // If we have a valid rank, show it
        if (rank && rank > 0) {
            el.innerHTML = `
                <div class="lb-item anim-fade-in" style="width:100%; cursor:pointer; border:1px solid var(--color-accent-blue); background:rgba(59,130,246,0.05)" onclick="App.navigateTo('leaderboard')">
                    <div class="lb-rank-num" style="color:var(--color-accent-blue)">#${rank}</div>
                    <div class="lb-info">
                        <div class="lb-name" style="font-size:14px;">${window.t ? window.t('Global Vanguard') : 'Global Vanguard'}</div>
                        <div class="lb-meta">
                            <span class="lb-level-tag" style="background:rgba(59,130,246,0.2); color:#93c5fd">${window.t ? window.t(Utils.escapeHTML(user.spirit_level || 'Ghafil')) : Utils.escapeHTML(user.spirit_level || 'Ghafil')}</span>
                        </div>
                    </div>
                    <div style="font-size:20px;">🏆</div>
                </div>
            `;
            return;
        }
        
        // Fallback: Show power score if rank unavailable
        const myScore = user.spirit_score || 0;
        el.innerHTML = `
            <div class="lb-item" style="width:100%; cursor:pointer; border:1px solid var(--color-border); background:rgba(255,255,255,0.03)" onclick="App.navigateTo('leaderboard')">
                <div class="lb-rank-num" style="color:var(--color-text-muted)">⚡</div>
                <div class="lb-info">
                    <div class="lb-name" style="font-size:14px;">${myScore > 0 ? myScore + ' Power' : 'No Score Yet'}</div>
                    <div class="lb-meta">
                        <span class="lb-level-tag">${Utils.escapeHTML(user.spirit_level || 'Ghafil')}</span>
                    </div>
                </div>
                <div style="font-size:16px; opacity:0.5;">→</div>
            </div>
        `;
    }
  },

  renderIhsanLevel() {
    const container = document.getElementById('home-level-progress-container');
    if (!container) return;
    
    // FIX #4: Use cached SHS instead of recalculating
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
    
    // FIX #4: Use cached SHS instead of recalculating
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
           transition: none; /* Disable transition instantly to snap to start position */
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

    // Clear existing interval and timeout to prevent overlapping transitions
    if (this.insightInterval) clearInterval(this.insightInterval);
    if (this.insightTimeout) clearTimeout(this.insightTimeout);

    this.insightInterval = setInterval(() => {
      // COORDINATION: Stop if Home section is no longer active
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

      // 1. Trigger Fade Out
      textEl.classList.add('fade-out');

      this.insightTimeout = setTimeout(() => {
        // 2. Change text and prepare for Fade In
        let newIdx = Math.floor(Math.random() * quotes.length);
        while (newIdx === qIdx && quotes.length > 1) {
          newIdx = Math.floor(Math.random() * quotes.length);
        }
        qIdx = newIdx;
        
        textEl.classList.remove('fade-out');
        textEl.classList.add('fade-in-prep');
        textEl.textContent = quotes[qIdx];
        
        if (iconEl) iconEl.classList.add('pulse');

        // Force browser reflow so the 'prep' state applies immediately without animating
        void textEl.offsetWidth;

        // 3. Trigger Fade In
        textEl.classList.remove('fade-in-prep');
        
        // Remove pulse from icon slightly later
        this.insightTimeout = setTimeout(() => {
          if (iconEl) iconEl.classList.remove('pulse');
          this.insightTimeout = null;
        }, 500);

      }, 600); // 600ms matches the fade-out CSS transition time
    }, 10000); // 10 seconds per quote
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


  /* ---- Live Date Time (using rAF for zero lag) ---- */
  startLiveDateTime() {
    const el = document.getElementById('home-live-datetime');
    if (!el) return;

    // Cancel previous loop to prevent resource leaks
    if (this.dateTimeRAF) cancelAnimationFrame(this.dateTimeRAF);

    // Initial skeleton/structure if empty
    if (!el.innerHTML.includes('live-time-val')) {
      el.innerHTML = `
        <div style="margin-top: 10px;">
          <div id="live-time-val" style="font-size: 1.8rem; font-weight: 800; color: var(--home-time-color); line-height: 1;">--:--:--</div>
          <div id="live-date-en-val" style="font-size: 12px; font-weight: 700; color: var(--color-text-secondary); text-transform: uppercase; margin-top: 2px;"></div>
          <div id="live-date-hj-val" style="font-size: 11px; font-weight: 700; color: var(--home-name-color); margin-top: 1px;"></div>
        </div>
      `;
    }

    const timeVal = document.getElementById('live-time-val');
    const enVal = document.getElementById('live-date-en-val');
    const hjVal = document.getElementById('live-date-hj-val');

    let lastSec = -1;
    const tick = () => {
      // FIX #3: Stop running when Home is not active
      if (!document.getElementById('section-home')?.classList.contains('active')) {
        this.dateTimeRAF = null;
        return; // Fully stop — will be restarted by init() on return
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

  /* ---- Next Prayer Countdown (rAF — smooth, no lag) ---- */
  startNextPrayerCountdown() {
    const times = Utils.calcPrayerTimes();
    const next  = Utils.getNextPrayer(times);
    const el    = document.getElementById('home-next-prayer');
    if (!el) return;

    const nextName = typeof next.name === 'string' && next.name ? next.name : 'Prayer';
    const nextLabel = typeof next.label === 'string' && next.label ? next.label : '--:--';

    // Ensure structure is always fresh and premium
    el.innerHTML = `
      <div class="card" style="margin-bottom:var(--space-6); padding: 18px 20px;">
        <div style="font-size:10px; font-weight:700; opacity:0.35; text-transform:uppercase; letter-spacing:1px; margin-bottom:10px;">${window.t ? window.t('NEXT PRAYER') : 'Next Prayer'}</div>
        <div style="display:grid; grid-template-columns: 1fr auto; align-items: center; gap: 12px;">
          <div>
            <div id="home-next-name" style="font-size:1.6rem; font-weight:800; color:var(--home-time-color); line-height:1; margin-bottom:4px; text-transform:capitalize;">${window.t ? window.t(nextName) : nextName.charAt(0).toUpperCase() + nextName.slice(1)}</div>
            <div id="home-next-time" style="font-size:13px; font-weight:600; opacity:0.55;">${window.n ? window.n(next.timeStr) : next.timeStr}</div>
          </div>
          <div style="display: flex; flex-direction: column; align-items: center;">
            <div id="home-countdown" style="font-size: 1.9rem; font-weight: 800; letter-spacing: -0.5px; line-height: 1; color: var(--color-text-primary);">--:--:--</div>
            <div style="font-size: 10px; font-weight: 600; color: var(--color-text-muted); margin-top: 5px; opacity: 0.8;">${window.t ? window.t('Remaining') : 'Remaining'}</div>
          </div>
        </div>
      </div>
    `;

    // Set initial prayer name/time
    this._lastPrayerName = nextName;
    const nameEl = document.getElementById('home-next-name');
    const timeEl = document.getElementById('home-next-time');
    if (nameEl) nameEl.textContent = window.t ? window.t(nextName) : nextName.charAt(0).toUpperCase() + nextName.slice(1);
    if (timeEl) timeEl.textContent = window.n ? window.n(next.timeStr) : next.timeStr;

    // Cancel previous loop
    if (this.countdownRAF) cancelAnimationFrame(this.countdownRAF);

    let lastCountdown = '';
    const tickCountdown = () => {
      // FIX #3: Fully stop when Home is not active (will restart via init)
      if (!document.getElementById('section-home')?.classList.contains('active')) {
        this.countdownRAF = null;
        return;
      }

      const t = Utils.calcPrayerTimes();
      const n = Utils.getNextPrayer(t);
      const cd = Utils.countdownTo(n.time);

      // FIX #2: Update prayer name and time when the next prayer changes
      if (n.name !== this._lastPrayerName) {
        this._lastPrayerName = n.name;
        const updatedName = document.getElementById('home-next-name');
        const updatedTime = document.getElementById('home-next-time');
        if (updatedName) updatedName.textContent = n.name.charAt(0).toUpperCase() + n.name.slice(1);
        if (updatedTime) updatedTime.textContent = n.label;
      }

      if (cd !== lastCountdown) {
        lastCountdown = cd;
        const cdEl = document.getElementById('home-countdown');
        if (cdEl) cdEl.textContent = window.n ? window.n(cd) : cd;
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
    const circumference = 2 * Math.PI * 54;
    const offset = circumference - (visualPct / 100) * circumference;
    const color = score.done === 5 ? '#34d399' : score.done >= 3 ? '#fbbf24' : '#f87171';
    // Ensure structure is always fresh
    el.innerHTML = `
      <div class="ring-chart" style="width:140px;height:140px">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle class="ring-chart-bg" cx="70" cy="70" r="54" stroke-width="12"/>
          <circle class="ring-chart-fill" id="salah-ring-fill" cx="70" cy="70" r="54" stroke-width="12"
            stroke-dasharray="${circumference}" style="transition:stroke-dashoffset 1s ease"/>
        </svg>
        <div class="ring-chart-label">
          <div id="salah-ring-count" style="font-size:2rem;font-weight:800">0</div>
          <div style="font-size:0.7rem;color:var(--color-text-muted)">${window.t ? window.t('of 5') : 'of 5'}</div>
        </div>
      </div>
      <div style="text-align:center;">
        <div style="font-size:var(--text-lg);font-weight:700">${window.t ? window.t("Today's Salah") : "Today's Salah"}</div>
        <div id="salah-ring-desc" style="color:var(--color-text-muted);font-size:var(--text-sm);margin-top:4px">${window.n ? window.n('0/5') : '0/5'} ${window.t ? window.t('prayers completed') : 'prayers completed'}</div>
        <div class="progress-bar mt-2" style="width:140px">
          <div class="progress-fill" id="salah-ring-bar" style="width:0%"></div>
        </div>
      </div>
    `;

    const fill = document.getElementById('salah-ring-fill');
    const count = document.getElementById('salah-ring-count');
    const desc = document.getElementById('salah-ring-desc');
    const bar = document.getElementById('salah-ring-bar');

    if (fill) {
      fill.setAttribute('stroke', color);
      fill.style.strokeDashoffset = offset;
    }
    if (count) {
      count.textContent = window.n ? window.n(score.done) : score.done;
      count.style.color = color;
    }
    if (desc) desc.textContent = `${window.n ? window.n(score.done) : score.done}/${window.n ? window.n('5') : '5'} ${window.t ? window.t('prayers completed') : 'prayers completed'}`;
    if (bar) {
      bar.style.width = visualPct + '%';
      bar.style.background = color;
    }
  }
};

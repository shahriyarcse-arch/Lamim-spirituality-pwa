const Home = {
  countdownRAF: null,
  dateTimeRAF: null,
  insightInterval: null,
  insightTimeout: null,
  _cachedSHS: null,
  _lastPrayerName: null,
  _cardObserver: null,

  init() { 
    this.render(); 
    this._observeCards();
    // Listen for local data updates to refresh dashboard live
    if (!this._boundDataUpdated) {
      window.addEventListener('lamim:data-updated', () => {
        if (document.getElementById('section-home')?.classList.contains('active')) {
          this.render();
          this._observeCards();
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
    if (this._cardObserver) { this._cardObserver.disconnect(); this._cardObserver = null; }
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

    let greet = 'Good Night 🌙';
    let greetClass = 'greeting-night';
    if (nowTime >= fajr && nowTime < dhuhr) { greet = 'Fajr Mubarak 🌅'; greetClass = 'greeting-fajr'; }
    else if (nowTime >= dhuhr && nowTime < asr) { greet = 'Blessed Noon ☀️'; greetClass = 'greeting-dhuhr'; }
    else if (nowTime >= asr && nowTime < maghrib) { greet = 'Asr Barakah 🌤️'; greetClass = 'greeting-asr'; }
    else if (nowTime >= maghrib && nowTime < isha) { greet = 'Maghrib Light 🌆'; greetClass = 'greeting-maghrib'; }
    else if (nowTime >= isha) { greet = 'Isha Peace 🌙'; greetClass = 'greeting-isha'; }

    // Get Last Name (with safety)
    const rawName = (user && typeof user.name === 'string') ? user.name : 'User';
    const nameParts = rawName.trim().split(/\s+/);
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0];

    // Use global Utils.escapeHTML to prevent XSS attacks
    const safeLastName = Utils.escapeHTML(lastName);

    const el = document.getElementById('home-greeting');
    if (el) el.innerHTML = `
      <div class="home-greeting-card fluid-gradient-hero home-reveal home-reveal-from-top ${greetClass}" style="display: flex; align-items: center; gap: 14px; padding: 18px 20px;">
        <div class="user-avatar-initial">${safeLastName.charAt(0).toUpperCase()}</div>
        <div class="greeting-icon-box greeting-icon-${greetClass}">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            ${greetClass === 'greeting-fajr' ? '<path d="M12 2v8"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="M17.66 12.34l1.41-1.41"/><path d="M22 22H2"/><path d="M8 22l4-4 4 4"/>' : greetClass === 'greeting-dhuhr' ? '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/>' : greetClass === 'greeting-asr' ? '<path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M13 22H7a5 5 0 1 1 4.9-6.13"/>' : greetClass === 'greeting-maghrib' ? '<path d="M17 18a5 5 0 0 0-10 0"/><path d="M12 2v7"/><polyline points="16 5 12 9 8 5"/><path d="M23 22H1"/>' : '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>'}
          </svg>
        </div>
        <div style="flex:1; min-width:0;">
          <h2 style="font-size: 1.15rem; font-weight: 800; line-height: 1.2; margin: 0; color: var(--home-salam-color); letter-spacing: -0.3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${window.t ? window.t('As-salamu alaykum, ') : 'As-salamu alaykum, '}<span style="color: var(--home-name-color);">${safeLastName}</span>
          </h2>
          <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; color: var(--color-accent-primary); margin-top: 1px;">
            ${window.t ? window.t(greet) : greet}
          </div>
        </div>
      </div>
    `;

    // Live Date Time (accurate, no lag)
    this.startLiveDateTime();

    // FIX #4: Compute SHS once and cache for sub-functions
    this._cachedSHS = typeof Analysis !== 'undefined' ? Analysis.calculateSHS() : 0;

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
        <div id="shs-pulse-graph-spot" style="display: flex; align-items: center; justify-content: center; min-width: 80px; margin-right: 10px;"></div>
      `;
    }

    // Next prayer banner
    // Wrap in reveal container
    this.startNextPrayerCountdown();

    // Salah ring (inside the card - add reveal to the parent)
    this.renderSalahRing();

    // 1. Path to Ihsan (Level Progress Bar)
    const lvlContainer = document.getElementById('home-level-progress-container');
    if (lvlContainer) lvlContainer.classList.add('home-reveal', 'home-reveal-from-bottom');

    this.renderIhsanLevel();

    // 3. Spiritual Pulse (Micro-Graph)
    this.renderSpiritualPulse();

    // 4. AI Spiritual Insight (reveal class added inside renderAIInsight)
    this.renderAIInsight();

    // 5. Weekly AI Summary
    this.renderWeeklySummary();

    // 6. Dua Request Board Card
    this.renderDuaCard();

    // 7. Nur Particles (Subtle Animation)
    this.renderNurParticles();
  },



  renderIhsanLevel() {
    const container = document.getElementById('home-level-progress-container');
    if (!container) return;
    
    // FIX #4: Use cached SHS instead of recalculating
    const shs = this._cachedSHS || (typeof Analysis !== 'undefined' ? Analysis.calculateSHS() : { total: 0, rating: { color: '#8E8E93' } });
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
      <div style="display:flex; justify-content:space-between; margin-bottom:10px; align-items:flex-end">
        <div style="display:flex; flex-direction:column">
          <span style="font-size:10px; font-weight:800; opacity:0.45; text-transform:uppercase; letter-spacing:1.2px">${window.t ? window.t('CURRENT RANK') : 'Current Rank'}</span>
          <span style="font-size:18px; font-weight:900; color:${shs.rating.color}; letter-spacing:-0.3px;">${window.t ? window.t(current.label) : current.label}</span>
        </div>
        <div style="text-align:right; display:flex; flex-direction:column">
          <span style="font-size:11px; font-weight:700; color:var(--color-text-muted); text-transform:uppercase; letter-spacing:0.5px">${window.t ? window.t('Next') : 'Next'}: <span style="color:var(--color-accent-gold);">${window.t ? window.t(next.label) : next.label}</span></span>
          <span style="font-size:14px; font-weight:800; color:${shs.rating.color}; margin-top:2px;">${window.n ? window.n(Math.round(prog)) : Math.round(prog)}%</span>
        </div>
      </div>
      <div style="height:10px; background:var(--color-divider-subtle); border-radius:10px; position:relative; overflow:visible; margin-top:6px;">
        <div style="width:${prog}%; height:100%; background:linear-gradient(90deg, ${shs.rating.color}, var(--color-accent-gold)); border-radius:10px; position:relative; box-shadow:0 0 16px ${shs.rating.color}40; transition:width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);">
          <div style="position:absolute; right:-6px; top:-4px; width:22px; height:22px; background:var(--color-bg-elevated); border-radius:50%; border:3px solid ${shs.rating.color}; box-shadow:0 0 14px ${shs.rating.color};"></div>
        </div>
      </div>
      <div style="display:flex; justify-content:space-between; margin-top:10px; padding:0 2px;">
        ${ranks.map((r, idx) => `
          <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
            <div style="width:12px; height:12px; border-radius:50%; background:${idx <= curIdx ? shs.rating.color : 'var(--color-divider-subtle)'}; border:3px solid ${idx <= curIdx ? shs.rating.color : 'var(--color-border)'}; box-shadow:${idx <= curIdx ? `0 0 8px ${shs.rating.color}60` : 'none'}; transition:all 0.5s ease;"></div>
            <span style="font-size:9px; font-weight:700; color:${idx === curIdx ? shs.rating.color : 'var(--color-text-muted)'}; text-transform:uppercase; letter-spacing:0.5px; opacity:${idx <= curIdx ? 1 : 0.4};">${window.t ? window.t(r.label.substring(0, 4)) : r.label.substring(0, 4)}</span>
          </div>
        `).join('')}
      </div>
    `;
  },

  renderSpiritualPulse() {
    const container = document.getElementById('shs-pulse-graph-spot');
    if (!container) return;
    
    // FIX #4: Use cached SHS instead of recalculating
    const color = (this._cachedSHS || (typeof Analysis !== 'undefined' ? Analysis.calculateSHS() : { rating: { color: '#8E8E93' } })).rating.color;
    container.style.overflow = 'visible';
    container.style.width = '80px'; 
    
    container.innerHTML = `
      <svg width="80" height="30" viewBox="0 0 100 30" style="filter: drop-shadow(0 0 5px ${color}40);">
        <defs>
          <linearGradient id="pGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:${color};stop-opacity:0" />
            <stop offset="50%" style="stop-color:${color};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${color};stop-opacity:0" />
          </linearGradient>
        </defs>
        <path d="M 0,15 Q 10,15 15,15 T 25,5 T 35,25 T 45,15 T 55,15 T 65,15 T 75,5 T 85,25 T 100,15" 
              fill="none" stroke="url(#pGrad)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.3" />
        <path class="shs-pulse-dot" d="M 0,15 Q 10,15 15,15 T 25,5 T 35,25 T 45,15 T 55,15 T 65,15 T 75,5 T 85,25 T 100,15" 
              fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
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
           transform: scale(1.1) rotate(5deg);
           box-shadow: 0 0 25px rgba(167,139,250,0.6) !important;
        }
      </style>
      <div class="card ai-insight-premium home-reveal home-reveal-from-bottom" style="background:linear-gradient(135deg, rgba(167,139,250,0.08) 0%, rgba(192,132,252,0.03) 100%); padding:18px 20px; display:flex; align-items:center; gap:16px;">
        <div id="home-insight-icon" class="ai-insight-icon-wrap" style="width:38px; height:38px; background:linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-teal)); border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; box-shadow:0 0 20px rgba(167,139,250,0.25);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-bg-primary)" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        </div>
        <div style="display:flex; flex-direction:column; gap:3px; flex: 1;">
          <span style="font-size:9px; font-weight:800; text-transform:uppercase; letter-spacing:1.5px; color:var(--color-accent-primary)">${window.t ? window.t('SPIRITUAL INSIGHT') : 'Spiritual Insight'}</span>
          <div style="min-height: 34px; display: flex; align-items: center;">
            <p id="home-insight-text" class="ai-insight-text" style="font-size:12px; font-weight:600; margin:0; line-height:1.45; color:var(--color-text-secondary)">${window.t ? window.t(quotes[qIdx]) : quotes[qIdx]}</p>
          </div>
        </div>
      </div>
    `;

    // Clear existing interval and timeout to prevent overlapping transitions
    if (this.insightInterval) clearInterval(this.insightInterval);
    if (this.insightTimeout) clearTimeout(this.insightTimeout);
    if (this._insightPulseTimeout) clearTimeout(this._insightPulseTimeout);

    this.insightInterval = setInterval(() => {
      if (!document.getElementById('section-home')?.classList.contains('active')) {
        clearInterval(this.insightInterval);
        this.insightInterval = null;
        if (this.insightTimeout) { clearTimeout(this.insightTimeout); this.insightTimeout = null; }
        if (this._insightPulseTimeout) { clearTimeout(this._insightPulseTimeout); this._insightPulseTimeout = null; }
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

        this._insightPulseTimeout = setTimeout(() => {
          if (iconEl) iconEl.classList.remove('pulse');
          this._insightPulseTimeout = null;
        }, 500);

        this.insightTimeout = null;
      }, 600);
    }, 10000);
  },

  renderWeeklySummary() {
    const container = document.getElementById('home-weekly-summary');
    if (!container) return;

    const history = DB.getSalahHistory(7);
    let totalPrayed = 0, totalMissed = 0, totalDhikr = 0, totalSunnah = 0, perfectDays = 0;
    let bestDay = 0, bestDayLabel = '';
    const today = Utils.todayStr();

    history.forEach(day => {
      const s = Utils.salahScore(day.data);
      totalPrayed += s.done;
      totalMissed += 5 - s.done;
      if (s.done === 5) perfectDays++;
      if (s.done > bestDay) { bestDay = s.done; bestDayLabel = day.date === today ? 'Today' : Utils.formatDate(new Date(day.date + 'T00:00:00'), { weekday: 'short' }); }

      const dhikr = DB.getDhikr(day.date);
      const dhikrTotal = Object.values(dhikr).reduce((a, b) => a + (parseInt(b) || 0), 0);
      totalDhikr += dhikrTotal;

      if (day.data.sunnah) {
        Object.values(day.data.sunnah).forEach(v => { if (v === 'prayed' || v === true) totalSunnah++; });
      }
    });

    if (totalPrayed === 0) {
      container.innerHTML = '';
      return;
    }

    const avgPrayed = (totalPrayed / history.length).toFixed(1);
    const tip = perfectDays >= 5 ? '🔥 Exceptional week! You\'re in a spiritual flow.'
      : totalMissed > totalPrayed ? '🌱 Start with one prayer at a time. Consistency over intensity.'
      : totalDhikr > 1000 ? '📿 Your dhikr is high — keep your tongue moist with remembrance.'
      : totalSunnah < 5 ? '⭐ Add a Sunnah prayer daily for extra light.'
      : '🤲 You\'re doing great. Small steps lead to big transformations.';

    container.innerHTML = `
      <div class="card home-reveal home-reveal-from-bottom" style="background:linear-gradient(135deg, rgba(16,185,129,0.06), rgba(99,102,241,0.03)); padding:18px 20px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div class="ai-insight-icon-wrap" style="width:36px;height:36px;background:linear-gradient(135deg,#10b981,#6366f1);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 0 16px rgba(16,185,129,0.2);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          </div>
          <div style="flex:1;display:flex;flex-direction:column;gap:2px;">
            <div style="font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#10b981;">Weekly Pulse</div>
            <div style="font-size:12px;font-weight:600;color:var(--color-text-secondary);line-height:1.4;">
              ${avgPrayed}/5 avg · ${perfectDays} perfect · ${totalDhikr > 999 ? (totalDhikr/1000).toFixed(1)+'k' : totalDhikr} dhikr
            </div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px;">
            <div style="font-size:9px;font-weight:700;color:var(--color-text-muted);text-transform:uppercase;">Best</div>
            <div style="font-size:16px;font-weight:900;color:var(--color-accent-gold);">${bestDay}/5</div>
          </div>
        </div>
        <div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--color-border-muted);display:flex;align-items:center;gap:8px;">
          <span style="font-size:14px;line-height:1;">💡</span>
          <span style="font-size:11px;font-weight:600;color:var(--color-text-muted);line-height:1.4;">${tip}</span>
        </div>
      </div>
    `;
  },

  renderDuaCard() {
    const container = document.getElementById('home-dua-card');
    if (!container || typeof DuaBoard === 'undefined') return;
    const active = DuaBoard.getActiveCount();
    const answered = DuaBoard.getAnsweredCount();
    container.innerHTML = `
      <div class="home-dua-card home-reveal home-reveal-from-bottom" onclick="DuaBoard.showModal()">
        <div class="home-dua-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
        </div>
        <div class="home-dua-info">
          <div class="home-dua-label">Dua Board</div>
          <div class="home-dua-desc">${active > 0 ? active + ' active dua' + (active > 1 ? 's' : '') : 'Add your prayer requests'}</div>
        </div>
        <div class="home-dua-count">${active}</div>
      </div>
    `;
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
      <div class="card next-prayer-premium home-reveal home-reveal-from-bottom" style="margin-bottom:var(--space-6); padding: 20px 22px;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
          <div style="font-size:9px; font-weight:800; text-transform:uppercase; letter-spacing:1.5px; color:var(--color-text-muted);">${window.t ? window.t('NEXT PRAYER') : 'Next Prayer'}</div>
          <div style="display:flex; align-items:center; gap:4px; font-size:9px; font-weight:700; color:var(--color-accent-gold);">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>${window.t ? window.t('Tracked') : 'Tracked'}</span>
          </div>
        </div>
        <div style="display:grid; grid-template-columns: 1fr auto; align-items: center; gap: 16px;">
          <div>
            <div id="home-next-name" class="next-prayer-glow" style="font-size:1.7rem; font-weight:900; color:var(--home-time-color); line-height:1.1; margin-bottom:6px; text-transform:capitalize; letter-spacing:-0.5px;">${window.t ? window.t(nextName) : nextName.charAt(0).toUpperCase() + nextName.slice(1)}</div>
            <div id="home-next-time" style="font-size:13px; font-weight:600; color:var(--color-text-muted); display:flex; align-items:center; gap:8px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              ${window.n ? window.n(nextLabel) : nextLabel}
            </div>
          </div>
          <div style="display:flex; flex-direction:column; align-items:center; position:relative; width:88px; height:88px;">
            <svg width="88" height="88" viewBox="0 0 88 88">
              <circle cx="44" cy="44" r="36" stroke="var(--color-divider-subtle)" stroke-width="4" fill="none"/>
              <circle id="home-countdown-ring" cx="44" cy="44" r="36" stroke="var(--color-accent-primary)" stroke-width="4" fill="none" stroke-dasharray="226.2" stroke-dashoffset="0" stroke-linecap="round" transform="rotate(-90 44 44)"/>
            </svg>
            <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">
              <div id="home-countdown" class="countdown-premium" style="font-size:1rem;font-weight:900;line-height:1.1;">--:--:--</div>
              <div style="font-size:7px;font-weight:700;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-top:2px;">${window.t ? window.t('Remaining') : 'Remaining'}</div>
            </div>
          </div>
        </div>
        <!-- Countdown progress bar -->
        <div style="margin-top:14px; height:3px; background:var(--color-divider-subtle); border-radius:10px; overflow:hidden;">
          <div id="home-countdown-bar" style="width:0%; height:100%; background:linear-gradient(90deg, var(--color-accent-primary), var(--color-accent-gold)); border-radius:10px;"></div>
        </div>
      </div>
    `;

    // Set initial prayer name/time
    this._lastPrayerName = nextName;
    const nameEl = document.getElementById('home-next-name');
    const timeEl = document.getElementById('home-next-time');
    if (nameEl) nameEl.textContent = window.t ? window.t(nextName) : nextName.charAt(0).toUpperCase() + nextName.slice(1);
    if (timeEl) timeEl.textContent = window.n ? window.n(nextLabel) : nextLabel;

    // Cancel previous loop
    if (this.countdownRAF) cancelAnimationFrame(this.countdownRAF);

    let lastCountdown = '';
    let lastPct = -1;
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
        if (updatedName) updatedName.textContent = window.t ? window.t(n.name.charAt(0).toUpperCase() + n.name.slice(1)) : (n.name.charAt(0).toUpperCase() + n.name.slice(1));
        if (updatedTime) updatedTime.textContent = window.n ? window.n(n.label) : n.label;
      }

      if (cd !== lastCountdown) {
        lastCountdown = cd;
        const cdEl = document.getElementById('home-countdown');
        if (cdEl) cdEl.textContent = window.n ? window.n(cd) : cd;
      }

      // Countdown progress bar: elapsed time between previous and next prayer
      const nowMs = Date.now();
      const nIdx = t.findIndex(p => p.time.getTime() === n.time.getTime());
      const prevTime = nIdx > 0 ? t[nIdx - 1].time.getTime() : (nIdx === 0 ? n.time.getTime() - 86400000 / 5 : (t.length > 0 ? t[t.length - 1].time.getTime() : n.time.getTime() - 86400000 / 5));
      const totalGap = n.time.getTime() - prevTime;
      if (totalGap > 0 && totalGap < 86400000) {
        const elapsed = nowMs - prevTime;
        const pct = Math.max(0, Math.min(100, (elapsed / totalGap) * 100));
        if (Math.abs(pct - lastPct) > 0.5) {
          lastPct = pct;
          const bar = document.getElementById('home-countdown-bar');
          if (bar) bar.style.width = pct + '%';
          const ring = document.getElementById('home-countdown-ring');
          if (ring) {
            const circ = 226.2;
            ring.style.strokeDashoffset = circ * (1 - pct / 100);
            ring.style.stroke = pct > 80 ? 'var(--color-accent-gold)' : pct > 40 ? 'var(--color-accent-primary)' : 'var(--color-accent-teal, #38bdf8)';
          }
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
    const circumference = 2 * Math.PI * 62;
    const offset = circumference - (visualPct / 100) * circumference;
    const color = score.done === 5 ? '#34d399' : score.done >= 3 ? '#fbbf24' : '#f87171';
    // Ensure structure is always fresh
    el.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
        <div class="salah-ring-premium ring-chart" style="width:160px;height:160px">
          <svg width="160" height="160" viewBox="0 0 160 160">
            <circle class="ring-chart-bg" cx="80" cy="80" r="62" stroke-width="14"/>
            <circle class="ring-chart-fill" id="salah-ring-fill" cx="80" cy="80" r="62" stroke-width="14"
              stroke-dasharray="${circumference}" style="transition:stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)"/>
          </svg>
          <div class="ring-chart-label">
            <div id="salah-ring-count" style="font-size:2.4rem;font-weight:900;line-height:1">0</div>
            <div style="font-size:0.7rem;color:var(--color-text-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-top:2px;">${window.t ? window.t('of 5') : 'of 5'}</div>
          </div>
        </div>
        <div style="text-align:center;width:100%;">
          <div style="font-size:var(--text-md);font-weight:800;letter-spacing:-0.3px;">${window.t ? window.t("Today's Salah") : "Today's Salah"}</div>
          <div id="salah-ring-desc" style="color:var(--color-text-muted);font-size:var(--text-sm);margin-top:4px;font-weight:500;">${window.n ? window.n('0/5') : '0/5'} ${window.t ? window.t('prayers completed') : 'prayers completed'}</div>
          <div class="progress-bar mt-2" style="width:140px;margin:10px auto 0;">
            <div class="progress-fill" id="salah-ring-bar" style="width:0%"></div>
          </div>
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
  },

  /** IntersectionObserver: spring-entrance stagger for .home-reveal cards */
  _observeCards() {
    if (this._cardObserver) this._cardObserver.disconnect();
    const cards = document.querySelectorAll('.home-reveal');
    if (!cards.length) return;
    this._cardObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('home-revealed');
          this._cardObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
    cards.forEach(card => this._cardObserver.observe(card));
  }
};

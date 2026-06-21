const Home = {
  countdownRAF: null,
  dateTimeRAF: null,
  insightInterval: null,
  insightTimeout: null,
  _cachedSHS: null,
  _lastPrayerName: null,
  _waqtPrevName: null,
  _waqtBurstTimeout: null,

  init() {
    this.render();
    // Listen for local data updates to refresh dashboard live
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
    if (this.dateTimeRAF) { cancelAnimationFrame(this.dateTimeRAF); this.dateTimeRAF = null; }
    if (this.insightInterval) { clearInterval(this.insightInterval); this.insightInterval = null; }
    if (this.insightTimeout) { clearTimeout(this.insightTimeout); this.insightTimeout = null; }
    if (this._waqtBurstTimeout) { clearTimeout(this._waqtBurstTimeout); this._waqtBurstTimeout = null; }
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
    if (nowTime >= fajr && nowTime < dhuhr) greet = 'Fajr Mubarak 🌅';
    else if (nowTime >= dhuhr && nowTime < asr) greet = 'Blessed Noon ☀️';
    else if (nowTime >= asr && nowTime < maghrib) greet = 'Asr Barakah 🌤️';
    else if (nowTime >= maghrib && nowTime < isha) greet = 'Maghrib Light 🌆';
    else if (nowTime >= isha) greet = 'Isha Peace 🌙';

    // Get Last Name (with safety)
    const rawName = (user && typeof user.name === 'string') ? user.name : 'User';
    const nameParts = rawName.trim().split(/\s+/);
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0];

    // Use global Utils.escapeHTML to prevent XSS attacks
    const safeLastName = Utils.escapeHTML(lastName);

    const el = document.getElementById('home-greeting');
    if (el) el.innerHTML = `
      <div class="home-hero-card">
        <div class="home-hero-left">
          <div class="home-hero-waqt-badge">
            <span class="home-hero-waqt-dot"></span>
            ${window.t ? window.t(greet) : greet}
          </div>
          <h2 class="home-hero-salam">
            ${window.t ? window.t('As-salamu alaykum,') : 'As-salamu alaykum,'}
          </h2>
          <div class="home-hero-name">${safeLastName}</div>
        </div>
        <div class="home-hero-right">
          <div id="live-time-val" class="home-hero-time">--:--</div>
          <div id="live-date-en-val" class="home-hero-date-en"></div>
          <div id="live-date-hj-val" class="home-hero-date-hj"></div>
        </div>
      </div>
    `;

    // Live Date Time (accurate, no lag)
    this.startLiveDateTime();

    // FIX #4: Compute SHS once and cache for sub-functions
    this._cachedSHS = typeof Analysis !== 'undefined' ? Analysis.calculateSHS() : 0;

    // Date bar (Streaks + LSS Score + Pulse)
    const db = document.getElementById('home-date-bar');
    if (db) {
      const shs = this._cachedSHS;

      db.innerHTML = `
        <div class="home-stats-row">
          <div class="home-stat-chip home-stat-streak">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--color-accent-gold)">
              <path d="M12 2c0 0-4.5 5.5-4.5 10s3.5 8 4.5 8 4.5-3.5 4.5-8-4.5-10-4.5-10zm0 15c-1.5 0-2.5-1.5-2.5-3.5s1-3.5 2.5-3.5 2.5 1.5 2.5 3.5-1 3.5-2.5 3.5z"/>
            </svg>
            <span class="home-stat-value" style="color: var(--color-accent-gold);">${window.n ? window.n(DB.getSalahStreak().perfect) : DB.getSalahStreak().perfect}d</span>
            <span class="home-stat-label">${window.t ? window.t('Streak') : 'Streak'}</span>
          </div>
          <div class="home-stat-chip home-stat-shs" style="--stat-color: ${shs.rating.color};">
            <div class="home-stat-shs-orb" style="background: ${shs.rating.color};">
              <span>${window.n ? window.n(Math.round(shs.total)) : Math.round(shs.total)}</span>
            </div>
            <span class="home-stat-label">SHS</span>
          </div>
          <div class="home-stat-chip home-stat-pulse" id="shs-pulse-graph-spot"></div>
        </div>
      `;
    }

    // Next prayer banner
    // Wrap in reveal container
    const npContainer = document.getElementById('home-next-prayer');
    if (npContainer) npContainer.classList.add('home-reveal', 'revealed');

    this.startNextPrayerCountdown();

    // Salah ring (inside the card - add reveal to the parent)
    this.renderSalahRing();

    // 1. Path to Ihsan (Level Progress Bar)
    const lvlContainer = document.getElementById('home-level-progress-container');
    if (lvlContainer) lvlContainer.classList.add('home-reveal', 'revealed', 'home-reveal-delay-2');

    this.renderIhsanLevel();

    // 3. Spiritual Pulse (Micro-Graph)
    this.renderSpiritualPulse();

    // 4. Barakah Garden
    this.renderBarakahGarden();

    // 5. Weekly AI Summary
    this.renderWeeklySummary();

    // 6. Dua Request Board Card
    this.renderDuaCard();

    // 7. AI Spiritual Insight (reveal class added inside renderAIInsight)
    this.renderAIInsight();

    // 8. Nur Particles (Subtle Animation)
    this.renderNurParticles();
  },



  renderIhsanLevel() {
    const container = document.getElementById('home-level-progress-container');
    if (!container) return;

    const shs = this._cachedSHS || (typeof Analysis !== 'undefined' ? Analysis.calculateSHS() : { total: 0, rating: { color: '#8E8E93' } });
    const ranks = [
      { min: 0, label: 'Ghafil' },
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
    const color = shs.rating.color;

    const starPositions = [
      [40, 90], [125, 60], [210, 80], [295, 50],
      [380, 75], [465, 55], [550, 85], [620, 50]
    ];

    const segLengths = [];
    for (let i = 1; i < starPositions.length; i++) {
      const dx = starPositions[i][0] - starPositions[i - 1][0];
      const dy = starPositions[i][1] - starPositions[i - 1][1];
      segLengths.push(Math.sqrt(dx * dx + dy * dy));
    }
    const totalConnLen = segLengths.reduce((a, b) => a + b, 0);

    let progressLen = 0;
    for (let i = 0; i < Math.min(curIdx, 7); i++) progressLen += segLengths[i];
    if (curIdx < 7) progressLen += (prog / 100) * segLengths[curIdx];
    const fillOffset = totalConnLen - progressLen;

    const allPoints = starPositions.map(p => p.join(',')).join(' ');

    const starsHtml = ranks.map((r, idx) => {
      const [x, y] = starPositions[idx];
      const isAchieved = idx < curIdx;
      const isCurrent = idx === curIdx;
      const isFuture = idx > curIdx;
      const starR = isAchieved ? 7 : isCurrent ? 8 : 5;
      return `
        <g class="ihsan-star ${isAchieved ? 'ihsan-star-achieved' : isCurrent ? 'ihsan-star-current' : 'ihsan-star-future'}">
          <circle cx="${x}" cy="${y}" r="${starR}" fill="${isAchieved || isCurrent ? color : 'none'}"
            stroke="${isAchieved || isCurrent ? color : 'var(--color-divider-subtle)'}" stroke-width="1.5"/>
          ${isCurrent ? `<circle cx="${x}" cy="${y}" r="12" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.3" class="ihsan-pulse-ring"/>` : ''}
          ${isCurrent ? `<circle cx="${x}" cy="${y}" r="17" fill="none" stroke="${color}" stroke-width="1" opacity="0.12" class="ihsan-pulse-ring-outer"/>` : ''}
          <text x="${x}" y="${y + 22}" text-anchor="middle" font-size="9" font-weight="${isCurrent ? '800' : '600'}"
            fill="${isAchieved || isCurrent ? 'var(--color-text-primary)' : 'var(--color-text-muted)'}" opacity="${isFuture ? 0.35 : 1}">${r.label}</text>
        </g>`;
    }).join('');

    container.innerHTML = `
      <div class="ihsan-galaxy-container">
        <div class="ihsan-galaxy-header">
          <div>
            <div class="ihsan-label">${window.t ? window.t('CURRENT RANK') : 'Current Rank'}</div>
            <div class="ihsan-current-rank" style="color:${color};">${window.t ? window.t(current.label) : current.label} <span class="ihsan-shs">${window.n ? window.n(Math.round(shs.total)) : Math.round(shs.total)}</span></div>
          </div>
          <div class="ihsan-next-info">
            <div class="ihsan-label">${window.t ? window.t('Next') : 'Next'}</div>
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="color:var(--color-accent-gold); font-weight:800; font-size:14px;">${window.t ? window.t(next.label) : next.label}</span>
              <span class="ihsan-pct" style="color:${color};">${window.n ? window.n(Math.round(prog)) : Math.round(prog)}%</span>
            </div>
          </div>
        </div>
        <div class="ihsan-galaxy-scroll">
          <svg class="ihsan-galaxy-svg" viewBox="0 0 660 140" width="660" height="140">
            <polyline points="${allPoints}" fill="none" stroke="var(--color-divider-subtle)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.35"/>
            <polyline points="${allPoints}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${totalConnLen}" stroke-dashoffset="${fillOffset}" style="transition: stroke-dashoffset 1s cubic-bezier(0.34, 1.56, 0.64, 1);"/>
            ${starsHtml}
          </svg>
        </div>
      </div>
    `;
  },

  renderSpiritualPulse() {
    const container = document.getElementById('shs-pulse-graph-spot');
    if (!container) return;

    // FIX #4: Use cached SHS instead of recalculating
    const color = (this._cachedSHS || (typeof Analysis !== 'undefined' ? Analysis.calculateSHS() : { rating: { color: '#8E8E93' } })).rating.color;
    container.style.overflow = 'visible';
    container.style.width = '100px';

    container.innerHTML = `
      <svg width="100" height="30" viewBox="0 0 100 30" style="filter: drop-shadow(0 0 5px ${color}40);">
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
      <div class="card ai-insight-premium home-reveal revealed home-reveal-delay-3" style="background:linear-gradient(135deg, rgba(167,139,250,0.08) 0%, rgba(192,132,252,0.03) 100%); padding:18px 20px; display:flex; align-items:center; gap:16px;">
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

    const formattedAvg = window.n ? window.n(avgPrayed) : avgPrayed;
    const formattedPerfect = window.n ? window.n(perfectDays) : perfectDays;
    const formattedDhikrVal = totalDhikr > 999 ? (totalDhikr / 1000).toFixed(1) + 'k' : totalDhikr;
    const formattedDhikr = window.n ? window.n(formattedDhikrVal) : formattedDhikrVal;
    
    const labelAvg = window.t ? window.t('avg') : 'avg';
    const labelPerfect = window.t ? window.t('perfect') : 'perfect';
    const labelDhikr = window.t ? window.t('dhikr') : 'dhikr';

    container.innerHTML = `
      <div class="card home-reveal revealed home-reveal-delay-3" style="background:linear-gradient(135deg, rgba(16,185,129,0.06), rgba(99,102,241,0.03)); padding:18px 20px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div class="ai-insight-icon-wrap" style="width:36px;height:36px;background:linear-gradient(135deg,#10b981,#6366f1);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 0 16px rgba(16,185,129,0.2);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          </div>
          <div style="flex:1;display:flex;flex-direction:column;gap:2px;">
            <div style="font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#10b981;">${window.t ? window.t('Weekly Pulse') : 'Weekly Pulse'}</div>
            <div style="font-size:12px;font-weight:600;color:var(--color-text-secondary);line-height:1.4;">
              ${formattedAvg}/${window.n ? window.n(5) : 5} ${labelAvg} · ${formattedPerfect} ${labelPerfect} · ${formattedDhikr} ${labelDhikr}
            </div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px;">
            <div style="font-size:9px;font-weight:700;color:var(--color-text-muted);text-transform:uppercase;">${window.t ? window.t('Best') : 'Best'}</div>
            <div style="font-size:16px;font-weight:900;color:var(--color-accent-gold);">${window.n ? window.n(bestDay) : bestDay}/${window.n ? window.n(5) : 5}</div>
          </div>
        </div>
        <div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--color-border-muted);display:flex;align-items:center;gap:8px;">
          <span style="font-size:14px;line-height:1;">💡</span>
          <span style="font-size:11px;font-weight:600;color:var(--color-text-muted);line-height:1.4;">${window.t ? window.t(tip) : tip}</span>
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
      <div class="home-dua-card home-reveal revealed home-reveal-delay-4" onclick="DuaBoard.showModal()">
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

  renderBarakahGarden() {
    const container = document.getElementById('home-barakah-garden');
    if (!container) return;
    const streak = DB.getSalahStreak ? DB.getSalahStreak().perfect : 0;
    const tier = streak >= 100 ? 5 : streak >= 60 ? 4 : streak >= 30 ? 3 : streak >= 14 ? 2 : streak >= 7 ? 1 : 0;
    const tierNames = streak === 0 ? ['Fallow Land'] : ['Sprout', 'Bloom', 'Rose', 'Sapling', 'Tree', 'Olive Tree'];
    const tierEmojis = streak === 0 ? ['🏜️'] : ['🌱', '🌸', '🌹', '🌿', '🌳', '🫒'];
    const tierName = streak === 0 ? 'Fallow Land' : tierNames[tier];
    const colors = streak === 0 ? ['#6B7280'] : ['#86efac', '#34d399', '#22c55e', '#16a34a', '#15803d', '#fdba74'];

    const gardenSVG = this._gardenSVG(tier, streak === 0);
    const phaseColor = streak === 0 ? '#6B7280' : (colors[tier] || '#10B981');

    container.innerHTML = `
      <div class="card barakah-garden-card home-reveal revealed" style="padding:0; overflow:hidden; border:1px solid var(--color-border); border-radius:var(--card-radius); background:var(--color-surface-card);">
        <div class="barakah-garden-inner" style="position:relative;">
          <div class="barakah-garden-svg-wrap">${gardenSVG}</div>
          <div class="barakah-garden-label" style="display:flex; align-items:center; justify-content:space-between; padding:8px 16px 12px; border-top:1px solid var(--color-divider-subtle);">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:18px;">${streak === 0 ? '🏜️' : tierEmojis[tier]}</span>
              <div>
                <div style="font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:1.2px; color:var(--color-text-muted);">${window.t ? window.t('Barakah Garden') : 'Barakah Garden'}</div>
                <div style="font-size:15px; font-weight:800; color:${phaseColor};">${window.t ? window.t(tierName) : tierName}</div>
              </div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:24px; font-weight:900; line-height:1; color:var(--color-text-primary);">${window.n ? window.n(streak) : streak}</div>
              <div style="font-size:9px; font-weight:600; text-transform:uppercase; letter-spacing:0.8px; color:var(--color-text-muted);">${window.t ? window.t('Day Streak') : 'Day Streak'}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  _gardenSVG(tier, isBarren) {
    if (isBarren) {
      return `<svg width="340" height="230" viewBox="0 0 340 230" style="display:block;">
        <defs>
          <radialGradient id="barrenGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stop-color="#29252440"/>
            <stop offset="100%" stop-color="#29252400"/>
          </radialGradient>
        </defs>
        <rect width="340" height="230" fill="#1c1917"/>
        <circle cx="170" cy="110" r="80" fill="url(#barrenGlow)"/>
        <path d="M0,195 Q85,200 170,195 Q255,190 340,195 L340,230 L0,230 Z" fill="#292524"/>
        <path d="M0,208 Q85,205 170,208 Q255,211 340,208 L340,230 L0,230 Z" fill="#1c1917" opacity="0.6"/>
        <path d="M0,195 L40,165 L80,190 L120,160 L160,185 L200,155 L240,180 L280,165 L320,190 L340,175 L340,195 Z" fill="#292524" opacity="0.4"/>
        ${this._cloudSVG(50, 45, 0.5)}
        ${this._cloudSVG(240, 60, 0.3)}
        <!-- Single dried grass -->
        <path d="M170,200 Q172,185 168,175" stroke="#57534e" stroke-width="1.2" fill="none" opacity="0.4"/>
        <path d="M168,175 Q165,172 163,175" stroke="#57534e" stroke-width="1" fill="none" opacity="0.4"/>
        <path d="M160,205 Q158,195 162,188" stroke="#57534e" stroke-width="1" fill="none" opacity="0.3"/>
        <!-- Tiny seed buried -->
        <ellipse cx="170" cy="204" rx="3" ry="2" fill="#78716c" opacity="0.5"/>
        <text x="170" y="160" text-anchor="middle" fill="#57534e" font-size="10" font-weight="600" letter-spacing="0.5" opacity="0.6">Plant your first seed</text>
        <text x="170" y="173" text-anchor="middle" fill="#44403c" font-size="8" font-weight="400" opacity="0.4">Complete all 5 prayers today</text>
      </svg>`;
    }

    const skyTop = '#0a0f1e';
    const skyBot = '#162032';
    const groundA = '#2d5a27';
    const groundB = '#1a3a15';

    return `<svg width="340" height="230" viewBox="0 0 340 230" style="display:block;">
      <defs>
        <linearGradient id="bgG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${skyTop}"/>
          <stop offset="60%" stop-color="${skyBot}"/>
          <stop offset="100%" stop-color="${groundA}" stop-opacity="0.3"/>
        </linearGradient>
        <linearGradient id="moonG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#e2e8f0" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#e2e8f0" stop-opacity="0.1"/>
        </linearGradient>
      </defs>
      <rect width="340" height="230" fill="url(#bgG)"/>
      <!-- Stars -->
      ${Array.from({length: 15}, (_, i) => {
        const sx = 20 + Math.sin(i * 1.7) * 150 + 170;
        const sy = 8 + (i * 7.3) % 45;
        return `<circle cx="${sx}" cy="${sy}" r="${0.5 + (i % 3) * 0.3}" fill="#e2e8f0" opacity="${0.2 + (i % 4) * 0.15}" class="barakah-star" style="animation-delay:${(i * 0.2).toFixed(2)}s"/>`;
      }).join('')}
      <!-- Crescent moon -->
      <path d="M280,35 A18,18 0 1,1 295,20 A22,22 0 1,0 280,35 Z" fill="url(#moonG)" opacity="0.6"/>
      <!-- Mountains -->
      <path d="M0,195 L45,155 L90,185 L135,145 L180,175 L225,140 L270,170 L315,148 L340,180 L340,195 Z" fill="#1a2e1a" opacity="0.5"/>
      <path d="M0,195 L30,170 L60,188 L100,160 L140,182 L170,155 L200,178 L240,158 L280,180 L320,162 L340,185 L340,195 Z" fill="#1a3a15" opacity="0.35"/>
      <!-- Ground -->
      <path d="M0,195 Q85,183 170,195 Q255,207 340,195 L340,230 L0,230 Z" fill="${groundA}"/>
      <path d="M0,207 Q85,198 170,207 Q255,216 340,207 L340,230 L0,230 Z" fill="${groundB}" opacity="0.6"/>
      <!-- Mid-ground grass layer -->
      <path d="M0,195 Q42,190 85,195 Q127,200 170,195 Q212,190 255,195 Q297,200 340,195" fill="none" stroke="#166534" stroke-width="1" opacity="0.3"/>
      ${this._cloudSVG(60, 48, 0.5)}
      ${this._cloudSVG(250, 65, 0.35)}
      ${this._grassSVG(tier)}
      ${this._plantSVG(170, 200, tier)}
      ${tier >= 2 ? this._plantSVG(85, 207, Math.min(tier - 1, 3)) : ''}
      ${tier >= 3 ? this._plantSVG(255, 204, Math.min(tier - 2, 3)) : ''}
      ${tier >= 5 ? this._plantSVG(120, 210, 2) : ''}
    </svg>`;
  },

  _cloudSVG(cx, cy, opacity) {
    return `<g class="barakah-cloud" opacity="${opacity}">
      <ellipse cx="${cx}" cy="${cy}" rx="28" ry="9" fill="#1e293b"/>
      <ellipse cx="${cx + 14}" cy="${cy - 5}" rx="16" ry="7" fill="#1e293b"/>
      <ellipse cx="${cx - 10}" cy="${cy - 3}" rx="13" ry="6" fill="#1e293b"/>
    </g>`;
  },

  _grassSVG(tier) {
    const count = 8 + tier * 2;
    const blades = [];
    for (let i = 0; i < count; i++) {
      const x = 10 + (i * (320 / count)) + (i % 3) * 4;
      const h = 7 + (i % 5) * 4 + tier * 1.5;
      const lean = i % 2 === 0 ? 1 : -1;
      blades.push(`<path d="M${x},205 Q${x + lean * 2},${205 - h} ${x + lean * 4},${205 - h - 2}" stroke="#22c55e" stroke-width="${1 + tier * 0.15}" fill="none" class="barakah-grass" style="animation-delay:${(i * 0.12).toFixed(2)}s"/>`);
    }
    return blades.join('');
  },

  _plantSVG(x, baseY, tier) {
    const s = (tier >= 3 ? 1 : 1) * (tier >= 4 ? 1.15 : 1);

    if (tier === 0) {
      // Tiny sprout — the start of growth
      return `<g class="barakah-plant-group" transform-origin="${x}px ${baseY}px">
        <path d="M${x},${baseY} Q${x + 1},${baseY - 14} ${x - 1},${baseY - 18}" stroke="#4ade80" stroke-width="2" fill="none" class="barakah-plant"/>
        <path d="M${x - 1},${baseY - 18} Q${x - 7},${baseY - 21} ${x - 8},${baseY - 17}" fill="#4ade80" class="barakah-leaf"/>
        <path d="M${x - 0.5},${baseY - 15} Q${x + 6},${baseY - 18} ${x + 7},${baseY - 14}" fill="#4ade80" class="barakah-leaf"/>
        <ellipse cx="${x}" cy="${baseY + 2}" rx="4" ry="1.5" fill="#78716c" opacity="0.3"/>
      </g>`;
    }

    if (tier === 1) {
      // Tulip flower
      const px = x, py = baseY - 38;
      return `<g class="barakah-plant-group" transform-origin="${x}px ${baseY}px">
        <path d="M${x},${baseY} Q${x - 2},${baseY - 18} ${x + 1},${baseY - 30}" stroke="#22c55e" stroke-width="2.5" fill="none" class="barakah-plant"/>
        <path d="M${x + 1},${baseY - 20} Q${x - 7},${baseY - 24} ${x - 8},${baseY - 18}" fill="#4ade80" class="barakah-leaf"/>
        <path d="M${x + 1},${baseY - 14} Q${x + 8},${baseY - 17} ${x + 9},${baseY - 13}" fill="#4ade80" class="barakah-leaf"/>
        <!-- Tulip cup -->
        <path d="M${px - 6},${py + 4} Q${px - 8},${py - 4} ${px - 5},${py - 8} Q${px},${py - 12} ${px + 5},${py - 8} Q${px + 8},${py - 4} ${px + 6},${py + 4} Z" fill="#f472b6" class="barakah-petal"/>
        <ellipse cx="${px}" cy="${py + 2}" rx="3" ry="1.5" fill="#fbbf24" opacity="0.6"/>
      </g>`;
    }

    if (tier === 2) {
      // Daisy flower
      const px = x, py = baseY - 42;
      const petals = [];
      for (let a = 0; a < 8; a++) {
        const angle = (a / 8) * Math.PI * 2;
        const xOff = Math.cos(angle) * 8;
        const yOff = Math.sin(angle) * 8;
        petals.push(`<ellipse cx="${px + xOff}" cy="${py + yOff}" rx="4" ry="6" fill="#a78bfa" opacity="0.85" class="barakah-petal" transform="rotate(${a * 45} ${px + xOff} ${py + yOff})" style="animation-delay:${(a * 0.08).toFixed(2)}s"/>`);
      }
      return `<g class="barakah-plant-group" transform-origin="${x}px ${baseY}px">
        <path d="M${x},${baseY} Q${x + 1},${baseY - 20} ${x - 1},${baseY - 34}" stroke="#22c55e" stroke-width="2.8" fill="none" class="barakah-plant"/>
        ${petals.join('')}
        <circle cx="${px}" cy="${py}" r="4" fill="#fbbf24"/>
        <path d="M${x - 1},${baseY - 16} Q${x - 9},${baseY - 20} ${x - 10},${baseY - 15}" fill="#4ade80" class="barakah-leaf"/>
        <path d="M${x - 1},${baseY - 24} Q${x + 9},${baseY - 28} ${x + 10},${baseY - 22}" fill="#4ade80" class="barakah-leaf"/>
      </g>`;
    }

    if (tier === 3) {
      // Cherry blossom sapling
      const tx = x - 4, tw = 8;
      return `<g class="barakah-plant-group" transform-origin="${x}px ${baseY}px">
        <path d="M${tx},${baseY} L${tx + tw},${baseY} L${tx + tw - 1},${baseY - 48} L${tx + 1},${baseY - 48} Z" fill="#6B4226"/>
        <path d="M${tx + 3},${baseY - 30} Q${tx - 8},${baseY - 35} ${tx - 10},${baseY - 30}" stroke="#8B5A2B" stroke-width="2" fill="none"/>
        <path d="M${tx + tw - 3},${baseY - 25} Q${tx + tw + 8},${baseY - 30} ${tx + tw + 10},${baseY - 25}" stroke="#8B5A2B" stroke-width="2" fill="none"/>
        <!-- Canopy layers -->
        <ellipse cx="${x}" cy="${baseY - 52}" rx="22" ry="16" fill="#166534" opacity="0.4" class="barakah-canopy"/>
        <ellipse cx="${x}" cy="${baseY - 50}" rx="18" ry="12" fill="#22c55e" opacity="0.5" class="barakah-canopy"/>
        <ellipse cx="${x}" cy="${baseY - 53}" rx="12" ry="9" fill="#4ade80" opacity="0.6"/>
        <!-- Cherry blossoms -->
        ${Array.from({length: 6}, (_, i) => {
          const bx = x - 10 + (i % 3) * 10;
          const by = baseY - 56 + Math.floor(i / 3) * 7;
          return `<circle cx="${bx}" cy="${by}" r="2.5" fill="#f9a8d4" opacity="0.9" class="barakah-petal" style="animation-delay:${(i * 0.15).toFixed(2)}s"/>`;
        }).join('')}
        <circle cx="${x - 12}" cy="${baseY - 48}" r="2" fill="#f9a8d4" class="barakah-petal" style="animation-delay:0.2s"/>
        <circle cx="${x + 14}" cy="${baseY - 46}" r="2" fill="#f9a8d4" class="barakah-petal" style="animation-delay:0.4s"/>
      </g>`;
    }

    if (tier === 4) {
      // Oak tree
      const tx = x - 6, tw = 12;
      return `<g class="barakah-plant-group" transform-origin="${x}px ${baseY}px">
        <path d="M${tx},${baseY} L${tx + tw},${baseY} L${tx + tw},${baseY - 52} L${tx},${baseY - 52} Z" fill="#4A3728"/>
        <path d="M${tx + 2},${baseY - 35} Q${tx - 10},${baseY - 42} ${tx - 12},${baseY - 35}" stroke="#4A3728" stroke-width="2.5" fill="none"/>
        <path d="M${tx + tw - 2},${baseY - 30} Q${tx + tw + 10},${baseY - 38} ${tx + tw + 12},${baseY - 30}" stroke="#4A3728" stroke-width="2.5" fill="none"/>
        <path d="M${tx + 4},${baseY - 20} Q${tx + 16},${baseY - 26} ${tx + 18},${baseY - 20}" stroke="#4A3728" stroke-width="1.5" fill="none"/>
        <path d="M${tx + tw - 4},${baseY - 18} Q${tx - 16},${baseY - 24} ${tx - 18},${baseY - 18}" stroke="#4A3728" stroke-width="1.5" fill="none"/>
        <ellipse cx="${x}" cy="${baseY - 58}" rx="32" ry="20" fill="#166534" opacity="0.3" class="barakah-canopy"/>
        <ellipse cx="${x}" cy="${baseY - 56}" rx="26" ry="16" fill="#22c55e" opacity="0.45" class="barakah-canopy"/>
        <ellipse cx="${x}" cy="${baseY - 60}" rx="18" ry="12" fill="#4ade80" opacity="0.55"/>
        <ellipse cx="${x - 12}" cy="${baseY - 50}" rx="14" ry="10" fill="#22c55e" opacity="0.35" class="barakah-canopy"/>
        <ellipse cx="${x + 14}" cy="${baseY - 52}" rx="12" ry="9" fill="#22c55e" opacity="0.35" class="barakah-canopy"/>
        ${Array.from({length: 3}, (_, i) =>
          `<circle cx="${x - 6 + i * 6}" cy="${baseY - 66}" r="2" fill="#fbbf24" class="barakah-sparkle" style="animation-delay:${(i * 0.4).toFixed(2)}s"/>`
        ).join('')}
      </g>`;
    }

    // Tier 5: Olive tree — 100+ days
    const tx = x - 7, tw = 14;
    return `<g class="barakah-plant-group" transform-origin="${x}px ${baseY}px">
      <path d="M${tx},${baseY} L${tx + tw},${baseY} L${tx + tw - 1},${baseY - 58} L${tx + 1},${baseY - 58} Z" fill="#4A3728"/>
      <path d="M${tx + 2},${baseY - 42} Q${tx - 14},${baseY - 52} ${tx - 16},${baseY - 44}" stroke="#4A3728" stroke-width="3" fill="none"/>
      <path d="M${tx + tw - 2},${baseY - 38} Q${tx + tw + 16},${baseY - 48} ${tx + tw + 18},${baseY - 40}" stroke="#4A3728" stroke-width="3" fill="none"/>
      <path d="M${tx + 5},${baseY - 25} Q${tx + 20},${baseY - 32} ${tx + 22},${baseY - 25}" stroke="#4A3728" stroke-width="2" fill="none"/>
      <path d="M${tx + tw - 5},${baseY - 22} Q${tx - 20},${baseY - 28} ${tx - 22},${baseY - 22}" stroke="#4A3728" stroke-width="2" fill="none"/>
      <path d="M${tx + 8},${baseY - 14} Q${tx + 24},${baseY - 18} ${tx + 26},${baseY - 13}" stroke="#4A3728" stroke-width="1.2" fill="none"/>
      <path d="M${tx + tw - 8},${baseY - 12} Q${tx - 24},${baseY - 16} ${tx - 26},${baseY - 12}" stroke="#4A3728" stroke-width="1.2" fill="none"/>
      <ellipse cx="${x}" cy="${baseY - 62}" rx="36" ry="22" fill="#525b30" opacity="0.25" class="barakah-canopy"/>
      <ellipse cx="${x}" cy="${baseY - 60}" rx="30" ry="18" fill="#6B8E23" opacity="0.35" class="barakah-canopy"/>
      <ellipse cx="${x}" cy="${baseY - 64}" rx="22" ry="14" fill="#84a83f" opacity="0.45"/>
      <ellipse cx="${x}" cy="${baseY - 66}" rx="14" ry="10" fill="#a3bf5a" opacity="0.55"/>
      <ellipse cx="${x - 14}" cy="${baseY - 54}" rx="16" ry="10" fill="#6B8E23" opacity="0.3" class="barakah-canopy"/>
      <ellipse cx="${x + 16}" cy="${baseY - 56}" rx="14" ry="9" fill="#6B8E23" opacity="0.3" class="barakah-canopy"/>
      ${Array.from({length: 6}, (_, i) => {
        const ox = x - 12 + i * 5;
        const oy = baseY - 68 + (i % 2 === 0 ? 0 : 5);
        return `<circle cx="${ox}" cy="${oy}" r="3" fill="#566b1f" class="barakah-olive" style="animation-delay:${(i * 0.3).toFixed(2)}s"/>`;
      }).join('')}
      <circle cx="${x}" cy="${baseY - 76}" r="2.5" fill="#fbbf24" class="barakah-sparkle"/>
    </g>`;
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
    // Cancel previous loop to prevent resource leaks
    if (this.dateTimeRAF) cancelAnimationFrame(this.dateTimeRAF);

    const timeVal = document.getElementById('live-time-val');
    const enVal = document.getElementById('live-date-en-val');
    const hjVal = document.getElementById('live-date-hj-val');

    if (!timeVal) return;

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

  /* ---- Waqt Orb — Living Countdown Sphere ---- */
  startNextPrayerCountdown() {
    const times = Utils.calcPrayerTimes();
    const next = Utils.getNextPrayer(times);
    const el = document.getElementById('home-next-prayer');
    if (!el) return;

    const nextName = typeof next.name === 'string' && next.name ? next.name : 'Prayer';
    const nextLabel = typeof next.label === 'string' && next.label ? next.label : '--:--';

    const waqtColors = {
      fajr: '#38bdf8',
      dhuhr: '#fbbf24',
      asr: '#fb923c',
      maghrib: '#a855f7',
      isha: '#6366f1'
    };
    const waqtColor = waqtColors[next.name] || '#10B981';
    const waqtClass = 'waqt-' + (next.name || 'fajr');

    // Compute initial ring offset + urgency class before render (no flash)
    const CIRC = 452.4;
    const nowMsInit = Date.now();
    const nIdxInit = times.findIndex(p => p.time.getTime() === next.time.getTime());
    const prevTimeInit = nIdxInit > 0 ? times[nIdxInit - 1].time.getTime() : (nIdxInit === 0 ? next.time.getTime() - 17280000 : next.time.getTime() - 86400000 / 5);
    const totalGapInit = next.time.getTime() - prevTimeInit;
    let initPct = 0;
    if (totalGapInit > 0 && totalGapInit < 86400000) initPct = Math.max(0, Math.min(100, ((nowMsInit - prevTimeInit) / totalGapInit) * 100));
    const initOffset = CIRC * (1 - initPct / 100);
    const remainingInit = next.time.getTime() - nowMsInit;
    let extraWaqtClass = '';
    if (remainingInit < 600000) extraWaqtClass = ' waqt-critical';
    else if (remainingInit < 3600000) extraWaqtClass = ' waqt-urgent';

    el.innerHTML = `
      <div class="card waqt-orb-premium home-reveal revealed ${waqtClass}${extraWaqtClass}" style="margin: 0; padding: 24px;">
        <div class="waqt-orb-header" style="justify-content:center; margin-bottom: 16px;">
          <span style="font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:2px; color:var(--color-text-muted);">${window.t ? window.t('NEXT PRAYER') : 'Next Prayer'}</span>
        </div>
        <div class="waqt-orb-body">
          <div class="waqt-orb-visual">
            <div class="waqt-orb-glow" id="waqt-orb-glow" style="--waqt-glow:${waqtColor};"></div>
            <svg width="160" height="160" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="72" stroke="var(--color-divider-subtle)" stroke-width="4" fill="none"/>
              <circle id="waqt-ring" cx="80" cy="80" r="72" stroke="${waqtColor}" stroke-width="5" fill="none" stroke-dasharray="${CIRC}" stroke-dashoffset="${initOffset}" stroke-linecap="round" transform="rotate(-90 80 80)"/>
            </svg>
            <div class="waqt-orb-inner">
              <div id="home-countdown" class="waqt-countdown" style="font-size: 1.8rem;">--:--:--</div>
            </div>
          </div>
          <div style="display:flex; flex-direction:column; align-items:center; gap:2px; margin-top:8px;">
            <div id="home-next-name" class="waqt-prayer-name" style="color:${waqtColor}; font-size:2.2rem; font-weight:900; line-height:1; letter-spacing:-0.5px;">${window.t ? window.t(nextName.charAt(0).toUpperCase() + nextName.slice(1)) : nextName.charAt(0).toUpperCase() + nextName.slice(1)}</div>
            <div id="home-next-time" class="waqt-prayer-time" style="font-size:1.15rem; font-weight:700; color:var(--color-text-primary); opacity:0.8;">${window.n ? window.n(nextLabel) : nextLabel}</div>
          </div>
        </div>
      </div>
    `;

    this._lastPrayerName = next.name;
    this._waqtPrevName = next.name;
    if (this.countdownRAF) cancelAnimationFrame(this.countdownRAF);
    if (this._waqtBurstTimeout) { clearTimeout(this._waqtBurstTimeout); this._waqtBurstTimeout = null; }

    let lastCountdown = '';
    let lastPct = -1;
    // CIRC already declared above in the outer scope
    const tickCountdown = () => {
      if (!document.getElementById('section-home')?.classList.contains('active')) {
        this.countdownRAF = null;
        return;
      }

      const t = Utils.calcPrayerTimes();
      const n = Utils.getNextPrayer(t);
      const cd = Utils.countdownTo(n.time);

      if (n.name !== this._waqtPrevName) {
        this._waqtPrevName = n.name;
        this._lastPrayerName = n.name;
        const orbCard = el.querySelector('.waqt-orb-premium');
        if (orbCard) {
          Object.keys(waqtColors).forEach(k => orbCard.classList.remove('waqt-' + k));
          orbCard.classList.add('waqt-' + (n.name || 'fajr'));
          orbCard.classList.add('waqt-bursting');
          if (this._waqtBurstTimeout) clearTimeout(this._waqtBurstTimeout);
          this._waqtBurstTimeout = setTimeout(() => {
            const c = orbCard;
            if (c) c.classList.remove('waqt-bursting');
            this._waqtBurstTimeout = null;
          }, 800);
        }
        const ringEl = document.getElementById('waqt-ring');
        if (ringEl) ringEl.style.stroke = waqtColors[n.name] || '#10B981';
        const glowEl = document.getElementById('waqt-orb-glow');
        if (glowEl) glowEl.style.setProperty('--waqt-glow', waqtColors[n.name] || '#10B981');
        const pnEl = document.getElementById('home-next-name');
        if (pnEl) pnEl.style.color = waqtColors[n.name] || '#10B981';
        const ptEl = document.getElementById('home-next-time');
        if (ptEl) ptEl.textContent = window.n ? window.n(n.label) : n.label;
      }

      if (cd !== lastCountdown) {
        lastCountdown = cd;
        const cdEl = document.getElementById('home-countdown');
        if (cdEl) cdEl.textContent = window.n ? window.n(cd) : cd;
      }

      const nowMs = Date.now();
      const nIdx = t.findIndex(p => p.time.getTime() === n.time.getTime());
      const prevTime = nIdx > 0 ? t[nIdx - 1].time.getTime() : (nIdx === 0 ? n.time.getTime() - 86400000 / 5 : (t.length > 0 ? t[t.length - 1].time.getTime() : n.time.getTime() - 86400000 / 5));
      const totalGap = n.time.getTime() - prevTime;
      if (totalGap > 0 && totalGap < 86400000) {
        const elapsed = nowMs - prevTime;
        const pct = Math.max(0, Math.min(100, (elapsed / totalGap) * 100));
        if (Math.abs(pct - lastPct) > 0.5) {
          lastPct = pct;
          const ring = document.getElementById('waqt-ring');
          if (ring) ring.style.strokeDashoffset = CIRC * (1 - pct / 100);

          const orbCard = el.querySelector('.waqt-orb-premium');
          if (orbCard) {
            const remaining = n.time.getTime() - nowMs;
            orbCard.classList.remove('waqt-urgent', 'waqt-critical');
            if (remaining < 600000) orbCard.classList.add('waqt-critical');
            else if (remaining < 3600000) orbCard.classList.add('waqt-urgent');
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
    
    const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    const prayerLabels = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    
    let lastDoneIdx = -1;
    for (let i = 0; i < prayers.length; i++) {
      let st = today[prayers[i]];
      if (st) lastDoneIdx = i;
    }
    const progressPct = lastDoneIdx >= 0 ? (lastDoneIdx / (prayers.length - 1)) * 100 : 0;
    
    const isPerfect = score.done === 5;
    const hasMissed = score.done > 0 && score.done < 5;
    const accentColor = isPerfect ? '#10B981' : '#3B82F6';

    let pointsHTML = '';
    prayers.forEach((p, i) => {
      let st = today[p];
      let isDone = st === 'jamaat' || st === 'alone' || st === 'qaza';
      let isMiss = st === 'missed';
      
      let dotBg = 'var(--color-surface-nested)';
      let dotBorder = 'var(--color-divider-strong)';
      let shadow = 'none';
      let icon = '';
      
      if (isDone) {
        dotBg = accentColor;
        dotBorder = accentColor;
        shadow = `0 0 10px ${accentColor}60`;
        icon = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
      } else if (isMiss) {
        dotBg = '#EF4444';
        dotBorder = '#EF4444';
        icon = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
      }

      pointsHTML += `
        <div style="position:relative; z-index:2; display:flex; flex-direction:column; align-items:center; gap:8px;">
          <div style="width:24px; height:24px; border-radius:50%; background:${dotBg}; border:2px solid ${dotBorder}; box-shadow:${shadow}; display:flex; align-items:center; justify-content:center; transition:all 0.4s var(--cb-bounce);">
            ${icon}
          </div>
          <span style="font-size:10px; font-weight:700; color:${isDone ? 'var(--color-text-primary)' : 'var(--color-text-muted)'}; text-transform:uppercase; letter-spacing:0.5px;">${window.t ? window.t(prayerLabels[i]) : prayerLabels[i]}</span>
        </div>
      `;
    });

    const statusMsg = isPerfect ? "Beautiful! You've prayed all 5." : hasMissed ? "Keep striving. Every prayer counts." : "Your daily spiritual journey.";

    el.innerHTML = `
      <div style="display:flex; flex-direction:column; width:100%; padding: 4px 0;">
        <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom: 28px;">
          <div style="text-align:left;">
            <div style="font-size:1.5rem; font-weight:900; letter-spacing:-0.5px; color:var(--color-text-primary);">${window.t ? window.t("Today's Salah") : "Today's Salah"}</div>
            <div style="color:var(--color-text-muted); font-size:12px; margin-top:4px; font-weight:600;">
              ${window.t ? window.t(statusMsg) : statusMsg}
            </div>
          </div>
          <div style="background:color-mix(in srgb, ${accentColor} 15%, transparent); color:${accentColor}; padding:6px 14px; border-radius:20px; font-size:16px; font-weight:800; border:1px solid color-mix(in srgb, ${accentColor} 30%, transparent);">
            ${window.n ? window.n(score.done) : score.done}/${window.n ? window.n(5) : 5}
          </div>
        </div>

        <div style="position:relative; width:100%; margin:0 auto 10px; padding:0 12px; display:flex; flex-direction:column;">
          <!-- Track Background -->
          <div style="position:absolute; top:10px; left:24px; right:24px; height:4px; background:var(--color-divider-subtle); z-index:0; border-radius:2px;"></div>
          <!-- Track Fill -->
          <div style="position:absolute; top:10px; left:24px; right:24px; height:4px; z-index:1; border-radius:2px;">
            <div id="salah-timeline-fill" style="height:100%; background:${accentColor}; width:0%; transition:width 1s cubic-bezier(0.34, 1.56, 0.64, 1); box-shadow:0 0 8px ${accentColor}80; border-radius:2px;"></div>
          </div>
          
          <!-- Points Row -->
          <div style="display:flex; justify-content:space-between; width:100%;">
            ${pointsHTML}
          </div>
        </div>
      </div>
    `;

    const fill = document.getElementById('salah-timeline-fill');
    if (fill) {
      setTimeout(() => {
        fill.style.width = progressPct + '%';
      }, 50);
    }
  }
};

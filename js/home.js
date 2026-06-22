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

    let greet = 'Good Night';
    if (nowTime >= fajr && nowTime < dhuhr) greet = 'Fajr Mubarak';
    else if (nowTime >= dhuhr && nowTime < asr) greet = 'Blessed Noon';
    else if (nowTime >= asr && nowTime < maghrib) greet = 'Asr Barakah';
    else if (nowTime >= maghrib && nowTime < isha) greet = 'Maghrib Light';
    else if (nowTime >= isha) greet = 'Isha Peace';

    const rawName = (user && typeof user.name === 'string') ? user.name : 'User';
    const nameParts = rawName.trim().split(/\s+/);
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0];
    const safeLastName = Utils.escapeHTML(lastName);

    // Compute SHS once
    this._cachedSHS = typeof Analysis !== 'undefined' ? Analysis.calculateSHS() : 0;

    // --- SALAM BAR (compact) ---
    const el = document.getElementById('home-greeting');
    if (el) {
      const next = Utils.getNextPrayer(times);
      const waqtColors = { fajr:'#38bdf8', dhuhr:'#fbbf24', asr:'#fb923c', maghrib:'#a855f7', isha:'#6366f1' };
      const wc = waqtColors[next.name] || '#10B981';

      // Sync ambient background color to waqt
      const section = document.getElementById('section-home');
      if (section) section.style.setProperty('--waqt-color', wc);
      el.innerHTML = `
        <div class="h-salam">
          <div class="h-salam-accent" style="--waqt-color:${wc}"></div>
          <div class="h-salam-body">
            <div class="h-salam-left">
              <span class="h-salam-badge" style="background:${wc}">
                <span class="h-salam-dot"></span>
                ${window.t ? window.t(greet) : greet}
              </span>
              <div class="h-salam-name">${window.t ? window.t('As-salamu alaykum,') : 'As-salamu alaykum,'} ${safeLastName}</div>
            </div>
            <div class="h-salam-right">
              <div id="live-time-val" class="h-salam-time">--:--</div>
              <div id="live-date-en-val" class="h-salam-date"></div>
              <div id="live-date-hj-val" class="h-salam-date">...</div>
            </div>
          </div>
        </div>
      `;
    }
    this.startLiveDateTime();

    // --- STATS BAR (home-date-bar) ---
    const db = document.getElementById('home-date-bar');
    if (db) {
      const shs = this._cachedSHS;
      const streak = DB.getSalahStreak();
      const today = DB.getSalah(Utils.todayStr());
      const score = Utils.salahScore(today);
      db.innerHTML = `
        <div class="h-stats">
          <div class="h-stat">
            <span class="h-stat-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg></span>
            <span class="h-stat-val">${window.n ? window.n(streak.perfect) : streak.perfect}<span class="h-stat-unit">d</span></span>
            <span class="h-stat-lbl">${window.t ? window.t('Streak') : 'Streak'}</span>
          </div>
          <div class="h-stat">
            <span class="h-stat-icon h-stat-orb" style="background:${shs.rating.color}">${window.n ? window.n(Math.round(shs.total)) : Math.round(shs.total)}</span>
            <span class="h-stat-val">${window.n ? window.n(Math.round(shs.total)) : Math.round(shs.total)}</span>
            <span class="h-stat-lbl">SHS</span>
          </div>
          <div class="h-stat">
            <span class="h-stat-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l-3 4h6l-3-4z"/><path d="M5 22V8l7-4 7 4v14"/><path d="M5 22h14"/><path d="M9 22v-4a3 3 0 0 1 6 0v4"/><path d="M2 22h20"/></svg></span>
            <span class="h-stat-val">${window.n ? window.n(score.done) : score.done}<span class="h-stat-unit">/${window.n ? window.n(5) : 5}</span></span>
            <span class="h-stat-lbl">${window.t ? window.t('Today') : 'Today'}</span>
          </div>
        </div>
      `;
    }

    // --- NEXT PRAYER (compact card) ---
    this.startNextPrayerCountdown();

    // --- TODAY'S SALAH STATUS ---
    this.renderSalahRing();

    // --- WEEKLY PULSE ---
    this.renderWeeklySummary();

    // --- DUA CARD ---
    this.renderDuaCard();

    // --- AI INSIGHT ---
    this.renderAIInsight();

    // Trigger staggered entrance
    document.querySelectorAll('.home-block').forEach((b, i) => {
      b.style.setProperty('--stagger-i', i);
    });
  },



  /* Ihsan level, spiritual pulse, barakah garden, nur particles removed — replaced with bento dashboard */

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
        .ai-insight-icon-wrap {
           transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.5s ease;
        }
        .ai-insight-icon-wrap.pulse {
           transform: scale(1.1) rotate(5deg);
           box-shadow: 0 0 25px rgba(167,139,250,0.6) !important;
        }
      </style>
      <div class="card ai-insight-premium home-reveal revealed home-reveal-delay-3" style="background:linear-gradient(135deg, rgba(167,139,250,0.08) 0%, rgba(192,132,252,0.03) 100%); padding:18px 20px; display:flex; align-items:center; gap:16px; position:relative;">
        <div id="home-insight-icon" class="ai-insight-icon-wrap">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-bg-primary)" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        </div>
        <div style="display:flex; flex-direction:column; gap:3px; flex: 1;">
          <span style="font-size:9px; font-weight:800; text-transform:uppercase; letter-spacing:1.5px; color:var(--color-accent-primary)">${window.t ? window.t('SPIRITUAL INSIGHT') : 'Spiritual Insight'}</span>
          <div style="min-height: 34px; display: flex; align-items: center;">
            <p id="home-insight-text" style="font-size:12px; font-weight:600; margin:0; line-height:1.45; color:var(--color-text-secondary)">${window.t ? window.t(quotes[qIdx]) : quotes[qIdx]}</p>
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
    const tip = perfectDays >= 5 ? 'Exceptional week! You\'re in a spiritual flow.'
      : totalMissed > totalPrayed ? 'Start with one prayer at a time. Consistency over intensity.'
        : totalDhikr > 1000 ? 'Your dhikr is high — keep your tongue moist with remembrance.'
          : totalSunnah < 5 ? 'Add a Sunnah prayer daily for extra light.'
            : 'You\'re doing great. Small steps lead to big transformations.';

    const formattedAvg = window.n ? window.n(avgPrayed) : avgPrayed;
    const formattedPerfect = window.n ? window.n(perfectDays) : perfectDays;
    const formattedDhikrVal = totalDhikr > 999 ? (totalDhikr / 1000).toFixed(1) + 'k' : totalDhikr;
    const formattedDhikr = window.n ? window.n(formattedDhikrVal) : formattedDhikrVal;
    
    const labelAvg = window.t ? window.t('avg') : 'avg';
    const labelPerfect = window.t ? window.t('perfect') : 'perfect';
    const labelDhikr = window.t ? window.t('dhikr') : 'dhikr';

    container.innerHTML = `
      <div class="card home-reveal revealed home-reveal-delay-3" style="background:linear-gradient(135deg, rgba(16,185,129,0.06), rgba(99,102,241,0.03)); padding:18px 20px; position:relative;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div class="ai-insight-icon-wrap">
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
        <div style="margin-top:10px;padding-top:10px;border-top:1.5px solid var(--color-divider-subtle);display:flex;align-items:center;gap:8px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;opacity:0.5;"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>
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
          <div class="home-dua-desc">${active > 0 ? active + ' active' : 'Add your prayers'}</div>
        </div>
        <div class="home-dua-stats">
          <div class="home-dua-stat active">
            <div class="home-dua-stat-val">${active}</div>
            <div class="home-dua-stat-lbl">Active</div>
          </div>
          <div class="home-dua-stat answered">
            <div class="home-dua-stat-val">${answered}</div>
            <div class="home-dua-stat-lbl">Answered</div>
          </div>
        </div>
      </div>
    `;
  },

  /* Barakah garden removed */


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

  /* ---- Next Prayer — Compact Countdown Card ---- */
  startNextPrayerCountdown() {
    const times = Utils.calcPrayerTimes();
    const next = Utils.getNextPrayer(times);
    const el = document.getElementById('home-next-prayer');
    if (!el) return;

    const nextName = typeof next.name === 'string' && next.name ? next.name : 'Prayer';
    const nextLabel = typeof next.label === 'string' && next.label ? next.label : '--:--';

    const waqtColors = {
      fajr: '#38bdf8', dhuhr: '#fbbf24', asr: '#fb923c', maghrib: '#a855f7', isha: '#6366f1'
    };
    const waqtColor = waqtColors[next.name] || '#10B981';

    el.innerHTML = `
      <div class="h-next">
        <div class="h-next-accent" style="background:${waqtColor}"></div>
        <div class="h-next-body">
          <div class="h-next-top">
            <span class="h-next-label">${window.t ? window.t('NEXT PRAYER') : 'Next Prayer'}</span>
            <span id="home-next-time" class="h-next-time">${window.n ? window.n(nextLabel) : nextLabel}</span>
          </div>
          <div id="home-next-name" class="h-next-name" style="--h-next-color:${waqtColor}">${window.t ? window.t(nextName.charAt(0).toUpperCase() + nextName.slice(1)) : nextName.charAt(0).toUpperCase() + nextName.slice(1)}</div>
          <div class="h-next-bar">
            <div id="h-next-fill" class="h-next-fill" style="width:0%"></div>
          </div>
          <div id="home-countdown" class="h-next-cd">--:--:--</div>
        </div>
      </div>
    `;

    this._lastPrayerName = next.name;
    this._waqtPrevName = next.name;
    if (this.countdownRAF) cancelAnimationFrame(this.countdownRAF);

    let lastCountdown = '';
    let lastPct = -1;
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
        const c = waqtColors[n.name] || '#10B981';
        const accent = el.querySelector('.h-next-accent');
        if (accent) accent.style.background = c;
        const pnEl = document.getElementById('home-next-name');
        if (pnEl) { pnEl.textContent = window.t ? window.t(n.name.charAt(0).toUpperCase() + n.name.slice(1)) : n.name.charAt(0).toUpperCase() + n.name.slice(1); pnEl.style.setProperty('--h-next-color', c); }
        const ptEl = document.getElementById('home-next-time');
        if (ptEl) ptEl.textContent = window.n ? window.n(n.label) : n.label;
        // Sync ambient background
        const section = document.getElementById('section-home');
        if (section) section.style.setProperty('--waqt-color', c);
      }

      if (cd !== lastCountdown) {
        lastCountdown = cd;
        const cdEl = document.getElementById('home-countdown');
        if (cdEl) cdEl.textContent = window.n ? window.n(cd) : cd;
      }

      const nowMs = Date.now();
      const nIdx = t.findIndex(p => p.time.getTime() === n.time.getTime());
      const prevTime = nIdx > 0 ? t[nIdx - 1].time.getTime() : (nIdx === 0 ? n.time.getTime() - 86400000 / 5 : n.time.getTime() - 86400000 / 5);
      const totalGap = n.time.getTime() - prevTime;
      if (totalGap > 0 && totalGap < 86400000) {
        const pct = Math.max(0, Math.min(100, ((nowMs - prevTime) / totalGap) * 100));
        if (Math.abs(pct - lastPct) > 0.5) {
          lastPct = pct;
          const fill = document.getElementById('h-next-fill');
          if (fill) fill.style.width = pct + '%';
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

    const times = Utils.calcPrayerTimes();
    const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    const prayerLabels = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const isPerfect = score.done === 5;
    const hasMissed = score.done > 0 && score.done < 5;
    const accentColor = isPerfect ? '#10B981' : '#3B82F6';
    const statusMsg = isPerfect ? "Beautiful! You've prayed all 5." : hasMissed ? "Keep striving. Every prayer counts." : "Your daily spiritual journey.";

    const prayerDots = prayers.map((p, i) => {
      const st = today[p];
      const isDone = st === 'jamaat' || st === 'alone' || st === 'qaza';
      const isMiss = st === 'missed';
      let cls = 'h-prayer-dot-empty';
      if (isDone) cls = 'h-prayer-dot-done';
      if (isMiss) cls = 'h-prayer-dot-missed';
      const pt = times[i] ? times[i].label : '--:--';
      return `
        <div class="h-prayer-item">
          <div class="h-prayer-dot ${cls}"></div>
          <span class="h-prayer-lbl">${window.t ? window.t(prayerLabels[i]) : prayerLabels[i]}</span>
          <span class="h-prayer-time">${window.n ? window.n(pt) : pt}</span>
        </div>
      `;
    }).join('');

    el.innerHTML = `
      <div class="h-salah-card">
        <div class="h-salah-header">
          <span class="h-salah-title">${window.t ? window.t("Today's Salah") : "Today's Salah"}</span>
          <span class="h-salah-badge" style="--h-salah-color:${accentColor}">${window.n ? window.n(score.done) : score.done}/${window.n ? window.n(5) : 5}</span>
        </div>
        <div class="h-salah-dots">
          ${prayerDots}
        </div>
        <div class="h-salah-footer">${window.t ? window.t(statusMsg) : statusMsg}</div>
      </div>
    `;
  }
};

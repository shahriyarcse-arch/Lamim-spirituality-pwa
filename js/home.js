const Home = {
  countdownRAF: null,
  dateTimeRAF: null,
  insightInterval: null,
  insightTimeout: null,
  _cachedSHS: null,
  _lastPrayerName: null,

  _ranks: [
    { min: 0,  label: 'Ghafil' },
    { min: 15, label: 'Musafir' },
    { min: 30, label: 'Murid' },
    { min: 50, label: 'Mujahid' },
    { min: 65, label: 'Mukhlis' },
    { min: 80, label: 'Muttaqi' },
    { min: 90, label: 'Muhsin' },
    { min: 101, label: 'Wali' }
  ],

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

    this._cachedSHS = typeof Analysis !== 'undefined' ? Analysis.calculateSHS() : { total: 0, rating: { color: '#a78bfa' } };

    // 1. Greeting (name + waqt label + clock + dates)
    const greetEl = document.getElementById('home-greeting');
    if (greetEl) {
      greetEl.innerHTML = `
        <div class="hm-greeting">
          <div class="hm-waqt-label">${window.t ? window.t(greet.toUpperCase()) : greet.toUpperCase()}</div>
          <div class="hm-greeting-name">${window.t ? window.t('As-salamu alaykum,') : 'As-salamu alaykum,'} <span class="hm-name-highlight">${safeLastName}</span><span class="hm-sparkle"> ✨</span></div>
          <div class="hm-clock-row">
            <div id="hm-clock-val" class="hm-clock">--:--:--</div>
            <div class="hm-date-col">
              <span id="hm-date-en" class="hm-date-en"></span>
              <span id="hm-date-hj" class="hm-date-hj"></span>
            </div>
          </div>
        </div>
      `;
    }

    // 2. Spiritual Score Hero (perfect pill + SHS circle + wave)
    const heroEl = document.getElementById('home-date-bar');
    if (heroEl) {
      const shs = this._cachedSHS;
      const streak = DB.getSalahStreak();
      heroEl.innerHTML = `
        <div class="hm-score-hero">
          <div class="hm-perfect-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--hm-gold)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            <span>${window.t ? window.t('Od Perfect') : 'Od Perfect'}</span>
          </div>
          <div class="hm-shs-circle">
            <span class="hm-shs-value">${window.n ? window.n(Math.round(shs.total)) : Math.round(shs.total)}</span>
            <span class="hm-shs-label">SHS</span>
          </div>
          <div class="hm-wave-wrap">
            <svg width="72" height="30" viewBox="0 0 90 30" fill="none" stroke="var(--hm-blush)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.7">
              <path d="M2,18 L14,18 L20,18 L23,4 L26,26 L29,18 L40,18 L46,18 L50,18 L53,12 L56,22 L59,18 L70,18 L76,18 L80,18 L83,10 L86,20 L88,18">
                <animate attributeName="d" dur="2.5s" repeatCount="indefinite"
                  values="M2,18 L14,18 L20,18 L23,4 L26,26 L29,18 L40,18 L46,18 L50,18 L53,12 L56,22 L59,18 L70,18 L76,18 L80,18 L83,10 L86,20 L88,18;M2,18 L14,18 L20,18 L23,8 L26,24 L29,18 L40,18 L46,18 L50,18 L53,14 L56,20 L59,18 L70,18 L76,18 L80,18 L83,12 L86,18 L88,18;M2,18 L14,18 L20,18 L23,4 L26,26 L29,18 L40,18 L46,18 L50,18 L53,12 L56,22 L59,18 L70,18 L76,18 L80,18 L83,10 L86,20 L88,18"/>
              </path>
            </svg>
          </div>
        </div>
      `;
    }

    // Kick off live clock + next prayer countdown + salah ring + insight
    this.startLiveDateTime();
    this.startNextPrayerCountdown();
    this.renderSalahRing();
    this.renderAIInsight();
  },

  /* ---- Live Clock & Dates ---- */
  startLiveDateTime() {
    if (this.dateTimeRAF) cancelAnimationFrame(this.dateTimeRAF);

    const clockEl = document.getElementById('hm-clock-val');
    const enEl = document.getElementById('hm-date-en');
    const hjEl = document.getElementById('hm-date-hj');
    if (!clockEl) return;

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
        const locale = (typeof App !== 'undefined' && App.lang === 'bn') ? 'bn-BD' : 'en-US';
        clockEl.textContent = now.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        if (enEl) enEl.textContent = now.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
        if (hjEl) hjEl.textContent = Utils.toHijri(now);
      }
      this.dateTimeRAF = requestAnimationFrame(tick);
    };
    this.dateTimeRAF = requestAnimationFrame(tick);
  },

  /* ---- Next Prayer Countdown ---- */
  startNextPrayerCountdown() {
    const times = Utils.calcPrayerTimes();
    const next = Utils.getNextPrayer(times);
    const el = document.getElementById('home-next-prayer');
    if (!el) return;

    const nextName = typeof next.name === 'string' && next.name ? next.name : 'Prayer';

    el.innerHTML = `
      <div class="hm-next-card">
        <div class="hm-next-label">${window.t ? window.t('NEXT PRAYER') : 'NEXT PRAYER'}</div>
        <div class="hm-next-row">
          <span id="hm-next-name" class="hm-next-name">${window.t ? window.t(nextName.charAt(0).toUpperCase() + nextName.slice(1)) : nextName.charAt(0).toUpperCase() + nextName.slice(1)}</span>
          <div class="hm-next-cd">
            <span id="hm-next-cd-val" class="hm-next-cd-value">--:--:--</span>
            <span class="hm-next-cd-label">${window.t ? window.t('Remaining') : 'Remaining'}</span>
          </div>
        </div>
      </div>
    `;

    this._lastPrayerName = next.name;
    if (this.countdownRAF) cancelAnimationFrame(this.countdownRAF);

    let lastCountdown = '';
    const tick = () => {
      if (!document.getElementById('section-home')?.classList.contains('active')) {
        this.countdownRAF = null;
        return;
      }
      const t = Utils.calcPrayerTimes();
      const n = Utils.getNextPrayer(t);
      const cd = Utils.countdownTo(n.time);

      if (n.name !== this._lastPrayerName) {
        this._lastPrayerName = n.name;
        const nameEl = document.getElementById('hm-next-name');
        if (nameEl) nameEl.textContent = n.name.charAt(0).toUpperCase() + n.name.slice(1);
      }

      if (cd !== lastCountdown) {
        lastCountdown = cd;
        const cdEl = document.getElementById('hm-next-cd-val');
        if (cdEl) cdEl.textContent = cd;
      }
      this.countdownRAF = requestAnimationFrame(tick);
    };
    this.countdownRAF = requestAnimationFrame(tick);
  },

  /* ---- Salah Ring + Rank Progression ---- */
  renderSalahRing() {
    const el = document.getElementById('home-salah-ring');
    if (!el) return;

    const today = DB.getSalah(Utils.todayStr());
    const score = Utils.salahScore(today);
    const pct = (score.done / 5) * 100;
    const circumference = 2 * Math.PI * 32;
    const offset = circumference - (pct / 100) * circumference;
    const accent = score.done === 5 ? '#34d399' : score.done >= 3 ? '#fbbf24' : '#a78bfa';

    // Rank calculation
    const shs = this._cachedSHS || (typeof Analysis !== 'undefined' ? Analysis.calculateSHS() : { total: 0, rating: { color: '#a78bfa' } });
    let curIdx = this._ranks.findIndex(r => shs.total < r.min) - 1;
    if (curIdx < 0) curIdx = 0;
    const current = this._ranks[curIdx];
    const nextRank = this._ranks[curIdx + 1] || current;
    const diff = nextRank.min - current.min;
    const rankProg = diff > 0 ? Math.min(100, Math.max(0, ((shs.total - current.min) / diff) * 100)) : 100;

    el.innerHTML = `
      <div class="hm-salah-card">
        <div class="hm-salah-top">
          <div class="hm-salah-ring-wrap">
            <div class="ring-chart" style="width:80px;height:80px">
              <svg width="80" height="80" viewBox="0 0 80 80">
                <defs>
                  <linearGradient id="hmSalahGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="${accent}" />
                    <stop offset="100%" stop-color="var(--hm-lavender)" />
                  </linearGradient>
                </defs>
                <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(0,0,0,0.06)" stroke-width="6"/>
                <circle id="hm-ring-fill" cx="40" cy="40" r="32" fill="none" stroke="url(#hmSalahGrad)" stroke-width="6" stroke-linecap="round"
                  stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" style="transition:stroke-dashoffset 1s ease"/>
              </svg>
              <div class="ring-chart-label">
                <div style="font-size:18px;font-weight:950;line-height:1;color:${accent}">${window.n ? window.n(score.done) : score.done}</div>
                <div style="font-size:7px;font-weight:800;color:var(--hm-gray);text-transform:uppercase;letter-spacing:0.5px;margin-top:1px">of 5</div>
              </div>
            </div>
          </div>
          <div class="hm-salah-info">
            <div class="hm-salah-title">${window.t ? window.t("Today's Salah") : "Today's Salah"}</div>
            <div class="hm-salah-sub">${window.n ? window.n(score.done) : score.done}/5 ${window.t ? window.t('prayers completed') : 'prayers completed'}</div>
            <div class="hm-salah-bar-track">
              <div class="hm-salah-bar-fill" style="width:${pct}%"></div>
            </div>
          </div>
        </div>
        <div class="hm-rank-section">
          <div class="hm-rank-header">
            <div class="hm-rank-current">
              <span class="hm-rank-label">${window.t ? window.t('Current Rank') : 'Current Rank'}</span>
              <span class="hm-rank-name">${window.t ? window.t(current.label) : current.label}</span>
            </div>
            <div class="hm-rank-next">
              <span class="hm-rank-next-label">${window.t ? window.t('Next') : 'Next'}: ${window.t ? window.t(nextRank.label) : nextRank.label}</span>
              <span class="hm-rank-next-name">${window.n ? window.n(Math.round(rankProg)) : Math.round(rankProg)}%</span>
            </div>
          </div>
          <div class="hm-rank-track">
            <div class="hm-rank-fill" style="width:${rankProg}%">
              <div class="hm-rank-dot"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  /* ---- Spiritual Insight ---- */
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
      <div class="hm-insight-card">
        <div class="hm-insight-icon">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        </div>
        <div class="hm-insight-body">
          <div class="hm-insight-label">${window.t ? window.t('SPIRITUAL INSIGHT') : 'SPIRITUAL INSIGHT'}</div>
          <p id="hm-insight-quote">${window.t ? window.t(quotes[qIdx]) : quotes[qIdx]}</p>
        </div>
      </div>
    `;

    if (this.insightInterval) clearInterval(this.insightInterval);
    if (this.insightTimeout) clearTimeout(this.insightTimeout);

    this.insightInterval = setInterval(() => {
      if (!document.getElementById('section-home')?.classList.contains('active')) {
        clearInterval(this.insightInterval);
        this.insightInterval = null;
        if (this.insightTimeout) { clearTimeout(this.insightTimeout); this.insightTimeout = null; }
        return;
      }
      const textEl = document.getElementById('hm-insight-quote');
      if (!textEl) return;
      textEl.classList.add('fade-out');
      this.insightTimeout = setTimeout(() => {
        let newIdx = Math.floor(Math.random() * quotes.length);
        while (newIdx === qIdx && quotes.length > 1) newIdx = Math.floor(Math.random() * quotes.length);
        qIdx = newIdx;
        textEl.classList.remove('fade-out');
        textEl.classList.add('fade-in-prep');
        textEl.textContent = quotes[qIdx];
        void textEl.offsetWidth;
        textEl.classList.remove('fade-in-prep');
        this.insightTimeout = null;
      }, 500);
    }, 10000);
  }
};

/* =============================================
   LAMIM — YEAR IN REVIEW
   Annual Spiritual Report
   ============================================= */

const YearReview = {
  year: new Date().getFullYear(),
  _habitsCache: null,

  init() {
    this._habitsCache = DB.get('lamim_mujahid_habits') || [];
    this.render();
  },

  calcYear(year) {
    const now = Utils.getOffsetDate();
    const isCurrentYear = year === now.getFullYear();
    const lastDay = isCurrentYear ? now : new Date(year, 11, 31);
    const firstDay = new Date(year, 0, 1);

    if (lastDay < firstDay) return null;

    let totalPrayers = 0;
    let totalPossible = 0;
    let perfectDays = 0;
    let allFiveDays = 0;
    let totalDhikr = 0;
    let tahajjudNights = 0;
    let trackedDays = 0;
    let sumSHS = 0;
    let shsCount = 0;
    let maxSHS = 0;
    let minSHS = 100;
    let daysIn = 0;

    const ratingCounts = { muhsin: 0, muttaqi: 0, mukhlis: 0, mujahid: 0, murid: 0, musafir: 0, ghafil: 0 };

    const months = [];
    for (let m = 0; m < 12; m++) {
      months.push({
        month: m,
        label: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m],
        daysTracked: 0,
        sumSHS: 0,
        countSHS: 0,
        perfectDays: 0,
        totalDhikr: 0,
        tahajjud: 0
      });
    }

    const iterDate = new Date(firstDay);
    while (iterDate <= lastDay) {
      const ds = Utils.dateStr(iterDate);
      daysIn++;

      const salahData = DB.get('lamim_salah_' + ds);
      const dhikrData = DB.get('lamim_dhikr_' + ds);

      const hasSalah = salahData && Object.values(salahData).some(v => v !== null && v !== false);
      const hasDhikr = dhikrData && Object.keys(dhikrData).length > 0;

      if (!salahData && !dhikrData) {
        iterDate.setDate(iterDate.getDate() + 1);
        continue;
      }

      trackedDays++;
      const monthIdx = iterDate.getMonth();

      if (salahData) {
        const prayers = ['fajr','dhuhr','asr','maghrib','isha'];
        let done = 0;
        let perfect = true;
        prayers.forEach(p => {
          const s = salahData[p];
          totalPossible++;
          if (s && s !== 'missed') {
            done++;
            totalPrayers++;
            if (s === 'qaza') perfect = false;
          } else {
            perfect = false;
          }
        });
        if (done === 5) allFiveDays++;
        if (perfect && done === 5) {
          perfectDays++;
          months[monthIdx].perfectDays++;
        }
        if (salahData.tahajjud) {
          tahajjudNights++;
          months[monthIdx].tahajjud++;
        }
      }

      if (dhikrData) {
        const dayDhikr = Object.values(dhikrData).reduce((a, b) => {
          const n = parseInt(b, 10);
          return a + (isNaN(n) ? 0 : Math.max(0, n));
        }, 0);
        totalDhikr += dayDhikr;
        months[monthIdx].totalDhikr += dayDhikr;
      }

      if (salahData || dhikrData) {
        const shs = Analysis.calculateSHS(ds);
        sumSHS += shs.total;
        shsCount++;
        months[monthIdx].sumSHS += shs.total;
        months[monthIdx].countSHS++;
        months[monthIdx].daysTracked++;
        if (shs.total > maxSHS) maxSHS = shs.total;
        if (shs.total < minSHS) minSHS = shs.total;

        const ratingKey = shs.rating.label.toLowerCase();
        if (ratingCounts.hasOwnProperty(ratingKey)) ratingCounts[ratingKey]++;
      }

      iterDate.setDate(iterDate.getDate() + 1);
    }

    const avgSHS = shsCount > 0 ? parseFloat((sumSHS / shsCount).toFixed(1)) : 0;

    const monthsProcessed = months.map(m => ({
      ...m,
      avgSHS: m.countSHS > 0 ? parseFloat((m.sumSHS / m.countSHS).toFixed(1)) : 0
    }));

    let bestMonth = monthsProcessed.reduce((best, m) => m.avgSHS > best.avgSHS ? m : best, monthsProcessed[0]);
    let worstMonth = monthsProcessed.reduce((worst, m) => m.avgSHS < worst.avgSHS && m.daysTracked > 0 ? m : worst, monthsProcessed[0]);

    const streak = DB.getSalahStreak();

    const habits = this._habitsCache;
    let totalHabitDays = 0;
    let cleanHabitDays = 0;
    if (habits.length > 0) {
      habits.forEach(h => {
        (h.history || []).forEach(entry => {
          const entryYear = parseInt(entry.date, 10);
          if (entryYear === year) {
            totalHabitDays++;
            if (entry.clean) cleanHabitDays++;
          }
        });
      });
    }
    const habitCleanRate = totalHabitDays > 0 ? Math.round((cleanHabitDays / totalHabitDays) * 100) : null;

    const user = DB.getUser();
    const spiritScore = user?.spirit_score || 0;
    const spiritLevel = user?.spirit_level || 1;

    // Check if user was created this year
    let spiritStart = null;
    const createdAt = user?.createdAt;
    if (createdAt) {
      const createdYear = new Date(createdAt).getFullYear();
      if (createdYear <= year) {
        spiritStart = 0;
      }
    }

    return {
      year,
      totalDays: daysIn,
      trackedDays,
      totalPrayers,
      totalPossible,
      perfectDays,
      allFiveDays,
      totalDhikr,
      tahajjudNights,
      avgSHS,
      maxSHS: maxSHS || 0,
      minSHS: minSHS === 100 && trackedDays === 0 ? 0 : minSHS,
      bestMonth: bestMonth.daysTracked > 0 ? bestMonth : null,
      worstMonth: worstMonth.daysTracked > 0 ? worstMonth : null,
      months: monthsProcessed,
      ratingCounts,
      longestStreak: streak.perfect,
      consistencyStreak: streak.consistency,
      habitCleanRate,
      spiritScore,
      spiritLevel,
      spiritStart
    };
  },

  render() {
    const container = document.getElementById('year-review-content');
    if (!container) return;

    const data = this.calcYear(this.year);
    if (!data || data.trackedDays === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:60px 20px;opacity:0.6">
          <div style="font-size:3rem;margin-bottom:16px">📊</div>
          <div style="font-size:1.1rem;font-weight:700;margin-bottom:8px">No data for ${this.year}</div>
          <div style="font-size:0.85rem">Start tracking your spiritual journey and come back at year's end.</div>
        </div>
      `;
      return;
    }

    const totalPossiblePrayers = data.totalPossible || data.trackedDays * 5;
    const prayerRate = totalPossiblePrayers > 0 ? Math.round((data.totalPrayers / totalPossiblePrayers) * 100) : 0;
    const perfectRate = data.trackedDays > 0 ? Math.round((data.perfectDays / data.trackedDays) * 100) : 0;
    const avgSHS = data.avgSHS;
    const rating = Analysis.getRating(avgSHS);
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    const bestMonthLabel = data.bestMonth ? monthNames[data.bestMonth.month] + ' (' + data.bestMonth.avgSHS + ')' : '—';
    const worstMonthLabel = data.worstMonth ? monthNames[data.worstMonth.month] + ' (' + data.worstMonth.avgSHS + ')' : '—';

    const ratingEntries = [
      { key: 'muhsin', label: 'Muhsin', color: '#fbbf24', pct: 0 },
      { key: 'muttaqi', label: 'Muttaqi', color: '#a78bfa', pct: 0 },
      { key: 'mukhlis', label: 'Mukhlis', color: '#10b981', pct: 0 },
      { key: 'mujahid', label: 'Mujahid', color: '#38bdf8', pct: 0 },
      { key: 'murid', label: 'Murid', color: '#f59e0b', pct: 0 },
      { key: 'musafir', label: 'Musafir', color: '#f87171', pct: 0 },
      { key: 'ghafil', label: 'Ghafil', color: '#ef4444', pct: 0 }
    ];

    const maxRating = Math.max(1, ...ratingEntries.map(r => data.ratingCounts[r.key] || 0));
    ratingEntries.forEach(r => {
      r.count = data.ratingCounts[r.key] || 0;
      r.pct = Math.round((r.count / data.trackedDays) * 100);
    });

    const monthBars = data.months.filter(m => m.daysTracked > 0);

    container.innerHTML = `
      <div class="yr-nav">
        <button class="yr-nav-btn" onclick="YearReview.changeYear(-1)" id="yr-prev-btn" aria-label="Previous year">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <span class="yr-nav-year" id="yr-year-label">${this.year}</span>
        <button class="yr-nav-btn" onclick="YearReview.changeYear(1)" id="yr-next-btn" aria-label="Next year">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>

      <div class="yr-hero yr-anim yr-anim-d1">
        <div class="yr-hero-year">Year ${data.year === new Date().getFullYear() ? 'So Far' : 'In Review'}</div>
        <div class="yr-hero-score" style="color:${rating.color}">${Math.round(avgSHS)}</div>
        <div class="yr-hero-label">Average Spiritual Health Score</div>
        <div class="yr-hero-rating" style="background:${rating.color}20;color:${rating.color};border:1px solid ${rating.color}40">${rating.label}</div>
        <div style="font-size:0.75rem;opacity:0.5;margin-top:var(--space-3);font-weight:600">${data.trackedDays} days tracked</div>
      </div>

      <div class="yr-stats-grid yr-anim yr-anim-d2">
        <div class="yr-stat-card">
          <div class="yr-stat-icon" style="background:rgba(52,211,153,0.15);color:#34d399">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c-4 0-7 4-7 9v11h14V11c0-5-3-9-7-9z"/><path d="M9 22v-5a3 3 0 0 1 6 0v5"/></svg>
          </div>
          <div class="yr-stat-value" style="color:#34d399">${prayerRate}%</div>
          <div class="yr-stat-label">Salah Rate</div>
          <div class="yr-stat-sub" style="color:#34d399">${data.totalPrayers}/${totalPossiblePrayers}</div>
        </div>
        <div class="yr-stat-card">
          <div class="yr-stat-icon" style="background:rgba(251,191,36,0.15);color:#fbbf24">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div class="yr-stat-value" style="color:#fbbf24">${data.perfectDays}</div>
          <div class="yr-stat-label">Perfect Days</div>
          <div class="yr-stat-sub" style="color:#fbbf24">${perfectRate}% of tracked</div>
        </div>
        <div class="yr-stat-card">
          <div class="yr-stat-icon" style="background:rgba(56,189,248,0.15);color:#38bdf8">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M6.34 17.66l-1.41 1.41"/><path d="M19.07 4.93l-1.41 1.41"/></svg>
          </div>
          <div class="yr-stat-value" style="color:#38bdf8">${YearReview._fmtNum(data.totalDhikr)}</div>
          <div class="yr-stat-label">Total Dhikr</div>
        </div>
        <div class="yr-stat-card">
          <div class="yr-stat-icon" style="background:rgba(168,85,247,0.15);color:#a855f7">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div class="yr-stat-value" style="color:#a855f7">${data.longestStreak}</div>
          <div class="yr-stat-label">Best Streak</div>
          <div class="yr-stat-sub" style="color:#a855f7">${data.longestStreak === 1 ? 'day' : 'days'} perfect</div>
        </div>
        <div class="yr-stat-card">
          <div class="yr-stat-icon" style="background:rgba(16,185,129,0.15);color:#10b981">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div class="yr-stat-value" style="color:#10b981">${data.tahajjudNights}</div>
          <div class="yr-stat-label">Tahajjud Nights</div>
        </div>
        <div class="yr-stat-card">
          <div class="yr-stat-icon" style="background:rgba(251,191,36,0.15);color:#fbbf24">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
          </div>
          <div class="yr-stat-value" style="color:#fbbf24;font-size:1rem">${bestMonthLabel}</div>
          <div class="yr-stat-label">Best Month</div>
        </div>
      </div>

      ${monthBars.length > 0 ? `
      <div class="yr-month-chart yr-anim yr-anim-d3">
        <div class="yr-section-title">Monthly Average SHS</div>
        ${monthBars.map(m => {
          const pct = m.avgSHS || 0;
          const barColor = Analysis.getRating(pct).color;
          return `
            <div class="yr-month-row">
              <span class="yr-month-label">${m.label}</span>
              <div class="yr-month-bar-track">
                <div class="yr-month-bar-fill" style="width:${pct}%;background:${barColor};animation:yr-bar-grow 1s ease forwards;"></div>
              </div>
              <span class="yr-month-bar-score" style="color:${barColor}">${Math.round(pct)}</span>
            </div>
          `;
        }).join('')}
      </div>
      ` : ''}

      <div class="yr-rating-list yr-anim yr-anim-d4">
        <div class="yr-section-title">Days by Rating</div>
        ${ratingEntries.filter(r => r.count > 0).map(r => {
          const barPct = Math.max(2, (r.count / data.trackedDays) * 100);
          return `
            <div class="yr-rating-item">
              <div class="yr-rating-dot" style="background:${r.color}"></div>
              <span class="yr-rating-label" style="color:${r.color}">${r.label}</span>
              <div class="yr-rating-bar-track">
                <div class="yr-rating-bar-fill" style="width:${barPct}%;background:${r.color};animation:yr-bar-grow 1.2s ease forwards;"></div>
              </div>
              <span class="yr-rating-count">${r.count}</span>
            </div>
          `;
        }).join('')}
        ${ratingEntries.filter(r => r.count > 0).length === 0 ? '<div style="text-align:center;opacity:0.5;padding:var(--space-4);font-size:0.85rem">No SHS ratings recorded yet</div>' : ''}
      </div>

      <div style="height:60px"></div>
    `;

    // Disable next year if it's the current year or future
    const now = new Date();
    const nextBtn = document.getElementById('yr-next-btn');
    if (nextBtn && this.year >= now.getFullYear()) {
      nextBtn.disabled = true;
      nextBtn.style.opacity = '0.3';
    }
  },

  changeYear(delta) {
    this.year += delta;
    const now = new Date().getFullYear();
    if (this.year > now) this.year = now;
    if (this.year < 2020) this.year = 2020;
    this.render();
  },

  _fmtNum(n) {
    if (!n) return '0';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toLocaleString();
  }
};

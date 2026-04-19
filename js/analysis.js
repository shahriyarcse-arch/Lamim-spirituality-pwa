/* =============================================
   LAMIM — ANALYSIS MODULE (Canvas Charts)
   ============================================= */
const Analysis = {
  currentTab: 'daily',

  init() {
    this.renderTab('daily');
    this.renderAchievements();
    this.renderSummaryStats();
  },

  renderTab(tab) {
    this.currentTab = tab;
    document.querySelectorAll('.analysis-tab-content').forEach(el => el.classList.remove('active'));
    const el = document.getElementById('analysis-' + tab);
    if (el) el.classList.add('active');
    if (tab === 'daily')   this.renderDailyChart();
    if (tab === 'weekly')  this.renderWeeklyChart();
    if (tab === 'monthly') this.renderMonthlyChart();
    if (tab === 'dhikr')   this.renderDhikrChart();
  },

  renderSummaryStats() {
    const history = DB.getSalahHistory(30);
    let totalDone = 0, streaks = DB.getSalahStreak();
    history.forEach(({ data }) => { totalDone += Utils.salahScore(data).done; });
    const avg = Math.round(totalDone / 30 * 10) / 10;
    const el = document.getElementById('analysis-summary');
    if (!el) return;
    el.innerHTML = `
      <div class="stat-box"><div class="stat-box-val">${streaks.consistency}</div><div class="stat-box-label">Current Streak 🌱</div></div>
      <div class="stat-box"><div class="stat-box-val">${avg}</div><div class="stat-box-label">Avg Prayers/Day</div></div>
      <div class="stat-box"><div class="stat-box-val">${Math.round((totalDone/150)*100)}%</div><div class="stat-box-label">30-Day Rate</div></div>
      <div class="stat-box"><div class="stat-box-val">${totalDone}</div><div class="stat-box-label">Total Prayers</div></div>
    `;
  },

  drawBarChart(canvasId, labels, data, color = '#58a6ff') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.offsetWidth; const H = 220;
    canvas.width = W; canvas.height = H;
    ctx.clearRect(0, 0, W, H);
    const max   = Math.max(...data, 5);
    const barW  = Math.max(8, (W - 60) / data.length - 6);
    const padL  = 40; const padB = 40; const padT = 20;
    const chartH = H - padB - padT;
    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padT + (chartH / 5) * i;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - 10, y); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '10px Inter'; ctx.textAlign = 'right';
      ctx.fillText(Math.round(max - (max / 5) * i), padL - 4, y + 4);
    }
    // Bars
    data.forEach((val, i) => {
      const x  = padL + i * ((W - padL - 10) / data.length) + 3;
      const bh = (val / max) * chartH;
      const y  = padT + chartH - bh;
      const grad = ctx.createLinearGradient(0, y, 0, y + bh);
      grad.addColorStop(0, color); grad.addColorStop(1, color + '44');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(x, y, barW, bh, [4, 4, 0, 0]) : ctx.rect(x, y, barW, bh);
      ctx.fill();
      // Label
      if (labels[i]) {
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '9px Inter'; ctx.textAlign = 'center';
        ctx.fillText(labels[i], x + barW / 2, H - 8);
      }
    });
  },

  drawLineChart(canvasId, labels, datasets) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.offsetWidth; const H = 220;
    canvas.width = W; canvas.height = H;
    ctx.clearRect(0, 0, W, H);
    const allVals = datasets.flatMap(d => d.data);
    const max = Math.max(...allVals, 5);
    const padL = 40; const padB = 40; const padT = 20;
    const chartH = H - padB - padT;
    const n = datasets[0]?.data.length || 1;
    const stepX = (W - padL - 10) / (n - 1 || 1);
    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padT + (chartH / 5) * i;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - 10, y); ctx.stroke();
    }
    // Lines
    datasets.forEach(ds => {
      ctx.strokeStyle = ds.color; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
      ctx.beginPath();
      ds.data.forEach((val, i) => {
        const x = padL + i * stepX;
        const y = padT + chartH - (val / max) * chartH;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();
      // Dots
      ds.data.forEach((val, i) => {
        const x = padL + i * stepX;
        const y = padT + chartH - (val / max) * chartH;
        ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = ds.color; ctx.fill();
      });
    });
    // Labels
    if (labels) {
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '9px Inter'; ctx.textAlign = 'center';
      labels.forEach((l, i) => {
        ctx.fillText(l, padL + i * stepX, H - 8);
      });
    }
  },

  drawDonutChart(canvasId, segments) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = Math.min(canvas.offsetWidth, 200);
    canvas.width = size; canvas.height = size;
    const cx = size / 2, cy = size / 2, r = size * 0.38, inner = r * 0.6;
    const total = segments.reduce((a, s) => a + s.value, 0) || 1;
    let angle = -Math.PI / 2;
    ctx.clearRect(0, 0, size, size);
    segments.forEach(s => {
      const sweep = (s.value / total) * Math.PI * 2;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, angle, angle + sweep);
      ctx.closePath(); ctx.fillStyle = s.color; ctx.fill();
      angle += sweep;
    });
    ctx.beginPath(); ctx.arc(cx, cy, inner, 0, Math.PI * 2);
    ctx.fillStyle = 'var(--color-bg-secondary)'; ctx.fill();
  },

  renderDailyChart() {
    const history = DB.getSalahHistory(7);
    const labels = history.map(h => Utils.getDayName(h.date));
    const data   = history.map(h => Utils.salahScore(h.data).done);
    this.drawBarChart('chart-daily', labels, data, '#58a6ff');
    // Breakdown donut
    const today = DB.getSalah(Utils.todayStr());
    const prayers = ['fajr','dhuhr','asr','maghrib','isha'];
    const counts  = { jamaat:0, alone:0, qaza:0, missed:0 };
    prayers.forEach(p => { if (today[p]) counts[today[p]]++; });
    const segments = [
      { value: counts.jamaat, color: 'var(--color-jamaat)'  },
      { value: counts.alone,  color: 'var(--color-alone)'   },
      { value: counts.qaza,   color: 'var(--color-qaza)'    },
      { value: counts.missed + (5 - prayers.filter(p => today[p]).length), color: 'var(--color-missed)' },
    ];
    this.drawDonutChart('chart-donut', segments);
    const legend = document.getElementById('donut-legend');
    if (legend) legend.innerHTML = [
      { label:"Jama'at", color:'var(--color-jamaat)', val: counts.jamaat },
      { label:'Alone',   color:'var(--color-alone)',  val: counts.alone  },
      { label:'Qaza',    color:'var(--color-qaza)',   val: counts.qaza   },
      { label:'Missed',  color:'var(--color-missed)', val: counts.missed },
    ].map(item => `
      <div style="display:flex;align-items:center;gap:6px;font-size:var(--text-sm)">
        <span style="width:10px;height:10px;border-radius:50%;background:${item.color};flex-shrink:0"></span>
        <span style="color:var(--color-text-secondary)">${item.label}</span>
        <span style="font-weight:600;margin-left:auto">${item.val}</span>
      </div>
    `).join('');
  },

  renderWeeklyChart() {
    const history = DB.getSalahHistory(28);
    const weeks = [];
    for (let w = 0; w < 4; w++) {
      const slice = history.slice(w * 7, w * 7 + 7);
      const score = slice.reduce((a, h) => a + Utils.salahScore(h.data).done, 0);
      weeks.push({ label: `W${4 - w}`, score });
    }
    weeks.reverse();
    this.drawBarChart('chart-weekly', weeks.map(w => w.label), weeks.map(w => w.score), '#d4a843');
  },

  renderMonthlyChart() {
    const history = DB.getSalahHistory(30);
    const labels = history.filter((_, i) => i % 3 === 0).map(h => h.date.slice(5));
    const data   = [];
    for (let i = 0; i < history.length; i += 3) {
      const slice = history.slice(i, i + 3);
      data.push(Math.round(slice.reduce((a, h) => a + Utils.salahScore(h.data).pct, 0) / slice.length));
    }
    this.drawLineChart('chart-monthly', labels, [{ data, color: '#3fb950' }]);
  },

  renderDhikrChart() {
    const history = DB.getDhikrHistory(7);
    const labels  = history.map(h => Utils.getDayName(h.date));
    const data    = history.map(h => h.total);
    this.drawBarChart('chart-dhikr', labels, data, '#bc8cff');
  },

  renderAchievements() {
    const streak   = DB.getSalahStreak();
    const history  = DB.getSalahHistory(30);
    const total    = history.reduce((a, h) => a + Utils.salahScore(h.data).done, 0);
    const allAch = [
      { id:'first-prayer',  icon:'🕌', name:'First Prayer',    desc:'Log your first prayer',    earned: total >= 1 },
      { id:'streak-3',      icon:'🔥', name:'3-Day Streak',    desc:'3 consecutive perfect days',  earned: streak.perfect >= 3 },
      { id:'streak-7',      icon:'⚡', name:'Week Warrior',    desc:'7 perfect days',              earned: streak.perfect >= 7 },
      { id:'streak-30',     icon:'🏆', name:'Monthly Master',  desc:'30 perfect days',             earned: streak.perfect >= 30 },
      { id:'50-prayers',    icon:'💎', name:'Devoted',         desc:'50 prayers logged',         earned: total >= 50 },
      { id:'100-prayers',   icon:'👑', name:'Dedicated',       desc:'100 prayers logged',        earned: total >= 100 },
      { id:'jamaat-10',     icon:'🤝', name:'Community Spirit',desc:'10 Jama\'at prayers',       earned: false },
      { id:'dhikr-1000',    icon:'📿', name:'Dhikr Master',    desc:'1000 total dhikr',          earned: false },
      { id:'goal-complete', icon:'🎯', name:'Goal Getter',     desc:'Complete your first goal',  earned: DB.getGoals().some(g => g.completed) },
      { id:'full-day',      icon:'✨', name:'Perfect Day',     desc:'All 5 prayers in one day',  earned: history.some(h => Utils.salahScore(h.data).done === 5) },
    ];
    const el = document.getElementById('achievements-grid');
    if (!el) return;
    el.innerHTML = allAch.map(a => `
      <div class="achievement-card ${a.earned ? '' : 'locked'}" title="${a.desc}">
        <div class="achievement-icon">${a.icon}</div>
        <div class="achievement-name">${a.name}</div>
        ${a.earned ? '<div style="font-size:10px;color:var(--color-accent-green);margin-top:2px">Earned ✓</div>' : '<div style="font-size:10px;color:var(--color-text-muted);margin-top:2px">Locked</div>'}
      </div>
    `).join('');
  }
};

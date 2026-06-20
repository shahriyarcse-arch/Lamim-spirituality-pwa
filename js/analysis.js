/* =============================================
   LAMIM — ANALYSIS MODULE (SHS Engine)
   Spiritual Health Score Logic (Premium UI)
   ============================================= */

const Analysis = {
  monthOffset: 0,
  weights: {
    salah: 50,
    nafl: 15,
    dhikr: 15,
    mujahid: 10,
    consistency: 10
  },
  
  _cachedHabits: null,
  _isGeneratingPDF: false,



  init() {
    this.render();

    // Listen for local data updates with debouncing to prevent UI lag
    if (!this.dataUpdateBound) {
      this._debouncedRender = Utils.debounce(() => {
        if (document.getElementById('section-analysis')?.classList.contains('active')) {
          this.render();
        }
      }, 300);

      window.addEventListener('lamim:data-updated', () => {
        this._cachedHabits = null; // Invalidate cache on data change
        this._debouncedRender();
      });
      this.dataUpdateBound = true;
    }
  },

  calculateSHS(date) {
    date = date || Utils.todayStr();
    const salahData = DB.getSalah(date);
    const dhikrData = DB.getDhikr(date);
    
    // 1. Salah Score (Max 50)
    const salahScore = Utils.salahScore(salahData);
    const pointsSalah = (salahScore.pct / 100) * this.weights.salah;

    let pointsNafl = 0;
    let sunnahRakatCount = 0;
    if (salahData.sunnah) {
      if (salahData.sunnah.fajr_s) sunnahRakatCount += 2;
      if (salahData.sunnah.dhuhr_s_b) sunnahRakatCount += 4;
      if (salahData.sunnah.dhuhr_s_a) sunnahRakatCount += 2;
      if (salahData.sunnah.maghrib_s) sunnahRakatCount += 2;
      if (salahData.sunnah.isha_s) sunnahRakatCount += 2;
    }
    
    pointsNafl += (Math.min(sunnahRakatCount, 12) / 12) * 8;
    if (salahData.tahajjud) pointsNafl += 4;
    if (salahData.witr > 0) pointsNafl += 3;

    // 3. Dhikr Score (Max 15) - Proportional Level Logic
    const totalDhikrCount = Object.values(dhikrData).reduce((a, b) => {
      const num = parseInt(b, 10);
      return a + (isNaN(num) ? 0 : Math.max(0, num));
    }, 0);
    const pointsDhikr = Math.min(15, (totalDhikrCount / 2100) * this.weights.dhikr);
    const dhikrLevel = Math.min(7, Math.floor(totalDhikrCount / 300));

    // 4. Mujahid Score (Max 10) - Real Survival Logic
    let pointsMujahid = 0;
    if (!this._cachedHabits) this._cachedHabits = DB.get('lamim_mujahid_habits') || [];
    const habits = this._cachedHabits;
    
    if (habits.length > 0) {
      let activeHabitsForDay = 0;
      let successfulHabits = 0;
      
      habits.forEach(h => {
        // Only count this habit if it was started on or before the current date
        const habitStartDateStr = h.startDate ? h.startDate.split('T')[0] : null;
        if (habitStartDateStr && date >= habitStartDateStr) {
          activeHabitsForDay++;
          const history = h.history || [];
          const relapsedToday = history.find(entry => entry.date === date && entry.clean === false);
          if (!relapsedToday) successfulHabits++;
        }
      });
      
      if (activeHabitsForDay > 0) {
        pointsMujahid = (successfulHabits / activeHabitsForDay) * this.weights.mujahid;
      }
    }

    // 5. Consistency Score (Max 10) - Step Logic
    const rawTotal = pointsSalah + pointsNafl + pointsDhikr + pointsMujahid;
    let pointsConsistency = 0;
    
    // Using rounded value for a better UX experience
    const checkTotal = Math.round(rawTotal);
    
    if (checkTotal >= 90) pointsConsistency = 10;
    else if (checkTotal >= 80) pointsConsistency = 8;
    else if (checkTotal >= 70) pointsConsistency = 6;
    else if (checkTotal >= 60) pointsConsistency = 4;
    else if (checkTotal >= 50) pointsConsistency = 2;

    const totalSHS = Math.min(100, rawTotal + pointsConsistency);

    return {
      total: parseFloat(totalSHS.toFixed(1)),
      breakdown: {
        salah: parseFloat(pointsSalah.toFixed(1)),
        nafl: parseFloat(pointsNafl.toFixed(1)),
        dhikr: parseFloat(pointsDhikr.toFixed(1)),
        mujahid: parseFloat(pointsMujahid.toFixed(1)),
        consistency: parseFloat(pointsConsistency.toFixed(1))
      },
      level: { dhikr: dhikrLevel, dhikrCount: totalDhikrCount },
      rating: this.getRating(totalSHS)
    };
  },

  getRating(score) {
    if (score >= 90) return { label: 'Muhsin', color: '#fbbf24', desc: 'You worship as if you see Him. The pinnacle of Ihsan.' };
    if (score >= 80) return { label: 'Muttaqi', color: '#a78bfa', desc: 'God-consciousness guides your every step. Remarkable.' };
    if (score >= 65) return { label: 'Mukhlis', color: '#10b981', desc: 'Sincerity shines through your deeds. Stay steadfast.' };
    if (score >= 50) return { label: 'Mujahid', color: '#38bdf8', desc: 'Keep pushing your limits. Great things take time.' };
    if (score >= 30) return { label: 'Murid', color: '#f59e0b', desc: 'Your intention is set. Now let your actions follow your heart.' };
    if (score >= 15) return { label: 'Musafir', color: '#f87171', desc: "You've started walking. Keep your eyes on the path ahead." };
    return { label: 'Ghafil', color: '#ef4444', desc: 'Awaken your soul. The journey of a thousand miles begins with one step.' };
  },

  getMonthDailyTrend(year, month) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const shs = this.calculateSHS(Utils.dateStr(date));
      days.push({
        dateNum: d.toString(),
        fullDateStr: Utils.dateStr(date),
        weekday: date.toLocaleDateString(undefined, { weekday: 'short' }),
        score: shs.total,
        color: shs.rating.color
      });
    }
    return days;
  },


  render() {
    const container = document.getElementById('analysis-content');
    if (!container) return;

    const today = Utils.getOffsetDate();
    if (!this.monthOffset) this.monthOffset = 0;

    let targetDate = new Date(today.getFullYear(), today.getMonth() + this.monthOffset, 1);
    let monthVal = `${targetDate.getFullYear()}-${targetDate.getMonth()}`;
    let monthLabel = (this.monthOffset === 0) ? 'This Month' : targetDate.toLocaleDateString(undefined, {month: 'short', year: 'numeric'});

    let isHistorical = (this.monthOffset !== 0);

    // Always use the daily trend for the current viewed month
    let trend = this.getMonthDailyTrend(targetDate.getFullYear(), targetDate.getMonth());

    let activeDateStr = this.selectedDateStr;
    if (!activeDateStr && trend.length > 0) {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const available = trend.filter(d => {
        const [y, m, day] = d.fullDateStr.split('-').map(Number);
        return new Date(y, m - 1, day) <= todayStart;
      });
      activeDateStr = available.length > 0 ? available[available.length - 1].fullDateStr : trend[trend.length - 1].fullDateStr;
    }

    let shs = this.calculateSHS(activeDateStr || Utils.dateStr(today));

    const rating = shs.rating;
    const trendLabel = isHistorical ? 'Monthly' : 'Trend';
    let activeDateObj = today;
    if (activeDateStr) {
      const [y, m, d] = activeDateStr.split('-');
      activeDateObj = new Date(y, m - 1, d);
    }
    const scoreSubLabel = activeDateObj.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });


    container.innerHTML = `
      <style>
        .analysis-month-label { transition: 0.2s; }
        .analysis-month-label:hover { transform: scale(1.05); }
      </style>
      <div class="analysis-dashboard">
        <!-- Dashboard Header -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: -10px; gap: 8px;">
          <h2 style="font-size: 1.1rem; font-weight: 900; opacity: 1; flex: 1; line-height: 1.1; margin: 0; letter-spacing: -0.5px; color: var(--color-text-primary);">
            Lamim Spirituality<br>Score
          </h2>
          
          <div class="analysis-date-nav-modern" style="display: flex; align-items: center; background: rgba(168,85,247,0.1); border: 1px solid rgba(168,85,247,0.2); border-radius: 20px; padding: 2px;">
            <button class="btn btn-icon-sm" onclick="Analysis.changeMonth(-1)" style="color: #a855f7; width: 28px; height: 28px; border-radius: 50%; padding: 0; display: flex; align-items: center; justify-content: center; background: transparent; border: none; cursor: pointer;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <span class="analysis-month-label" onclick="Analysis.resetMonth()" style="color: #c084fc; font-size: 13px; font-weight: 700; padding: 0 10px; min-width: 60px; text-align: center; cursor: pointer;">${monthLabel}</span>
            <button class="btn btn-icon-sm" onclick="Analysis.changeMonth(1)" style="color: #a855f7; width: 28px; height: 28px; border-radius: 50%; padding: 0; display: ${this.monthOffset < 0 ? 'flex' : 'none'}; align-items: center; justify-content: center; background: transparent; border: none; cursor: pointer;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>

          <button class="btn-report-link" onclick="Analysis.exportMonthlyReport('${monthVal}')" style="flex-shrink: 0; padding: 5px 10px; font-size: 10px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span>PDF</span>
          </button>
        </div>

        <!-- Main Score Aura -->
        <div class="shs-aura-container">
          <div class="shs-aura" style="--aura-color: ${rating.color}">
            <div class="shs-val">${Math.round(shs.total)}</div>
            <div class="shs-label">Total LSS</div>
          </div>
          <div class="shs-rating-badge" id="shs-rating-badge" style="background: ${rating.color}20; color: ${rating.color}; border: 1px solid ${rating.color}40">
            ${rating.label}
          </div>
          <p class="shs-desc date-desc" style="font-size:11px; opacity:0.8; margin-bottom: 2px;">${scoreSubLabel}</p>
          <p class="shs-desc rating-desc">${rating.desc}</p>
        </div>

        <!-- NEW: Radar Chart Balance -->
        <div class="radar-chart-container anim-fade-in" style="margin-top: -15px; margin-bottom: 20px; flex-direction: column;">
          <div style="width: 100%; text-align: center; margin-bottom: 5px;">
            <span style="font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; opacity: 0.5; color: #a78bfa;">Spiritual Balance</span>
          </div>
          <div class="radar-chart-wrapper">
            ${this.renderRadarChart(shs.breakdown)}
          </div>
        </div>

        <!-- Weekly Trend (Bulletproof Scientific Style) -->
        <div class="weekly-trend-container" style="margin-top: 10px;">
          <div style="width: 100%; text-align: center; margin-bottom: 15px;">
            <span style="font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 2.5px; opacity: 0.5; color: var(--color-accent-gold);">Progress Timeline</span>
          </div>
          
          <div class="weekly-chart-wrapper">
            <div class="weekly-y-axis">
              <span>100</span><span>80</span><span>60</span><span>40</span><span>20</span><span>0</span>
            </div>
            
            <div class="weekly-chart-main" style="direction: rtl; overflow-x: auto; overflow-y: hidden; scrollbar-width: none; -ms-overflow-style: none;">
              <div style="direction: ltr; min-width: ${Math.max(100, (trend.length / 7) * 100)}%; height: 100%; display: flex; flex-direction: column; position: relative; padding-right: 10px;">
                <div class="weekly-chart-area" style="border-left: none;">
                  <!-- Grid Lines -->
                  <div class="grid-line" style="bottom: 20%"></div>
                  <div class="grid-line" style="bottom: 40%"></div>
                  <div class="grid-line" style="bottom: 60%"></div>
                  <div class="grid-line" style="bottom: 80%"></div>
                  <div class="grid-line" style="bottom: 100%"></div>
                  
                  <!-- Bars Container -->
                  <div class="bars-container" style="inset: 0;">
                    ${trend.map(t => {
                      const isInactive = t.score <= 10;
                      const isSelected = (t.fullDateStr === activeDateStr);
                      const barColor = isInactive ? 'var(--chart-inactive)' : t.color;
                      const groupStyle = isSelected ? `z-index: 10;` : `opacity: ${isInactive ? '0.3' : '0.5'}`;
                      const fillGlow = isSelected ? `box-shadow: 0 0 15px ${barColor}; border-top: 2px solid #fff;` : '';
                      return `
                        <div class="bar-col" data-date="${t.fullDateStr}" data-inactive="${isInactive}" data-color="${t.color}" onclick="Analysis.selectDate('${t.fullDateStr}')" style="cursor:pointer; -webkit-tap-highlight-color: transparent;">
                          <div class="bar-group" style="height: ${isInactive ? '10%' : t.score + '%'}; ${groupStyle}; transition: all 0.3s ease;">
                            <div class="bar-score" style="${!isInactive && isSelected ? 'color:' + t.color : 'display:none'}; text-shadow: 0 0 5px ${t.color};">
                              ${Math.round(t.score)}
                            </div>
                            <div class="bar-fill ${!isInactive ? 'active' : ''}" style="--bar-color: ${barColor}; width: 14px; ${fillGlow} transition: box-shadow 0.3s ease;"></div>
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>
                
                <!-- X-Axis (Baseline & Labels) -->
                <div class="weekly-x-axis">
                  <div class="baseline-line"></div>
                  <div class="x-labels" style="padding: 10px 0 0 0;">
                    ${trend.map(t => {
                      const isSelected = (t.fullDateStr === activeDateStr);
                      return `
                      <div class="x-label" data-date="${t.fullDateStr}" style="font-size: 9px; line-height: 1.3; display: flex; flex-direction: column; align-items: center; ${isSelected ? `color: ${t.color}; font-weight: 900;` : ''}">
                        <span style="opacity: ${isSelected ? '0.8' : '0.5'}; font-size: 8px;">${t.weekday}</span>
                        <span>${t.dateNum}</span>
                      </div>
                    `}).join('')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Detailed Breakdown (Compact Style) -->
        <div style="width: 100%; text-align: center; margin-top: 25px; margin-bottom: 15px;">
          <span style="font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 2.5px; opacity: 0.5; color: #34d399;">Insight Breakdown</span>
        </div>
        <div class="shs-grid">
          ${this.renderCard('Salah', shs.breakdown.salah, 50, '#f87171', `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20H4c-1 0-2-1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4c0 1-1 2-2 2z"/><path d="M12 10V3"/><path d="M8 6h8"/></svg>
          `)}
          ${this.renderCard('Nafl', shs.breakdown.nafl, 15, '#a855f7', `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          `)}
          ${this.renderCard('Dhikr', shs.breakdown.dhikr, 15, '#38bdf8', `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M6.34 17.66l-1.41 1.41"/><path d="M19.07 4.93l-1.41 1.41"/></svg>
          `, `Lvl ${shs.level.dhikr}`)}
          ${this.renderCard('Mujahid', shs.breakdown.mujahid, 10, '#fbbf24', `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          `)}
          ${this.renderCard('Spirit', shs.breakdown.consistency, 10, '#10b981', `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          `)}
        </div>

        <div style="height:40px"></div>
      </div>
    `;
  },

  renderCard(label, val, max, color, svg, sub, noAnim = false) {
    return `
      <div class="shs-card ${noAnim ? '' : 'anim-fade-in'}">
        <div class="shs-card-header">
          <div class="shs-card-icon" style="background: ${color}15; color: ${color}">${svg}</div>
          <div class="shs-card-info">
            <div class="shs-card-val">${val}<span class="max-val">/${max}</span></div>
            <div class="shs-card-label">${label} ${sub ? `<span class="sub-label">(${sub})</span>` : ''}</div>
          </div>
        </div>
      </div>
    `;
  },

  changeMonth(delta) {
    if (!this.monthOffset) this.monthOffset = 0;
    this.monthOffset += delta;
    if (this.monthOffset > 0) this.monthOffset = 0;
    this.selectedDateStr = null; // Clear selected date on month change
    this.render();
  },

  resetMonth() {
    this.monthOffset = 0;
    this.selectedDateStr = null; // Clear selected date on reset
    this.render();
  },

  selectDate(dateStr) {
    if (this.selectedDateStr === dateStr) return; // Already selected
    this.selectedDateStr = dateStr;
    
    // Manual DOM updates to prevent any blinking/flickering
    const shs = this.calculateSHS(dateStr);
    const rating = shs.rating;
    
    // 1. Update Aura
    const aura = document.querySelector('.shs-aura');
    if (aura) aura.style.setProperty('--aura-color', rating.color);
    
    const val = document.querySelector('.shs-val');
    if (val) val.innerText = Math.round(shs.total);
    
    const badge = document.getElementById('shs-rating-badge');
    if (badge) {
      badge.style.background = `${rating.color}20`;
      badge.style.color = rating.color;
      badge.style.border = `1px solid ${rating.color}40`;
      badge.innerText = rating.label;
    }
    
    const [y, m, d] = dateStr.split('-');
    const dateObj = new Date(y, m - 1, d);
    const scoreSubLabel = dateObj.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
    const dateDesc = document.querySelector('.date-desc');
    if (dateDesc) dateDesc.innerHTML = `${scoreSubLabel}`;
    
    const ratingDesc = document.querySelector('.rating-desc');
    if (ratingDesc) ratingDesc.innerText = rating.desc;
    
    // 2. Update Grid (pass true for noAnim to prevent fade-in flicker)
    const grid = document.querySelector('.shs-grid');
    if (grid) {
      grid.innerHTML = `
        ${this.renderCard('Salah', shs.breakdown.salah, 50, '#f87171', `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20H4c-1 0-2-1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4c0 1-1 2-2 2z"/><path d="M12 10V3"/><path d="M8 6h8"/></svg>`, null, true)}
        ${this.renderCard('Nafl', shs.breakdown.nafl, 15, '#a855f7', `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`, null, true)}
        ${this.renderCard('Dhikr', shs.breakdown.dhikr, 15, '#38bdf8', `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M6.34 17.66l-1.41 1.41"/><path d="M19.07 4.93l-1.41 1.41"/></svg>`, `Lvl ${shs.level.dhikr}`, true)}
        ${this.renderCard('Mujahid', shs.breakdown.mujahid, 10, '#fbbf24', `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`, null, true)}
        ${this.renderCard('Spirit', shs.breakdown.consistency, 10, '#10b981', `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`, null, true)}
      `;
    }
    
    // 4. Update Radar Chart
    const radarWrapper = document.querySelector('.radar-chart-wrapper');
    if (radarWrapper) {
      radarWrapper.innerHTML = this.renderRadarChart(shs.breakdown);
    }

    // 5. Update Chart Bars
    const bars = document.querySelectorAll('.bar-col');
    bars.forEach(bar => {
      const bDate = bar.getAttribute('data-date');
      const isSelected = (bDate === dateStr);
      
      const isInactive = bar.getAttribute('data-inactive') === 'true';
      const nativeColor = bar.getAttribute('data-color');
      const barColor = isInactive ? 'var(--chart-inactive)' : nativeColor;
      
      const group = bar.querySelector('.bar-group');
      if (group) {
        group.style.zIndex = isSelected ? '10' : '1';
        group.style.opacity = isSelected ? '1' : (isInactive ? '0.3' : '0.5');
      }
      
      const scoreEl = bar.querySelector('.bar-score');
      if (scoreEl) {
        scoreEl.style.display = (!isInactive && isSelected) ? 'block' : 'none';
        if (isSelected) scoreEl.style.color = nativeColor;
      }
      
      const fillEl = bar.querySelector('.bar-fill');
      if (fillEl) {
        if (isSelected) {
          fillEl.style.boxShadow = `0 0 15px ${barColor}`;
          fillEl.style.borderTop = `2px solid #fff`;
        } else {
          fillEl.style.boxShadow = '';
          fillEl.style.borderTop = '';
        }
      }
    });
  },

  renderRadarChart(breakdown) {
    // Normalize scores to 0-100 scale for radar
    const values = [
      (breakdown.salah / 50) * 100,       // Top (Salah)
      (breakdown.nafl / 15) * 100,        // Top-Right (Nafl)
      (breakdown.dhikr / 15) * 100,       // Bottom-Right (Dhikr)
      (breakdown.mujahid / 10) * 100,     // Bottom-Left (Mujahid)
      (breakdown.consistency / 10) * 100  // Top-Left (Consistency)
    ];

    const labels = ['Salah', 'Nafl', 'Dhikr', 'Mujahid', 'Spirit'];
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const colors = isLight 
      ? ['#DC2626', '#7C3AED', '#2563EB', '#D97706', '#059669'] 
      : ['#f87171', '#a855f7', '#38bdf8', '#fbbf24', '#10b981'];
    const polyStroke = isLight ? '#6366F1' : '#a78bfa';
    const polyGradStart = isLight ? '#6366F1' : '#818cf8';
    const polyGradEnd = isLight ? '#7C3AED' : '#c084fc';
    
    const center = 100;
    const maxRadius = 75;
    const points = [];
    
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      const radius = (values[i] / 100) * maxRadius;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      points.push(`${x},${y}`);
    }

    const polygonPoints = points.join(' ');
    
    // Background Grid
    let grids = '';
    const gridStroke = 'var(--radar-grid-stroke, rgba(128, 128, 128, 0.15))'; // Adaptive theme-based grid stroke
    const axisStroke = 'var(--radar-axis-stroke, rgba(128, 128, 128, 0.25))'; // Adaptive theme-based axis stroke

    [0.2, 0.4, 0.6, 0.8, 1.0].forEach(scale => {
      const gPoints = [];
      for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        const x = center + (maxRadius * scale) * Math.cos(angle);
        const y = center + (maxRadius * scale) * Math.sin(angle);
        gPoints.push(`${x},${y}`);
      }
      grids += `<polygon points="${gPoints.join(' ')}" fill="none" stroke="${gridStroke}" stroke-width="1" />`;
    });

    // Axis Lines and Labels
    let axisElements = '';
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      const xEnd = center + maxRadius * Math.cos(angle);
      const yEnd = center + maxRadius * Math.sin(angle);
      const xLabel = center + (maxRadius + 15) * Math.cos(angle);
      const yLabel = center + (maxRadius + 15) * Math.sin(angle);
      
      axisElements += `
        <line x1="${center}" y1="${center}" x2="${xEnd}" y2="${yEnd}" stroke="${axisStroke}" stroke-width="1" />
        <text x="${xLabel}" y="${yLabel}" fill="${colors[i]}" font-size="9" font-weight="900" text-anchor="middle" dominant-baseline="middle" style="filter: drop-shadow(0 0 4px ${colors[i]}40)">${labels[i]}</text>
      `;
    }

    return `
      <svg viewBox="0 0 200 200" style="width: 100%; max-width: 280px; margin: 0 auto; display: block; overflow: visible;">
        <defs>
          <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="${polyGradStart}" stop-opacity="0.2" />
            <stop offset="100%" stop-color="${polyGradStart}" stop-opacity="0" />
          </radialGradient>
          <linearGradient id="poly-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${polyGradStart}" stop-opacity="0.6" />
            <stop offset="100%" stop-color="${polyGradEnd}" stop-opacity="0.3" />
          </linearGradient>
        </defs>
        
        <circle cx="100" cy="100" r="100" fill="url(#radar-glow)" />
        ${grids}
        ${axisElements}
        
        <!-- The Morphing Polygon -->
        <polygon points="${polygonPoints}" fill="url(#poly-grad)" stroke="${polyStroke}" stroke-width="2" style="transition: points 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
          <animate attributeName="opacity" values="0.4;0.7;0.4" dur="4s" repeatCount="indefinite" />
        </polygon>
        
        <!-- Glowing Vertices -->
        ${points.map((p, i) => {
          const [px, py] = p.split(',');
          return `<circle cx="${px}" cy="${py}" r="3" fill="#fff" style="filter: drop-shadow(0 0 4px ${colors[i]}); transition: cx 0.6s, cy 0.6s;">
            <animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite" begin="${i * 0.4}s" />
          </circle>`;
        }).join('')}
      </svg>
    `;
  },

  exportMonthlyReport(monthStr) {
    if (this._isGeneratingPDF) {
      Utils.toast('Report is already opening. Please wait...', 'warning');
      return;
    }
    this._isGeneratingPDF = true;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let targetDate = todayStart;
    if (monthStr) {
      const [y, m] = monthStr.split('-');
      targetDate = new Date(parseInt(y), parseInt(m), 1);
    }

    const currentMonth = targetDate.getMonth();
    const currentYear = targetDate.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const monthName = targetDate.toLocaleDateString(undefined, { month: 'long' });

    let totalSHS = 0, daysAnalyzed = 0, totalDhikr = 0;
    let salahStats = { perfect: 0, consistent: 0 };
    const dayData = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      if (date > todayStart) break;
      const ds = Utils.dateStr(date);
      const shs = this.calculateSHS(ds);
      totalSHS += shs.total;
      totalDhikr += shs.level.dhikrCount;
      const salah = DB.getSalah(ds);
      let done = 0;
      ['fajr','dhuhr','asr','maghrib','isha'].forEach(p => { if (salah[p] && salah[p] !== 'missed') done++; });
      if (done === 5) salahStats.perfect++;
      if (done >= 4) salahStats.consistent++;
      dayData.push({ day: i, score: shs.total, rating: shs.rating.label });
      daysAnalyzed++;
    }

    if (daysAnalyzed === 0) {
      Utils.toast('No data available for this month yet.', 'error');
      this._isGeneratingPDF = false;
      return;
    }

    const avgSHS = (totalSHS / daysAnalyzed).toFixed(1);
    const user = DB.getUser() || { name: 'Anonymous Warrior' };
    const generatedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const getBadgeStyle = (rating) => {
      if (rating === 'Muttaqi') return 'background: rgba(251, 191, 36, 0.15); color: #b45309; border: 1px solid rgba(251, 191, 36, 0.3);';
      if (rating === 'Mukhlis') return 'background: rgba(16, 185, 129, 0.15); color: #047857; border: 1px solid rgba(16, 185, 129, 0.3);';
      if (rating === 'Mujahid') return 'background: rgba(56, 189, 248, 0.15); color: #0369a1; border: 1px solid rgba(56, 189, 248, 0.3);';
      return 'background: rgba(248, 113, 113, 0.15); color: #b91c1c; border: 1px solid rgba(248, 113, 113, 0.3);';
    };

    const bodyHTML = `
      <div style="max-width:210mm;margin:0 auto;padding:28px 32px;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;color:#0f172a;font-size:10px;line-height:1.4;background:#fff;">

        <div style="display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:20px;border-bottom:2px solid #e2e8f0;margin-bottom:22px;">
          <div style="display:flex;align-items:center;gap:14px;">
            <div style="width:42px;height:42px;background:linear-gradient(135deg,#6366f1,#a855f7);border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:17px;font-weight:900;letter-spacing:-1px;">LM</div>
            <div>
              <div style="font-size:20px;font-weight:800;letter-spacing:-0.5px;color:#0f172a;line-height:1.1;">LAMIM</div>
              <div style="font-size:9px;color:#64748b;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;margin-top:3px;">Spiritual Score Report</div>
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:8px;color:#94a3b8;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-bottom:2px;">${monthName} ${currentYear}</div>
            <div style="font-size:9px;color:#64748b;font-weight:500;">Generated ${generatedDate}</div>
          </div>
        </div>

        <div style="background:linear-gradient(135deg,#eef2ff,#ede9fe);border-radius:16px;padding:24px 28px;margin-bottom:22px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-size:11px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Servant of Allah</div>
            <div style="font-size:24px;font-weight:800;color:#0f172a;">${user.name || 'Anonymous Warrior'}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:36px;font-weight:800;color:#4f46e5;line-height:1;">${avgSHS}</div>
            <div style="font-size:9px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Avg LSS</div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:24px;">
          <div style="background:#fff;padding:18px 20px;border-radius:12px;border:1px solid #e2e8f0;">
            <div style="font-size:9px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.3px;margin-bottom:6px;">Perfect Days</div>
            <div style="font-size:28px;font-weight:800;color:#059669;line-height:1;">${salahStats.perfect}</div>
            <div style="font-size:9px;color:#94a3b8;margin-top:2px;">/ ${daysAnalyzed} days</div>
          </div>
          <div style="background:#fff;padding:18px 20px;border-radius:12px;border:1px solid #e2e8f0;">
            <div style="font-size:9px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.3px;margin-bottom:6px;">Consistent Days</div>
            <div style="font-size:28px;font-weight:800;color:#0891b2;line-height:1;">${salahStats.consistent}</div>
            <div style="font-size:9px;color:#94a3b8;margin-top:2px;">≥ 4 prayers</div>
          </div>
          <div style="background:#fff;padding:18px 20px;border-radius:12px;border:1px solid #e2e8f0;">
            <div style="font-size:9px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.3px;margin-bottom:6px;">Total Dhikr</div>
            <div style="font-size:28px;font-weight:800;color:#d97706;line-height:1;">${totalDhikr}</div>
            <div style="font-size:9px;color:#94a3b8;margin-top:2px;">count</div>
          </div>
        </div>

        <div style="font-size:12px;font-weight:700;color:#0f172a;margin-bottom:14px;display:flex;align-items:center;gap:8px;">
          <span style="display:block;width:4px;height:14px;background:#6366f1;border-radius:2px;"></span>
          Daily Performance Log
        </div>

        <table style="width:100%;border-collapse:separate;border-spacing:0;background:#fff;border-radius:10px;border:1px solid #e2e8f0;overflow:hidden;">
          <thead>
            <tr>
              <th style="text-align:left;background:#f8fafc;padding:10px 14px;font-size:9px;text-transform:uppercase;color:#64748b;font-weight:700;border-bottom:1px solid #e2e8f0;letter-spacing:0.5px;">Day</th>
              <th style="text-align:left;background:#f8fafc;padding:10px 14px;font-size:9px;text-transform:uppercase;color:#64748b;font-weight:700;border-bottom:1px solid #e2e8f0;letter-spacing:0.5px;">Date</th>
              <th style="text-align:center;background:#f8fafc;padding:10px 14px;font-size:9px;text-transform:uppercase;color:#64748b;font-weight:700;border-bottom:1px solid #e2e8f0;letter-spacing:0.5px;">LSS Score</th>
              <th style="text-align:center;background:#f8fafc;padding:10px 14px;font-size:9px;text-transform:uppercase;color:#64748b;font-weight:700;border-bottom:1px solid #e2e8f0;letter-spacing:0.5px;">Spiritual Rating</th>
            </tr>
          </thead>
          <tbody>
            ${dayData.map(d => `
              <tr${d.day % 2 === 0 ? ' style="background:#fafafa;"' : ''}>
                <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;font-size:11px;color:#64748b;font-weight:600;">${String(d.day).padStart(2, '0')}</td>
                <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;font-size:11px;color:#334155;font-weight:500;">${monthName} ${d.day}, ${currentYear}</td>
                <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;font-size:13px;text-align:center;font-weight:700;color:#0f172a;">${d.score}</td>
                <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;font-size:11px;text-align:center;"><span style="padding:4px 10px;border-radius:12px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;display:inline-block;${getBadgeStyle(d.rating)}">${d.rating}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="margin-top:28px;padding-top:16px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;">
          <div style="font-size:8px;color:#94a3b8;font-weight:500;">Securely generated by Lamim Intelligence</div>
          <div style="font-size:11px;font-weight:800;color:#cbd5e1;letter-spacing:1px;">LAMIM</div>
        </div>
      </div>
    `;

    const closeBtn = `<div id="lamim-close-bar" style="position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:2px solid #e2e8f0;padding:14px 20px;text-align:center;z-index:99999;box-shadow:0 -4px 20px rgba(0,0,0,0.08);display:flex;align-items:center;justify-content:space-between;">
      <span style="font-size:12px;font-weight:600;color:#64748b;">LAMIM Report</span>
      <div style="display:flex;gap:10px;">
        <button onclick="window.print()" style="background:#10b981;color:#fff;border:none;padding:10px 20px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:6px;box-shadow:0 4px 12px rgba(16,185,129,0.3);">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Print / PDF
        </button>
        <button onclick="window.close()" style="background:#64748b;color:#fff;border:none;padding:10px 16px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          Close
        </button>
      </div>
    </div>`;
    const fullHTML = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"><title>LAMIM — ${monthName} ${currentYear} Spiritual Report</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"><style>@page { size: A4; margin: 0; } * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; } body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: #ffffff; color: #0f172a; font-size: 10px; line-height: 1.4; padding-bottom: 70px; } @media print { #lamim-close-bar { display: none !important; } body { padding-bottom: 0; } }</style></head><body>${bodyHTML}${closeBtn}</body></html>`;

    const winName = 'lamim_pdf_' + Date.now();
    const printWindow = window.open('', winName);
    if (!printWindow) {
      Utils.toast('Popup blocked. Please allow popups and try again.', 'error');
      this._isGeneratingPDF = false;
      return;
    }

    printWindow.document.open();
    printWindow.document.write(fullHTML);
    printWindow.document.close();

    this._isGeneratingPDF = false;
  }
};

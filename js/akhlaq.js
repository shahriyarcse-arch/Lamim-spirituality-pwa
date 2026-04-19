/* =============================================
   LAMIM — AKHLAQ MODULE (Habit & Sunnah Builder)
   ============================================= */
const Akhlaq = {
  selectedDate: null,

  init() {
    this.selectedDate = Utils.todayStr();
    this.render();
  },

  render() {
    const data = DB.getAkhlaq(this.selectedDate);
    const container = document.getElementById('akhlaq-content');
    if (!container) return;

    container.innerHTML = `
      <div class="card mb-4">
        <div class="card-header"><div class="card-title">🌅 Daily Adhkar</div></div>
        <div class="flex-col gap-3">
          <label class="toggle-wrapper" style="justify-content:space-between;width:100%">
            <span>Morning Adhkar (After Fajr)</span>
            <div class="toggle ${data.morning_adhkar ? 'active' : ''}" onclick="Akhlaq.toggle('morning_adhkar')"></div>
          </label>
          <div class="divider" style="margin:var(--space-2) 0"></div>
          <label class="toggle-wrapper" style="justify-content:space-between;width:100%">
            <span>Evening Adhkar (After Asr)</span>
            <div class="toggle ${data.evening_adhkar ? 'active' : ''}" onclick="Akhlaq.toggle('evening_adhkar')"></div>
          </label>
        </div>
      </div>

      <div class="card mb-4 card-gold">
        <div class="card-header"><div class="card-title">🙏 Gratitude Journal</div></div>
        <p class="text-sm text-muted mb-3">Write 3 things you are grateful to Allah for today:</p>
        <div class="flex-col gap-2">
          <input class="input" placeholder="1. Alhamdulillah for..." value="${data.gratitude[0] || ''}" onchange="Akhlaq.saveGratitude(0, this.value)">
          <input class="input" placeholder="2. Alhamdulillah for..." value="${data.gratitude[1] || ''}" onchange="Akhlaq.saveGratitude(1, this.value)">
          <input class="input" placeholder="3. Alhamdulillah for..." value="${data.gratitude[2] || ''}" onchange="Akhlaq.saveGratitude(2, this.value)">
        </div>
      </div>

      <div class="grid-2 mb-4">
        <div class="card">
          <div class="card-header"><div class="card-title">💧 Sunnah</div></div>
          <label class="toggle-wrapper" style="justify-content:space-between;width:100%">
            <span class="text-sm">Wudu before sleep</span>
            <div class="toggle ${data.wudu_sleep ? 'active' : ''}" onclick="Akhlaq.toggle('wudu_sleep')"></div>
          </label>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">🛡️ Discipline</div></div>
          <label class="toggle-wrapper" style="justify-content:space-between;width:100%">
            <span class="text-sm">Avoided bad habit today</span>
            <div class="toggle ${data.bad_habit_avoided ? 'active' : ''}" onclick="Akhlaq.toggle('bad_habit_avoided')"></div>
          </label>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">💝 Sadaqah (Charity)</div></div>
        <div class="flex items-center gap-3">
          <div class="stat-box" style="flex:1">
            <div class="stat-box-val" style="font-size:var(--text-3xl)">$${data.sadaqah}</div>
            <div class="stat-box-label">Given Today</div>
          </div>
          <div class="flex-col gap-2">
            <button class="btn btn-sm btn-secondary" onclick="Akhlaq.addSadaqah(1)">+$1</button>
            <button class="btn btn-sm btn-secondary" onclick="Akhlaq.addSadaqah(5)">+$5</button>
            <button class="btn btn-sm btn-gold" onclick="Akhlaq.addSadaqahCustom()">Custom</button>
          </div>
        </div>
      </div>
    `;
  },

  toggle(key) {
    const data = DB.getAkhlaq(this.selectedDate);
    data[key] = !data[key];
    DB.setAkhlaq(this.selectedDate, data);
    this.render();
    if(data[key]) Utils.toast('Habit logged! ✅', 'success');
  },

  saveGratitude(index, val) {
    const data = DB.getAkhlaq(this.selectedDate);
    data.gratitude[index] = val;
    DB.setAkhlaq(this.selectedDate, data);
  },

  addSadaqah(amount) {
    const data = DB.getAkhlaq(this.selectedDate);
    data.sadaqah = (data.sadaqah || 0) + amount;
    DB.setAkhlaq(this.selectedDate, data);
    this.render();
    Utils.toast(`$${amount} logged for Sadaqah. May Allah accept!`, 'success');
  },

  addSadaqahCustom() {
    const val = prompt('Enter amount given:');
    if (val && !isNaN(val)) {
      this.addSadaqah(parseFloat(val));
    }
  }
};

/* =============================================
   LAMIM — TAZKIYAH MODULE (Mental Health)
   ============================================= */
const Tazkiyah = {
  selectedDate: null,
  moods: [
    { id: 'happy', icon: '😄', label: 'Happy' },
    { id: 'calm', icon: '😌', label: 'Calm' },
    { id: 'anxious', icon: '😟', label: 'Anxious' },
    { id: 'sad', icon: '😢', label: 'Sad' },
    { id: 'angry', icon: '😠', label: 'Angry' }
  ],

  init() {
    this.selectedDate = Utils.todayStr();
    this.render();
  },

  render() {
    const data = DB.getTazkiyah(this.selectedDate);
    const container = document.getElementById('tazkiyah-content');
    if (!container) return;

    let duah = '';
    if (data.mood === 'anxious' || data.mood === 'sad') {
      duah = `
        <div class="card card-sm mb-4" style="background:rgba(88,166,255,0.1);border-color:var(--color-accent-primary)">
          <div class="text-sm font-bold text-blue mb-1">Du'a for Anxiety & Sorrow:</div>
          <div class="font-arabic text-xl mb-2 text-right">اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ</div>
          <div class="text-xs text-muted">"O Allah, I seek refuge in You from anxiety and sorrow."</div>
        </div>
      `;
    } else if (data.mood === 'angry') {
      duah = `
        <div class="card card-sm mb-4" style="background:rgba(248,81,73,0.1);border-color:var(--color-accent-red)">
          <div class="text-sm font-bold text-red mb-1">When Angry, say:</div>
          <div class="font-arabic text-xl mb-2 text-right">أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ</div>
          <div class="text-xs text-muted">"I seek refuge in Allah from the accursed devil."</div>
          <label class="toggle-wrapper mt-3" style="justify-content:space-between;width:100%">
            <span class="text-xs">Did I manage my anger (Sunnah way)?</span>
            <div class="toggle ${data.anger_managed ? 'active' : ''}" onclick="Tazkiyah.toggle('anger_managed')"></div>
          </label>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="card mb-4">
        <div class="card-header"><div class="card-title">How are you feeling today?</div></div>
        <div class="flex gap-2 justify-between mb-2">
          ${this.moods.map(m => `
            <button class="btn btn-icon" style="font-size:1.5rem; ${data.mood === m.id ? 'transform:scale(1.2);background:var(--color-bg-elevated);border:1px solid var(--color-border)' : 'opacity:0.6'}" onclick="Tazkiyah.setMood('${m.id}')" title="${m.label}">
              ${m.icon}
            </button>
          `).join('')}
        </div>
      </div>

      ${duah}

      <div class="card mb-4">
        <div class="card-header"><div class="card-title">Tawakkul Journal (Letting Go)</div></div>
        <p class="text-sm text-muted mb-3">Write down a worry you cannot control, and entrust it to Allah:</p>
        <textarea class="input" rows="3" placeholder="I am worried about... but I leave it to You, Ya Allah." onchange="Tazkiyah.saveLettingGo(this.value)">${data.letting_go || ''}</textarea>
        ${data.letting_go ? '<div class="text-xs text-green mt-2">✓ Handed over to Allah</div>' : ''}
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">Protection & Ruqyah</div></div>
        <label class="toggle-wrapper" style="justify-content:space-between;width:100%">
          <span class="text-sm">Recited 3 Quls & blew over myself</span>
          <div class="toggle ${data.ruqyah ? 'active' : ''}" onclick="Tazkiyah.toggle('ruqyah')"></div>
        </label>
      </div>
    `;
  },

  setMood(moodId) {
    const data = DB.getTazkiyah(this.selectedDate);
    data.mood = moodId;
    DB.setTazkiyah(this.selectedDate, data);
    this.render();
  },

  saveLettingGo(val) {
    const data = DB.getTazkiyah(this.selectedDate);
    data.letting_go = val;
    DB.setTazkiyah(this.selectedDate, data);
    this.render();
  },

  toggle(key) {
    const data = DB.getTazkiyah(this.selectedDate);
    data[key] = !data[key];
    DB.setTazkiyah(this.selectedDate, data);
    this.render();
  }
};

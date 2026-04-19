/* =============================================
   LAMIM — DHIKR MODULE
   ============================================= */
const Dhikr = {
  presets: [
    { id:'subhanallah',  arabic:'سُبْحَانَ اللَّهِ',    latin:'SubhanAllah',    meaning:'Glory be to Allah',          target:33,  category:'general' },
    { id:'alhamdulillah',arabic:'الْحَمْدُ لِلَّهِ',    latin:'Alhamdulillah',  meaning:'All praise is due to Allah', target:33,  category:'general' },
    { id:'allahuakbar',  arabic:'اللَّهُ أَكْبَرُ',      latin:'AllahuAkbar',    meaning:'Allah is the Greatest',      target:34,  category:'general' },
    { id:'la-ilaha',     arabic:'لَا إِلَٰهَ إِلَّا اللَّهُ', latin:'La ilaha illallah', meaning:'There is no god but Allah', target:100, category:'general' },
    { id:'astaghfirullah',arabic:'أَسْتَغْفِرُ اللَّهَ', latin:'Astaghfirullah', meaning:'I seek forgiveness of Allah',target:100, category:'morning' },
    { id:'salawat',      arabic:'صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ', latin:'Allahumma Salli', meaning:"Prayers upon the Prophet ﷺ", target:100, category:'general' },
    { id:'hasbunallah',  arabic:'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', latin:'Hasbunallah',  meaning:'Allah is Sufficient for us', target:7, category:'morning' },
    { id:'ya-hayyu',     arabic:'يَا حَيُّ يَا قَيُّومُ', latin:'Ya Hayyu Ya Qayyum', meaning:'O Ever-Living, O Sustainer', target:40, category:'evening' },
    { id:'subhanallahi-wabihamdihi', arabic:'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', latin:'SubhanAllahi Wabihamdihi', meaning:'Glory and praise be to Allah', target:100, category:'after-prayer' },
    { id:'la-hawla',     arabic:'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', latin:'La Hawla Wala Quwwata', meaning:'There is no power except with Allah', target:100, category:'general' },
  ],

  currentId: 'subhanallah',
  count: 0,
  sessionStart: null,

  get current() { return this.getAllPresets().find(p => p.id === this.currentId) || this.presets[0]; },

  getAllPresets() {
    return [...this.presets, ...DB.getDhikrPresets()];
  },

  init() {
    this.renderPresetGrid();
    this.renderCounter();
    this.renderSessionHistory();
    this.bindKeyboard();
    this.renderCategories();
  },

  renderPresetGrid(filter = 'all') {
    const grid = document.getElementById('dhikr-grid');
    if (!grid) return;
    const presets = filter === 'all' ? this.getAllPresets() : this.getAllPresets().filter(p => p.category === filter);
    grid.innerHTML = presets.map(p => `
      <div class="dhikr-preset-card ${p.id === this.currentId ? 'active' : ''}" onclick="Dhikr.selectDhikr('${p.id}')">
        <div class="dhikr-preset-arabic">${p.arabic}</div>
        <div class="dhikr-preset-name">${p.latin}</div>
        <div class="dhikr-preset-count">Target: ${p.target} · ${DB.getDhikr(Utils.todayStr())[p.id] || 0} today</div>
      </div>
    `).join('') + `
      <div class="dhikr-preset-card" onclick="Dhikr.showAddModal()" style="border-style:dashed;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:120px;">
        <div style="font-size:2rem;margin-bottom:8px;">➕</div>
        <div class="dhikr-preset-name">Custom Dhikr</div>
      </div>
    `;
  },

  renderCategories() {
    const tabs = document.getElementById('dhikr-cat-tabs');
    if (!tabs) return;
    const cats = [{ id:'all',label:'All'},{id:'general',label:'General'},{id:'morning',label:'Morning'},{id:'evening',label:'Evening'},{id:'after-prayer',label:'After Prayer'}];
    tabs.innerHTML = cats.map(c => `<button class="tab-btn ${c.id==='all'?'active':''}" onclick="Dhikr.filterCat('${c.id}',this)">${c.label}</button>`).join('');
  },

  filterCat(cat, btn) {
    document.querySelectorAll('#dhikr-cat-tabs .tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    this.renderPresetGrid(cat);
  },

  selectDhikr(id) {
    this.currentId = id;
    this.count = 0;
    this.sessionStart = new Date();
    this.renderCounter();
    this.renderPresetGrid();
    this.renderBeads();
  },

  renderCounter() {
    const d = this.current;
    const el = document.getElementById('dhikr-counter-wrap');
    if (!el) return;
    const pct = Math.min(100, Math.round((this.count / d.target) * 100));
    el.innerHTML = `
      <div class="dhikr-name-arabic">${d.arabic}</div>
      <div class="dhikr-name-latin">${d.latin}</div>
      <div class="dhikr-meaning">${d.meaning}</div>
      <div class="dhikr-count-display" id="dhikr-count-num">${this.count}</div>
      <div class="dhikr-target">Target: ${d.target} &nbsp;|&nbsp; ${pct}% complete</div>
      <div class="progress-bar" style="max-width:300px;margin:0 auto var(--space-6)">
        <div class="progress-fill progress-fill-gold" style="width:${pct}%"></div>
      </div>
    `;
    this.renderBeads();
  },

  renderBeads() {
    const el = document.getElementById('dhikr-beads');
    if (!el) return;
    const target = Math.min(this.current.target, 33);
    const lit    = this.count % (target || 1);
    el.innerHTML = Array.from({ length: target }, (_, i) =>
      `<div class="bead ${i < lit ? 'lit' : ''}"></div>`
    ).join('');
  },

  tap() {
    if (!this.sessionStart) this.sessionStart = new Date();
    this.count++;
    const d = this.current;
    const today = Utils.todayStr();
    const dhikr = DB.getDhikr(today);
    dhikr[d.id] = (dhikr[d.id] || 0) + 1;
    DB.setDhikr(today, dhikr);

    // Animate count
    const num = document.getElementById('dhikr-count-num');
    if (num) { num.textContent = this.count; num.style.animation = 'none'; num.offsetHeight; num.style.animation = 'countBounce 0.3s ease'; }

    // Float-up number
    this.floatUp();
    this.renderBeads();

    // Update progress
    const pct = Math.min(100, Math.round((this.count / d.target) * 100));
    const bar = document.querySelector('#dhikr-counter-wrap .progress-fill');
    if (bar) bar.style.width = pct + '%';
    const targetEl = document.querySelector('.dhikr-target');
    if (targetEl) targetEl.textContent = `Target: ${d.target} | ${pct}% complete`;

    if (this.count === d.target) this.onTargetReached();
    if (this.count > 0 && this.count % d.target === 0 && this.count !== d.target) this.onRoundComplete();
  },

  floatUp() {
    const btn = document.getElementById('dhikr-tap-btn');
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const el = document.createElement('div');
    el.textContent = '+1';
    el.style.cssText = `position:fixed;left:${rect.left+rect.width/2}px;top:${rect.top}px;font-size:1.5rem;font-weight:800;color:var(--color-accent-gold);pointer-events:none;z-index:999;animation:floatUp 0.8s ease forwards;`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 900);
  },

  onTargetReached() {
    Utils.confetti();
    Utils.toast(`✨ ${this.current.latin} — Target reached! MashaAllah!`, 'success', 4000);
    this.count = 0;
    setTimeout(() => this.renderCounter(), 200);
    this.renderSessionHistory();
  },

  onRoundComplete() {
    Utils.toast(`Round ${Math.floor(this.count / this.current.target)} complete! 🏆`, 'info');
    this.renderSessionHistory();
  },

  bindKeyboard() {
    document.addEventListener('keydown', e => {
      if (e.code === 'Space' && document.getElementById('section-dhikr')?.classList.contains('active')) {
        e.preventDefault();
        this.tap();
      }
    });
  },

  renderSessionHistory() {
    const el = document.getElementById('dhikr-session-history');
    if (!el) return;
    const today = DB.getDhikr(Utils.todayStr());
    const entries = Object.entries(today);
    if (!entries.length) { el.innerHTML = '<div class="empty-state"><div class="empty-icon">📿</div><p>No dhikr logged today yet</p></div>'; return; }
    el.innerHTML = entries.map(([id, cnt]) => {
      const preset = this.getAllPresets().find(p => p.id === id) || { latin: id, target: 33 };
      const pct = Math.min(100, Math.round((cnt / preset.target) * 100));
      return `
        <div class="card card-sm flex items-center justify-between" style="margin-bottom:var(--space-2)">
          <div>
            <div style="font-weight:600">${preset.latin}</div>
            <div style="font-size:var(--text-xs);color:var(--color-text-muted)">${cnt} / ${preset.target}</div>
          </div>
          <div style="width:80px;text-align:right">
            <div class="progress-bar" style="margin-bottom:4px"><div class="progress-fill progress-fill-gold" style="width:${pct}%"></div></div>
            <div style="font-size:10px;color:var(--color-text-muted)">${pct}%</div>
          </div>
        </div>
      `;
    }).join('');
  },

  showAddModal() {
    const m = document.getElementById('dhikr-add-modal');
    if (m) m.classList.remove('hidden');
  },

  hideAddModal() {
    const m = document.getElementById('dhikr-add-modal');
    if (m) m.classList.add('hidden');
  },

  saveCustom() {
    const arabic = document.getElementById('custom-arabic')?.value || '';
    const latin  = document.getElementById('custom-latin')?.value;
    const target = parseInt(document.getElementById('custom-target')?.value) || 33;
    if (!latin) { Utils.toast('Name is required', 'error'); return; }
    const preset = { id: Utils.uid(), arabic, latin, meaning:'', target, category:'general' };
    const presets = DB.getDhikrPresets();
    presets.push(preset);
    DB.setDhikrPresets(presets);
    this.hideAddModal();
    this.renderPresetGrid();
    Utils.toast('Custom dhikr added!', 'success');
  },

  reset() {
    if (confirm('Reset today\'s count for this dhikr?')) {
      this.count = 0;
      const today = Utils.todayStr();
      const dhikr = DB.getDhikr(today);
      dhikr[this.currentId] = 0;
      DB.setDhikr(today, dhikr);
      this.renderCounter();
      this.renderSessionHistory();
    }
  }
};

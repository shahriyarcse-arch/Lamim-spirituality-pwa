/* =============================================
   LAMIM — DHIKR MODULE (Infinite & Bilingual)
   ============================================= */

// Cache migration: ensure sparkle/confetti exist even if stale utils.js served
if (!Utils.sparkle) Utils.sparkle = function() {};
if (!Utils.confetti) Utils.confetti = function() {};

// Basic SVG Icons to replace emojis
const Icons = {
  sparkles: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>',
  heart: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
  kaaba: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4z"/><path d="M4 8h16"/><path d="M12 8v12"/></svg>',
  hands: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>',
  moon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>',
  star: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  water: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>',
  circle: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>',
  tasbeeh: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/><circle cx="12" cy="2" r="2"/></svg>'
};

const Dhikr = {
  presets: [
    { id: 'subhanallah', arabic: 'سُبْحَانَ اللَّهِ', latin: 'SubhanAllah', meaning: 'Glory be to Allah', category: 'general', icon: Icons.sparkles },
    { id: 'alhamdulillah', arabic: 'الْحَمْدُ لِلَّهِ', latin: 'Alhamdulillah', meaning: 'All praise is due to Allah', category: 'general', icon: Icons.heart },
    { id: 'allhuakbar', arabic: 'اللَّهُ أَكْبَرُ', latin: 'AllhuAkbar', meaning: 'Allah is the Greatest', category: 'general', icon: Icons.kaaba },
    { id: 'la-ilaha', arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ', latin: 'La ilaha illallah', meaning: 'There is no god but Allah', category: 'general', icon: Icons.circle },
    { id: 'astghfirullah', arabic: 'أَسْتَغْفِرُ اللَّهَ', latin: 'Astghfirullah', meaning: 'I seek forgiveness of Allah', category: 'morning', icon: Icons.hands },
    { id: 'salawat', arabic: 'صَلَّى اللَّهُ عَلَيْهِ وَسَلَّমَ', latin: 'Allahumma Salli', meaning: "Prayers upon the Prophet", category: 'general', icon: Icons.star },
    { id: 'hasbunallah', arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', latin: 'Hasbunallah', meaning: 'Allah is Sufficient for us', category: 'morning', icon: Icons.water },
    { id: 'ya-hayyu', arabic: 'يَا حَيُّ يَا قَيُّومُ', latin: 'Ya Hayyu Ya Qayyum', meaning: 'O Ever-Living, O Sustainer', category: 'evening', icon: Icons.moon },
    { id: 'subhanallahi-wabihamdihi', arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', latin: 'SubhanAllahi Wabihamdihi', meaning: 'Glory and praise be to Allah', category: 'after-prayer', icon: Icons.sparkles },
    { id: 'la-hawla', arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', latin: 'La Hawla Wala Quwwata', meaning: 'There is no power except with Allah', category: 'general', icon: Icons.circle },
  ],

  hadith: {
    en: "The Messenger of Allah (ﷺ) said: “I met Ibrahim on the night of my ascent... inform them that Paradise has pure soil and delicious water, and that it is a flat treeless plain, and that its seeds are: Subḥān Allāh, Al-ḥamdulillāh, Lā ilāha illallāh, and Allāhu Akbar.”",
    bn: "রাসুল (সা.) বলেছেন: মিরাজের রাতে আমি ইবরাহিম (আ.)-এর সাথে সাক্ষাৎ করি। তিনি বললেন: ‘হে মুহাম্মদ! আমার পক্ষ থেকে তোমার উম্মতকে সালাম দাও এবং তাদেরকে জানাও— জান্নাতের মাটি অত্যন্ত উত্তম, পানি অত্যন্ত মিষ্টি, এবং তা সমতল ভূমি। আর এর গাছ রোপণ করা হয় এই শব্দগুলো দিয়ে: সুবহানাল্লাহ, আলহামদুলিল্লাহ, লা ইলাহা ইল্লাল্লাহ, আল্লাহু আকবার।’"
  },

  currentId: 'subhanallah',
  count: 0,

  // Track language fallback if App.lang isn't ready
  escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  },

  getLang() {
    return window.App && App.lang ? App.lang : (DB.rawGet('lamim_lang') || 'en');
  },

  get current() { return this.getAllPresets().find(p => p.id === this.currentId) || this.presets[0]; },

  getAllPresets() {
    return [...this.presets, ...DB.getDhikrPresets()];
  },

  init() {
    // Sync count from DB for today instantly
    this.count = DB.getDhikr(Utils.todayStr())[this.currentId] || 0;

    this.renderMarquee();
    this.renderHero();
    this.renderPresetRow();
    this.renderSessionHistory();

    // Listen for local data updates
    if (!this.dataUpdateBound) {
      window.addEventListener('lamim:data-updated', () => {
        if (document.getElementById('section-dhikr')?.classList.contains('active')) {
          const freshCount = DB.getDhikr(Utils.todayStr())[this.currentId] || 0;
          // Only re-render if count actually changed (to avoid interrupting active tapping)
          if (freshCount !== this.count) {
            this.count = freshCount;
            this.renderHero();
            this.renderSessionHistory();
          }
        }
      });
      this.dataUpdateBound = true;
    }

    if (!this.initialized) {
      this.bindKeyboard();
      this.initialized = true;
    }
  },

  renderMarquee() {
    const els = document.querySelectorAll('.dhikr-hadith-text');
    els.forEach(el => {
      el.textContent = this.hadith[this.getLang()] + " • ";
    });
  },

  getSuggestedDhikr() {
    if (typeof Analysis === 'undefined') return null;
    const shs = Analysis.calculateSHS();
    if (!shs) return null;
    const { breakdown } = shs;
    const weakest = Object.entries(breakdown).sort((a, b) => a[1] - b[1])[0];
    if (!weakest) return null;
    const map = {
      salah: { preset: 'astghfirullah', hint: 'Strengthen your Salah with Istighfar' },
      nafl: { preset: 'ya-hayyu', hint: 'Boost your Nafl with Ya Hayyu Ya Qayyum' },
      dhikr: { preset: 'subhanallah', hint: 'Keep going! SubhanAllah fills the scales' },
      mujahid: { preset: 'hasbunallah', hint: 'For your jihad: Hasbunallah wa ni\'mal Wakil' },
      consistency: { preset: 'alhamdulillah', hint: 'Build consistency with Alhamdulillah' }
    };
    return map[weakest[0]] || null;
  },

  renderPresetRow() {
    const grid = document.getElementById('dhikr-grid');
    if (!grid) return;
    const presets = this.getAllPresets();

    // Smart suggestion
    const sug = this.getSuggestedDhikr();
    const sugEl = document.getElementById('dhikr-suggestion');
    if (sugEl && sug) {
      const isActive = this.currentId === sug.preset;
      sugEl.innerHTML = `
        <div class="dhikr-suggestion-badge" style="${isActive ? 'opacity:0.5' : ''}">
          <span>💡</span>
          <span>${sug.hint}</span>
          ${!isActive ? `<button class="dhikr-suggestion-apply" onclick="Dhikr.selectDhikr('${sug.preset}')">Try</button>` : ''}
        </div>
      `;
    } else if (sugEl) {
      sugEl.innerHTML = '';
    }

    grid.innerHTML = presets.map((p, i) => `
      <div class="dhikr-preset-card anim-fade-in-up ${p.id === this.currentId ? 'active' : ''}" style="animation-delay:${i * 0.04}s" onclick="Dhikr.selectDhikr('${p.id}')">
        <div class="dhikr-preset-icon">${p.icon || ''}</div>
        ${p.arabic ? `<div class="dhikr-preset-arabic">${p.arabic}</div>` : ''}
        <div class="dhikr-preset-name">${this.escapeHtml(p.latin)}</div>
      </div>
    `).join('') + `
      <div class="dhikr-preset-card anim-fade-in-up" style="animation-delay:${presets.length * 0.04}s;border-style:dashed" onclick="Dhikr.showAddModal()">
        <div class="dhikr-preset-icon" style="font-size:18px; color:var(--color-text-muted)">+</div>
        <div class="dhikr-preset-name" style="font-size:10px; -webkit-text-fill-color:var(--color-text-muted); color:var(--color-text-muted)">Custom</div>
      </div>
    `;
  },

  renderHero() {
    const d = this.current;
    const countEl = document.getElementById('dhikr-tap-count');
    const infoEl = document.getElementById('dhikr-current-info');
    const beadsEl = document.getElementById('dhikr-beads-container');

    if (countEl) countEl.textContent = this.count;

    if (infoEl) {
      const currentName = infoEl.querySelector('.latin-name');
      if (!currentName || currentName.textContent !== d.latin) {
        infoEl.innerHTML = `
          <div class="latin-name">${d.latin}</div>
          <div class="meaning">${d.meaning}</div>
        `;
      }
    }

    // Render infinite looping beads (33 per loop) efficiently
    if (beadsEl) {
      const loopSize = 33;
      const lit = this.count % loopSize;

      if (beadsEl.children.length === loopSize) {
        Array.from(beadsEl.children).forEach((bead, i) => {
          if (i < lit) bead.classList.add('lit');
          else bead.classList.remove('lit');
        });
      } else {
        beadsEl.innerHTML = Array.from({ length: loopSize }, (_, i) =>
          `<div class="bead ${i < lit ? 'lit' : ''}" style="animation-delay: ${i * 0.015}s"></div>`
        ).join('');
      }
    }
  },

  selectDhikr(id) {
    this.currentId = id;
    this.count = DB.getDhikr(Utils.todayStr())[id] || 0;
    this.renderHero();
    this.renderPresetRow();
  },

  tap() {
    this.count++;
    this.saveInstantly();

    // Sparkle
    const btn = document.getElementById('dhikr-tap-btn');
    if (btn) Utils.sparkle(btn, 4);

    // Haptic
    if (navigator.vibrate) navigator.vibrate(25);

    // Animate tap ripple
    const ripple = document.getElementById('tap-ripple');
    if (ripple) {
      // Re-trigger animation
      ripple.classList.remove('animate-ripple');
      void ripple.offsetWidth; // trigger reflow
      ripple.classList.add('animate-ripple');
    }

    // Animate number softly
    const countEl = document.getElementById('dhikr-tap-count');
    if (countEl) {
      countEl.style.transform = 'scale(1.1)';
      setTimeout(() => countEl.style.transform = 'scale(1)', 150);
    }

    // Float up
    this.floatUp();

    // Update UI
    this.renderHero();
    this.renderSessionHistory();
  },

  undo() {
    if (this.count > 0) {
      this.count--;
      this.saveInstantly();
      this.renderHero();
      this.renderSessionHistory();
    }
  },

  reset() {
    const isBn = this.getLang() === 'bn';
    Utils.confirm(
      isBn ? 'কাউন্ট রিসেট করুন' : 'Reset Count',
      isBn ? 'কাউন্ট জিরো (0) করতে চান?' : 'Reset current count to zero?',
      () => {
        this.count = 0;
        this.saveInstantly();
        this.renderHero();
        this.renderSessionHistory();
        Utils.toast(isBn ? 'কাউন্ট রিসেট করা হয়েছে' : 'Count reset successfully', 'success');
      },
      'warning'
    );
  },

  saveInstantly() {
    const today = Utils.todayStr();
    const dhikr = DB.getDhikr(today);
    dhikr[this.currentId] = this.count;
    DB.setDhikr(today, dhikr);
    window.dispatchEvent(new CustomEvent('lamim:data-updated'));
  },

  floatUp() {
    const btn = document.getElementById('dhikr-tap-btn');
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const el = document.createElement('div');
    el.innerHTML = this.current.icon || Icons.sparkles;
    el.style.cssText = `position:fixed;left:${rect.left + rect.width / 2 - 14}px;top:${rect.top - 10}px;pointer-events:none;z-index:9999;animation:dhikrFloatUp 0.7s ease forwards;filter:drop-shadow(0 0 10px rgba(234,179,8,0.9));color:var(--color-accent-gold);`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 750);
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

    // Filter out zero counts
    const entries = Object.entries(today).filter(([_, cnt]) => cnt > 0);

    if (!entries.length) {
      el.innerHTML = `<div class="dhikr-empty-state anim-fade-in">
        <div class="dhikr-empty-orb">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/><circle cx="12" cy="2" r="2"/></svg>
        </div>
        <p class="dhikr-empty-text">${this.getLang() === 'bn' ? 'যিকির শুরু করুন' : 'Your spiritual logs for today will appear here'}</p>
      </div>`;
      return;
    }

    // If grid doesn't exist, render it fully
    let grid = el.querySelector('.dhikr-session-grid');
    if (!grid) {
      el.innerHTML = '<div class="dhikr-session-grid"></div>';
      grid = el.querySelector('.dhikr-session-grid');
    }

    // Update or append items
    entries.forEach(([id, cnt]) => {
      const itemEl = document.getElementById(`session-item-${id}`);
      if (itemEl) {
        // Just update the count text
        const countEl = document.getElementById(`session-count-${id}`);
        if (countEl && countEl.textContent !== cnt.toString()) {
          countEl.textContent = cnt;
          countEl.style.transform = 'scale(1.1)';

          if (countEl.timeoutId) clearTimeout(countEl.timeoutId);
          countEl.timeoutId = setTimeout(() => {
            countEl.style.transform = 'scale(1)';
          }, 100);
        }
      } else {
        // Item doesn't exist yet, append it
        const preset = this.getAllPresets().find(p => p.id === id) || { latin: id, icon: Icons.tasbeeh };
        const temp = document.createElement('div');
        temp.innerHTML = `
          <div class="dhikr-session-item anim-fade-in" id="session-item-${id}">
            <div class="ds-icon">${preset.icon}</div>
            <div class="ds-info">
              <div class="ds-name">${this.escapeHtml(preset.latin)}</div>
              <div class="ds-count" id="session-count-${id}" style="transition: all 0.15s ease; display: inline-block;">${cnt}</div>
            </div>
          </div>
        `;
        grid.appendChild(temp.firstElementChild);
      }
    });

    // Remove any items that are in the DOM but no longer in the entries list (e.g. reset to 0)
    const validIds = entries.map(([id]) => `session-item-${id}`);
    Array.from(grid.children).forEach(child => {
      if (!validIds.includes(child.id)) {
        grid.removeChild(child);
      }
    });
  },

  showHistoryModal() {
    const el = document.getElementById('dhikr-history-modal');
    const body = document.getElementById('dhikr-history-modal-body');
    if (!el || !body) return;

    // Aggregate all lamim_dhikr_YYYY-MM-DD keys from localStorage
    const dbData = {};
    const allKeys = DB.keys();
    for (let i = 0; i < allKeys.length; i++) {
      const key = allKeys[i];
      if (key && key.startsWith('lamim_dhikr_') && key !== 'lamim_dhikr_presets') {
        const dateStr = key.replace('lamim_dhikr_', '');
        try {
          dbData[dateStr] = JSON.parse(DB.rawGet(key));
        } catch (e) { }
      }
    }

    // Sort dates descending
    const dates = Object.keys(dbData).sort((a, b) => new Date(b) - new Date(a));

    if (dates.length === 0) {
      body.innerHTML = `<div class="empty-state" style="padding:var(--space-6)">
        <div class="empty-icon" style="font-size:2rem; color:var(--color-text-muted); margin-bottom: 10px;">🕒</div>
        <p>${this.getLang() === 'bn' ? 'কোনো ইতিহাস নেই' : 'No history found'}</p>
      </div>`;
    } else {
      let html = '';
      dates.forEach(date => {
        const dayData = dbData[date];
        const entries = Object.entries(dayData).filter(([_, c]) => c > 0);
        if (entries.length === 0) return;

        let totalDayCount = entries.reduce((sum, [_, c]) => sum + c, 0);

        // Format date string nicely
        let displayDate = date;
        if (date === Utils.todayStr()) {
          displayDate = this.getLang() === 'bn' ? 'আজ' : 'Today';
        } else {
          const d = new Date(date);
          displayDate = d.toLocaleDateString(this.getLang() === 'bn' ? 'bn-BD' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }

        html += `
          <div class="dhikr-history-card">
            <div class="dhikr-history-header">
              <span class="dhikr-history-date">${displayDate}</span>
              <span class="dhikr-history-total">${this.getLang() === 'bn' ? 'মোট:' : 'Total:'} ${totalDayCount}</span>
            </div>
            <div class="dhikr-history-list">
        `;

        entries.forEach(([id, cnt]) => {
          const preset = this.getAllPresets().find(p => p.id === id) || { latin: id, icon: Icons.tasbeeh };
          html += `
            <div class="dhikr-history-item">
              <div class="dhikr-history-item-left">
                <span class="dhikr-history-item-icon">${preset.icon}</span>
                <span class="dhikr-history-item-name">${this.escapeHtml(preset.latin)}</span>
              </div>
              <span class="dhikr-history-item-count">${cnt}</span>
            </div>
          `;
        });

        html += `</div></div>`;
      });
      body.innerHTML = html;
    }

    el.classList.remove('hidden');
  },

  showAddModal() {
    Utils.openModal(document.getElementById('dhikr-add-modal'));
  },

  hideAddModal() {
    Utils.closeModal(document.getElementById('dhikr-add-modal'));
  },

  saveCustom() {
    const latin = document.getElementById('custom-latin')?.value;
    const target = document.getElementById('custom-target')?.value || '33';
    if (!latin) { Utils.toast('Name is required', 'error'); return; }
    const preset = { id: Utils.uid(), latin, meaning: `${this.getLang() === 'bn' ? 'লক্ষ্য: ' : 'Target: '}${target}`, category: 'general', icon: Icons.tasbeeh };
    const presets = DB.getDhikrPresets();
    presets.push(preset);
    DB.setDhikrPresets(presets);
    window.dispatchEvent(new CustomEvent('lamim:data-updated'));
    this.hideAddModal();
    this.renderPresetRow();
    Utils.toast('Custom dhikr added!', 'success');
  },

  resetToday() {
    UI.showSettingsModal({
      title: 'Reset Today\'s Dhikr?',
      desc: 'This will clear all your dhikr sessions and counts for today.',
      confirmText: 'Yes, Clear All',
      type: 'danger',
      onConfirm: () => {
        const today = Utils.todayStr();
        DB.remove('lamim_dhikr_' + today);
        window.dispatchEvent(new CustomEvent('lamim:data-updated'));
        this.init();
        Utils.toast('Dhikr data cleared', 'info');
      }
    });
  }
};
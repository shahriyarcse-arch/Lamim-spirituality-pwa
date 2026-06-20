// Cache migration: ensure sparkle/confetti exist even if stale utils.js served
if (!Utils.sparkle) Utils.sparkle = function() {};
if (!Utils.confetti) Utils.confetti = function() {};

const DuaBoard = {
  _key: 'lamim_duas',

  getAll() {
    return DB.get(this._key) || [];
  },

  save(duas) {
    DB.set(this._key, duas);
  },

  add(text) {
    const duas = this.getAll();
    duas.unshift({
      id: Utils.uid(),
      text: text.trim(),
      date: Utils.todayStr(),
      answered: false,
      answeredDate: null
    });
    this.save(duas);
    window.dispatchEvent(new CustomEvent('lamim:data-updated'));
  },

  markAnswered(id) {
    const duas = this.getAll();
    const dua = duas.find(d => d.id === id);
    if (dua) {
      dua.answered = true;
      dua.answeredDate = Utils.todayStr();
      this.save(duas);
      Utils.confetti(16);
      window.dispatchEvent(new CustomEvent('lamim:data-updated'));
      Utils.toast('Dua answered! Alhamdulillah! 🤲✨', 'success');
    }
  },

  unmarkAnswered(id) {
    const duas = this.getAll();
    const dua = duas.find(d => d.id === id);
    if (dua) {
      dua.answered = false;
      dua.answeredDate = null;
      this.save(duas);
      window.dispatchEvent(new CustomEvent('lamim:data-updated'));
    }
  },

  remove(id) {
    const duas = this.getAll();
    const filtered = duas.filter(d => d.id !== id);
    this.save(filtered);
    window.dispatchEvent(new CustomEvent('lamim:data-updated'));
  },

  getActiveCount() {
    return this.getAll().filter(d => !d.answered).length;
  },

  getAnsweredCount() {
    return this.getAll().filter(d => d.answered).length;
  },

  showModal() {
    if (!document.getElementById('dua-modal')) return;
    Utils.openModal(document.getElementById('dua-modal'));
    this.renderList();
  },

  hideModal() {
    Utils.closeModal(document.getElementById('dua-modal'));
  },

  renderList() {
    const list = document.getElementById('dua-list');
    if (!list) return;
    const duas = this.getAll();

    list.innerHTML = duas.map(d => `
      <div class="dua-item ${d.answered ? 'answered' : ''}">
        <div class="dua-item-left">
          <div class="dua-status-icon" onclick="DuaBoard.${d.answered ? 'unmarkAnswered' : 'markAnswered'}('${d.id}')">
            ${d.answered 
              ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
              : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>'}
          </div>
          <div class="dua-item-content">
            <div class="dua-item-text">${Utils.escapeHTML(d.text)}</div>
            <div class="dua-item-meta">
              <span>${Utils.formatDate(new Date(d.date + 'T00:00:00'), { month: 'short', day: 'numeric' })}</span>
              ${d.answered ? `<span class="dua-answered-badge"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Answered ${d.answeredDate ? Utils.formatDate(new Date(d.answeredDate + 'T00:00:00'), { month: 'short', day: 'numeric' }) : ''}</span>` : ''}
            </div>
          </div>
        </div>
        <button class="dua-delete-btn" onclick="DuaBoard.remove('${d.id}')" title="Remove">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
    `).join('') || '<div class="dua-empty"><div class="dua-empty-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg></div><p>No duas yet. Add your first prayer request!</p></div>';
  },

  handleAdd() {
    const input = document.getElementById('dua-input');
    const text = input?.value.trim();
    if (!text) { Utils.toast('Please write your dua', 'warning'); return; }
    this.add(text);
    input.value = '';
    this.renderList();
    Utils.toast('Dua saved! May Allah accept it 🤲', 'success');
  }
};

// Setup live sync for DuaBoard modal
window.addEventListener('lamim:data-updated', () => {
  const modal = document.getElementById('dua-modal');
  if (modal && !modal.classList.contains('hidden')) {
    DuaBoard.renderList();
  }
});

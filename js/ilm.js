/* =============================================
   LAMIM — ILM MODULE (Knowledge & Library)
   ============================================= */
const Ilm = {
  duas: [
    { id: 'dua_sleep', title: 'Before Sleeping', arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', meaning: 'In Your name, O Allah, I die and I live.' },
    { id: 'dua_wake', title: 'Upon Waking Up', arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ', meaning: 'All praise is for Allah who gave us life after having taken it from us and unto Him is the resurrection.' },
    { id: 'dua_eat', title: 'Before Eating', arabic: 'بِسْمِ اللَّهِ', meaning: 'In the name of Allah.' },
    { id: 'dua_leave_home', title: 'Leaving Home', arabic: 'بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', meaning: 'In the name of Allah, I place my trust in Allah, and there is no might nor power except with Allah.' },
  ],

  init() {
    this.renderLibrary();
    this.renderNotes();
  },

  renderLibrary() {
    const data = DB.getIlm();
    const container = document.getElementById('ilm-library');
    if (!container) return;

    container.innerHTML = `
      <div class="card mb-4">
        <div class="card-header"><div class="card-title">📖 Essential Du'as (Hisnul Muslim)</div></div>
        <div class="flex-col gap-3">
          ${this.duas.map(d => {
            const isLearned = data.memorized_duas.includes(d.id);
            return `
              <div class="card card-sm hover-lift" style="background:var(--color-bg-secondary)">
                <div class="flex justify-between items-start mb-2">
                  <div class="font-bold">${d.title}</div>
                  <label class="checkbox-wrap">
                    <input type="checkbox" ${isLearned ? 'checked' : ''} onchange="Ilm.toggleDua('${d.id}')"> Learned
                  </label>
                </div>
                <div class="font-arabic text-xl mb-1 text-right text-gold">${d.arabic}</div>
                <div class="text-xs text-muted font-italic">${d.meaning}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  toggleDua(id) {
    const data = DB.getIlm();
    if (data.memorized_duas.includes(id)) {
      data.memorized_duas = data.memorized_duas.filter(x => x !== id);
    } else {
      data.memorized_duas.push(id);
      Utils.toast('MashaAllah! Du\'a memorized.', 'success');
    }
    DB.setIlm(data);
  },

  renderNotes() {
    const data = DB.getIlm();
    const container = document.getElementById('ilm-notes');
    if (!container) return;

    container.innerHTML = `
      <div class="flex justify-between items-center mb-3">
        <div class="card-title">📝 Lecture Notes & Questions</div>
        <button class="btn btn-sm btn-gold" onclick="Ilm.addNote()">+ Add</button>
      </div>
      <div class="flex-col gap-3">
        ${data.notes.length === 0 ? '<div class="text-sm text-muted text-center py-4">No notes yet. Start learning!</div>' : ''}
        ${data.notes.map(n => `
          <div class="card card-sm relative">
            <button class="btn btn-icon btn-sm" style="position:absolute;top:8px;right:8px" onclick="Ilm.deleteNote('${n.id}')">✕</button>
            <div class="font-bold text-sm mb-1">${n.title}</div>
            <div class="text-sm text-secondary whitespace-pre-wrap">${n.content}</div>
          </div>
        `).join('')}
      </div>
    `;
  },

  addNote() {
    const title = prompt('Title/Topic (e.g., Friday Khutbah):');
    if (!title) return;
    const content = prompt('Enter your notes/questions:');
    if (!content) return;

    const data = DB.getIlm();
    data.notes.push({ id: Utils.uid(), title, content });
    DB.setIlm(data);
    this.renderNotes();
  },

  deleteNote(id) {
    if(!confirm('Delete this note?')) return;
    const data = DB.getIlm();
    data.notes = data.notes.filter(n => n.id !== id);
    DB.setIlm(data);
    this.renderNotes();
  }
};

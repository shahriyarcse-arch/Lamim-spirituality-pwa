/* =============================================
   LAMIM — GOALS MODULE
   ============================================= */
const Goals = {
  categories: [
    { id:'salah',    label:'🕋 Salah',   color:'var(--color-accent-primary)' },
    { id:'dhikr',    label:'📿 Dhikr',   color:'var(--color-accent-gold)' },
    { id:'quran',    label:'📖 Quran',   color:'var(--color-accent-green)' },
    { id:'charity',  label:'💝 Charity', color:'var(--color-accent-purple)' },
    { id:'learning', label:'📚 Learning',color:'var(--color-accent-teal)' },
    { id:'other',    label:'🎯 Other',   color:'var(--color-text-secondary)' },
  ],

  init() {
    this.renderGoals();
    this.renderStats();
  },

  renderGoals(filter = 'active') {
    const container = document.getElementById('goals-list');
    if (!container) return;
    let goals = DB.getGoals();
    if (filter === 'active')    goals = goals.filter(g => !g.completed && !g.archived);
    if (filter === 'completed') goals = goals.filter(g => g.completed);
    if (filter === 'archived')  goals = goals.filter(g => g.archived);

    if (!goals.length) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">🎯</div><h3>No goals yet</h3><p>Set your first spiritual goal!</p><button class="btn btn-gold mt-4" onclick="Goals.showAddModal()">➕ Add Goal</button></div>`;
      return;
    }
    container.innerHTML = goals.map(g => this.renderGoalCard(g)).join('');
  },

  renderGoalCard(g) {
    const pct  = Math.min(100, Math.round((g.progress / g.target) * 100));
    const cat  = this.categories.find(c => c.id === g.category) || this.categories[5];
    const dead = g.deadline ? this.daysLeft(g.deadline) : null;
    const priorityColor = { high:'var(--color-accent-red)', medium:'var(--color-accent-amber)', low:'var(--color-accent-green)' }[g.priority] || 'var(--color-text-muted)';
    return `
      <div class="goal-card ${g.completed ? 'completed' : ''} anim-fade-in-up hover-lift" id="goal-${g.id}">
        <div class="goal-header">
          <div>
            <div class="flex items-center gap-2">
              <span class="priority-dot" style="background:${priorityColor}"></span>
              <span class="goal-title">${g.title}</span>
              ${g.completed ? '<span class="badge badge-green">✅ Done</span>' : ''}
            </div>
            <div class="goal-category">${cat.label} · ${g.category}</div>
            ${g.description ? `<div style="font-size:var(--text-sm);color:var(--color-text-muted);margin-top:4px">${g.description}</div>` : ''}
          </div>
          <div class="flex gap-1">
            <button class="btn btn-ghost btn-icon-sm" onclick="Goals.editGoal('${g.id}')" title="Edit">✏️</button>
            <button class="btn btn-ghost btn-icon-sm" onclick="Goals.deleteGoal('${g.id}')" title="Delete">🗑️</button>
          </div>
        </div>
        <div class="goal-progress-wrap">
          <div class="goal-progress-label">
            <span>Progress: ${g.progress} / ${g.target} ${g.unit || ''}</span>
            <span style="font-weight:600;color:${cat.color}">${pct}%</span>
          </div>
          <div class="progress-bar"><div class="progress-fill" style="width:${pct}%;background:${cat.color}"></div></div>
        </div>
        ${g.milestones?.length ? `<div style="margin-bottom:var(--space-3)">${g.milestones.map(m=>`<label style="display:flex;align-items:center;gap:8px;font-size:var(--text-sm);color:var(--color-text-secondary);cursor:pointer;margin-bottom:4px"><input type="checkbox" ${m.done?'checked':''} style="accent-color:var(--color-accent-primary)" onchange="Goals.toggleMilestone('${g.id}','${m.id}')"><span style="${m.done?'text-decoration:line-through;opacity:0.5':''}">${m.label}</span></label>`).join('')}</div>` : ''}
        <div class="goal-footer">
          <div class="goal-deadline">
            ${dead !== null ? `⏰ ${dead >= 0 ? dead + ' days left' : Math.abs(dead) + ' days overdue'}` : ''}
            ${g.recurring ? `<span class="badge badge-blue" style="margin-left:8px">🔄 ${g.recurring}</span>` : ''}
          </div>
          <div class="flex gap-2">
            ${!g.completed ? `
              <button class="btn btn-sm btn-secondary" onclick="Goals.addProgress('${g.id}')">+ Log Progress</button>
              ${pct >= 100 ? `<button class="btn btn-sm btn-success" onclick="Goals.completeGoal('${g.id}')">✅ Complete</button>` : ''}
            ` : `<button class="btn btn-sm btn-ghost" onclick="Goals.archiveGoal('${g.id}')">📦 Archive</button>`}
          </div>
        </div>
      </div>
    `;
  },

  daysLeft(deadline) {
    const diff = new Date(deadline) - new Date();
    return Math.ceil(diff / 86400000);
  },

  renderStats() {
    const el = document.getElementById('goals-stats');
    if (!el) return;
    const goals = DB.getGoals();
    const total     = goals.length;
    const completed = goals.filter(g => g.completed).length;
    const active    = goals.filter(g => !g.completed && !g.archived).length;
    const rate      = total ? Math.round((completed / total) * 100) : 0;
    el.innerHTML = `
      <div class="stat-box"><div class="stat-box-val">${active}</div><div class="stat-box-label">Active</div></div>
      <div class="stat-box"><div class="stat-box-val">${completed}</div><div class="stat-box-label">Completed</div></div>
      <div class="stat-box"><div class="stat-box-val">${rate}%</div><div class="stat-box-label">Success Rate</div></div>
    `;
  },

  showAddModal(editId = null) {
    const m = document.getElementById('goal-modal');
    if (!m) return;
    const g = editId ? DB.getGoals().find(x => x.id === editId) : null;
    document.getElementById('goal-modal-title').textContent = g ? 'Edit Goal' : 'New Goal';
    document.getElementById('goal-id-field').value   = g?.id || '';
    document.getElementById('goal-title-field').value = g?.title || '';
    document.getElementById('goal-desc-field').value  = g?.description || '';
    document.getElementById('goal-target-field').value = g?.target || 1;
    document.getElementById('goal-unit-field').value  = g?.unit || '';
    document.getElementById('goal-deadline-field').value = g?.deadline || '';
    document.getElementById('goal-category-field').value = g?.category || 'salah';
    document.getElementById('goal-priority-field').value  = g?.priority || 'medium';
    document.getElementById('goal-recurring-field').value = g?.recurring || '';
    document.getElementById('goal-milestone-field').value = g?.milestones?.map(m=>m.label).join('\n') || '';
    m.classList.remove('hidden');
  },

  hideModal() { document.getElementById('goal-modal')?.classList.add('hidden'); },

  saveGoal() {
    const id    = document.getElementById('goal-id-field').value;
    const title = document.getElementById('goal-title-field').value.trim();
    if (!title) { Utils.toast('Title is required', 'error'); return; }
    const rawMilestones = document.getElementById('goal-milestone-field')?.value || '';
    const milestones = rawMilestones.trim() ? rawMilestones.split('\n').filter(Boolean).map(l => ({ id: Utils.uid(), label: l.trim(), done: false })) : [];
    const goal = {
      id:          id || Utils.uid(),
      title,
      description: document.getElementById('goal-desc-field').value,
      target:      parseInt(document.getElementById('goal-target-field').value) || 1,
      unit:        document.getElementById('goal-unit-field').value,
      progress:    id ? (DB.getGoals().find(g => g.id === id)?.progress || 0) : 0,
      deadline:    document.getElementById('goal-deadline-field').value,
      category:    document.getElementById('goal-category-field').value,
      priority:    document.getElementById('goal-priority-field').value,
      recurring:   document.getElementById('goal-recurring-field').value,
      milestones,
      completed:   false, archived: false,
      createdAt:   new Date().toISOString(),
    };
    if (id) { DB.updateGoal(id, goal); Utils.toast('Goal updated!', 'success'); }
    else    { DB.addGoal(goal); Utils.toast('Goal created! 🎯', 'success'); }
    this.hideModal();
    this.renderGoals();
    this.renderStats();
  },

  addProgress(id) {
    const val = prompt('Log progress (enter amount):');
    if (!val || isNaN(val)) return;
    const goals = DB.getGoals();
    const g = goals.find(x => x.id === id);
    if (!g) return;
    g.progress = Math.min(g.target, (g.progress || 0) + parseFloat(val));
    DB.updateGoal(id, g);
    this.renderGoals();
    if (g.progress >= g.target) Utils.toast('🏆 Goal target reached!', 'success');
    else Utils.toast(`Progress logged: ${g.progress}/${g.target}`, 'info');
  },

  completeGoal(id) {
    DB.updateGoal(id, { completed: true, completedAt: new Date().toISOString() });
    Utils.confetti();
    Utils.toast('🎉 Congratulations! Goal completed!', 'success', 4000);
    this.renderGoals();
    this.renderStats();
  },

  archiveGoal(id) {
    DB.updateGoal(id, { archived: true });
    Utils.toast('Goal archived', 'info');
    this.renderGoals();
    this.renderStats();
  },

  deleteGoal(id) {
    if (!confirm('Delete this goal?')) return;
    DB.deleteGoal(id);
    Utils.toast('Goal deleted', 'info');
    this.renderGoals();
    this.renderStats();
  },

  editGoal(id) { this.showAddModal(id); },

  toggleMilestone(goalId, milestoneId) {
    const goals = DB.getGoals();
    const g = goals.find(x => x.id === goalId);
    if (!g) return;
    const m = g.milestones?.find(m => m.id === milestoneId);
    if (m) m.done = !m.done;
    DB.updateGoal(goalId, g);
  },

  filterGoals(filter, btn) {
    document.querySelectorAll('#goals-filter-tabs .tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    this.renderGoals(filter);
  }
};

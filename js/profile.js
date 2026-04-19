/* =============================================
   LAMIM — PROFILE MODULE
   ============================================= */
const Profile = {
  init() {
    this.renderProfile();
    this.renderSettings();
    this.bindAvatarUpload();
  },

  renderProfile() {
    const user = DB.getUser();
    if (!user) return;
    const initials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
    const el = document.getElementById('profile-hero');
    if (!el) return;
    el.innerHTML = `
      <div class="profile-avatar-wrap">
        ${user.avatar
          ? `<img src="${user.avatar}" class="profile-avatar" alt="Avatar">`
          : `<div class="profile-avatar">${initials}</div>`}
        <label class="avatar-edit-btn" for="avatar-upload" title="Change photo">✏️</label>
        <input type="file" id="avatar-upload" accept="image/*" class="hidden" onchange="Profile.handleAvatarUpload(event)">
      </div>
      <div class="profile-name">${user.name}</div>
      <div class="profile-email">${user.email}</div>
      <div class="flex justify-center gap-3 mt-4">
        <div class="streak-badge"><span class="fire">🌱</span>${DB.getSalahStreak().consistency} day streak</div>
        <div class="badge badge-gold">⭐ ${user.madhab || 'Hanafi'}</div>
      </div>
    `;
  },

  renderSettings() {
    const settings = DB.getSettings();
    const user = DB.getUser();

    // Personal info
    const pi = document.getElementById('profile-personal-info');
    if (pi) pi.innerHTML = `
      <div class="settings-item" onclick="Profile.editField('name')">
        <div class="settings-item-left"><div class="settings-item-icon">👤</div><div><div class="settings-item-label">Name</div></div></div>
        <div class="settings-item-right"><span>${user?.name || '—'}</span><span>›</span></div>
      </div>
      <div class="settings-item" onclick="Profile.editField('email')">
        <div class="settings-item-left"><div class="settings-item-icon">📧</div><div><div class="settings-item-label">Email</div></div></div>
        <div class="settings-item-right"><span>${user?.email || '—'}</span><span>›</span></div>
      </div>
      <div class="settings-item" onclick="Profile.editField('location')">
        <div class="settings-item-left"><div class="settings-item-icon">📍</div><div><div class="settings-item-label">Location</div></div></div>
        <div class="settings-item-right"><span>${user?.location || 'Not set'}</span><span>›</span></div>
      </div>
    `;

    // Prayer settings
    const ps = document.getElementById('profile-prayer-settings');
    if (ps) ps.innerHTML = `
      <div class="settings-item">
        <div class="settings-item-left"><div class="settings-item-icon">🕌</div><div><div class="settings-item-label">Madhab</div></div></div>
        <div class="settings-item-right">
          <select class="input" style="width:auto;padding:4px 8px;font-size:var(--text-sm)" onchange="Profile.saveSetting('madhab',this.value)">
            ${['Hanafi','Shafi\'i','Maliki','Hanbali'].map(m => `<option ${settings.madhab===m?'selected':''}>${m}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="settings-item">
        <div class="settings-item-left"><div class="settings-item-icon">🌐</div><div><div class="settings-item-label">Calc Method</div></div></div>
        <div class="settings-item-right">
          <select class="input" style="width:auto;padding:4px 8px;font-size:var(--text-sm)" onchange="Profile.saveSetting('calcMethod',this.value)">
            ${['MWL','ISNA','Egypt','Makkah','Karachi'].map(m => `<option ${settings.calcMethod===m?'selected':''}>${m}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="settings-item" onclick="Profile.toggleNotifications()">
        <div class="settings-item-left"><div class="settings-item-icon">🔔</div><div><div class="settings-item-label">Prayer Notifications</div></div></div>
        <div class="settings-item-right"><div class="toggle ${settings.notifications?'active':''}"></div></div>
      </div>
    `;

    // App settings
    const as = document.getElementById('profile-app-settings');
    if (as) as.innerHTML = `
      <div class="settings-item" onclick="Profile.toggleTheme()">
        <div class="settings-item-left"><div class="settings-item-icon">${settings.theme==='dark'?'🌙':'☀️'}</div><div><div class="settings-item-label">Theme</div></div></div>
        <div class="settings-item-right"><span>${settings.theme==='dark'?'Dark':'Light'}</span><div class="toggle ${settings.theme==='dark'?'active':''}"></div></div>
      </div>
      <div class="settings-item" onclick="Profile.exportData()">
        <div class="settings-item-left"><div class="settings-item-icon">📤</div><div><div class="settings-item-label">Export Data</div></div></div>
        <div class="settings-item-right"><span>JSON Backup</span><span>›</span></div>
      </div>
      <div class="settings-item" onclick="Profile.importData()">
        <div class="settings-item-left"><div class="settings-item-icon">📥</div><div><div class="settings-item-label">Import Data</div></div></div>
        <div class="settings-item-right"><span>›</span></div>
      </div>
      <div class="settings-item" onclick="Profile.exportSalahCSV()">
        <div class="settings-item-left"><div class="settings-item-icon">📊</div><div><div class="settings-item-label">Export Salah Log</div></div></div>
        <div class="settings-item-right"><span>CSV</span><span>›</span></div>
      </div>
    `;

    // Danger zone
    const dz = document.getElementById('profile-danger');
    if (dz) dz.innerHTML = `
      <div class="settings-item" onclick="Auth.logout()">
        <div class="settings-item-left"><div class="settings-item-icon" style="background:rgba(248,81,73,0.1)">🚪</div><div><div class="settings-item-label" style="color:var(--color-accent-red)">Logout</div></div></div>
        <div class="settings-item-right"><span>›</span></div>
      </div>
      <div class="settings-item" onclick="Profile.deleteAccount()">
        <div class="settings-item-left"><div class="settings-item-icon" style="background:rgba(248,81,73,0.1)">⚠️</div><div><div class="settings-item-label" style="color:var(--color-accent-red)">Delete Account</div></div></div>
        <div class="settings-item-right"><span>›</span></div>
      </div>
    `;

    // About
    const ab = document.getElementById('profile-about');
    if (ab) ab.innerHTML = `
      <div class="settings-item">
        <div class="settings-item-left"><div class="settings-item-icon">📱</div><div><div class="settings-item-label">App Version</div></div></div>
        <div class="settings-item-right"><span class="badge badge-blue">v1.0.0</span></div>
      </div>
      <div class="settings-item" onclick="window.open('https://example.com/privacy','_blank')">
        <div class="settings-item-left"><div class="settings-item-icon">🔒</div><div><div class="settings-item-label">Privacy Policy</div></div></div>
        <div class="settings-item-right"><span>›</span></div>
      </div>
    `;
  },

  handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const user = DB.getUser();
      if (user) { user.avatar = evt.target.result; DB.setUser(user); this.renderProfile(); Utils.toast('Profile photo updated!', 'success'); }
    };
    reader.readAsDataURL(file);
  },

  bindAvatarUpload() {
    // already bound via HTML onchange
  },

  editField(field) {
    const user = DB.getUser();
    if (!user) return;
    const labels = { name:'Your Name', email:'Email Address', location:'Your City/Location' };
    const val = prompt(`Edit ${labels[field] || field}:`, user[field] || '');
    if (val === null) return;
    user[field] = val.trim();
    DB.setUser(user);
    this.renderProfile();
    this.renderSettings();
    Utils.toast(labels[field] + ' updated!', 'success');
  },

  saveSetting(key, val) {
    const s = DB.getSettings();
    s[key] = val;
    DB.setSettings(s);
    const user = DB.getUser();
    if (user && key === 'madhab') { user.madhab = val; DB.setUser(user); }
    Utils.toast('Setting saved', 'success');
  },

  toggleTheme() {
    const s = DB.getSettings();
    s.theme = s.theme === 'dark' ? 'light' : 'dark';
    DB.setSettings(s);
    document.documentElement.setAttribute('data-theme', s.theme);
    this.renderSettings();
    Utils.toast('Theme changed to ' + s.theme + ' mode', 'info');
  },

  toggleNotifications() {
    const s = DB.getSettings();
    s.notifications = !s.notifications;
    DB.setSettings(s);
    if (s.notifications && 'Notification' in window) {
      Notification.requestPermission().then(p => { if (p === 'granted') Utils.toast('Notifications enabled 🔔', 'success'); });
    }
    this.renderSettings();
  },

  exportData() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k.startsWith('lamim_')) data[k] = localStorage.getItem(k);
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `lamim_backup_${Utils.todayStr()}.json`; a.click();
    Utils.toast('Data exported!', 'success');
  },

  importData() {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = e => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = evt => {
        try {
          const data = JSON.parse(evt.target.result);
          Object.entries(data).forEach(([k, v]) => { if (k.startsWith('lamim_')) localStorage.setItem(k, v); });
          Utils.toast('Data imported! Refreshing…', 'success');
          setTimeout(() => location.reload(), 1000);
        } catch { Utils.toast('Invalid backup file', 'error'); }
      };
      reader.readAsText(file);
    };
    input.click();
  },

  exportSalahCSV() { Salah.exportCSV(); },

  deleteAccount() {
    if (!confirm('Are you SURE? This will delete ALL your data permanently!')) return;
    if (!confirm('This cannot be undone. Delete everything?')) return;
    localStorage.clear();
    Utils.toast('Account deleted. Goodbye 👋', 'info');
    setTimeout(() => App.showPage('login'), 1000);
  }
};

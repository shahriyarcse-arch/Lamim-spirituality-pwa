/* =============================================
   LAMIM — PROFILE MODULE
   ============================================= */
const Profile = {
  init() {
    this.renderProfile();
    this.renderSettings();
  },

  renderProfile() {
    const user = DB.getUser();
    if (!user) return;
    const initials = (user.name || '').trim().split(/\s+/).map(n => Array.from(n)[0] || '').join('').substring(0, 2).toUpperCase() || '?';
    const el = document.getElementById('profile-hero');
    if (!el) return;
    const pIcons = {
      consistency: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22V15C12 15 16 14 18 10C20 6 18 2 18 2C18 2 14 4 12 8C10 12 12 15 12 15Z" fill="url(#sproutGrad)" fill-opacity="0.3" stroke="url(#sproutGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 15C12 15 8 14 6 10C4 6 6 2 6 2C6 2 10 4 12 8C14 12 12 15 12 15Z" fill="url(#sproutGrad)" fill-opacity="0.3" stroke="url(#sproutGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><defs><linearGradient id="sproutGrad" x1="6" y1="2" x2="18" y2="22" gradientUnits="userSpaceOnUse"><stop stop-color="#34D399"/><stop offset="1" stop-color="#10B981"/></linearGradient></defs></svg>`,
      perfect: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="url(#starGrad)" fill-opacity="0.3" stroke="url(#starGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><defs><linearGradient id="starGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse"><stop stop-color="#FBBF24"/><stop offset="1" stop-color="#F59E0B"/></linearGradient></defs></svg>`,
      moon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" fill="url(#moonGrad)" fill-opacity="0.3" stroke="url(#moonGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><defs><linearGradient id="moonGrad" x1="3" y1="3" x2="21" y2="12" gradientUnits="userSpaceOnUse"><stop stop-color="#818CF8"/><stop offset="1" stop-color="#6366F1"/></linearGradient></defs></svg>`
    };
    const streak = DB.getSalahStreak();

    el.innerHTML = `
      <div class="profile-avatar-wrap">
        ${user.avatar
          ? `<img src="${Utils.escapeHTML(user.avatar)}" class="profile-avatar" alt="Avatar" data-fallback="${Utils.escapeHTML(initials)}" onerror="this.outerHTML='<div class=\'profile-avatar\'>'+this.dataset.fallback+'</div>'">`
          : `<div class="profile-avatar">${Utils.escapeHTML(initials)}</div>`}
        <label class="avatar-edit-btn" for="avatar-upload" title="Change photo">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
        </label>
        <input type="file" id="avatar-upload" accept="image/*" class="hidden" onchange="Profile.handleAvatarUpload(event)">
        ${user.avatar ? `
          <button class="avatar-remove-btn" onclick="Profile.removeAvatar()" title="Remove photo">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"></path></svg>
          </button>
        ` : ''}
      </div>
      <div class="profile-name" id="prof-display-name"></div>
      <div class="profile-bio" id="prof-display-bio"></div>
      ${user.createdAt ? `<div class="profile-joined">Warrior since ${new Date(user.createdAt).toLocaleDateString('en-US', {month:'long', year:'numeric'})}</div>` : ''}

      <div class="profile-stats">
        <div class="streak-badge active streak-perfect" style="background:rgba(255,214,10,0.1); border-color:rgba(255,214,10,0.3); color:var(--color-accent-gold);" title="Your Lamim Spiritual Score (LSS)">
          <span class="badge-icon">⚡</span>${user.spirit_level || 'Ghafil'} · ${Math.round(user.spirit_score || 0)} Power
        </div>
        <div class="streak-badge ${streak.consistency > 0 ? 'active' : ''} streak-consistency" title="Consecutive days with 4+ prayers logged">
          <span class="badge-icon">${pIcons.consistency}</span>${streak.consistency}d Consistent
        </div>
        ${streak.perfect > 0 ? `
        <div class="streak-badge active streak-perfect" title="Consecutive days with all 5 prayers logged">
          <span class="badge-icon">${pIcons.perfect}</span>${streak.perfect}d Perfect
        </div>
        ` : ''}
      </div>
    `;

    // Inject text safely to prevent XSS
    const nameEl = document.getElementById('prof-display-name');
    const bioEl = document.getElementById('prof-display-bio');
    if (nameEl) nameEl.textContent = user.name || 'Anonymous';
    if (bioEl) bioEl.textContent = user.bio || '';
  },

  renderSettings() {
    const settings = DB.getSettings();
    const user = DB.getUser();

    const icons = {
      user: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
      mail: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m2 4 10 8 10-8"></path></svg>',
      users: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
      pen: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>',
      calendar: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
      mosque: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>',
      bell: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>',
      globe: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>',
      dollar: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>',
      moon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>',
      sun: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>',

      logout: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>',
      trash: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>',
      info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
      shield: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
      refresh: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>',
      lock: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>'
    };

    // Personal Info
    const pi = document.getElementById('profile-personal-info');
    if (pi) pi.innerHTML = `
      <div class="settings-item" onclick="Profile.editField('name')">
        <div class="settings-item-left"><div class="settings-item-icon ic-blue">${icons.user}</div><div><div class="settings-item-label" data-i18n="Name">Name</div><div class="settings-item-value">${Utils.escapeHTML(user?.name || '—')}</div></div></div>
        <div class="settings-item-right"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></div>
      </div>
      <div class="settings-item" style="cursor:default">
        <div class="settings-item-left"><div class="settings-item-icon ic-violet">${icons.users}</div><div><div class="settings-item-label" data-i18n="Gender">Gender</div></div></div>
        <div class="settings-item-right">
          <div class="lang-toggle-pill">
            <button class="${user?.gender==='male'?'active':''}" onclick="Profile.updateGender('male')">M</button>
            <button class="${user?.gender==='female'?'active':''}" onclick="Profile.updateGender('female')">F</button>
          </div>
        </div>
      </div>
      <div class="settings-item" onclick="Profile.editField('bio')">
        <div class="settings-item-left"><div class="settings-item-icon ic-teal">${icons.pen}</div><div><div class="settings-item-label">Bio / Status</div><div class="settings-item-value">${Utils.escapeHTML(user?.bio || 'Not set')}</div></div></div>
        <div class="settings-item-right"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></div>
      </div>
      <div class="settings-item" onclick="Profile.editField('dob')">
        <div class="settings-item-left"><div class="settings-item-icon ic-orange">${icons.calendar}</div><div><div class="settings-item-label">Date of Birth</div><div class="settings-item-value">${(() => {
          if (!user?.dob) return 'Not set';
          const d = new Date(user.dob);
          if (isNaN(d.getTime())) return 'Not set';
          const age = Math.floor((new Date() - d) / (1000 * 60 * 60 * 24 * 365.25));
          return age + ' years old';
        })()}</div></div></div>
        <div class="settings-item-right">
          <div class="dob-pill">${(() => { if (!user?.dob) return '<span class="dob-seg dob-placeholder">DD</span><span class="dob-sep">/</span><span class="dob-seg dob-placeholder">MM</span><span class="dob-sep">/</span><span class="dob-seg dob-placeholder">YYYY</span>'; const d = new Date(user.dob); if (isNaN(d.getTime())) return '<span class="dob-seg dob-placeholder">DD</span><span class="dob-sep">/</span><span class="dob-seg dob-placeholder">MM</span><span class="dob-sep">/</span><span class="dob-seg dob-placeholder">YYYY</span>'; return `<span class="dob-seg">${String(d.getDate()).padStart(2,'0')}</span><span class="dob-sep">/</span><span class="dob-seg">${String(d.getMonth()+1).padStart(2,'0')}</span><span class="dob-sep">/</span><span class="dob-seg">${d.getFullYear()}</span>`; })()}</div>
        </div>
      </div>
    `;

    // Prayer settings
    const ps = document.getElementById('profile-prayer-settings');
    if (ps) ps.innerHTML = `
      <div class="settings-item" onclick="Profile.toggleJumuahMode()">
        <div class="settings-item-left"><div class="settings-item-icon ic-violet">${icons.mosque}</div><div><div class="settings-item-label">Jumu'ah Mode</div><div class="settings-item-value">Show Jumu'ah on Fridays</div></div></div>
        <div class="settings-item-right"><div class="toggle ${settings.jumuahMode?'active':''}"></div></div>
      </div>
      <div class="settings-item" onclick="Profile.toggleNotifications()">
        <div class="settings-item-left"><div class="settings-item-icon ic-amber">${icons.bell}</div><div><div class="settings-item-label">Prayer Notifications</div><div class="settings-item-value">Alerts for next waqt</div></div></div>
        <div class="settings-item-right"><div class="toggle ${settings.notifications?'active':''}"></div></div>
      </div>
    `;

    // App settings
    const as = document.getElementById('profile-app-settings');
    if (as) as.innerHTML = `
      <div class="settings-item" style="cursor:default">
        <div class="settings-item-left"><div class="settings-item-icon ic-sky">${icons.globe}</div><div><div class="settings-item-label" data-i18n="Language / ভাষা">Language / ভাষা</div></div></div>
        <div class="settings-item-right">
          <div class="lang-toggle-pill">
            <button class="${App.lang==='en'?'active':''}" onclick="App.setLang('en')">EN</button>
            <button class="${App.lang==='bn'?'active':''}" onclick="App.setLang('bn')">বাং</button>
          </div>
        </div>
      </div>
      <div class="settings-item" style="cursor:default">
        <div class="settings-item-left"><div class="settings-item-icon ic-lime">${icons.dollar}</div><div><div class="settings-item-label">Currency</div></div></div>
        <div class="settings-item-right">
          <select class="input" onchange="Profile.saveSetting('currency',this.value)">
            <option value="USD" ${settings.currency==='USD'?'selected':''}>USD ($)</option>
            <option value="BDT" ${settings.currency==='BDT'?'selected':''}>BDT (৳)</option>
          </select>
        </div>
      </div>
      <div class="settings-item" onclick="Profile.detectLocation(event)">
        <div class="settings-item-left"><div class="settings-item-icon ic-teal">${icons.globe}</div><div><div class="settings-item-label">Detect Location</div><div class="settings-item-value">${settings.locationName || (settings.lat ? settings.lat.toFixed(2) + ', ' + settings.lng.toFixed(2) : 'Not set')}</div></div></div>
        <div class="settings-item-right"><span>↻</span></div>
      </div>
      <div class="settings-item" style="cursor:default">
        <div class="settings-item-left"><div class="settings-item-icon ic-slate">${settings.theme==='dark'?icons.moon:icons.sun}</div><div><div class="settings-item-label" data-i18n="Theme">Theme</div></div></div>
        <div class="settings-item-right">
          <div class="lang-toggle-pill">
            <button class="${settings.theme==='light'?'active':''}" onclick="Profile.setTheme('light')">Light</button>
            <button class="${settings.theme==='dark'?'active':''}" onclick="Profile.setTheme('dark')">Dark</button>
          </div>
        </div>
      </div>
    `;

    // Danger
    const dg = document.getElementById('profile-danger');
    if (dg) dg.innerHTML = `
      <div class="settings-item" onclick="Auth.logout()">
        <div class="settings-item-left"><div class="settings-item-icon ic-red">${icons.logout}</div><div><div class="settings-item-label" style="color:var(--color-accent-red)" data-i18n="Logout">Logout</div></div></div>
        <div class="settings-item-right"><span>›</span></div>
      </div>
      <div class="settings-item" onclick="Profile.deleteAccount()">
        <div class="settings-item-left"><div class="settings-item-icon ic-red">${icons.trash}</div><div><div class="settings-item-label" style="color:var(--color-accent-red)" data-i18n="Delete Account">Wipe Data</div></div></div>
        <div class="settings-item-right"><span>›</span></div>
      </div>
      <div class="settings-item" onclick="Profile.fullReset()">
        <div class="settings-item-left"><div class="settings-item-icon ic-orange">${icons.refresh}</div><div><div class="settings-item-label" style="color:#f97316" data-i18n="Hard Reset App">Hard Reset App</div><div class="settings-item-value">Clear cache & all data</div></div></div>
        <div class="settings-item-right"><span>›</span></div>
      </div>
    `;
    
    // About
    const ab = document.getElementById('profile-about');
    if (ab) ab.innerHTML = `
      <div class="settings-item" onclick="Profile.showAppInfo()">
        <div class="settings-item-left"><div class="settings-item-icon ic-slate">${icons.info}</div><div><div class="settings-item-label" data-i18n="App Version">App Version</div><div class="settings-item-value">Tap to see app info</div></div></div>
        <div class="settings-item-right"><span>v4.0.0</span><span>›</span></div>
      </div>
    `;
  },



  editField(field) {
    const user = DB.getUser();
    if (!user) return;
    const labels = { name: 'Your Name', bio: 'Bio / Status', dob: 'Date of Birth' };
    this._editingField = field;
    const modal = document.getElementById('profile-edit-modal');
    const title = document.getElementById('profile-edit-title');
    const label = document.getElementById('profile-edit-label');
    const input = document.getElementById('profile-edit-input');
    title.textContent = 'Edit ' + (labels[field] || field);
    label.textContent = labels[field] || field;
    if (field === 'dob') {
      input.type = 'date';
      input.value = user.dob || '';
      input.placeholder = '';
    } else {
      input.type = 'text';
      input.value = user[field] || '';
      input.placeholder = 'Enter ' + (labels[field] || field).toLowerCase();
    }
    input.style.display = 'block';
    Utils.openModal(modal);
    setTimeout(() => input.focus(), 100);
    
    // Usability: Press Enter to save, Escape to cancel
    input.onkeydown = (e) => { 
      if (e.key === 'Enter') this.saveEditModal(); 
      if (e.key === 'Escape') this.closeEditModal();
    };
  },

  saveEditModal() {
    const user = DB.getUser();
    if (!user || !this._editingField) return;
    if (this._editingField === '__info__') {
      this.closeEditModal();
      return;
    }
    const input = document.getElementById('profile-edit-input');
    // Sanitize: Trim and replace multiple spaces with a single space
    const val = input.value.trim().replace(/\s+/g, ' ');
    
    if (this._editingField === 'name' && !val) {
      Utils.toast('This field cannot be empty', 'error');
      return;
    }
    
    // Validation: Name length
    if (this._editingField === 'name') {
      if (val.length < 2 || val.length > 50) {
        Utils.toast('Name must be between 2 and 50 characters', 'error');
        return;
      }
    }
    
    // Validation: Bio length
    if (this._editingField === 'bio') {
      if (val.length > 150) {
        Utils.toast('Bio cannot exceed 150 characters', 'error');
        return;
      }
    }
    
    // Validation: Date of Birth
    if (this._editingField === 'dob' && val) {
      const selectedDate = new Date(val);
      
      if (isNaN(selectedDate.getTime())) {
        Utils.toast('Please enter a valid date', 'error');
        return;
      }
      
      const today = new Date();
      const minDate = new Date();
      minDate.setFullYear(today.getFullYear() - 120); // Max 120 years old
      
      if (selectedDate > today) {
        Utils.toast('Date of birth cannot be in the future', 'error');
        return;
      }
      if (selectedDate < minDate) {
        Utils.toast('Please enter a valid date of birth', 'error');
        return;
      }
    }
    const labels = { name: 'Your Name', bio: 'Bio / Status', dob: 'Date of Birth' };
    user[this._editingField] = val;
    DB.setUser(user);
    this.closeEditModal();
    this.renderProfile();
    this.renderSettings();
    if (typeof App !== 'undefined') App.updateAvatars();
    Utils.toast((labels[this._editingField] || this._editingField) + ' updated!', 'success');
    
    this._editingField = null;
  },

  closeEditModal() {
    const input = document.getElementById('profile-edit-input');
    Utils.closeModal(document.getElementById('profile-edit-modal'));
    input.type = 'text';
    input.style.display = 'block';
    this._editingField = null;
  },



  updateGender(val) {
    if (val !== 'male' && val !== 'female') return;
    const user = DB.getUser();
    if (!user) return;
    user.gender = val;
    DB.setUser(user);
    this.renderProfile();
    this.renderSettings();
    Utils.toast('Gender updated!', 'success');
  },

  saveSetting(key, val) {
    const s = DB.getSettings();
    s[key] = val;
    DB.setSettings(s);
    
    const user = DB.getUser();
    if (user && key === 'madhab') { user.madhab = val; DB.setUser(user); }
    
    // Re-render settings UI
    Profile.renderSettings();
    
    // If it's a critical app setting, notify App
    if (key === 'currency') this.renderSettings();
  },

  toggleTheme() {
    const s = DB.getSettings();
    const next = s.theme === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
    const sun = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
    const moon = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
    const icon = next === 'dark' ? moon : sun;
    document.querySelectorAll('#theme-icon-top, #theme-icon-section').forEach(el => el.innerHTML = icon);
  },

  setTheme(theme) {
    if (theme !== 'light' && theme !== 'dark') return;
    const s = DB.getSettings();
    if (s.theme === theme) return;
    s.theme = theme;
    DB.setSettings(s);
    document.documentElement.setAttribute('data-theme', theme);
    this.renderSettings();
  },

  toggleNotifications() {
    if (!('Notification' in window)) {
      Utils.toast('Notifications are not supported on this device', 'error');
      return;
    }
    const s = DB.getSettings();
    s.notifications = !s.notifications;
    DB.setSettings(s);
    if (s.notifications && 'Notification' in window) {
      Notification.requestPermission().then(p => { 
        if (p === 'granted') {
          Utils.toast('Notifications enabled 🔔', 'success'); 
          if (typeof PrayerNotifier !== 'undefined') PrayerNotifier.init();
        }
      });
    } else {
      if (typeof PrayerNotifier !== 'undefined') PrayerNotifier.stop();
    }
    this.renderSettings();
  },

  toggleJumuahMode() {
    const s = DB.getSettings();
    s.jumuahMode = s.jumuahMode === undefined ? true : !s.jumuahMode;
    DB.setSettings(s);
    this.renderSettings();
  },





  showAppInfo() {
    const totalKeys = DB.keys().filter(k => k.startsWith('lamim_')).length;
    let storageBytes = 0;
    for (let i = 0; i < DB.keys().length; i++) {
      const k = DB.keys()[i];
      if (k.startsWith('lamim_')) storageBytes += (DB.rawGet(k)?.length || 0) * 2;
    }
    const storageMB = (storageBytes / 1024 / 1024).toFixed(2);
    const user = DB.getUser();
    const createdDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown';

    const modal = document.getElementById('profile-edit-modal');
    const title = document.getElementById('profile-edit-title');
    const label = document.getElementById('profile-edit-label');
    const input = document.getElementById('profile-edit-input');
    title.textContent = 'App Info';
    label.innerHTML = `
      <div style="font-size:14px;line-height:1.8;color:var(--color-text-secondary)">
        <div><strong>App Name:</strong> Lamim Spirituality</div>
        <div><strong>Version:</strong> 4.0.0 "Sovereign"</div>
        <div><strong>Account Created:</strong> ${createdDate}</div>
        <div><strong>Data Entries:</strong> ${totalKeys} keys</div>
        <div><strong>Storage Used:</strong> ${storageMB} MB</div>
        <div><strong>Platform:</strong> Standalone Offline PWA</div>
        <div><strong>Developer:</strong> Shamim Shahriyar</div>
      </div>
    `;
    input.style.display = 'none';
    Utils.openModal(modal);
    this._editingField = '__info__';
  },

  deleteAccount() {
    Utils.confirm(
      'Wipe All Local Data?', 
      'This will permanently delete all your data from this device. Are you sure?', 
      () => {
        DB.clearAllUserData();
        DB.remove('lamim_user');
        Utils.toast('Local data wiped.', 'success');
        setTimeout(() => App.showPage('setup'), 1000);
      }
    );
  },

  fullReset() {
    Utils.confirm(
      'Hard Reset App?', 
      'This will wipe all data, clear the app cache, and reset everything (useful for fixing issues on iPhone). Are you sure?', 
      async () => {
        // Clear database and local storage
        DB.clear();
        
        // Unregister service workers
        if ('serviceWorker' in navigator) {
          try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (let reg of registrations) {
              await reg.unregister();
            }
          } catch(e) { console.error('SW unregister error', e); }
        }
        
        // Clear caches
        if ('caches' in window) {
          try {
            const keys = await caches.keys();
            for (let key of keys) {
              await caches.delete(key);
            }
          } catch(e) { console.error('Cache delete error', e); }
        }
        
        Utils.toast('App reset successfully! Reloading...', 'success');
        setTimeout(() => window.location.reload(true), 1500);
      }
    );
  },

  exportData() {
    try {
      const data = {};
      const keys = DB.keys();
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (key.startsWith('lamim_')) {
          data[key] = DB.rawGet(key);
        }
      }
      
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lamim_backup_${Utils.todayStr()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      // Reset the backup timer
      const s = DB.getSettings();
      s.lastBackupDate = Utils.todayStr();
      DB.setSettings(s);

      Utils.toast('Data exported successfully!', 'success');
    } catch (e) {
      console.error(e);
      Utils.toast('Failed to export data', 'error');
    }
  },

  importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        Utils.confirm('Restore Data?', 'This will overwrite your current data with the backup file. Continue?', () => {
          let restored = 0;
          for (const key in data) {
            if (key.startsWith('lamim_')) {
              DB.rawSet(key, data[key]);
              restored++;
            }
          }
          if (restored > 0) {
            Utils.toast('Backup restored successfully! Reloading...', 'success');
            setTimeout(() => window.location.reload(), 1500);
          } else {
            Utils.toast('No valid Lamim data found in file', 'error');
          }
        });
      } catch (err) {
        console.error(err);
        Utils.toast('Invalid backup file', 'error');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  },



  // Task 1: Avatar Upload (Local Storage Only)
  removeAvatar() {
    Utils.confirm(
      'Remove Photo',
      'Are you sure you want to remove your profile picture?',
      () => {
        const user = DB.getUser();
        if (!user) return;

        try {
          // 1. Local update
          user.avatar = null;
          DB.setUser(user);
          
          // 2. UI update
          Profile.renderProfile();
          Profile.renderSettings();
          if (typeof App !== 'undefined') App.updateAvatars();
          
          Utils.toast("Profile picture removed", "success");
        } catch (err) {
          console.error("Remove Avatar Error:", err);
          Utils.toast("Failed to remove photo", "error");
        }
      }
    );
  },

  async handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Robustness: File type check
    if (!file.type.startsWith('image/')) {
      Utils.toast('Please select a valid image file (JPG, PNG, etc.)', 'error');
      e.target.value = '';
      return;
    }
    
    // Size limit before compression
    const MAX_MB = 10;
    if (file.size > MAX_MB * 1024 * 1024) {
      Utils.toast(`Image is too large. Please select an image under ${MAX_MB}MB`, 'error');
      e.target.value = '';
      return;
    }

    Utils.toast('Processing image...', 'info');

    // 1. Client-side Image Compression (Safe for localStorage limit)
    const compressImage = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const MAX_DIMENSION = 200; // Optimal for avatars and localStorage

            if (width > height) {
              if (width > MAX_DIMENSION) {
                height *= MAX_DIMENSION / width;
                width = MAX_DIMENSION;
              }
            } else {
              if (height > MAX_DIMENSION) {
                width *= MAX_DIMENSION / height;
                height = MAX_DIMENSION;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Heavy compression to prevent blowing up localStorage
            const dataUrl = canvas.toDataURL('image/jpeg', 0.5); 
            resolve(dataUrl);
          };
          img.onerror = reject;
          img.src = event.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };

    try {
      const dataUrl = await compressImage(file);

      // 2. Final Update Local User
      const updatedUser = DB.getUser();
      if (!updatedUser) return;
      updatedUser.avatar = dataUrl; 
      DB.setUser(updatedUser);
      Profile.renderProfile();
      Profile.renderSettings();
      if (typeof App !== 'undefined') App.updateAvatars();

      Utils.toast('Photo updated!', 'success');
    } catch (err) {
      console.error(err);
      Utils.toast('Failed to process image', 'error');
    } finally {
      e.target.value = ''; // Reset input to allow selecting the same file again
    }
  },


  async detectLocation(e) {
    if (this._isSyncingLocation) return;
    
    if (!navigator.geolocation && !window.fetch) {
      Utils.toast('Location services not supported', 'error');
      return;
    }
    
    this._isSyncingLocation = true;
    Utils.toast('Detecting your location...', 'info');
    
    // Find icons to rotate
    let icons = [];
    if (e && e.currentTarget) {
      icons = e.currentTarget.querySelectorAll('.settings-item-icon, .settings-item-right span');
    } else {
      icons = document.querySelectorAll('.ic-teal, .settings-item-right span');
    }
    icons.forEach(icon => icon.classList.add('rotating'));

    const updateFinalLocation = async (lat, lng, isIP = false) => {
      const settings = DB.getSettings();
      settings.lat = lat;
      settings.lng = lng;

      try {
        const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
        const data = await res.json();
        const city = data.city || data.locality || '';
        const country = data.countryName || '';
        settings.locationName = city && country ? `${city}, ${country}` : (city || country || 'Unknown Location');
      } catch (err) {
        settings.locationName = isIP ? 'Detected via IP' : (lat.toFixed(2) + ', ' + lng.toFixed(2));
      }

      DB.setSettings(settings);
      this.renderSettings();
      if (typeof Home !== 'undefined') Home.render(); 
      
      const successMsg = settings.locationName ? `Location synced: ${settings.locationName}` : 'Location updated successfully!';
      Utils.toast(successMsg, 'success');
      icons.forEach(icon => icon.classList.remove('rotating'));
      this._isSyncingLocation = false;
    };

    // Strategy 1: High-precision Geolocation (GPS/WiFi)
    navigator.geolocation.getCurrentPosition(
      (pos) => updateFinalLocation(pos.coords.latitude, pos.coords.longitude),
      async (err) => {
        console.warn("Geolocation failed, trying IP fallback...", err);
        // Strategy 2: IP-based Fallback (Works better with VPNs on Desktop)
        try {
          const res = await fetch('https://ipapi.co/json/');
          const data = await res.json();
          if (data.latitude && data.longitude) {
            updateFinalLocation(data.latitude, data.longitude, true);
          } else {
            throw new Error("IP Geolocation failed");
          }
        } catch (ipErr) {
          Utils.toast('Location access denied or failed', 'error');
          icons.forEach(icon => icon.classList.remove('rotating'));
        } finally {
          this._isSyncingLocation = false;
        }
      },
      { timeout: 8000 }
    );
  }
};

/* =============================================
   LAMIM — SANCTUM ADMIN DASHBOARD (Production)
   Functional · Responsive · Premium
   ============================================= */
const Admin = {
  state: {
    tab: 'dashboard',
    users: [],
    filtered: [],
    search: '',
    roleFilter: 'all',
    sort: 'newest',
    totalUsers: 0,
    activeToday: 0,
    activeNow: 0,
    admins: 0,
    syncTime: null,
    selectedUser: null,
    page: 0,
    perPage: 12,
    loading: false,
    logs: [],
    showBroadcast: false,
    health: { db: 96, auth: 100, storage: 84, api: 24 }
  },

  async init() {
    const user = DB.getUser();
    if (!user || user.role !== 'admin') {
      Utils.toast('Access Denied', 'error');
      App.showDashboard();
      return;
    }
    this.state.tab = 'dashboard';
    this.state.page = 0;

    // Load cached users instantly (Stale-While-Revalidate pattern)
    try {
      const cachedUsers = DB.get('lamim_admin_cached_users');
      if (cachedUsers && Array.isArray(cachedUsers)) {
        this.state.users = cachedUsers;
        this.state.totalUsers = cachedUsers.length;
        this.state.admins = cachedUsers.filter(u => u.role === 'admin').length;
        this.recalculateActiveToday();
        this.applyFilters(false);
      }
    } catch (e) { /* ignore cache parse error */ }
    
    // Bind Presence Listener
    this.state.onlineUsers = window.Sync ? Array.from(window.Sync.onlineUsers) : [];
    if (this._presenceBound) {
      window.removeEventListener('lamim:presence-updated', this.handlePresenceUpdate);
    }
    this.handlePresenceUpdate = (e) => {
      this.state.onlineUsers = e.detail || [];
      this.recalculateActiveToday();
      this.render();
    };
    window.addEventListener('lamim:presence-updated', this.handlePresenceUpdate);
    this._presenceBound = true;

    this.render();
    await this.loadData();
    this.subscribeRealtime();
  },

  subscribeRealtime() {
    if (!window.supabaseClient) return;
    if (this._realtimeBound) return; // Prevent duplicate subscriptions on re-init
    
    let debounceTimer;
    const handleUpdate = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => this.loadData(), 1500);
    };

    try {
      window.supabaseClient
        .channel('sanctum-admin-profiles') // Unique channel name
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, handleUpdate)
        .subscribe();
      this._realtimeBound = true;
    } catch (e) { /* silent */ }
  },

  async loadData() {
    if (!window.supabaseClient) { this.render(); return; }
    if (this.state.loading) return; // Prevent concurrent requests
    
    this.state.loading = true;
    const startAPI = performance.now();
    try {
      // Optimisation: Fetch only fields required for list rendering, sorting, and role logic.
      // This saves massive network bandwidth and database processing time.
      // True dynamic system health check running in parallel with high limit
      const dbPromise = window.supabaseClient.from('profiles').select('id, name, email, role, updated_at, created_at').limit(10000);
      const authPromise = window.supabaseClient.auth.getUser();
      const storagePromise = window.supabaseClient.storage.listBuckets();
      
      const [dbRes, authRes, storageRes] = await Promise.allSettled([dbPromise, authPromise, storagePromise]);
      const latency = Math.round(performance.now() - startAPI);
      
      const users = dbRes.status === 'fulfilled' ? dbRes.value.data : null;
      const error = dbRes.status === 'fulfilled' ? dbRes.value.error : new Error('Network Error');

      // Real Health metrics calculation
      this.state.health = {
        db: dbRes.status === 'fulfilled' && !dbRes.value.error ? 100 : 0,
        auth: authRes.status === 'fulfilled' && !authRes.value.error ? 100 : 0,
        storage: storageRes.status === 'fulfilled' && (!storageRes.value.error || !storageRes.value.error.message.includes('fetch')) ? 100 : 0,
        api: latency
      };

      if (error) throw error;
      if (users) {
        this.state.users = users.sort((a, b) =>
          new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0)
        );
        this.state.totalUsers = users.length;
        this.state.admins = users.filter(u => u.role === 'admin').length;

        // Security check: If my own admin status was revoked, kick me out instantly
        const me = DB.getUser();
        const myProfile = me ? users.find(u => u.email === me.email) : null;
        if (myProfile && myProfile.role !== 'admin') {
          Utils.toast('Your admin privileges were revoked.', 'error');
          me.role = 'user';
          DB.setUser(me);
          if (window.App && typeof App.showDashboard === 'function') App.showDashboard();
          return;
        }

        // Save fresh data to local cache for next immediate load
        try {
          DB.set('lamim_admin_cached_users', this.state.users);
        } catch (cacheErr) {
          console.warn("Admin cache full, skipping save.", cacheErr);
        }

        // Update open modal data if viewing a user
        if (this.state.selectedUser) {
          this.state.selectedUser = this.state.users.find(u => u.id === this.state.selectedUser.id) || null;
        }

        // Calculate active today (joined, updated within 24h, or online)
        this.recalculateActiveToday();

        this.applyFilters(false); // Do NOT reset page position on background sync
      }
      this.state.syncTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      this.addLog('Data synced successfully', 'success');
    } catch (err) {
      console.error('Admin load error:', err);
      this.addLog('Sync failed: ' + (err.message || 'Unknown'), 'error');
    }
    this.state.loading = false;
    this.render();
  },

  applyFilters(resetPage = false) {
    let list = [...this.state.users];
    const q = this.state.search.toLowerCase().trim();
    if (q) {
      list = list.filter(u =>
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.id || '').toLowerCase().includes(q)
      );
    }
    if (this.state.roleFilter !== 'all') {
      list = list.filter(u => (u.role || 'user') === this.state.roleFilter);
    }
    if (this.state.sort === 'newest') list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    else if (this.state.sort === 'oldest') list.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
    else if (this.state.sort === 'name') list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    this.state.filtered = list;
    
    if (resetPage) {
      this.state.page = 0;
    } else {
      // Ensure we don't get stuck on an empty page if users were deleted
      const maxPage = Math.max(0, Math.ceil(this.state.filtered.length / this.state.perPage) - 1);
      if (this.state.page > maxPage) this.state.page = maxPage;
    }
  },

  recalculateActiveToday() {
    const s = this.state;
    const onlineSet = new Set(s.onlineUsers || []);
    
    // Add current user if not already present
    const me = DB.getUser();
    if (me && me.id) {
      onlineSet.add(me.id);
    }
    
    s.activeToday = onlineSet.size;
  },

  onSearch(val) {
    this.state.search = val;
    this.applyFilters(true);
    this.render();
  },

  onRoleFilter(val) {
    this.state.roleFilter = val;
    this.applyFilters(true);
    this.render();
  },

  onSort(val) {
    this.state.sort = val;
    this.applyFilters(true);
    this.render();
  },

  nextPage() { this.state.page++; this.render(); },
  prevPage() { if (this.state.page > 0) { this.state.page--; this.render(); } },

  switchTab(tab) {
    this.state.tab = tab;
    this.render();
  },

  async toggleRole(userId, currentRole) {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    Utils.confirm(
      'Update User Role',
      `Change this user's role to "${newRole}"?`,
      async () => {
        try {
          const { error } = await window.supabaseClient.from('profiles').update({ role: newRole }).eq('id', userId);
          if (error) throw error;
          Utils.toast('Role updated to ' + newRole, 'success');
          this.addLog(`Role changed to ${newRole}: ${userId.substring(0, 8)}...`, 'warning');
          await this.loadData();
        } catch (e) {
          Utils.toast('Failed to update role', 'error');
        }
      },
      'warning'
    );
  },

  viewUser(userId) {
    this.state.selectedUser = this.state.users.find(u => u.id === userId) || null;
    this.render();
  },

  clearAdminCache() {
    Utils.confirm(
      'Clear Cache',
      'Clear admin panel cache?',
      () => {
        Admin.state.logs = [];
        Admin.state.search = '';
        Admin.state.roleFilter = 'all';
        Admin.state.users = [];
        Admin.state.filtered = [];
        DB.remove('lamim_admin_cached_users'); // Clear persistent cache
        Utils.toast('Cache cleared, syncing fresh data...', 'info');
        Admin.render();
        Admin.loadData();
      },
      'danger'
    );
  },

  closeModal() {
    this.state.selectedUser = null;
    this.render();
  },

  broadcast() {
    this.state.showBroadcast = true;
    this.render();
  },

  async sendBroadcast() {
    const el = document.getElementById('sa-broadcast-input');
    const msg = el ? el.value.trim() : '';
    if (msg) {
      const btn = document.getElementById('sa-btn-broadcast');
      if (btn) { btn.textContent = 'Sending...'; btn.disabled = true; }
      
      try {
        if (!window.supabaseClient) throw new Error("Supabase not connected");
        
        // Push to Supabase
        const { error } = await window.supabaseClient
          .from('app_broadcasts')
          .insert([{ 
            message: msg, 
            admin_email: DB.getUser()?.email || 'admin'
          }]);
          
        if (error) throw error;
        
        Utils.toast('Broadcast sent successfully', 'success');
        this.addLog('Broadcast: ' + msg.substring(0, 30), 'info');
        
        this.state.broadcastText = ''; // Clear saved text on success
        this.state.showBroadcast = false;
        this.render();
      } catch (err) {
        if (btn) { btn.textContent = 'Send Broadcast'; btn.disabled = false; }
        console.error("Broadcast Error:", err);
        Utils.toast('Failed to send broadcast', 'error');
        this.addLog('Broadcast failed', 'error');
      }
    }
  },

  closeBroadcast() {
    this.state.broadcastText = ''; // Clear saved text
    this.state.showBroadcast = false;
    this.render();
  },

  exportCSV() {
    const rows = [['Name', 'Email', 'Role', 'Joined', 'Last Active']];
    
    // Prevent CSV Injection (Excel formula execution vulnerability)
    const sanitizeCSV = (str) => {
      let s = String(str || 'N/A');
      if (/^[=+\-@]/.test(s)) s = "'" + s;
      return s;
    };

    this.state.filtered.forEach(u => {
      rows.push([
        sanitizeCSV(u.name),
        sanitizeCSV(u.email),
        sanitizeCSV(u.role || 'user'),
        u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A',
        u.updated_at ? new Date(u.updated_at).toLocaleDateString() : 'N/A'
      ]);
    });
    const csv = rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
    
    // Prepend UTF-8 BOM (\uFEFF) so Excel correctly renders Arabic, Bengali, and Urdu characters
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `lamim_users_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
    Utils.toast('CSV exported', 'success');
    this.addLog('User data exported as CSV', 'info');
  },

  addLog(action, status) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.state.logs.unshift({ time, action, status });
    if (this.state.logs.length > 15) this.state.logs.pop();
  },

  timeAgo(d) {
    if (!d) return '—';
    const s = (Date.now() - new Date(d).getTime()) / 1000;
    if (s < 0) return 'now';
    if (s < 60) return 'now';
    if (s < 3600) return Math.floor(s / 60) + 'm ago';
    if (s < 86400) return Math.floor(s / 3600) + 'h ago';
    if (s < 604800) return Math.floor(s / 86400) + 'd ago';
    return new Date(d).toLocaleDateString();
  },

  fmtDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  },

  escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  },

  // =================== RENDER ===================
  render() {
    const root = document.getElementById('admin-root');
    if (!root) return;
    const s = this.state;
    
    // 1. Preserve critical DOM states before wiping
    const activeId = document.activeElement ? document.activeElement.id : null;
    const broadcastEl = document.getElementById('sa-broadcast-input');
    if (broadcastEl) s.broadcastText = broadcastEl.value;

    root.innerHTML = `
<div class="sa">
  <div class="sa-orb sa-orb1"></div>
  <div class="sa-orb sa-orb2"></div>

  <!-- Top Bar -->
  <div class="sa-topbar">
    <div class="sa-brand">
      <div class="sa-logo"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></div>
      <div>
        <div class="sa-bname">Sanctum</div>
        <div class="sa-bsub">Admin Console</div>
      </div>
    </div>
    <div class="sa-tright">
      <div class="sa-live"><span class="sa-dot"></span>${s.syncTime || '—'}</div>
      <button class="sa-ibtn ${s.loading ? 'rotating' : ''}" onclick="Admin.loadData()" title="Refresh" ${s.loading ? 'disabled' : ''}>↻</button>
    </div>
  </div>

  <!-- Tab Nav -->
  <div class="sa-tabs">
    <button class="sa-tab ${s.tab === 'dashboard' ? 'on' : ''}" onclick="Admin.switchTab('dashboard')">Overview</button>
    <button class="sa-tab ${s.tab === 'users' ? 'on' : ''}" onclick="Admin.switchTab('users')">Users</button>
    <button class="sa-tab ${s.tab === 'tools' ? 'on' : ''}" onclick="Admin.switchTab('tools')">Tools</button>
    <button class="sa-tab ${s.tab === 'logs' ? 'on' : ''}" onclick="Admin.switchTab('logs')">Logs</button>
  </div>

  <div class="sa-body">
    ${s.tab === 'dashboard' ? this.renderDashboard() : ''}
    ${s.tab === 'users' ? this.renderUsers() : ''}
    ${s.tab === 'tools' ? this.renderTools() : ''}
    ${s.tab === 'logs' ? this.renderLogs() : ''}
  </div>

  ${s.selectedUser ? this.renderUserModal() : ''}
  ${s.showBroadcast ? this.renderBroadcastModal() : ''}
</div>`;

    // Bind search input
    const si = document.getElementById('sa-search');
    if (si) {
      si.value = s.search;
      si.addEventListener('input', e => this.onSearch(e.target.value));
    }
    
    // 2. Restore Focus and Cursor Position
    if (activeId) {
      const activeEl = document.getElementById(activeId);
      if (activeEl) {
        activeEl.focus();
        if (typeof activeEl.setSelectionRange === 'function') {
          const len = activeEl.value.length;
          activeEl.setSelectionRange(len, len);
        }
      }
    }
  },

  renderDashboard() {
    const s = this.state;
    const growth = s.totalUsers > 1 ? '+' + Math.floor((s.activeToday / s.totalUsers) * 100) + '%' : '—';
    return `
    <!-- Stats 2x2 Grid -->
    <div class="sa-stats">
      <div class="sa-sc" style="--ac:#818cf8">
        <div class="sa-sc-top"><span>👥</span><span class="sa-sc-trend">↑</span></div>
        <div class="sa-sv">${s.totalUsers}</div>
        <div class="sa-sl">Total Members</div>
      </div>
      <div class="sa-sc" style="--ac:#34d399">
        <div class="sa-sc-top">
          <span>⚡</span>
          <span class="sa-sc-trend" style="background:rgba(52, 211, 153, 0.15); color:#34d399; font-weight:700; border-radius:12px; padding:2px 8px; font-size:10px; display:inline-flex; align-items:center; gap:4px;">
            <span class="sa-dot" style="margin:0;"></span>
            ${s.activeToday} Live
          </span>
        </div>
        <div class="sa-sv">${s.activeToday}</div>
        <div class="sa-sl">Active Now</div>
      </div>
      <div class="sa-sc" style="--ac:#fbbf24">
        <div class="sa-sc-top"><span>🛡</span><span class="sa-sc-trend">${s.admins}</span></div>
        <div class="sa-sv">${s.admins}</div>
        <div class="sa-sl">Admins</div>
      </div>
      <div class="sa-sc" style="--ac:#f472b6">
        <div class="sa-sc-top"><span>📊</span><span class="sa-sc-trend">${growth}</span></div>
        <div class="sa-sv">${growth}</div>
        <div class="sa-sl">Engagement</div>
      </div>
    </div>

    <!-- Dashboard Grid -->
    <div class="sa-dgrid">
      <!-- Recent Users -->
      <div class="sa-pnl">
        <div class="sa-ph"><h3>Recent Members</h3><span class="sa-cnt">${s.users.length} total</span></div>
        <div class="sa-lst">
          ${s.users.slice(0, 6).map(u => this.renderUserCard(u, true)).join('')}
          ${s.users.length === 0 ? '<div class="sa-empty">No users found</div>' : ''}
        </div>
        <button class="sa-link-btn" onclick="Admin.switchTab('users')">View all members →</button>
      </div>

      <!-- Sidebar -->
      <div class="sa-dsb">
        <div class="sa-pnl">
          ${(() => {
            const health = s.health || { db: 96, auth: 100, storage: 84, api: 24 };
            const isAllOk = health.db > 50 && health.auth > 50;
            const healthStatusText = isAllOk ? 'All Operational' : 'Degraded Performance';
            const healthStatusColor = isAllOk ? '#34d399' : '#ef4444';
            const apiBarWidth = Math.max(10, Math.min(100, Math.round(((1000 - health.api) / 1000) * 100)));
            return `
            <div class="sa-ph"><h3>System Health</h3><span class="sa-cnt" style="color:${healthStatusColor}">● ${healthStatusText}</span></div>
            <div class="sa-hgrid">
              <div class="sa-hcard" style="--hc:#34d399">
                <div class="sa-hcard-top"><span class="sa-hdot"></span><span class="sa-hname">Database</span></div>
                <div class="sa-hval">${health.db}<small>%</small></div>
                <div class="sa-hbar"><div class="sa-hbf" style="width:${health.db}%"></div></div>
              </div>
              <div class="sa-hcard" style="--hc:#22d3ee">
                <div class="sa-hcard-top"><span class="sa-hdot"></span><span class="sa-hname">Auth</span></div>
                <div class="sa-hval">${health.auth}<small>%</small></div>
                <div class="sa-hbar"><div class="sa-hbf" style="width:${health.auth}%"></div></div>
              </div>
              <div class="sa-hcard" style="--hc:#a78bfa">
                <div class="sa-hcard-top"><span class="sa-hdot"></span><span class="sa-hname">Storage</span></div>
                <div class="sa-hval">${health.storage}<small>%</small></div>
                <div class="sa-hbar"><div class="sa-hbf" style="width:${health.storage}%"></div></div>
              </div>
              <div class="sa-hcard" style="--hc:#fbbf24">
                <div class="sa-hcard-top"><span class="sa-hdot"></span><span class="sa-hname">API</span></div>
                <div class="sa-hval">${health.api}<small>ms</small></div>
                <div class="sa-hbar"><div class="sa-hbf" style="width:${apiBarWidth}%"></div></div>
              </div>
            </div>`;
          })()}
        </div>

        <div class="sa-pnl">
          <h3>Quick Actions</h3>
          <div class="sa-qa-grid">
            <button class="sa-qa" onclick="Admin.broadcast()" style="--qc:#a78bfa"><div class="sa-qa-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 14v-3z"></path><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path></svg></div><span>Broadcast</span></button>
            <button class="sa-qa" onclick="Admin.exportCSV()" style="--qc:#34d399"><div class="sa-qa-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg></div><span>Export CSV</span></button>
            <button class="sa-qa" onclick="Admin.switchTab('users')" style="--qc:#60a5fa"><div class="sa-qa-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg></div><span>Users</span></button>
            <button class="sa-qa" onclick="Admin.loadData()" style="--qc:#fbbf24"><div class="sa-qa-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path><path d="M16 21v-5h5"></path></svg></div><span>Sync</span></button>
          </div>
        </div>
      </div>
    </div>`;
  },

  renderUsers() {
    const s = this.state;
    const start = s.page * s.perPage;
    const pageUsers = s.filtered.slice(start, start + s.perPage);
    const totalPages = Math.ceil(s.filtered.length / s.perPage);

    return `
    <!-- Toolbar -->
    <div class="sa-toolbar">
      <input type="text" id="sa-search" class="sa-sinput" placeholder="Search by name or email...">
      <select class="sa-sel" onchange="Admin.onRoleFilter(this.value)">
        <option value="all" ${s.roleFilter === 'all' ? 'selected' : ''}>All Roles</option>
        <option value="admin" ${s.roleFilter === 'admin' ? 'selected' : ''}>Admins</option>
        <option value="user" ${s.roleFilter === 'user' ? 'selected' : ''}>Users</option>
      </select>
      <select class="sa-sel" onchange="Admin.onSort(this.value)">
        <option value="newest" ${s.sort === 'newest' ? 'selected' : ''}>Newest First</option>
        <option value="oldest" ${s.sort === 'oldest' ? 'selected' : ''}>Oldest First</option>
        <option value="name" ${s.sort === 'name' ? 'selected' : ''}>By Name</option>
      </select>
      <button class="sa-expbtn" onclick="Admin.exportCSV()">Export CSV</button>
    </div>
    <div class="sa-rstatus">${s.filtered.length} result${s.filtered.length !== 1 ? 's' : ''} found</div>

    <!-- User List -->
    <div class="sa-pnl sa-up">
      <div class="sa-lst">
        ${pageUsers.map(u => this.renderUserCard(u, false)).join('')}
        ${pageUsers.length === 0 ? '<div class="sa-empty">No users match your search</div>' : ''}
      </div>
    </div>

    <!-- Pagination -->
    ${totalPages > 1 ? `
    <div class="sa-pag">
      <button class="sa-pgbtn" onclick="Admin.prevPage()" ${s.page === 0 ? 'disabled' : ''}>← Prev</button>
      <span class="sa-pginfo">Page ${s.page + 1} of ${totalPages}</span>
      <button class="sa-pgbtn" onclick="Admin.nextPage()" ${s.page >= totalPages - 1 ? 'disabled' : ''}>Next →</button>
    </div>` : ''}`;
  },

  renderUserCard(u, compact) {
    const role = u.role || 'user';
    const isOnline = this.state.onlineUsers && this.state.onlineUsers.includes(u.id);
    const safeName = this.escapeHTML(u.name);
    const safeEmail = this.escapeHTML(u.email);
    return `
    <div class="sa-urow sa-r-${role}-row" onclick="Admin.viewUser('${u.id}')">
      <div class="sa-av" style="position:relative;">
        ${(safeName || safeEmail || '?').charAt(0).toUpperCase()}
        ${isOnline ? `<span class="sa-dot" style="position:absolute; bottom:-1px; right:-1px; width:8px; height:8px; border:2px solid var(--color-bg-primary, #060a14); box-shadow:0 0 6px #34d399;"></span>` : ''}
      </div>
      <div class="sa-umeta">
        <span class="sa-uname">${safeName || 'Anonymous'}</span>
        <span class="sa-uemail">${safeEmail || '—'}</span>
      </div>
      ${!compact ? `<span class="sa-utime">${isOnline ? 'Active now' : this.timeAgo(u.updated_at || u.created_at)}</span>` : ''}
      <span class="sa-role sa-r-${role}">${role}</span>
    </div>`;
  },

  renderTools() {
    return `
    <div class="sa-tgrid">
      <div class="sa-pnl">
        <h3><svg width="18" height="18" style="vertical-align:text-bottom;margin-right:6px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 14v-3z"></path><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path></svg> Broadcast Center</h3>
        <p>Send a spiritual announcement to all community members. Messages appear as in-app notifications.</p>
        <button class="sa-pbtn" onclick="Admin.broadcast()">Compose & Send</button>
      </div>
      <div class="sa-pnl">
        <h3><svg width="18" height="18" style="vertical-align:text-bottom;margin-right:6px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Data Export</h3>
        <p>Download the complete member registry as a CSV spreadsheet for analysis or backup.</p>
        <button class="sa-pbtn" onclick="Admin.exportCSV()">Export Full CSV</button>
      </div>
      <div class="sa-pnl">
        <h3><svg width="18" height="18" style="vertical-align:text-bottom;margin-right:6px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path><path d="M16 21v-5h5"></path></svg> Force Sync</h3>
        <p>Manually trigger a full synchronization with the cloud database to refresh all data.</p>
        <button class="sa-pbtn" onclick="Admin.loadData()" ${this.state.loading ? 'disabled' : ''}>${this.state.loading ? 'Syncing...' : 'Sync Now'}</button>
      </div>
      <div class="sa-pnl">
        <h3><svg width="18" height="18" style="vertical-align:text-bottom;margin-right:6px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg> Cache Management</h3>
        <p>Clear the admin panel's local cache. User data and settings will be preserved.</p>
        <button class="sa-pbtn sa-pbtn-danger" onclick="Admin.clearAdminCache()">Clear Cache</button>
      </div>
      <div class="sa-pnl">
        <h3><svg width="18" height="18" style="vertical-align:text-bottom;margin-right:6px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg> App Overview</h3>
        <div class="sa-info-row"><span>App Version</span><strong>3.1.0</strong></div>
        <div class="sa-info-row"><span>Backend</span><strong>Supabase Cloud</strong></div>
        <div class="sa-info-row"><span>Auth Provider</span><strong>Supabase Auth</strong></div>
        <div class="sa-info-row"><span>Database</span><strong>PostgreSQL</strong></div>
        <div class="sa-info-row"><span>Hosting</span><strong>Edge Network</strong></div>
      </div>
      <div class="sa-pnl">
        <h3><svg width="18" height="18" style="vertical-align:text-bottom;margin-right:6px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg> Security</h3>
        <div class="sa-info-row"><span>Admin Email</span><strong>${DB.getUser()?.email || '—'}</strong></div>
        <div class="sa-info-row"><span>Session Status</span><strong style="color:#34d399">Active</strong></div>
        <div class="sa-info-row"><span>Last Sync</span><strong>${this.state.syncTime || '—'}</strong></div>
        <div class="sa-info-row"><span>Total Admins</span><strong>${this.state.admins}</strong></div>
      </div>
    </div>`;
  },

  renderLogs() {
    return `
    <div class="sa-pnl">
      <div class="sa-ph"><h3>Activity Log</h3><span class="sa-cnt">${this.state.logs.length} entries</span></div>
      <div class="sa-log-list">
        ${this.state.logs.length === 0 ? '<div class="sa-empty">No activity yet. Actions will appear here.</div>' : ''}
        ${this.state.logs.map(l => `
          <div class="sa-log-row">
            <span class="sa-log-dot sa-ld-${l.status}"></span>
            <span class="sa-log-time">${l.time}</span>
            <span class="sa-log-msg">${this.escapeHTML(l.action)}</span>
          </div>
        `).join('')}
      </div>
    </div>`;
  },

  renderUserModal() {
    const u = this.state.selectedUser;
    if (!u) return '';
    const role = u.role || 'user';
    const safeName = this.escapeHTML(u.name);
    const safeEmail = this.escapeHTML(u.email);
    const safeLocation = this.escapeHTML(u.location);
    return `
    <div class="sa-modal-bg" onclick="Admin.closeModal()">
      <div class="sa-modal" onclick="event.stopPropagation()">
        <button class="sa-mclose" onclick="Admin.closeModal()">✕</button>
        <div class="sa-mhead">
          <div class="sa-mav">${(safeName || safeEmail || '?').charAt(0).toUpperCase()}</div>
          <div>
            <div class="sa-mname">${safeName || 'Anonymous'}</div>
            <div class="sa-memail">${safeEmail || '—'}</div>
          </div>
        </div>
        <div class="sa-mdetails">
          <div class="sa-mrow"><span>User ID</span><strong>${u.id}</strong></div>
          <div class="sa-mrow"><span>Role</span><strong><span class="sa-role sa-r-${role}">${role}</span></strong></div>
          <div class="sa-mrow"><span>Joined</span><strong>${this.fmtDate(u.created_at)}</strong></div>
          <div class="sa-mrow"><span>Last Active</span><strong>${this.fmtDate(u.updated_at)}</strong></div>
          ${safeLocation ? `<div class="sa-mrow"><span>Location</span><strong>${safeLocation}</strong></div>` : ''}
          ${u.spirit_score !== undefined ? `<div class="sa-mrow"><span>Spirit Score</span><strong>${u.spirit_score}</strong></div>` : ''}
        </div>
        <div class="sa-mactions">
          <button class="sa-pbtn" onclick="Admin.toggleRole('${u.id}','${role}');Admin.closeModal()">
            ${role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
          </button>
        </div>
      </div>
    </div>`;
  },

  renderBroadcastModal() {
    return `
    <div class="sa-modal-bg" onclick="Admin.closeBroadcast()">
      <div class="sa-modal" onclick="event.stopPropagation()">
        <button class="sa-mclose" onclick="Admin.closeBroadcast()">✕</button>
        <div class="sa-mhead" style="margin-bottom:16px;">
          <div class="sa-mav" style="background: var(--color-surface-nested); color: var(--color-accent-primary); border: 1px solid var(--color-border);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 14v-3z"></path><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path></svg>
          </div>
          <div>
            <div class="sa-mname">Broadcast Message</div>
            <div class="sa-memail">Send notification to all users</div>
          </div>
        </div>
        <div class="sa-mdetails" style="margin-bottom:16px;">
          <textarea id="sa-broadcast-input" placeholder="Type your message here..." style="width:100%;height:100px;background:var(--color-surface-nested);border:1px solid var(--color-border);border-radius:14px;color:var(--color-text-primary);padding:14px;font-family:inherit;font-size:13px;resize:none;outline:none;transition:border 0.2s;" onfocus="this.style.borderColor='var(--color-accent-primary)'" onblur="this.style.borderColor='var(--color-border)'">${this.escapeHTML(this.state.broadcastText || '')}</textarea>
        </div>
        <div class="sa-mactions">
          <button id="sa-btn-broadcast" class="sa-pbtn" style="background:linear-gradient(135deg, #a78bfa, #c084fc);" onclick="Admin.sendBroadcast()">Send Broadcast</button>
        </div>
      </div>
    </div>`;
  }
};

window.Admin = Admin;

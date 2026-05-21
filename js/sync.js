/* =============================================
   LAMIM — CLOUD SYNC ENGINE (SUPABASE)
   ============================================= */
const Sync = {
  isSyncing: false,

  init() {
    // Check queue every 5 seconds
    setInterval(() => this.processQueue(), 5000);
    
    // Immediate sync on network recovery
    window.addEventListener('online', () => this.processQueue());

    // Subscribe to live changes for current user
    this.subscribeUserChanges();
  },

  isSubscribed: false,
  async subscribeUserChanges() {
    if (!window.supabaseClient) return;
    if (this.isSubscribed) return;
    const { data: session } = await window.supabaseClient.auth.getSession();
    if (!session?.session?.user) return;
    const uid = session.session.user.id;

    console.log("[Sync] Subscribing to user realtime data...");
    this.isSubscribed = true;
    
    // Listen for changes in user's own records
    const channel = window.supabaseClient.channel('user-data-live');
    
    ['salah_logs', 'dhikr_logs', 'finance_store', 'mujahid_habits', 'user_settings', 'goals', 'dhikr_presets'].forEach(table => {
      channel.on('postgres_changes', { event: '*', schema: 'public', table: table, filter: `user_id=eq.${uid}` }, (payload) => this.handleRealtime(table, payload));
    });
    
    // Profiles table uses 'id' instead of 'user_id'
    channel.on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${uid}` }, (payload) => this.handleRealtime('profiles', payload));
    
    // Global broadcasts (no user filter)
    channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'app_broadcasts' }, (payload) => this.handleRealtime('app_broadcasts', payload));

    channel.subscribe();

    // Join real-time presence room to track online status
    this.joinPresence(uid);
  },

  presenceChannel: null,
  onlineUsers: new Set(),
  async joinPresence(uid) {
    if (!window.supabaseClient || !uid) return;
    try {
      const name = DB.getUser()?.name || 'Anonymous';
      this.presenceChannel = window.supabaseClient.channel('online-presence-room', {
        config: {
          presence: {
            key: uid
          }
        }
      });

      this.presenceChannel
        .on('presence', { event: 'sync' }, () => {
          const state = this.presenceChannel.presenceState();
          this.onlineUsers.clear();
          Object.keys(state).forEach(key => this.onlineUsers.add(key));
          window.dispatchEvent(new CustomEvent('lamim:presence-updated', { detail: Array.from(this.onlineUsers) }));
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await this.presenceChannel.track({
              id: uid,
              name: name,
              online_at: new Date().toISOString()
            });
          }
        });
    } catch (e) {
      console.warn("[Presence] Failed to join presence room:", e);
    }
  },

  async pullAll() {
    if (!window.supabaseClient) return;
    const { data: session } = await window.supabaseClient.auth.getSession();
    if (!session?.session?.user) return;
    const uid = session.session.user.id;

    // Ensure realtime subscriptions are active
    this.subscribeUserChanges();

    try {
      // Touch profile to update updated_at (marks user active)
      window.supabaseClient.from('profiles').update({ updated_at: new Date().toISOString() }).eq('id', uid).then(() => {});

      const q = DB.get('lamim_sync_queue') || [];

      // Fetch all core modules in parallel for maximum throughput
      const results = await Promise.all([
        window.supabaseClient.from('profiles').select('*').eq('id', uid).single(),
        window.supabaseClient.from('user_settings').select('*').eq('user_id', uid).maybeSingle(),
        window.supabaseClient.from('salah_logs').select('*').eq('user_id', uid).order('date', {ascending: false}).limit(30),
        window.supabaseClient.from('dhikr_logs').select('*').eq('user_id', uid).limit(30),
        window.supabaseClient.from('finance_store').select('*').eq('user_id', uid).maybeSingle(),
        window.supabaseClient.from('mujahid_habits').select('*').eq('user_id', uid),
        window.supabaseClient.from('goals').select('*').eq('user_id', uid).maybeSingle(),
        window.supabaseClient.from('dhikr_presets').select('*').eq('user_id', uid).maybeSingle()
      ]);

      const [profRes, settRes, salahRes, dhikrRes, finRes, mujRes, goalRes, preRes] = results;

      // 1. Profile
      if (profRes.data) {
        const prof = profRes.data;
        if (!q.some(i => i.type === 'profile')) {
          const local = DB.getUser() || {};
          DB.setUser({ ...local, ...prof }, true);
        }
      }

      // 2. Settings
      if (settRes.data) {
        if (!q.some(i => i.type === 'settings')) {
          const cloudSettings = settRes.data.settings || settRes.data.data || settRes.data;
          DB.setSettings(cloudSettings, true);
        }
      }

      // 3. Salah
      if (salahRes.data) {
        salahRes.data.forEach(log => {
          if (q.some(i => i.type === 'salah' && i.date === log.date)) return;
          localStorage.setItem('lamim_salah_' + log.date, JSON.stringify({
            fajr: log.fajr, dhuhr: log.dhuhr, asr: log.asr, maghrib: log.maghrib, isha: log.isha,
            sunnah: log.sunnah || {}, tahajjud: log.tahajjud || log.tajajjud || false, tahajjud_rakat: log.tahajjud_rakat || 0,
            witr: log.witr || 0, jummah: log.jummah || false, notes: log.notes || {}
          }));
        });
      }

      // 4. Dhikr
      if (dhikrRes.data) {
        dhikrRes.data.forEach(log => {
          if (q.some(i => i.type === 'dhikr' && i.date === log.date)) return;
          DB.rawSet('lamim_dhikr_' + log.date, JSON.stringify(log.data || {}));
        });
      }

      // 5. Finance
      if (finRes.data && !q.some(i => i.type === 'finance')) {
        DB.rawSet('lamim_finance', JSON.stringify(finRes.data.data));
      }

      // 6. Mujahid
      if (mujRes.data && !q.some(i => i.type === 'mujahid')) {
        DB.rawSet('lamim_mujahid_habits', JSON.stringify(mujRes.data));
      }
      
      // 7. Goals
      if (goalRes.data && !q.some(i => i.type === 'goals')) {
        DB.rawSet('lamim_goals', JSON.stringify(goalRes.data.data));
      }

      // 8. Dhikr Presets
      if (preRes.data && !q.some(i => i.type === 'dhikr_presets')) {
        DB.rawSet('lamim_dhikr_presets', JSON.stringify(preRes.data.data));
      }

      console.log("Cloud pull complete.");
      if (DB.refreshSpiritScore) DB.refreshSpiritScore();
      if (typeof App !== 'undefined') App.applyTranslations(); 
      this.updateGlobal();
      
      // Dispatch event to refresh UI components
      window.dispatchEvent(new CustomEvent('lamim:data-updated'));
    } catch (err) {
      console.error("Cloud Pull Error:", err);
    }
  },

  queueSync(type, date, data) {
    const q = DB.get('lamim_sync_queue') || [];
    // Remove duplicate entry if exists
    const filtered = q.filter(i => !(i.type === type && i.date === date));
    filtered.push({ type, date, data, ts: Date.now() });
    DB.set('lamim_sync_queue', filtered);
    this.updateGlobal();
    
    // Trigger instant upload with a slight debounce to batch rapid clicks
    if (navigator.onLine && !this.isSyncing) {
      if (this.syncDebounceTimer) clearTimeout(this.syncDebounceTimer);
      this.syncDebounceTimer = setTimeout(() => this.processQueue(), 400);
    }
  },

  updateGlobal() {
    const q = DB.get('lamim_sync_queue') || [];
    const btn = document.getElementById('sync-hub-icon');
    const badge = document.getElementById('sync-badge');
    
    if (btn) {
      if (!navigator.onLine) {
        btn.classList.add('offline');
        btn.classList.remove('pending', 'synced');
      } else if (q.length > 0) {
        btn.classList.add('pending');
        btn.classList.remove('offline', 'synced');
      } else {
        btn.classList.add('synced');
        btn.classList.remove('offline', 'pending');
      }
    }

    if (badge) {
      badge.textContent = q.length > 0 ? q.length : '';
      badge.style.display = q.length > 0 ? 'flex' : 'none';
    }

    // Update Hub Modal if open
    const statusText = document.getElementById('sync-status-text');
    const syncCount = document.getElementById('sync-pending-count');
    const syncIcon = document.getElementById('sync-hub-main-icon');

    if (statusText) {
      if (q.length > 0) {
        statusText.textContent = "Sync Pending";
        if (syncCount) syncCount.textContent = `${q.length} items waiting to upload`;
        if (syncIcon) syncIcon.innerHTML = '📤';
      } else {
        statusText.textContent = "Fully Synced";
        if (syncCount) syncCount.textContent = "All your data is safe in the cloud";
        if (syncIcon) syncIcon.innerHTML = '🛡️';
      }
    }
  },

  async pushProfile(u) {
    if (!window.supabaseClient) throw new Error("Supabase not initialized");
    const { data: session } = await window.supabaseClient.auth.getSession();
    if (!session?.session?.user) throw new Error("No active session. Please login.");
    
    const payload = {
      id: session.session.user.id,
      name: u.name,
      bio: u.bio,
      email: u.email,
      dob: u.dob,
      gender: u.gender,
      avatar: u.avatar,
      spirit_score: Math.round(u.spirit_score || 0),
      spirit_level: u.spirit_level || 'Ghafil'
    };
    const { error } = await window.supabaseClient.from('profiles').upsert(payload);
    if (error) throw error;
  },

  async pushSalah(date, data) {
    if (!window.supabaseClient) throw new Error("Supabase not initialized");
    const { data: session } = await window.supabaseClient.auth.getSession();
    if (!session?.session?.user) throw new Error("No active session. Please login.");
    
    // Mapping flat JSON object to individual database columns
    const payload = {
      user_id: session.session.user.id,
      date: date,
      fajr:    data.fajr !== undefined ? data.fajr : null,
      dhuhr:   data.dhuhr !== undefined ? data.dhuhr : null,
      asr:     data.asr !== undefined ? data.asr : null,
      maghrib: data.maghrib !== undefined ? data.maghrib : null,
      isha:    data.isha !== undefined ? data.isha : null,
      sunnah:  data.sunnah || {},
      tahajjud: data.tahajjud || false,
      tahajjud_rakat: data.tahajjud_rakat || 0,
      witr:    data.witr || 0,
      jummah:  data.jummah || false,
      notes:   data.notes || {}
    };

    // console.log("[Sync] Pushing Salah/Nafl payload:", payload);
    const { error } = await window.supabaseClient.from('salah_logs').upsert(payload, { onConflict: 'user_id,date' });
    if (error) throw error;
  },

  async pushDhikr(date, data) {
    if (!window.supabaseClient) throw new Error("Supabase not initialized");
    const { data: session } = await window.supabaseClient.auth.getSession();
    if (!session?.session?.user) throw new Error("No active session. Please login.");
    
    const { error } = await window.supabaseClient.from('dhikr_logs').upsert({
      user_id: session.session.user.id,
      date: date,
      data: data
    }, { onConflict: 'user_id,date' });
    if (error) throw error;
  },

  async pushFinance(d) {
    if (!window.supabaseClient) throw new Error("Supabase not initialized");
    const { data: session } = await window.supabaseClient.auth.getSession();
    if (!session?.session?.user) throw new Error("No active session. Please login.");
    
    const payload = {
      user_id: session.session.user.id,
      data: d
    };
    const { error } = await window.supabaseClient.from('finance_store').upsert(payload, { onConflict: 'user_id' });
    if (error) throw error;
  },

  async pushMujahid(habits) {
    if (!window.supabaseClient) throw new Error("Supabase not initialized");
    const { data: session } = await window.supabaseClient.auth.getSession();
    if (!session?.session?.user) throw new Error("No active session. Please login.");
    
    const uid = session.session.user.id;
    const localIds = habits.map(h => h.id);
    
    try {
      // 1. Delete removed habits from Supabase
      if (localIds.length > 0) {
        await window.supabaseClient.from('mujahid_habits').delete().eq('user_id', uid).not('id', 'in', `(${localIds.join(',')})`);
      } else {
        await window.supabaseClient.from('mujahid_habits').delete().eq('user_id', uid);
      }
    } catch (err) {
      console.warn("Non-blocking error deleting habits from cloud:", err);
    }
    
    // 2. Upsert remaining habits
    const getPayloads = (includeLongestStreak) => habits.map(h => {
      const p = {
        id: h.id,
        user_id: uid,
        label: h.label,
        icon: h.icon,
        color: h.color,
        history: h.history || [],
        start_date: h.startDate || null,
        custom_start: h.customStart || false
      };
      if (includeLongestStreak) {
        p.longest_streak = h.longestStreak || 0;
      }
      return p;
    });

    let payloads = getPayloads(true);
    if (payloads.length === 0) return;

    let { error } = await window.supabaseClient.from('mujahid_habits').upsert(payloads);
    if (error) {
      if (error.message && error.message.includes('longest_streak')) {
        console.warn("[Sync] 'longest_streak' column missing in Supabase. Retrying without it...");
        payloads = getPayloads(false);
        const { error: retryError } = await window.supabaseClient.from('mujahid_habits').upsert(payloads);
        if (retryError) throw retryError;
      } else {
        throw error;
      }
    }
  },

  async pushSettings(s) {
    if (!window.supabaseClient) throw new Error("Supabase not initialized");
    const { data: session } = await window.supabaseClient.auth.getSession();
    if (!session?.session?.user) throw new Error("No active session. Please login.");
    
    // We try 'settings' first as it's the primary schema, then fallback if needed.
    // However, for upsert, we must be explicit.
    const payload = {
      user_id: session.session.user.id,
      settings: s
    };
    
    const { error } = await window.supabaseClient.from('user_settings').upsert(payload, { onConflict: 'user_id' });
    if (error) {
      // Fallback: If 'settings' column doesn't exist, try 'data'
      if (error.message?.includes('column "settings" of relation "user_settings" does not exist')) {
        const fallbackPayload = { user_id: session.session.user.id, data: s };
        const { error: err2 } = await window.supabaseClient.from('user_settings').upsert(fallbackPayload, { onConflict: 'user_id' });
        if (err2) throw err2;
      } else {
        throw error;
      }
    }
  },

  async pushGoals(goals) {
    if (!window.supabaseClient) throw new Error("Supabase not initialized");
    const { data: session } = await window.supabaseClient.auth.getSession();
    if (!session?.session?.user) throw new Error("No active session. Please login.");
    const payload = {
      user_id: session.session.user.id,
      data: goals
    };
    const { error } = await window.supabaseClient.from('goals').upsert(payload, { onConflict: 'user_id' });
    if (error) throw error;
  },

  async pushDhikrPresets(presets) {
    if (!window.supabaseClient) throw new Error("Supabase not initialized");
    const { data: session } = await window.supabaseClient.auth.getSession();
    if (!session?.session?.user) throw new Error("No active session. Please login.");
    const payload = {
      user_id: session.session.user.id,
      data: presets
    };
    const { error } = await window.supabaseClient.from('dhikr_presets').upsert(payload, { onConflict: 'user_id' });
    if (error) throw error;
  },

  async processQueue() {
    if (this.isSyncing) return;
    if (!navigator.onLine) {
      this.updateGlobal();
      return;
    }

    try {
      this.isSyncing = true;

      // Loop over queue dynamically to prevent race conditions during long await calls
      while (true) {
        const freshQ = DB.get('lamim_sync_queue') || [];
        if (freshQ.length === 0) break;

        const item = freshQ[0];
        try {
          console.log(`[Sync] Uploading ${item.type} for ${item.date || 'all'}...`);
          
          if (item.type === 'salah') await this.pushSalah(item.date, item.data);
          else if (item.type === 'dhikr') await this.pushDhikr(item.date, item.data);
          else if (item.type === 'profile') await this.pushProfile(item.data);
          else if (item.type === 'finance') await this.pushFinance(item.data);
          else if (item.type === 'mujahid') await this.pushMujahid(item.data);
          else if (item.type === 'settings') await this.pushSettings(item.data);
          else if (item.type === 'goals') await this.pushGoals(item.data);
          else if (item.type === 'dhikr_presets') await this.pushDhikrPresets(item.data);
          
          // Re-fetch queue to prevent overwriting new items added by user during the await
          const qAfterSync = DB.get('lamim_sync_queue') || [];
          const updatedQ = qAfterSync.filter(i => !(i.type === item.type && i.date === item.date && i.ts === item.ts));
          DB.set('lamim_sync_queue', updatedQ);
          console.log(`[Sync] Successfully synced: ${item.type}`);
        } catch (err) {
          console.error(`[Sync] Fatal error on ${item.type}:`, err);
          
          if (err.message && err.message.includes("No active session")) {
            Utils.toast(`Authentication Required. Please login again to sync.`, 'warning');
            return; // Stop processing queue until login
          }

          item.retries = (item.retries || 0) + 1;
          const qAfterErr = DB.get('lamim_sync_queue') || [];
          
          if (item.retries > 3) {
            console.error(`[Sync] Dropping corrupted item (${item.type}) after 3 failed retries.`);
            const droppedQ = qAfterErr.filter(i => !(i.type === item.type && i.date === item.date && i.ts === item.ts));
            DB.set('lamim_sync_queue', droppedQ);
            continue;
          } else {
            const retryQ = qAfterErr.map(i => (i.type === item.type && i.date === item.date && i.ts === item.ts) ? item : i);
            DB.set('lamim_sync_queue', retryQ); 
            Utils.toast(`Sync failed (${item.type}): Retrying soon...`, 'error');
            break; // Retry later
          }
        }
      }
    } finally {
      this.isSyncing = false;
      this.updateGlobal();
    }
  },

  refreshTimeout: null,
  handleRealtime(table, payload) {
    if (!payload.new) return;
    const data = payload.new;

    if (table === 'salah_logs') {
      const cloudFormat = {
        fajr: data.fajr, dhuhr: data.dhuhr, asr: data.asr, maghrib: data.maghrib, isha: data.isha,
        sunnah: data.sunnah || {}, tahajjud: data.tahajjud || false, tahajjud_rakat: data.tahajjud_rakat || 0,
        witr: data.witr || 0, jummah: data.jummah || false, notes: data.notes || {}
      };
      DB.setSalah(data.date, cloudFormat, true);
    } 
    else if (table === 'dhikr_logs') DB.setDhikr(data.date, data.data, true);
    else if (table === 'finance_store') DB.setFinance(data.data, true);
    else if (table === 'mujahid_habits') {
      const current = DB.getMujahid();
      const idx = current.findIndex(h => h.id === data.id);
      const updatedHabit = {
        ...data,
        startDate: data.start_date || data.startDate,
        customStart: data.custom_start !== undefined ? data.custom_start : data.customStart,
        longestStreak: data.longest_streak !== undefined ? data.longest_streak : data.longestStreak
      };
      if (idx !== -1) {
        current[idx] = { ...current[idx], ...updatedHabit };
      } else {
        current.push(updatedHabit);
      }
      DB.setMujahid(current, true);
    }
    else if (table === 'user_settings') DB.setSettings(data.settings, true);
    else if (table === 'goals') DB.setGoals(data.data, true);
    else if (table === 'dhikr_presets') DB.setDhikrPresets(data.data, true);
    else if (table === 'profiles') {
      const local = DB.getUser() || {};
      DB.setUser({ ...local, ...data }, true);
    }
    else if (table === 'app_broadcasts') {
      if (typeof Home !== 'undefined' && Home.renderBroadcastBanner) {
        Home.renderBroadcastBanner(data);
        Utils.toast('New Announcement!', 'info');
      }
    }

    // Debounce UI refresh
    if (window.App && window.App.refreshCurrentPage) {
      if (this.refreshTimeout) clearTimeout(this.refreshTimeout);
      this.refreshTimeout = setTimeout(() => window.App.refreshCurrentPage(), 300);
    }
  }
};

window.Sync = Sync;

// Initial pulse check with readyState safeguard
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Sync.init());
} else {
  Sync.init();
}

// Click FAB to force sync
document.addEventListener('click', (e) => {
  if (e.target.closest('#sync-hub-icon')) {
    Sync.processQueue();
  }
});

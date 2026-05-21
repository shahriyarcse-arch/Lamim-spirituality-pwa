/* =============================================
   LAMIM — LEADERBOARD MODULE (Vanguard)
   ============================================= */

const Leaderboard = {
    users: [],
    myRank: 0,
    lastFetch: 0,
    cacheTime: 5000, // 5 seconds cache to prevent spam, but feel instant

    async init() {
        const user = DB.getUser();
        if (!user || user.role !== 'admin') {
            const root = document.getElementById('leaderboard-content');
            if (root) {
                root.innerHTML = `
                    <div style="padding: 40px 20px; text-align: center; color: var(--color-text-muted);">
                        <div style="font-size: 48px; margin-bottom: 20px;">🛡️</div>
                        <h2 style="color: var(--color-text-primary); margin-bottom: 10px;">Vanguard Access Restricted</h2>
                        <p>The Spiritual Vanguard section is currently in beta and only available for administrators.</p>
                    </div>
                `;
            }
            return;
        }

        // 1. Load from Local Cache for Instant View
        this.loadLocalCache();
        if (this.users.length > 0) {
            this.render();
        } else {
            this.renderLoading();
        }

        // 2. Background Fetch
        this.loadData();

        // 3. Realtime Live Updates
        this.setupRealtime();
    },

    setupRealtime() {
        if (this.realtimeBound || !window.supabaseClient) return;
        
        try {
            const channel = window.supabaseClient.channel('vanguard-live');
            channel.on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
                // FIX #3: Only refetch if spirit_score actually changed
                const newRecord = payload.new || {};
                const oldRecord = payload.old || {};
                if (newRecord.spirit_score === oldRecord.spirit_score && payload.eventType !== 'DELETE') return;
                
                // Batch rapid changes with longer debounce to prevent spam
                if (this.liveUpdateTimer) clearTimeout(this.liveUpdateTimer);
                this.liveUpdateTimer = setTimeout(() => {
                    this.lastFetch = 0; // Force bypass cache
                    this.loadData();
                }, 1500); // Increased from 300ms to 1.5s
            }).subscribe();
            this.realtimeBound = true;
        } catch(e) {
            console.error("Vanguard realtime setup failed", e);
        }
    },

    loadLocalCache() {
        try {
            const cached = DB.rawGet('lamim_leaderboard_cache');
            if (cached) {
                const parsed = JSON.parse(cached);
                this.users = parsed.users || [];
                this.myRank = parsed.myRank || 0;
                this.lastFetch = parsed.lastFetch || 0;
            }
        } catch (e) { console.error("Cache Load Error", e); }
    },

    saveLocalCache() {
        try {
            localStorage.setItem('lamim_leaderboard_cache', JSON.stringify({
                users: this.users,
                myRank: this.myRank,
                lastFetch: this.lastFetch
            }));
        } catch (e) { console.error("Cache Save Error", e); }
    },

    clearCache() {
        this.lastFetch = 0;
        this.users = [];
        DB.remove('lamim_leaderboard_cache');
    },

    async loadData() {
        // Wait for Supabase to be ready (Retry up to 5 times)
        let retries = 0;
        while (!window.supabaseClient && retries < 5) {
            await new Promise(r => setTimeout(r, 500));
            retries++;
        }

        if (!window.supabaseClient) return;
        
        const now = Date.now();
        if (this.users.length > 0 && (now - this.lastFetch < this.cacheTime)) return;

        try {
            this.fetchSessionId = Date.now();
            // 1. Fetch Top 50 Users
            const { data: topUsers, error } = await window.supabaseClient
                .from('profiles')
                .select('name, avatar, spirit_score, spirit_level')
                .order('spirit_score', { ascending: false })
                .limit(50);

            if (error) throw error;

            // Calculate true ranks to match global rank tie handling
            if (topUsers) {
                let currentRank = 1;
                let previousScore = null;
                topUsers.forEach((u, index) => {
                    if (previousScore !== null && u.spirit_score < previousScore) {
                        currentRank = index + 1;
                    }
                    u.trueRank = currentRank;
                    previousScore = u.spirit_score;
                });
            }

            const oldUsersStr = JSON.stringify(this.users);
            const newUsersStr = JSON.stringify(topUsers || []);
            this.users = topUsers || [];
            this.lastFetch = Date.now();

            let newRank = this.myRank;
            const oldRank = this.myRank;
            
            // 2. Fetch My Rank (FIX #2: Use gte for tie handling — same score = same rank)
            const myUser = DB.getUser();
            if (myUser) {
                const myScore = myUser.spirit_score || 0;
                // Count users with STRICTLY higher score, then add 1
                // If 3 people have higher score, you are rank 4 (tied with others at same score)
                const { count, error: rankErr } = await window.supabaseClient
                    .from('profiles')
                    .select('*', { count: 'exact', head: true })
                    .gt('spirit_score', myScore);
                
                if (!rankErr) {
                    newRank = (count || 0) + 1;
                }
            }

            if (oldUsersStr !== newUsersStr || oldRank !== newRank) {
                this.myRank = newRank;
                this.saveLocalCache();
                this.render(true);
            } else {
                this.saveLocalCache();
            }
        } catch (err) {
            console.error("Leaderboard Load Error:", err);
            this.renderError();
        }
    },

    async getMyRank() {
        // Wait for Supabase to be ready
        let retries = 0;
        while (!window.supabaseClient && retries < 5) {
            await new Promise(r => setTimeout(r, 300));
            retries++;
        }
        
        if (!window.supabaseClient) return 0;
        
        const user = DB.getUser();
        if (!user || !user.spirit_score) return 0;
        
        try {
            const { count, error } = await window.supabaseClient
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .gt('spirit_score', user.spirit_score);
            
            if (error) {
                console.warn('[Leaderboard] getMyRank query failed:', error);
                return 0;
            }
            return (count || 0) + 1;
        } catch (e) { 
            console.warn('[Leaderboard] getMyRank error:', e);
            return 0; 
        }
    },

    renderLoading() {
        const container = document.getElementById('leaderboard-content');
        if (!container) return;
        
        let skeletons = '';
        for(let i=0; i<8; i++) {
            skeletons += `
                <div class="lb-item" style="opacity:0.3; pointer-events:none;">
                    <div class="lb-rank-num">#</div>
                    <div class="lb-avatar" style="background:#444;"></div>
                    <div class="lb-info">
                        <div class="lb-name" style="width:100px; height:14px; background:#444; border-radius:4px;"></div>
                        <div class="lb-meta" style="width:60px; height:10px; background:#333; border-radius:4px; margin-top:5px;"></div>
                    </div>
                </div>
            `;
        }

        container.innerHTML = `
            <div class="lb-container">
                <h1 class="auth-title" style="text-align:center; margin-bottom:10px;">Spiritual Vanguard</h1>
                <div class="lb-podium" style="opacity:0.3;">
                    <div class="podium-item"><div class="podium-avatar-wrap" style="background:#444"></div></div>
                    <div class="podium-item podium-rank-1"><div class="podium-avatar-wrap" style="background:#444"></div></div>
                    <div class="podium-item"><div class="podium-avatar-wrap" style="background:#444"></div></div>
                </div>
                <div class="lb-list">${skeletons}</div>
            </div>
        `;
    },

    renderError() {
        const container = document.getElementById('leaderboard-content');
        if (!container) return;
        container.innerHTML = `
            <div class="lb-container" style="text-align:center; padding-top:100px;">
                <p style="color:var(--color-accent-red)">Failed to load rankings. Please check your connection.</p>
                <button class="btn btn-primary" style="margin-top:20px" onclick="Leaderboard.init()">Retry</button>
            </div>
        `;
    },

    render(skipAnim = false) {
        const container = document.getElementById('leaderboard-content');
        if (!container) return;

        const top3 = this.users.slice(0, 3);
        const rest = this.users.slice(3);
        const myUser = DB.getUser();

        // If skipAnim is true and container already has content, update partials to prevent blink
        if (skipAnim && container.querySelector('.lb-container')) {
            const podium = container.querySelector('.lb-podium');
            const list = container.querySelector('.lb-list');
            const footer = container.querySelector('.lb-sticky-footer');
            
            if (podium) podium.innerHTML = top3.map((u, i) => this.getPodiumHTML(u, i + 1, u.trueRank || (i + 1))).join('');
            if (list) list.innerHTML = rest.map((u, i) => this.getListItemHTML(u, u.trueRank || (i + 4), i)).join('');
            if (footer && myUser) {
                footer.innerHTML = `
                    <div class="lb-sticky-info">
                        <div class="lb-sticky-rank">#${this.myRank}</div>
                        <div class="lb-sticky-text">
                            <span class="rank-label">Your Global Rank</span>
                            <span class="rank-name">${myUser.name || 'You'}</span>
                        </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:15px;">
                        <div class="lb-score-wrap">
                            <span class="lb-score-val">${Math.round(myUser.spirit_score || 0)}</span>
                            <span class="lb-score-label">Power</span>
                        </div>
                        <button class="btn btn-icon-sm" onclick="Leaderboard.shareRank()" style="background:var(--color-accent-blue); color:#fff; border-radius:50%; width:32px; height:32px;">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                        </button>
                    </div>
                `;
            }
            return;
        }

        container.innerHTML = `
            <div class="lb-container ${skipAnim ? '' : 'anim-fade-in'}">
                <h1 class="auth-title" style="text-align:center; margin-bottom:10px;">Spiritual Vanguard</h1>
                <p style="text-align:center; color:rgba(255,255,255,0.5); font-size:14px; margin-bottom:30px;">The highest-ranking warriors of Lamim</p>

                <!-- Podium -->
                <div class="lb-podium">
                    ${top3.map((u, i) => this.getPodiumHTML(u, i + 1, u.trueRank || (i + 1))).join('')}
                </div>

                <!-- List -->
                <div class="lb-list">
                    ${rest.map((u, i) => this.getListItemHTML(u, u.trueRank || (i + 4), i)).join('')}
                </div>

                <!-- Sticky Footer -->
                ${myUser ? `
                <div class="lb-sticky-footer">
                    <div class="lb-sticky-info">
                        <div class="lb-sticky-rank">#${this.myRank}</div>
                        <div class="lb-sticky-text">
                            <span class="rank-label">Your Global Rank</span>
                            <span class="rank-name">${myUser.name || 'You'}</span>
                        </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:15px;">
                        <div class="lb-score-wrap">
                            <span class="lb-score-val">${Math.round(myUser.spirit_score || 0)}</span>
                            <span class="lb-score-label">Power</span>
                        </div>
                        <button class="btn btn-icon-sm" onclick="Leaderboard.shareRank()" style="background:var(--color-accent-blue); color:#fff; border-radius:50%; width:32px; height:32px;">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                        </button>
                    </div>
                </div>
                ` : ''}
            </div>
        `;
    },

    shareRank() {
        const user = DB.getUser();
        if (!user) return;
        const text = `I am ranked #${this.myRank} in the Spiritual Vanguard on Lamim! My Spiritual Power is ${Math.round(user.spirit_score || 0)}. Join me on the journey!`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Lamim Spiritual Vanguard',
                text: text,
                url: window.location.href
            }).catch(() => {});
        } else {
            Utils.toast("Rank copied to clipboard! Share it with your friends.", "success");
            navigator.clipboard.writeText(text);
        }
    },

    getPodiumHTML(user, position, rankNum) {
        if (rankNum === undefined) rankNum = position;
        // FIX #5: Use inline SVG fallback instead of external ui-avatars API
        const safeName = Utils.escapeHTML(user.name || 'Warrior');
        const initials = (user.name || 'U').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
        const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6'];
        const bgColor = colors[position % colors.length];
        const safeAvatar = user.avatar ? Utils.escapeHTML(user.avatar) : null;
        const avatarContent = safeAvatar 
            ? `<img src="${safeAvatar}" class="podium-img" alt="${safeName}" onload="this.classList.add('loaded')" onerror="this.outerHTML='<svg class=\\'podium-img loaded\\' viewBox=\\'0 0 40 40\\' xmlns=\\'http://www.w3.org/2000/svg\\' style=\\'width:100%;height:100%;border-radius:50%\\'><rect width=\\'40\\' height=\\'40\\' rx=\\'20\\' fill=\\'${bgColor}\\'/><text x=\\'20\\' y=\\'26\\' text-anchor=\\'middle\\' fill=\\'white\\' font-size=\\'16\\' font-weight=\\'700\\' font-family=\\'sans-serif\\'>${initials}</text></svg>'">`
            : `<svg class="podium-img loaded" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;border-radius:50%"><rect width="40" height="40" rx="20" fill="${bgColor}"/><text x="20" y="26" text-anchor="middle" fill="white" font-size="16" font-weight="700" font-family="sans-serif">${initials}</text></svg>`;
        return `
            <div class="podium-item podium-rank-${position}">
                <div class="podium-avatar-wrap">
                    ${avatarContent}
                    <div class="podium-badge">${rankNum}</div>
                </div>
                <div class="podium-name">${safeName}</div>
                <div class="podium-score" style="display:flex; flex-direction:column; align-items:center;">
                    <span>${Math.round(user.spirit_score || 0)} Power</span>
                    <span style="font-size:10px; color:var(--color-accent-blue); margin-top:2px;">${Utils.escapeHTML(user.spirit_level || 'Ghafil')}</span>
                </div>
            </div>
        `;
    },

    getListItemHTML(user, rankNum, index) {
        if (index === undefined) index = rankNum - 4;
        // FIX #5: Use inline SVG fallback instead of external ui-avatars API
        const safeName = Utils.escapeHTML(user.name || 'Warrior');
        const initials = (user.name || 'U').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
        const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6'];
        const bgColor = colors[index % colors.length];
        const safeAvatar = user.avatar ? Utils.escapeHTML(user.avatar) : null;
        const avatarContent = safeAvatar 
            ? `<img src="${safeAvatar}" class="lb-avatar" alt="${safeName}" loading="lazy" onload="this.classList.add('loaded')" onerror="this.outerHTML='<svg class=\\'lb-avatar loaded\\' viewBox=\\'0 0 32 32\\' xmlns=\\'http://www.w3.org/2000/svg\\' style=\\'opacity:1\\'><rect width=\\'32\\' height=\\'32\\' rx=\\'16\\' fill=\\'${bgColor}\\'/><text x=\\'16\\' y=\\'22\\' text-anchor=\\'middle\\' fill=\\'white\\' font-size=\\'13\\' font-weight=\\'700\\' font-family=\\'sans-serif\\'>${initials}</text></svg>'">`
            : `<svg class="lb-avatar loaded" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style="opacity:1"><rect width="32" height="32" rx="16" fill="${bgColor}"/><text x="16" y="22" text-anchor="middle" fill="white" font-size="13" font-weight="700" font-family="sans-serif">${initials}</text></svg>`;
        return `
            <div class="lb-item" style="animation-delay: ${index * 0.05}s">
                <div class="lb-rank-num">${rankNum}</div>
                ${avatarContent}
                <div class="lb-info">
                    <div class="lb-name">${safeName}</div>
                    <div class="lb-meta">
                        <span class="lb-level-tag">${Utils.escapeHTML(user.spirit_level || 'Ghafil')}</span>
                    </div>
                </div>
                <div class="lb-score-wrap">
                    <span class="lb-score-val">${Math.round(user.spirit_score || 0)}</span>
                    <span class="lb-score-label">Power</span>
                </div>
            </div>
        `;
    }
};

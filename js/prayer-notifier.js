/* =============================================
   LAMIM — PRAYER NOTIFICATION SCHEDULER
   Checks every 30s and fires notifications
   at prayer times (Fajr, Dhuhr, Asr, Maghrib, Isha)
   ============================================= */

const PrayerNotifier = {
  _lastNotifiedPrayer: null,
  _intervalId: null,
  _checkInterval: 30000, // Check every 30 seconds

  init() {
    if (this._intervalId) return; // Already running
    
    const settings = DB.getSettings();
    if (!settings.notifications) return;
    
    // Request permission if not granted
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Reset the last notified prayer at midnight
    this._lastNotifiedPrayer = localStorage.getItem('lamim_last_notified_prayer') || null;
    const lastNotifiedDate = localStorage.getItem('lamim_last_notified_date') || '';
    const todayStr = new Date().toISOString().split('T')[0];
    if (lastNotifiedDate !== todayStr) {
      this._lastNotifiedPrayer = null;
      localStorage.removeItem('lamim_last_notified_prayer');
    }

    // Start the checker loop
    this._intervalId = setInterval(() => this.check(), this._checkInterval);
    
    // Also check immediately
    setTimeout(() => this.check(), 2000);
    
    console.log('[PrayerNotifier] Initialized');
  },

  stop() {
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  },

  restart() {
    this.stop();
    this._lastNotifiedPrayer = null;
    this.init();
  },

  check() {
    const settings = DB.getSettings();
    if (!settings.notifications) return;
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const times = Utils.calcPrayerTimes();
    if (!times || times.length === 0) return;

    const now = new Date();
    const todayStr = Utils.todayStr();

    // Find which prayer just started (within the last 2 minutes)
    for (const prayer of times) {
      const diff = now.getTime() - prayer.time.getTime();
      
      // If we're within 0 to 120 seconds AFTER the prayer time
      if (diff >= 0 && diff < 120000) {
        const prayerKey = `${todayStr}_${prayer.name}`;
        
        // Don't notify twice for the same prayer
        if (this._lastNotifiedPrayer === prayerKey) return;
        
        this._lastNotifiedPrayer = prayerKey;
        localStorage.setItem('lamim_last_notified_prayer', prayerKey);
        localStorage.setItem('lamim_last_notified_date', todayStr);
        
        this.sendNotification(prayer);
        return;
      }
    }
  },

  sendNotification(prayer) {
    const prayerNames = {
      fajr: { en: 'Fajr', bn: 'ফজর', emoji: '🌅' },
      dhuhr: { en: 'Dhuhr', bn: 'যোহর', emoji: '☀️' },
      asr: { en: 'Asr', bn: 'আসর', emoji: '🌤️' },
      maghrib: { en: 'Maghrib', bn: 'মাগরিব', emoji: '🌅' },
      isha: { en: 'Isha', bn: 'এশা', emoji: '🌙' }
    };

    const info = prayerNames[prayer.name] || { en: prayer.name, bn: prayer.name, emoji: '🕌' };
    const lang = localStorage.getItem('lamim_lang') || 'en';
    const isBn = lang === 'bn';

    const title = isBn 
      ? `${info.emoji} ${info.bn} এর সময় হয়েছে!`
      : `${info.emoji} Time for ${info.en}!`;
    
    const body = isBn
      ? `এখনই সালাত আদায় করুন। আল্লাহ আপনাকে কবুল করুন।`
      : `Pray now. May Allah accept your prayer.`;

    try {
      // Try Service Worker notification first (works in background)
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification(title, {
            body: body,
            icon: './assets/icon-192x192.png',
            badge: './assets/icon-32x32.png',
            tag: `prayer-${prayer.name}`,
            renotify: true,
            vibrate: [200, 100, 200, 100, 200],
            requireInteraction: true,
            data: { prayer: prayer.name }
          });
        });
      } else {
        // Fallback to regular Notification API
        new Notification(title, {
          body: body,
          icon: './assets/icon-192x192.png',
          tag: `prayer-${prayer.name}`,
          requireInteraction: true
        });
      }

      console.log(`[PrayerNotifier] Sent notification for ${prayer.name}`);
    } catch (e) {
      console.error('[PrayerNotifier] Failed to send notification:', e);
    }
  }
};

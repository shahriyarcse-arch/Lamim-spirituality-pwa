const PushManager = {
  _initialized: false,
  _apiUrl: '/api/push',

  async init() {
    if (this._initialized) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    try {
      const resp = await fetch(this._apiUrl);
      if (!resp.ok) return;
      const data = await resp.json();
      if (!data.vapidKey) return;
      const key = this._urlBase64ToUint8Array(data.vapidKey);

      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();

      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: key
        });
      }

      const times = Utils.calcPrayerTimes();
      if (times && times.length > 0) {
        fetch(this._apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'subscribe',
            subscription: sub.toJSON(),
            times: times.map(t => ({ name: t.name, timestamp: t.time.getTime() }))
          })
        }).catch(() => {});
      }

      this._initialized = true;
    } catch (e) {
      console.warn('[PushManager] Setup failed:', e);
    }
  },

  _urlBase64ToUint8Array(s) {
    const padding = '='.repeat((4 - s.length % 4) % 4);
    const b64 = (s + padding).replace(/\-/g, '+').replace(/_/g, '/');
    return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  }
};

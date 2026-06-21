importScripts('./js/version.js');

const CACHE_NAME = 'lamim-v' + (typeof self.LAMIM_VERSION !== 'undefined' ? self.LAMIM_VERSION : '0');

// Prayer notification state for background notifications
let _prayerData = null;
let _prayerCheckId = null;
let _lastSwPrayerKey = null;

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/icon.svg',
  './assets/icon-32x32.png',
  './assets/icon-180x180.png',
  './assets/icon-192x192.png',
  './assets/icon-512x512.png',
  './js/version.js',
  './js/lang.js',
  './js/utils.js',
  './js/db.js',
  './js/hijri.js',
  './js/auth.js',
  './js/home.js',
  './js/salah.js',
  './js/dhikr.js',
  './js/goals.js',
  './js/finance.js',
  './js/mujahid.js',
  './js/profile.js',
  './js/analysis.js',
  './js/dua.js',
  './js/prayer-notifier.js',
  './js/push.js',
  './js/year-review.js',
  './js/app.js',
  './css/bundle.css',
  './css/year-review.css',
  './css/lively-enhancements.css'
];

// Install: Cache core assets & skip waiting immediately
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      const requests = ASSETS.map(url => new Request(url, { cache: 'reload' }));
      return cache.addAll(requests);
    }).catch((err) => {
      console.error('[SW] Failed to cache assets during install:', err);
    })
  );
  self.skipWaiting();
});

// Activate: Cleanup ALL old caches & claim clients immediately
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((k) => k !== CACHE_NAME && caches.delete(k)));
    }).then(() => {
      // Notify ALL open tabs that a new version is active
      return self.clients.matchAll({ type: 'window' }).then(clients => {
        clients.forEach(client => client.postMessage({ type: 'SW_UPDATED', version: CACHE_NAME }));
      });
    })
  );
  self.clients.claim();
});

// Listen for messages from the app
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (e.data && e.data.type === 'PRAYER_TIMES') {
    _prayerData = { times: e.data.times, date: e.data.date };
    _lastSwPrayerKey = null;
    _startPrayerChecker();
  }
});

// Background prayer notification checker (runs while SW is alive)
function _startPrayerChecker() {
  if (_prayerCheckId) return;
  _prayerCheckId = setInterval(() => {
    if (!_prayerData) return;
    const now = Date.now();
    const { times, date } = _prayerData;
    for (const p of times) {
      const diff = now - p.time;
      if (diff >= 0 && diff < 120000) {
        const key = date + '_' + p.name;
        if (_lastSwPrayerKey === key) break;
        _lastSwPrayerKey = key;
        const names = {
          fajr: { en: 'Fajr', bn: 'ফজর', emoji: '🌅' },
          dhuhr: { en: 'Dhuhr', bn: 'যোহর', emoji: '☀️' },
          asr: { en: 'Asr', bn: 'আসর', emoji: '🌤️' },
          maghrib: { en: 'Maghrib', bn: 'মাগরিব', emoji: '🌅' },
          isha: { en: 'Isha', bn: 'এশা', emoji: '🌙' }
        };
        const info = names[p.name] || { en: p.name, bn: p.name, emoji: '🕌' };
        self.registration.showNotification(info.emoji + ' Time for ' + info.en + '!', {
          body: 'Pray now. May Allah accept your prayer.',
          icon: './assets/icon-192x192.png',
          badge: './assets/icon-32x32.png',
          tag: 'prayer-' + p.name,
          renotify: true,
          vibrate: [200, 100, 200, 100, 200],
          requireInteraction: true,
          data: { prayer: p.name }
        });
        break;
      }
    }
  }, 10000);
}

function _stopPrayerChecker() {
  if (_prayerCheckId) {
    clearInterval(_prayerCheckId);
    _prayerCheckId = null;
  }
}

// Handle notification clicks — open/focus the app
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      if (clients.length > 0) {
        return clients[0].focus();
      }
      return self.clients.openWindow('./');
    })
  );
});

// Handle incoming push messages from server
self.addEventListener('push', (e) => {
  let title = 'Prayer Time!';
  let body = 'It is time to pray.';
  let icon = './assets/icon-192x192.png';
  let tag = 'prayer';
  try {
    if (e.data) {
      const d = e.data.json();
      if (d.title) title = d.title;
      if (d.body) body = d.body;
      if (d.icon) icon = d.icon;
      if (d.tag) tag = d.tag;
    }
  } catch (err) {}
  e.waitUntil(
    self.registration.showNotification(title, {
      body, icon, badge: './assets/icon-32x32.png', tag,
      renotify: true, vibrate: [200, 100, 200, 100, 200], requireInteraction: true
    })
  );
});

// Re-subscribe when push subscription changes (expired/rotated)
self.addEventListener('pushsubscriptionchange', (e) => {
  e.waitUntil(
    self.registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: e.oldSubscription?.options?.applicationServerKey })
      .then(sub => {
        return fetch('./api/push', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'subscribe', subscription: sub.toJSON(), times: [] })
        }).catch(() => {});
      }).catch(() => {})
  );
});

// Fetch: Smart Strategy
// - Navigation (HTML): Network-First (always get latest)
// - Assets (JS/CSS/etc): Network-First with Cache Fallback (fresh when online, cached when offline)
self.addEventListener('fetch', (e) => {
  // Only handle HTTP/HTTPS requests (ignores chrome-extension://, data:, etc.)
  if (!e.request.url.startsWith('http')) return;

  // Skip external database, dynamic API, and Google API calls to prevent stale data
  // Also skip CDN libraries that must always be fetched fresh
  const skipUrls = [
    '/api/',  // Never cache API calls
    'api.bigdatacloud.net',
    'ipapi.co',
    'open.er-api.com',
    'googleapis.com',
    'cdn.jsdelivr.net',  // Chart.js and other CDN libraries
    'fonts.googleapis.com'
  ];
  if (skipUrls.some(url => e.request.url.includes(url))) return;

  // NAVIGATION REQUESTS (HTML pages) → Network-First
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request, { cache: 'no-cache' })
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(e.request, { ignoreSearch: true }).then((cached) => cached || caches.match('./index.html', { ignoreSearch: true }))) // Fallback to cache or index.html if offline
    );
    return;
  }

  // LOCAL ASSETS (JS, CSS, images) → Network-First with Cache Fallback
  // Always tries network first (fresh code when online), falls back to cache when offline.
  // After fetching, updates cache in background for future offline use.
  const isLocalAsset = e.request.url.startsWith(self.location.origin);
  if (isLocalAsset) {
    e.respondWith(
      fetch(e.request, { cache: 'no-cache' })
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match(e.request, { ignoreSearch: true }).then((cached) => cached || new Response('Offline', { status: 503 })))
    );
    return;
  }

  // EXTERNAL STATIC ASSETS (fonts, CDN icons, etc.) → Network-First with Cache Fallback
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => {
        // Network failed, try cache, otherwise return error response
        return caches.match(e.request, { ignoreSearch: true }).then((cached) => {
          return cached || new Response('Offline – CDN unavailable', { status: 503, statusText: 'Service Unavailable', headers: { 'Content-Type': 'text/plain' } });
        });
      })
  );
});

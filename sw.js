const CACHE_NAME = 'lamim-v133';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/icon.svg',
  './assets/icon-32x32.png',
  './assets/icon-180x180.png',
  './assets/icon-192x192.png',
  './assets/icon-512x512.png',
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

// Fetch: Smart Strategy
// - Navigation (HTML): Network-First (always get latest)
// - Assets (JS/CSS/etc): Stale-While-Revalidate (fast + auto-update)
self.addEventListener('fetch', (e) => {
  // Only handle HTTP/HTTPS requests (ignores chrome-extension://, data:, etc.)
  if (!e.request.url.startsWith('http')) return;

  // Skip external database, dynamic API, and Google API calls to prevent stale data
  // Also skip CDN libraries that must always be fetched fresh
  const skipUrls = [
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

  // LOCAL ASSETS (JS, CSS, images) → Cache-First / Stale-While-Revalidate
  // Serves from cache immediately (0.5ms load) for instant launch on phones,
  // then updates the cache in the background. If a file is not in cache,
  // it falls back to the network.
  const isLocalAsset = e.request.url.startsWith(self.location.origin);
  if (isLocalAsset) {
    e.respondWith(
      caches.match(e.request, { ignoreSearch: true }).then((cached) => {
        const fetchPromise = fetch(e.request, { cache: 'no-cache' })
          .then((res) => {
            if (res && res.ok) {
              const copy = res.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy)).catch(() => {});
            }
            return res;
          })
          .catch(() => cached); // network error fallback to cached if present

        return cached || fetchPromise;
      })
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

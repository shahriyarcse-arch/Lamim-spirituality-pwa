const CACHE_NAME = 'lamim-v68';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Install: Cache core assets & skip waiting immediately
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
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
  const skipUrls = [
    'supabase.co',
    'api.bigdatacloud.net',
    'ipapi.co',
    'open.er-api.com',
    'googleapis.com'
  ];
  if (skipUrls.some(url => e.request.url.includes(url))) return;

  // NAVIGATION REQUESTS (HTML pages) → Network-First
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request, { cache: 'no-cache' })
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
          return res;
        })
        .catch(() => caches.match(e.request).then((cached) => cached || caches.match('./index.html'))) // Fallback to cache or index.html if offline
    );
    return;
  }

  // LOCAL ASSETS (JS, CSS, images) → Network-First with Timeout (1.5s) fallback to Cache
  // This ensures online users always get the latest updates instantly,
  // while offline/slow-connection users get the cached version instantly.
  const isLocalAsset = e.request.url.startsWith(self.location.origin);
  if (isLocalAsset) {
    e.respondWith(
      new Promise((resolve) => {
        let resolved = false;

        const timeoutId = setTimeout(() => {
          if (!resolved) {
            caches.match(e.request).then((cached) => {
              if (cached) {
                resolved = true;
                console.log('[SW] Timeout fallback to cache for:', e.request.url);
                resolve(cached);
              }
            });
          }
        }, 1500); // 1.5 seconds timeout

        fetch(e.request, { cache: 'no-cache' })
          .then((res) => {
            if (res && res.ok) {
              const copy = res.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
              
              if (!resolved) {
                clearTimeout(timeoutId);
                resolved = true;
                resolve(res);
              }
            } else {
              if (!resolved) {
                clearTimeout(timeoutId);
                resolved = true;
                caches.match(e.request).then((cached) => resolve(cached || res));
              }
            }
          })
          .catch(() => {
            if (!resolved) {
              clearTimeout(timeoutId);
              resolved = true;
              caches.match(e.request).then((cached) => {
                resolve(cached || new Response('Offline', { status: 503, statusText: 'Service Unavailable' }));
              });
            }
          });
      })
    );
    return;
  }

  // EXTERNAL STATIC ASSETS (fonts, CDN icons, etc.) → Stale-While-Revalidate
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const networkFetch = fetch(e.request).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
        }
        return res;
      }).catch(() => null);

      return cached || networkFetch;
    })
  );
});

const CACHE_NAME = 'obsidiuss-hub-v2';
const APP_SHELL = ['/', '/index.html', '/manifest.json', '/icon.svg', '/pwa-192x192.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Never cache Firebase/API endpoints or sw.js itself
  if (url.pathname === '/sw.js' || url.pathname.startsWith('/__/')) {
    return;
  }

  // Network-first for navigation requests, falling back to cached index.html when offline
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Stale-while-revalidate for static assets; skip caching HTML fallback responses on /assets/
  event.respondWith(
    caches.match(req).then((cached) => {
      const networkFetch = fetch(req)
        .then((res) => {
          const contentType = res.headers.get('content-type') || '';
          const isAssetHtmlFallback =
            url.pathname.startsWith('/assets/') && contentType.includes('text/html');
          if (res && res.status === 200 && res.type === 'basic' && !isAssetHtmlFallback) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});

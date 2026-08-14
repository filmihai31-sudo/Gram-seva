const CACHE_NAME = 'gram-seva-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-192.png',
  '/pwa-512.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/screenshot-mobile.png',
  '/screenshot-desktop.png',
  '/icon.svg'
];

// Install Event - Pre-cache App Shell & immediately activate
self.addEventListener('install', (event) => {
  // Immediately call self.skipWaiting() to replace older service workers without waiting
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching App Shell');
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('[Service Worker] Cache addAll warning:', err);
      });
    })
  );
});

// Activate Event - Claim all clients immediately & clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              console.log('[Service Worker] Purging Old Cache:', cache);
              return caches.delete(cache);
            }
          })
        );
      })
    ])
  );
});

// Fetch Event - Network-first for HTML / fresh builds, cache fallback for offline
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Allow browser to handle non-origin / external APIs directly
  if (!url.origin.includes(self.location.origin) && !url.href.includes('unpkg.com')) {
    return;
  }

  // Navigation requests (HTML pages) -> Network first to pick up new Cloudflare / GitHub releases immediately
  if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then((res) => res || caches.match('/index.html')))
    );
    return;
  }

  // Static assets (hashed JS, CSS, images) -> Cache first with network fallback & background cache update
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});


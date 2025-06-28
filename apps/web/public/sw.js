// Service Worker for performance optimizations
const CACHE_NAME = 'vtchat-v1';
const STATIC_ASSETS = [
  '/favicon.ico',
  '/icon.svg',
  '/manifest.webmanifest'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip non-http(s) requests
  if (!event.request.url.startsWith('http')) return;
  
  // Skip API routes
  if (event.request.url.includes('/api/')) return;
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request).then((fetchResponse) => {
          // Cache successful responses for static assets
          if (fetchResponse.ok && (
            event.request.url.endsWith('.woff2') ||
            event.request.url.endsWith('.ico') ||
            event.request.url.endsWith('.svg') ||
            event.request.url.endsWith('.webmanifest')
          )) {
            const responseClone = fetchResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => cache.put(event.request, responseClone));
          }
          return fetchResponse;
        });
      })
      .catch(() => {
        // Return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return new Response('Offline', {
            status: 200,
            headers: { 'Content-Type': 'text/plain' }
          });
        }
      })
  );
});

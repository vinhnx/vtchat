// Service Worker for VT Chat - PWA with performance optimizations and push notifications
const CACHE_NAME = 'vtchat-v2';
const STATIC_ASSETS = [
    '/favicon.ico',
    '/icon.svg',
    '/icon-192x192.png',
    '/icon-256x256.png',
    '/icon-384x384.png',
    '/icon-512x512.png',
    '/manifest.webmanifest',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('Service Worker installed successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker installation failed:', error);
            })
    );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker activated successfully');
                return self.clients.claim();
            })
            .catch((error) => {
                console.error('Service Worker activation failed:', error);
            })
    );
});

// Push event - handle push notifications
self.addEventListener('push', (event) => {
    console.log('Push event received');

    if (event.data) {
        try {
            const data = event.data.json();
            const options = {
                body: data.body || 'You have a new message',
                icon: data.icon || '/icon-192x192.png',
                badge: '/icon-192x192.png',
                vibrate: [100, 50, 100],
                data: {
                    dateOfArrival: Date.now(),
                    primaryKey: data.primaryKey || '1',
                    url: data.url || '/',
                },
                actions: [
                    {
                        action: 'open',
                        title: 'Open VT',
                        icon: '/icon-192x192.png',
                    },
                    {
                        action: 'close',
                        title: 'Close',
                    },
                ],
                requireInteraction: false,
                silent: false,
            };

            event.waitUntil(self.registration.showNotification(data.title || 'VT Chat', options));
        } catch (error) {
            console.error('Error handling push notification:', error);
            // Fallback notification
            event.waitUntil(
                self.registration.showNotification('VT Chat', {
                    body: 'You have a new message',
                    icon: '/icon-192x192.png',
                })
            );
        }
    }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    console.log('Notification click received');

    event.notification.close();

    const action = event.action;
    const notificationData = event.notification.data || {};

    if (action === 'close') {
        return;
    }

    // Default action or 'open' action
    const urlToOpen = notificationData.url || '/';

    event.waitUntil(
        clients
            .matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Check if there's already a window/tab open with the target URL
                for (const client of clientList) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }

                // If no existing window/tab, open a new one
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
            .catch((error) => {
                console.error('Error handling notification click:', error);
            })
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
        caches
            .match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                return (
                    response ||
                    fetch(event.request).then((fetchResponse) => {
                        // Cache successful responses for static assets
                        if (
                            fetchResponse.ok &&
                            (event.request.url.endsWith('.woff2') ||
                                event.request.url.endsWith('.ico') ||
                                event.request.url.endsWith('.svg') ||
                                event.request.url.endsWith('.png') ||
                                event.request.url.endsWith('.jpg') ||
                                event.request.url.endsWith('.jpeg') ||
                                event.request.url.endsWith('.webmanifest') ||
                                event.request.url.endsWith('.css') ||
                                event.request.url.endsWith('.js'))
                        ) {
                            const responseClone = fetchResponse.clone();
                            caches
                                .open(CACHE_NAME)
                                .then((cache) => cache.put(event.request, responseClone));
                        }
                        return fetchResponse;
                    })
                );
            })
            .catch(() => {
                // Return offline page for navigation requests
                if (event.request.mode === 'navigate') {
                    return new Response(
                        `<!DOCTYPE html>
                        <html>
                        <head>
                            <title>VT - Offline</title>
                            <meta name="viewport" content="width=device-width, initial-scale=1">
                            <style>
                                body {
                                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                    display: flex;
                                    flex-direction: column;
                                    align-items: center;
                                    justify-content: center;
                                    height: 100vh;
                                    margin: 0;
                                    background: #fafafa;
                                    color: #333;
                                    text-align: center;
                                    padding: 20px;
                                }
                                .icon { font-size: 48px; margin-bottom: 16px; }
                                h1 { margin: 0 0 8px 0; font-size: 24px; font-weight: 600; }
                                p { margin: 0; color: #666; line-height: 1.5; }
                                .retry {
                                    margin-top: 24px;
                                    padding: 12px 24px;
                                    background: #007bff;
                                    color: white;
                                    border: none;
                                    border-radius: 6px;
                                    cursor: pointer;
                                    font-size: 16px;
                                }
                                .retry:hover { background: #0056b3; }
                            </style>
                        </head>
                        <body>
                            <div class="icon">📱</div>
                            <h1>You're offline</h1>
                            <p>Check your internet connection and try again.</p>
                            <button class="retry" onclick="window.location.reload()">Try Again</button>
                        </body>
                        </html>`,
                        {
                            status: 200,
                            headers: { 'Content-Type': 'text/html' },
                        }
                    );
                }
            })
    );
});

// Background sync (optional, for future enhancement)
self.addEventListener('sync', (event) => {
    console.log('Background sync event:', event.tag);

    if (event.tag === 'background-sync') {
        event.waitUntil(
            // Perform background sync operations here
            console.log('Performing background sync...')
        );
    }
});

// Message event for communication with main thread
self.addEventListener('message', (event) => {
    console.log('Service Worker received message:', event.data);

    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

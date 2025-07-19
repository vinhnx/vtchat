// Service Worker for VT Chat - PWA with optimal caching strategy
const CACHE_VERSION = "3.1.0";
const STATIC_CACHE = `vtchat-static-v${CACHE_VERSION}`;
const DYNAMIC_CACHE = `vtchat-dynamic-v${CACHE_VERSION}`;
const IMAGE_CACHE = `vtchat-images-v${CACHE_VERSION}`;

// Static assets that rarely change
const STATIC_ASSETS = [
    "/favicon.ico",
    "/icon.svg",
    "/icon-192x192.png",
    "/icon-256x256.png",
    "/icon-384x384.png",
    "/icon-512x512.png",
    "/manifest.webmanifest",
    "/offline.html", // Add offline page to cache
];

// Cache limits to prevent excessive storage usage
const CACHE_LIMITS = {
    [DYNAMIC_CACHE]: 50, // 50 dynamic pages
    [IMAGE_CACHE]: 100, // 100 images
};

// Helper function to determine cache strategy based on request
function getCacheStrategy(request) {
    const url = new URL(request.url);

    // Static assets - long term cache with versioning
    if (STATIC_ASSETS.some((asset) => url.pathname.endsWith(asset))) {
        return { cache: STATIC_CACHE, strategy: "cache-first", maxAge: 365 * 24 * 60 * 60 }; // 1 year
    }

    // Images - optimize with size limits (including remote images and AI-generated content)
    if (
        url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|avif|ico)$/i) ||
        // Avatar services
        url.hostname.includes("googleusercontent.com") ||
        url.hostname.includes("githubusercontent.com") ||
        url.hostname.includes("discordapp.com") ||
        url.hostname.includes("facebook.com") ||
        url.hostname.includes("twimg.com") ||
        // AI/LLM Provider Images
        url.hostname.includes("oaidalleapiprodscus.blob.core.windows.net") ||
        url.hostname.includes("cdn.openai.com") ||
        url.hostname.includes("images.openai.com") ||
        url.hostname.includes("storage.googleapis.com") ||
        url.hostname.includes("generativelanguage.googleapis.com") ||
        url.hostname.includes("claude.ai") ||
        url.hostname.includes("cdn.anthropic.com") ||
        url.hostname.includes("images.anthropic.com") ||
        url.hostname.includes("api.stability.ai") ||
        url.hostname.includes("cdn.stability.ai") ||
        url.hostname.includes("replicate.delivery") ||
        url.hostname.includes("pbxt.replicate.delivery") ||
        url.hostname.includes("cdn.replicate.com") ||
        url.hostname.includes("huggingface.co") ||
        url.hostname.includes("cdn-uploads.huggingface.co") ||
        url.hostname.includes("images.cohere.ai") ||
        url.hostname.includes("api.cohere.ai") ||
        url.hostname.includes("images.perplexity.ai") ||
        url.hostname.includes("api.perplexity.ai") ||
        // CDN and user-uploaded content
        url.hostname.includes("cloudinary.com") ||
        url.hostname.includes("imgur.com") ||
        url.hostname.includes("unsplash.com")
    ) {
        // Use shorter cache for AI-generated images as they might be dynamic
        const isAIGenerated =
            url.hostname.includes("openai.com") ||
            url.hostname.includes("anthropic.com") ||
            url.hostname.includes("stability.ai") ||
            url.hostname.includes("replicate.") ||
            url.hostname.includes("cohere.ai") ||
            url.hostname.includes("perplexity.ai") ||
            url.hostname.includes("huggingface.co") ||
            url.hostname.includes("googleapis.com");

        return {
            cache: IMAGE_CACHE,
            strategy: "cache-first",
            maxAge: isAIGenerated ? 24 * 60 * 60 : 7 * 24 * 60 * 60, // 1 day for AI images, 1 week for others
        };
    }

    // CSS/JS files - moderate caching with network fallback
    if (url.pathname.match(/\.(css|js|woff2?|ttf|eot)$/i)) {
        return { cache: DYNAMIC_CACHE, strategy: "stale-while-revalidate", maxAge: 24 * 60 * 60 }; // 1 day
    }

    // HTML pages - network first with cache fallback
    if (request.mode === "navigate" || request.headers.get("accept")?.includes("text/html")) {
        return { cache: DYNAMIC_CACHE, strategy: "network-first", maxAge: 5 * 60 }; // 5 minutes
    }

    // API calls - no caching for dynamic content
    if (url.pathname.startsWith("/api/")) {
        return { cache: null, strategy: "network-only" };
    }

    // Default - network first with short cache
    return { cache: DYNAMIC_CACHE, strategy: "network-first", maxAge: 60 }; // 1 minute
}

// Helper function to check if cached response is still fresh
function isCacheEntryFresh(response, maxAge) {
    if (!response) return false;

    const cachedTime = response.headers.get("sw-cached-at");
    if (!cachedTime) return false;

    const age = (Date.now() - parseInt(cachedTime)) / 1000;
    return age < maxAge;
}

// Helper function to add cache metadata to response
function addCacheMetadata(response) {
    const responseClone = response.clone();
    const headers = new Headers(responseClone.headers);
    headers.set("sw-cached-at", Date.now().toString());

    return new Response(responseClone.body, {
        status: responseClone.status,
        statusText: responseClone.statusText,
        headers: headers,
    });
}

// Helper function to clean up old cache entries
async function cleanupCache(cacheName, limit) {
    if (!limit) return;

    try {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();

        if (keys.length > limit) {
            // Remove oldest entries (simple LRU simulation)
            const entriesToDelete = keys.slice(0, keys.length - limit);
            await Promise.all(entriesToDelete.map((key) => cache.delete(key)));
        }
    } catch {
        // Silent cleanup failure - don't block other operations
    }
}

// Install event - cache critical static assets only
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches
            .open(STATIC_CACHE)
            .then((cache) => {
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
            .catch(() => {
                // Silent failure - don't block installation
            }),
    );
});

// Activate event - clean old caches and optimize storage
self.addEventListener("activate", (event) => {
    event.waitUntil(
        Promise.all([
            // Clean up old cache versions
            caches
                .keys()
                .then((cacheNames) => {
                    return Promise.all(
                        cacheNames.map((cacheName) => {
                            if (!cacheName.includes(CACHE_VERSION)) {
                                return caches.delete(cacheName);
                            }
                        }),
                    );
                }),
            // Clean up oversized caches
            Object.entries(CACHE_LIMITS).map(([cacheName, limit]) =>
                cleanupCache(cacheName, limit),
            ),
            // Take control of all clients
            self.clients.claim(),
        ]).catch(() => {
            // Silent failure - don't block activation
        }),
    );
});

// Push event - handle push notifications with error resilience
self.addEventListener("push", (event) => {
    if (event.data) {
        try {
            const data = event.data.json();
            const options = {
                body: data.body || "You have a new message",
                icon: data.icon || "/icon-192x192.png",
                badge: "/icon-192x192.png",
                vibrate: [100, 50, 100],
                data: {
                    dateOfArrival: Date.now(),
                    primaryKey: data.primaryKey || "1",
                    url: data.url || "/",
                },
                actions: [
                    {
                        action: "open",
                        title: "Open VT",
                        icon: "/icon-192x192.png",
                    },
                    {
                        action: "close",
                        title: "Close",
                    },
                ],
                requireInteraction: false,
                silent: false,
                timestamp: Date.now(),
            };

            event.waitUntil(self.registration.showNotification(data.title || "VT Chat", options));
        } catch {
            // Fallback notification on parse error
            event.waitUntil(
                self.registration.showNotification("VT Chat", {
                    body: "You have a new message",
                    icon: "/icon-192x192.png",
                    timestamp: Date.now(),
                }),
            );
        }
    }
});

// Notification click event - handle user interactions
self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const action = event.action;
    const notificationData = event.notification.data || {};

    if (action === "close") {
        return;
    }

    // Default action or 'open' action
    const urlToOpen = notificationData.url || "/";

    event.waitUntil(
        clients
            .matchAll({ type: "window", includeUncontrolled: true })
            .then((clientList) => {
                // Check if there's already a window/tab open with the target URL
                for (const client of clientList) {
                    if (client.url === urlToOpen && "focus" in client) {
                        return client.focus();
                    }
                }

                // If no existing window/tab, open a new one
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
            .catch(() => {
                // Silent failure for notification click errors
            }),
    );
});

// Optimized fetch event - intelligent caching with multiple strategies
self.addEventListener("fetch", (event) => {
    // Only handle GET requests
    if (event.request.method !== "GET") return;

    // Skip non-http(s) requests
    if (!event.request.url.startsWith("http")) return;

    const { cache: cacheName, strategy, maxAge } = getCacheStrategy(event.request);

    // Network-only requests (API calls)
    if (strategy === "network-only") {
        return;
    }

    event.respondWith(
        (async () => {
            try {
                switch (strategy) {
                    case "cache-first": {
                        // Try cache first, fallback to network
                        const cachedResponse = await caches.match(event.request);
                        if (cachedResponse && isCacheEntryFresh(cachedResponse, maxAge)) {
                            return cachedResponse;
                        }

                        try {
                            const networkResponse = await fetch(event.request);
                            if (networkResponse.ok && cacheName) {
                                const cache = await caches.open(cacheName);
                                await cache.put(
                                    event.request,
                                    addCacheMetadata(networkResponse.clone()),
                                );
                                // Cleanup cache if it gets too large
                                cleanupCache(cacheName, CACHE_LIMITS[cacheName]);
                            }
                            return networkResponse;
                        } catch {
                            // Return stale cache if network fails
                            return cachedResponse || createOfflineResponse(event.request);
                        }
                    }

                    case "network-first": {
                        // Try network first, fallback to cache
                        try {
                            const networkResponse = await fetch(event.request);
                            if (networkResponse.ok && cacheName) {
                                const cache = await caches.open(cacheName);
                                await cache.put(
                                    event.request,
                                    addCacheMetadata(networkResponse.clone()),
                                );
                                cleanupCache(cacheName, CACHE_LIMITS[cacheName]);
                            }
                            return networkResponse;
                        } catch {
                            const cachedResponse = await caches.match(event.request);
                            return cachedResponse || createOfflineResponse(event.request);
                        }
                    }

                    case "stale-while-revalidate": {
                        // Return cache immediately, update in background
                        const cachedResponse = await caches.match(event.request);

                        // Background update if cache is stale
                        if (!cachedResponse || !isCacheEntryFresh(cachedResponse, maxAge)) {
                            event.waitUntil(
                                fetch(event.request)
                                    .then(async (networkResponse) => {
                                        if (networkResponse.ok && cacheName) {
                                            const cache = await caches.open(cacheName);
                                            await cache.put(
                                                event.request,
                                                addCacheMetadata(networkResponse.clone()),
                                            );
                                            cleanupCache(cacheName, CACHE_LIMITS[cacheName]);
                                        }
                                    })
                                    .catch(() => {
                                        // Silent background update failure
                                    }),
                            );
                        }

                        if (cachedResponse) {
                            return cachedResponse;
                        }

                        // If no cache, wait for network
                        try {
                            const networkResponse = await fetch(event.request);
                            if (networkResponse.ok && cacheName) {
                                const cache = await caches.open(cacheName);
                                await cache.put(
                                    event.request,
                                    addCacheMetadata(networkResponse.clone()),
                                );
                            }
                            return networkResponse;
                        } catch {
                            return createOfflineResponse(event.request);
                        }
                    }

                    default:
                        return fetch(event.request);
                }
            } catch {
                return createOfflineResponse(event.request);
            }
        })(),
    );
});

// Helper function to create appropriate offline responses
function createOfflineResponse(request) {
    // Return offline page for navigation requests.
    if (request.mode === "navigate") {
        return caches.match("/offline.html");
    }

    // For other requests (e.g., images, styles), return a simple error response.
    return new Response("Service Unavailable", {
        status: 503,
        statusText: "Service Unavailable",
        headers: { "Content-Type": "text/plain" },
    });
}

// Background sync - handle offline actions when connection is restored
self.addEventListener("sync", (event) => {
    if (event.tag === "background-sync") {
        event.waitUntil(
            // Perform background sync operations here
            // This could include sending queued messages, syncing user data, etc.
            Promise.resolve(),
        );
    }
});

// Message event - handle communication with main thread
self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }

    // Handle cache management messages from the main thread
    if (event.data && event.data.type === "CACHE_CLEANUP") {
        event.waitUntil(
            Promise.all(
                Object.entries(CACHE_LIMITS).map(([cacheName, limit]) =>
                    cleanupCache(cacheName, limit),
                ),
            ),
        );
    }
});

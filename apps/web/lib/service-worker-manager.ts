/**
 * Service Worker Manager - Client-side utilities for SW interaction
 */

export type CacheStats = {
    [cacheName: string]: {
        size: number;
        entries: number;
        maxSize: number;
        maxEntries: number;
        error?: string;
    };
};

export class ServiceWorkerManager {
    private static instance: ServiceWorkerManager;
    private registration: ServiceWorkerRegistration | null = null;
    private isSupported: boolean;

    private constructor() {
        this.isSupported = 'serviceWorker' in navigator;
    }

    static getInstance(): ServiceWorkerManager {
        if (!ServiceWorkerManager.instance) {
            ServiceWorkerManager.instance = new ServiceWorkerManager();
        }
        return ServiceWorkerManager.instance;
    }

    /**
     * Register the service worker
     */
    async register(): Promise<ServiceWorkerRegistration | null> {
        if (!this.isSupported) {
            console.warn('Service Worker not supported');
            return null;
        }

        try {
            this.registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/',
                updateViaCache: 'none', // Always check for updates
            });

            console.log('Service Worker registered:', this.registration);

            // Handle updates
            this.registration.addEventListener('updatefound', () => {
                const newWorker = this.registration?.installing;
                if (newWorker) {
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New version available
                            this.onUpdateAvailable?.(this.registration!);
                        }
                    });
                }
            });

            // Auto-update check
            setInterval(() => {
                this.registration?.update();
            }, 60000); // Check every minute

            return this.registration;
        } catch (error) {
            console.error('Service Worker registration failed:', error);
            return null;
        }
    }

    /**
     * Update to the new service worker version
     */
    async update(): Promise<void> {
        if (!this.registration) return;

        const newWorker = this.registration.waiting || this.registration.installing;
        if (newWorker) {
            // Send skip waiting message
            newWorker.postMessage({ type: 'SKIP_WAITING' });

            // Wait for the new worker to take control
            await new Promise<void>((resolve) => {
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    resolve();
                });
            });

            // Reload the page
            window.location.reload();
        }
    }

    /**
     * Get cache statistics
     */
    async getCacheStats(): Promise<CacheStats | null> {
        if (!this.isSupported || !navigator.serviceWorker.controller) return null;

        return new Promise((resolve) => {
            const channel = new MessageChannel();

            channel.port1.onmessage = (event) => {
                resolve(event.data);
            };

            navigator.serviceWorker.controller.postMessage({ type: 'GET_CACHE_STATS' }, [
                channel.port2,
            ]);

            // Timeout after 5 seconds
            setTimeout(() => resolve(null), 5000);
        });
    }

    /**
     * Get total cache size
     */
    async getCacheSize(): Promise<{ totalSize: number; totalEntries: number } | null> {
        if (!this.isSupported || !navigator.serviceWorker.controller) return null;

        return new Promise((resolve) => {
            const channel = new MessageChannel();

            channel.port1.onmessage = (event) => {
                if (event.data.type === 'CACHE_SIZE') {
                    resolve(event.data.size);
                } else {
                    resolve(null);
                }
            };

            navigator.serviceWorker.controller.postMessage({ type: 'GET_CACHE_SIZE' }, [
                channel.port2,
            ]);

            // Timeout after 5 seconds
            setTimeout(() => resolve(null), 5000);
        });
    }

    /**
     * Clear specific cache or all caches
     */
    async clearCache(cacheName?: string): Promise<void> {
        if (!this.isSupported || !navigator.serviceWorker.controller) return;

        navigator.serviceWorker.controller.postMessage({
            type: 'CLEAR_CACHE',
            data: { cacheName },
        });
    }

    /**
     * Force sync offline queue
     */
    async forceSync(): Promise<void> {
        if (!this.isSupported || !navigator.serviceWorker.controller) return;

        navigator.serviceWorker.controller.postMessage({
            type: 'FORCE_SYNC',
        });
    }

    /**
     * Check if app is running in offline mode
     */
    isOffline(): boolean {
        return !navigator.onLine;
    }

    /**
     * Add event listeners for online/offline status
     */
    onConnectionChange(callback: (isOnline: boolean) => void): () => void {
        const onlineHandler = () => callback(true);
        const offlineHandler = () => callback(false);

        window.addEventListener('online', onlineHandler);
        window.addEventListener('offline', offlineHandler);

        return () => {
            window.removeEventListener('online', onlineHandler);
            window.removeEventListener('offline', offlineHandler);
        };
    }

    /**
     * Callback for when service worker update is available
     */
    onUpdateAvailable?: (registration: ServiceWorkerRegistration) => void;

    /**
     * Check if there's a service worker update waiting
     */
    hasUpdateWaiting(): boolean {
        return !!this.registration?.waiting;
    }

    /**
     * Get the current service worker registration
     */
    getRegistration(): ServiceWorkerRegistration | null {
        return this.registration;
    }

    /**
     * Unregister the service worker (for debugging)
     */
    async unregister(): Promise<boolean> {
        if (!this.registration) return false;

        try {
            const result = await this.registration.unregister();
            this.registration = null;
            return result;
        } catch (error) {
            console.error('Failed to unregister service worker:', error);
            return false;
        }
    }
}

// Create singleton instance
export const swManager = ServiceWorkerManager.getInstance();

// Auto-register in browser environment (production only)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    // Wait for page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            swManager.register();
        });
    } else {
        swManager.register();
    }
}

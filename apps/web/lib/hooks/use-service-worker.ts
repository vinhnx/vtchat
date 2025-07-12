/**
 * React hook for Service Worker management
 */

import { useCallback, useEffect, useState } from 'react';
import { type CacheStats, swManager } from '../service-worker-manager';

export interface ServiceWorkerHook {
    isSupported: boolean;
    isRegistered: boolean;
    isOnline: boolean;
    hasUpdate: boolean;
    cacheStats: CacheStats | null;
    isLoading: boolean;

    // Actions
    updateServiceWorker: () => Promise<void>;
    clearCache: (cacheName?: string) => Promise<void>;
    forceSync: () => Promise<void>;
    refreshCacheStats: () => Promise<void>;
}

export function useServiceWorker(): ServiceWorkerHook {
    const [isRegistered, setIsRegistered] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const [hasUpdate, setHasUpdate] = useState(false);
    const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isSupported = 'serviceWorker' in navigator;

    // Initialize service worker
    useEffect(() => {
        if (!isSupported) {
            setIsLoading(false);
            return;
        }

        const initSW = async () => {
            try {
                // Only register in production
                const registration =
                    process.env.NODE_ENV === 'production' ? await swManager.register() : null;
                setIsRegistered(!!registration);
                setHasUpdate(swManager.hasUpdateWaiting());

                // Set up update callback
                swManager.onUpdateAvailable = () => {
                    setHasUpdate(true);
                };

                // Get initial cache stats
                const stats = await swManager.getCacheStats();
                setCacheStats(stats);
            } catch (error) {
                console.error('Service worker initialization failed:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initSW();
    }, [isSupported]);

    // Monitor online/offline status
    useEffect(() => {
        setIsOnline(!swManager.isOffline());

        const cleanup = swManager.onConnectionChange((online) => {
            setIsOnline(online);
        });

        return cleanup;
    }, []);

    // Update service worker
    const updateServiceWorker = useCallback(async () => {
        try {
            await swManager.update();
            setHasUpdate(false);
        } catch (error) {
            console.error('Service worker update failed:', error);
        }
    }, []);

    // Clear cache
    const clearCache = useCallback(async (cacheName?: string) => {
        try {
            await swManager.clearCache(cacheName);
            // Refresh stats after clearing
            const stats = await swManager.getCacheStats();
            setCacheStats(stats);
        } catch (error) {
            console.error('Cache clear failed:', error);
        }
    }, []);

    // Force sync
    const forceSync = useCallback(async () => {
        try {
            await swManager.forceSync();
        } catch (error) {
            console.error('Force sync failed:', error);
        }
    }, []);

    // Refresh cache stats
    const refreshCacheStats = useCallback(async () => {
        try {
            const stats = await swManager.getCacheStats();
            setCacheStats(stats);
        } catch (error) {
            console.error('Cache stats refresh failed:', error);
        }
    }, []);

    return {
        isSupported,
        isRegistered,
        isOnline,
        hasUpdate,
        cacheStats,
        isLoading,
        updateServiceWorker,
        clearCache,
        forceSync,
        refreshCacheStats,
    };
}

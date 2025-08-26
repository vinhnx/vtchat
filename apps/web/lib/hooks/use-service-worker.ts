/**
 * React hook for Service Worker management
 */

import { log } from '@repo/shared/lib/logger';
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

    const isSupported = typeof window !== 'undefined' && 'serviceWorker' in navigator;

    // Initialize service worker
    useEffect(() => {
        if (!isSupported || !swManager) {
            setIsLoading(false);
            return;
        }

        const initSW = async () => {
            try {
                // Only register in production
                const registration = process.env.NODE_ENV === 'production'
                    ? await swManager.register()
                    : null;
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
                log.error({ error }, 'Service worker initialization failed');
            } finally {
                setIsLoading(false);
            }
        };

        initSW();
    }, [isSupported]);

    // Monitor online/offline status
    useEffect(() => {
        if (!swManager) return;

        setIsOnline(!swManager.isOffline());

        const cleanup = swManager.onConnectionChange((online) => {
            setIsOnline(online);
        });

        return cleanup;
    }, []);

    // Update service worker
    const updateServiceWorker = useCallback(async () => {
        if (!swManager) return;
        try {
            await swManager.update();
            setHasUpdate(false);
        } catch (error) {
            log.error({ error }, 'Service worker update failed');
        }
    }, []);

    // Clear cache
    const clearCache = useCallback(async (cacheName?: string) => {
        if (!swManager) return;
        try {
            await swManager.clearCache(cacheName);
            // Refresh stats after clearing
            const stats = await swManager.getCacheStats();
            setCacheStats(stats);
        } catch (error) {
            log.error({ error }, 'Cache clear failed');
        }
    }, []);

    // Force sync
    const forceSync = useCallback(async () => {
        if (!swManager) return;
        try {
            await swManager.forceSync();
        } catch (error) {
            log.error({ error }, 'Force sync failed');
        }
    }, []);

    // Refresh cache stats
    const refreshCacheStats = useCallback(async () => {
        if (!swManager) return;
        try {
            const stats = await swManager.getCacheStats();
            setCacheStats(stats);
        } catch (error) {
            log.error({ error }, 'Cache stats refresh failed');
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

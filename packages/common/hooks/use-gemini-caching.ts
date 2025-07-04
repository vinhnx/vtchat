/**
 * Hook for managing Gemini explicit caching for VT+ users
 */

import { log } from '@repo/shared/logger';
import { FeatureSlug } from '@repo/shared/types/subscription';
import { useAppStore } from '../store';
import { useFeatureAccess } from './use-subscription-access';

/**
 * Hook to manage Gemini explicit caching settings and access
 */
export function useGeminiCaching() {
    const hasAccess = useFeatureAccess(FeatureSlug.GEMINI_EXPLICIT_CACHING);
    const geminiCaching = useAppStore((state) => state.geminiCaching);
    const setGeminiCaching = useAppStore((state) => state.setGeminiCaching);

    const isEnabled = hasAccess && geminiCaching.enabled;

    const updateSettings = (config: {
        enabled?: boolean;
        ttlSeconds?: number;
        maxCaches?: number;
    }) => {
        if (!hasAccess) {
            log.warn('Gemini caching is only available for VT+ users');
            return;
        }

        setGeminiCaching({
            enabled: config.enabled,
            ttlSeconds: config.ttlSeconds,
            maxCaches: config.maxCaches,
        });
    };

    return {
        hasAccess,
        isEnabled,
        settings: geminiCaching,
        updateSettings,

        // Convenience methods
        enable: () => updateSettings({ enabled: true }),
        disable: () => updateSettings({ enabled: false }),
        setTTL: (ttlSeconds: number) => updateSettings({ ttlSeconds }),
        setMaxCaches: (maxCaches: number) => updateSettings({ maxCaches }),
    };
}

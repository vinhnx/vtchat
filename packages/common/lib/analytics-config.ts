/**
 * Analytics Configuration
 * Vercel Analytics: Disabled
 */

export const ANALYTICS_CONFIG = {
    // Analytics disabled

    // Vercel Analytics disabled
    vercel: {
        enabled: false,
        webAnalytics: false,
    },

    // Feature flags - all disabled
    features: {
        userJourney: false,
        performance: false,
        ecommerce: false,
        customEvents: false,
        realTimeAnalytics: false,
    },
} as const;

/**
 * Check if analytics is properly configured
 */
export function isAnalyticsConfigured(): boolean {
    return false;
}

/**
 * Get analytics provider name for logging
 */
export function getAnalyticsProvider(): string {
    return "none";
}

/**
 * Check if a specific analytics feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof ANALYTICS_CONFIG.features): boolean {
    return ANALYTICS_CONFIG.features[feature];
}

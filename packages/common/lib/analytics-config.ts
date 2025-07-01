/**
 * Analytics Configuration
 * Primary analytics provider: Vemetric
 * Vercel Analytics: Disabled
 */

export const ANALYTICS_CONFIG = {
    // Primary analytics provider
    provider: 'vemetric' as const,
    
    // Vercel Analytics disabled
    vercel: {
        enabled: false,
        webAnalytics: false,
    },
    
    // Vemetric configuration
    vemetric: {
        enabled: true,
        frontendToken: process.env.NEXT_PUBLIC_VEMETRIC_TOKEN,
        backendToken: process.env.VEMETRIC_TOKEN,
        host: process.env.VEMETRIC_HOST || 'https://hub.vemetric.com',
        
        // Auto-tracking features
        autoTrack: {
            pageViews: true,
            clicks: true,
            forms: false, // We handle forms manually
            performance: true,
        },
        
        // Data collection settings
        privacy: {
            respectDoNotTrack: true,
            anonymizeIPs: true,
            cookieConsent: true,
        },
        
        // Error handling
        errorHandling: {
            silentCorsErrors: true,
            retryFailedEvents: true,
            fallbackLogging: true,
        },
    },
    
    // Feature flags
    features: {
        userJourney: true,
        performance: true,
        ecommerce: true,
        customEvents: true,
        realTimeAnalytics: true,
    },
} as const;

export type AnalyticsProvider = typeof ANALYTICS_CONFIG.provider;

/**
 * Check if analytics is properly configured
 */
export function isAnalyticsConfigured(): boolean {
    return !!(
        ANALYTICS_CONFIG.vemetric.enabled &&
        ANALYTICS_CONFIG.vemetric.frontendToken
    );
}

/**
 * Get analytics provider name for logging
 */
export function getAnalyticsProvider(): string {
    return ANALYTICS_CONFIG.provider;
}

/**
 * Check if a specific analytics feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof ANALYTICS_CONFIG.features): boolean {
    return ANALYTICS_CONFIG.features[feature];
}

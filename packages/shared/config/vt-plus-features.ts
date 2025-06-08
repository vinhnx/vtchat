/**
 * VT+ Subscription Features Configuration
 *
 * Defines all features and capabilities available with VT+ subscription
 */

export interface VTPlusFeature {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
}

/**
 * VT+ Features Configuration
 */
export const VT_PLUS_FEATURES: Record<string, VTPlusFeature> = {
    PRO_SEARCH: {
        id: 'pro_search',
        name: 'Pro Search',
        description: 'Pro Search: Enhanced search with web integration for real-time information.',
        enabled: true,
    },
    DARK_MODE: {
        id: 'dark_mode',
        name: 'Dark Mode',
        description: 'Access to dark mode.',
        enabled: true,
    },
    DEEP_RESEARCH: {
        id: 'deep_research',
        name: 'Deep Research',
        description: 'Deep Research: Comprehensive analysis of complex topics with in-depth exploration.',
        enabled: true,
    },
} as const;

/**
 * VT+ Product Information
 */
export const VT_PLUS_PRODUCT_INFO = {
    name: 'VT+',
    productId: process.env.CREEM_PRODUCT_ID, // Use environment variable
    description: 'For everyday productivity',
    pricing: {
        amount: 9.99,
        currency: 'USD',
        type: 'subscription' as const,
        interval: 'monthly' as const,
        taxIncluded: true,
    },
    features: Object.values(VT_PLUS_FEATURES),
} as const;

/**
 * Check if a specific feature is available for VT+ subscribers
 */
export function isVTPlusFeatureEnabled(featureId: string): boolean {
    const feature = Object.values(VT_PLUS_FEATURES).find(f => f.id === featureId);
    return feature?.enabled ?? false;
}

/**
 * Get all enabled VT+ features
 */
export function getEnabledVTPlusFeatures(): VTPlusFeature[] {
    return Object.values(VT_PLUS_FEATURES).filter(feature => feature.enabled);
}

/**
 * VT+ Feature Access Control
 * Helper functions to check feature access based on subscription status
 */
export const VTPlusAccess = {
    /**
     * Check if user has access to Pro Search
     */
    hasProSearch: (isVTPlusActive: boolean): boolean => {
        return isVTPlusActive && isVTPlusFeatureEnabled('pro_search');
    },

    /**
     * Check if user has access to Dark Mode
     */
    hasDarkMode: (isVTPlusActive: boolean): boolean => {
        return isVTPlusActive && isVTPlusFeatureEnabled('dark_mode');
    },

    /**
     * Check if user has access to Deep Research
     */
    hasDeepResearch: (isVTPlusActive: boolean): boolean => {
        return isVTPlusActive && isVTPlusFeatureEnabled('deep_research');
    },

    /**
     * Get all accessible features for a user
     */
    getAccessibleFeatures: (isVTPlusActive: boolean): VTPlusFeature[] => {
        if (!isVTPlusActive) return [];
        return getEnabledVTPlusFeatures();
    },
} as const;

/**
 * VT+ Subscription Features Configuration
 *
 * Defines all features and capabilities available with VT+ subscription
 */

import { CURRENCIES, VT_PLUS_PRICE } from '../constants';
import { FeatureSlug } from '../types/subscription';

export interface VTPlusFeature {
    id: FeatureSlug;
    name: string;
    description: string;
    enabled: boolean;
}

/**
 * VT+ Features Configuration
 * Only includes features that are exclusively available to VT+ subscribers
 */
export const VT_PLUS_FEATURES: Partial<Record<FeatureSlug, VTPlusFeature>> = {
    [FeatureSlug.PRO_SEARCH]: {
        id: FeatureSlug.PRO_SEARCH,
        name: 'Enhanced Web Search',
        description:
            'AI-powered web search with real-time information and comprehensive topic analysis.',
        enabled: true,
    },
    [FeatureSlug.DEEP_RESEARCH]: {
        id: FeatureSlug.DEEP_RESEARCH,
        name: 'Deep Research',
        description:
            'Advanced research capabilities with comprehensive analysis and detailed insights.',
        enabled: true,
    },
    [FeatureSlug.GEMINI_MODELS_NO_BYOK]: {
        id: FeatureSlug.GEMINI_MODELS_NO_BYOK,
        name: 'All Gemini Models Without BYOK',
        description:
            'Access all Gemini models (Gemini 2.5 Pro, Gemini 2.5 Flash, Gemini 2.5 Flash Lite) plus enhanced tools (web search, math calculator, charts) without needing your own API keys.',
        enabled: true,
    },
} as const;

/**
 * VT+ Product Information
 */
export const VT_PLUS_PRODUCT_INFO = {
    name: 'VT+',
    productId: process.env.CREEM_PRODUCT_ID, // Use environment variable
    description: 'Premium AI models and research capabilities',
    pricing: {
        amount: VT_PLUS_PRICE,
        currency: CURRENCIES.USD,
        type: 'subscription' as const,
        interval: 'monthly' as const,
        taxIncluded: true,
    },
    features: Object.values(VT_PLUS_FEATURES),
} as const;

/**
 * Check if a specific feature is available for VT+ subscribers
 */
export function isVTPlusFeatureEnabled(featureId: FeatureSlug): boolean {
    const feature = VT_PLUS_FEATURES[featureId];
    return feature?.enabled ?? false;
}

/**
 * Get all enabled VT+ features
 */
export function getEnabledVTPlusFeatures(): VTPlusFeature[] {
    return Object.values(VT_PLUS_FEATURES).filter((feature) => feature.enabled);
}

/**
 * VT+ Feature Access Control
 * Helper functions to check feature access based on subscription status
 * Note: Many features are now available to free tier users (logged in)
 */
export const VTPlusAccess = {
    /**
     * Check if user has access to Enhanced Web Search (VT+ exclusive)
     */
    hasProSearch: (isVTPlusActive: boolean): boolean => {
        return isVTPlusActive && isVTPlusFeatureEnabled(FeatureSlug.PRO_SEARCH);
    },

    /**
     * Check if user has access to Deep Research (VT+ exclusive)
     */
    hasDeepResearch: (isVTPlusActive: boolean): boolean => {
        return isVTPlusActive && isVTPlusFeatureEnabled(FeatureSlug.DEEP_RESEARCH);
    },

    /**
     * Check if user has access to Dark Mode (Free for logged in users)
     */
    hasDarkMode: (isSignedIn: boolean): boolean => {
        return isSignedIn; // Available to all logged in users
    },

    /**
     * Check if user has access to Structured Outputs (Free for logged in users)
     */
    hasStructuredOutput: (isSignedIn: boolean): boolean => {
        return isSignedIn; // Available to all logged in users
    },

    /**
     * Check if user has access to Thinking Mode (Free for logged in users)
     */
    hasThinkingMode: (isSignedIn: boolean): boolean => {
        return isSignedIn; // Available to all logged in users
    },

    /**
     * Check if user has access to Document Parsing (Free for logged in users)
     */
    hasDocumentParsing: (isSignedIn: boolean): boolean => {
        return isSignedIn; // Available to all logged in users
    },

    /**
     * Check if user has access to Thinking Mode Toggle (Free for logged in users)
     */
    hasThinkingModeToggle: (isSignedIn: boolean): boolean => {
        return isSignedIn; // Available to all logged in users
    },

    /**
     * Check if user has access to Reasoning Chain (Free for logged in users)
     */
    hasReasoningChain: (isSignedIn: boolean): boolean => {
        return isSignedIn; // Available to all logged in users
    },

    /**
     * Check if user has access to Gemini Explicit Caching (Free for logged in users)
     */
    hasGeminiExplicitCaching: (isSignedIn: boolean): boolean => {
        return isSignedIn; // Available to all logged in users
    },

    /**
     * Check if user has access to Chart Visualization (Free for logged in users)
     */
    hasChartVisualization: (isSignedIn: boolean): boolean => {
        return isSignedIn; // Available to all logged in users
    },

    /**
     * Get all VT+ exclusive features for a user
     */
    getAccessibleFeatures: (isVTPlusActive: boolean): VTPlusFeature[] => {
        if (!isVTPlusActive) return [];
        return getEnabledVTPlusFeatures();
    },
} as const;

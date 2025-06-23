/**
 * VT+ Subscription Features Configuration
 *
 * Defines all features and capabilities available with VT+ subscription
 */

import { FeatureSlug } from '../types/subscription';

export interface VTPlusFeature {
    id: FeatureSlug;
    name: string;
    description: string;
    enabled: boolean;
}

/**
 * VT+ Features Configuration
 */
export const VT_PLUS_FEATURES: Partial<Record<FeatureSlug, VTPlusFeature>> = {
    [FeatureSlug.PRO_SEARCH]: {
        id: FeatureSlug.PRO_SEARCH,
        name: 'Grounding Web Search - by Gemini',
        description: '"Web Search: Real-time web-enabled search with advanced grounding features"',
        enabled: true,
    },
    [FeatureSlug.DARK_THEME]: {
        id: FeatureSlug.DARK_THEME,
        name: 'Dark Theme',
        description: 'Access to dark theme.',
        enabled: true,
    },
    [FeatureSlug.DEEP_RESEARCH]: {
        id: FeatureSlug.DEEP_RESEARCH,
        name: 'Grounding Web Search',
        description:
            'Grounding Web Search: Comprehensive analysis of complex topics with in-depth exploration.',
        enabled: true,
    },
    [FeatureSlug.STRUCTURED_OUTPUT]: {
        id: FeatureSlug.STRUCTURED_OUTPUT,
        name: 'Structured Outputs',
        description:
            'AI-powered extraction of structured data from documents and advanced output formatting.',
        enabled: true,
    },
    [FeatureSlug.THINKING_MODE]: {
        id: FeatureSlug.THINKING_MODE,
        name: 'Thinking Mode',
        description:
            'Enhanced AI reasoning with visible thought processes for complex problem solving.',
        enabled: true,
    },
    [FeatureSlug.DOCUMENT_PARSING]: {
        id: FeatureSlug.DOCUMENT_PARSING,
        name: 'Document Parsing',
        description:
            'Advanced document parsing and analysis for PDFs, Word documents, and various file formats.',
        enabled: true,
    },
    [FeatureSlug.THINKING_MODE_TOGGLE]: {
        id: FeatureSlug.THINKING_MODE_TOGGLE,
        name: 'Thinking Mode Toggle',
        description:
            'Full control over thinking mode activation for customized AI reasoning experience.',
        enabled: true,
    },
    [FeatureSlug.REASONING_CHAIN]: {
        id: FeatureSlug.REASONING_CHAIN,
        name: 'Reasoning Chain',
        description:
            'Advanced chain-of-thought reasoning capabilities for complex analysis and problem solving.',
        enabled: true,
    },
    [FeatureSlug.GEMINI_EXPLICIT_CACHING]: {
        id: FeatureSlug.GEMINI_EXPLICIT_CACHING,
        name: 'Gemini Explicit Caching',
        description:
            'Cost-effective caching for Gemini 2.5 and 2.0 models to reduce API costs through context reuse.',
        enabled: true,
    },
    [FeatureSlug.CHART_VISUALIZATION]: {
        id: FeatureSlug.CHART_VISUALIZATION,
        name: 'Interactive Chart Generation',
        description:
            'AI-powered interactive chart creation including bar charts, line charts, area charts, pie charts, and radar charts with beautiful visualizations.',
        enabled: true,
    },
    [FeatureSlug.RAG]: {
        id: FeatureSlug.RAG,
        name: 'Personal AI Assistant with Memory',
        description:
            'Personal knowledge base with intelligent information storage and retrieval capabilities for enhanced AI conversations.',
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
export function isVTPlusFeatureEnabled(featureId: FeatureSlug): boolean {
    const feature = VT_PLUS_FEATURES[featureId];
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
     * Check if user has access to Grounding Web Search
     */
    hasProSearch: (isVTPlusActive: boolean): boolean => {
        return isVTPlusActive && isVTPlusFeatureEnabled(FeatureSlug.PRO_SEARCH);
    },

    /**
     * Check if user has access to Dark Mode
     */
    hasDarkMode: (isVTPlusActive: boolean): boolean => {
        return isVTPlusActive && isVTPlusFeatureEnabled(FeatureSlug.DARK_THEME);
    },

    /**
     * Check if user has access to Deep Research
     */
    hasDeepResearch: (isVTPlusActive: boolean): boolean => {
        return isVTPlusActive && isVTPlusFeatureEnabled(FeatureSlug.DEEP_RESEARCH);
    },

    /**
     * Check if user has access to Structured Outputs
     */
    hasStructuredOutput: (isVTPlusActive: boolean): boolean => {
        return isVTPlusActive && isVTPlusFeatureEnabled(FeatureSlug.STRUCTURED_OUTPUT);
    },

    /**
     * Check if user has access to Thinking Mode
     */
    hasThinkingMode: (isVTPlusActive: boolean): boolean => {
        return isVTPlusActive && isVTPlusFeatureEnabled(FeatureSlug.THINKING_MODE);
    },

    /**
     * Check if user has access to Document Parsing
     */
    hasDocumentParsing: (isVTPlusActive: boolean): boolean => {
        return isVTPlusActive && isVTPlusFeatureEnabled(FeatureSlug.DOCUMENT_PARSING);
    },

    /**
     * Check if user has access to Thinking Mode Toggle
     */
    hasThinkingModeToggle: (isVTPlusActive: boolean): boolean => {
        return isVTPlusActive && isVTPlusFeatureEnabled(FeatureSlug.THINKING_MODE_TOGGLE);
    },

    /**
     * Check if user has access to Reasoning Chain
     */
    hasReasoningChain: (isVTPlusActive: boolean): boolean => {
        return isVTPlusActive && isVTPlusFeatureEnabled(FeatureSlug.REASONING_CHAIN);
    },

    /**
     * Check if user has access to Gemini Explicit Caching
     */
    hasGeminiExplicitCaching: (isVTPlusActive: boolean): boolean => {
        return isVTPlusActive && isVTPlusFeatureEnabled(FeatureSlug.GEMINI_EXPLICIT_CACHING);
    },

    /**
     * Check if user has access to Chart Visualization
     */
    hasChartVisualization: (isVTPlusActive: boolean): boolean => {
        return isVTPlusActive && isVTPlusFeatureEnabled(FeatureSlug.CHART_VISUALIZATION);
    },

    /**
     * Check if user has access to Personal AI Assistant with Memory
     */
     hasPersonalAI: (isVTPlusActive: boolean): boolean => {
     return isVTPlusActive && isVTPlusFeatureEnabled(FeatureSlug.RAG);
    },

    /**
     * Get all accessible features for a user
     */
    getAccessibleFeatures: (isVTPlusActive: boolean): VTPlusFeature[] => {
        if (!isVTPlusActive) return [];
        return getEnabledVTPlusFeatures();
    },
} as const;

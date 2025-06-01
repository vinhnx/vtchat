/**
 * VT Chat Subscription Plans and Features
 *
 * This module defines the subscription plans and features for the VT Chat application.
 * It includes plan definitions, feature mappings, and utility functions for access control.
 */

// Plan slug enumerations
export enum PlanSlug {
    VT_BASE = 'vt_base',
    VT_PLUS = 'vt_plus',
}

// Feature slug enumerations
export enum FeatureSlug {
    // Base Plan Features
    ACCESS_CHAT = 'access_chat',
    BASE_MODELS = 'base_models',

    // VT+ Plan Features
    DARK_MODE = 'dark_mode',
    DEEP_RESEARCH = 'deep_research',
    PRO_SEARCH = 'pro_search',
    ADVANCED_CHAT_MODES = 'advanced_chat_modes',
}

// Plan configuration interface
export interface PlanConfig {
    slug: PlanSlug;
    name: string;
    description: string;
    features: FeatureSlug[];
    isDefault?: boolean;
}

// Feature configuration interface
export interface FeatureConfig {
    slug: FeatureSlug;
    name: string;
    description: string;
}

// Plan definitions
export const PLANS: Record<PlanSlug, PlanConfig> = {
    [PlanSlug.VT_BASE]: {
        slug: PlanSlug.VT_BASE,
        name: 'Base',
        description: 'Basic access to VT Chat with essential features',
        features: [FeatureSlug.ACCESS_CHAT, FeatureSlug.BASE_MODELS],
        isDefault: true,
    },
    [PlanSlug.VT_PLUS]: {
        slug: PlanSlug.VT_PLUS,
        name: 'VT+',
        description: 'Enhanced experience with advanced features and capabilities',
        features: [
            // All Base plan features
            FeatureSlug.ACCESS_CHAT,
            FeatureSlug.BASE_MODELS,

            // Additional VT+ features
            FeatureSlug.DARK_MODE,
            FeatureSlug.DEEP_RESEARCH,
            FeatureSlug.PRO_SEARCH,
            FeatureSlug.ADVANCED_CHAT_MODES,
        ],
    },
};

// Feature definitions
export const FEATURES: Record<FeatureSlug, FeatureConfig> = {
    [FeatureSlug.ACCESS_CHAT]: {
        slug: FeatureSlug.ACCESS_CHAT,
        name: 'Chat Access',
        description: 'Access to basic chat functionality',
    },
    [FeatureSlug.BASE_MODELS]: {
        slug: FeatureSlug.BASE_MODELS,
        name: 'Base Models',
        description: 'Access to standard AI models',
    },
    [FeatureSlug.DARK_MODE]: {
        slug: FeatureSlug.DARK_MODE,
        name: 'Dark Mode',
        description: 'Dark theme for better viewing experience',
    },
    [FeatureSlug.DEEP_RESEARCH]: {
        slug: FeatureSlug.DEEP_RESEARCH,
        name: 'Deep Research',
        description: 'Advanced research capabilities with comprehensive analysis',
    },
    [FeatureSlug.PRO_SEARCH]: {
        slug: FeatureSlug.PRO_SEARCH,
        name: 'Pro Search',
        description: 'Enhanced search with web integration',
    },
    [FeatureSlug.ADVANCED_CHAT_MODES]: {
        slug: FeatureSlug.ADVANCED_CHAT_MODES,
        name: 'Advanced Chat Modes',
        description: 'Access to specialized chat modes and advanced AI capabilities',
    },
};

// Default plan slug
export const DEFAULT_PLAN = PlanSlug.VT_BASE;

// Utility types
export type PlanSlugType = keyof typeof PlanSlug;
export type FeatureSlugType = keyof typeof FeatureSlug;

// Access control types
export interface AccessCheckOptions {
    plan?: PlanSlug;
    feature?: FeatureSlug;
}

export interface UserSubscription {
    planSlug: PlanSlug;
    features: FeatureSlug[];
    isActive: boolean;
    expiresAt?: Date;
}

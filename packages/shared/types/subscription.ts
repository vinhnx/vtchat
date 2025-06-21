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
    FREE_MODELS = 'free_models',
    MATH_CALCULATOR = 'math_calculator',
    BASE_FEATURES = 'base_features',

    // VT+ Plan Features
    DARK_THEME = 'dark_theme',
    DEEP_RESEARCH = 'deep_research',
    PRO_SEARCH = 'pro_search',
    GROUNDING_WEB_SEARCH = 'grounding_web_search',
    ADVANCED_CHAT_MODES = 'advanced_chat_modes',
    STRUCTURED_OUTPUT = 'structured_output',
    THINKING_MODE = 'thinking_mode',
    DOCUMENT_PARSING = 'document_parsing',
    THINKING_MODE_TOGGLE = 'thinking_mode_toggle',
    REASONING_CHAIN = 'reasoning_chain',
    GEMINI_EXPLICIT_CACHING = 'gemini_explicit_caching',
    CHART_VISUALIZATION = 'chart_visualization',
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
        description:
            'Perfect for getting started with VT - Access to base features with free models and essential tools',
        features: [
            FeatureSlug.ACCESS_CHAT,
            FeatureSlug.BASE_MODELS,
            FeatureSlug.FREE_MODELS,
            FeatureSlug.MATH_CALCULATOR,
            FeatureSlug.BASE_FEATURES,
        ],
        isDefault: true,
    },
    [PlanSlug.VT_PLUS]: {
        slug: PlanSlug.VT_PLUS,
        name: 'VT+',
        description:
            'Enhanced experience with advanced features and capabilities including document parsing, structured outputs, thinking mode controls, and reasoning chains',
        features: [
            // All Base plan features
            FeatureSlug.ACCESS_CHAT,
            FeatureSlug.BASE_MODELS,
            FeatureSlug.FREE_MODELS,
            FeatureSlug.MATH_CALCULATOR,
            FeatureSlug.BASE_FEATURES,

            // Additional VT+ features
            FeatureSlug.DARK_THEME,
            FeatureSlug.DEEP_RESEARCH,
            FeatureSlug.PRO_SEARCH,
            FeatureSlug.GROUNDING_WEB_SEARCH,
            FeatureSlug.ADVANCED_CHAT_MODES,
            FeatureSlug.STRUCTURED_OUTPUT,
            FeatureSlug.THINKING_MODE,
            FeatureSlug.DOCUMENT_PARSING,
            FeatureSlug.THINKING_MODE_TOGGLE,
            FeatureSlug.REASONING_CHAIN,
            FeatureSlug.GEMINI_EXPLICIT_CACHING,
            FeatureSlug.CHART_VISUALIZATION,
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
    [FeatureSlug.FREE_MODELS]: {
        slug: FeatureSlug.FREE_MODELS,
        name: 'Access to Free Models',
        description:
            'Access to free AI models including DeepSeek V3, DeepSeek R1, and Qwen3 14B via OpenRouter',
    },
    [FeatureSlug.MATH_CALCULATOR]: {
        slug: FeatureSlug.MATH_CALCULATOR,
        name: 'Mathematical Calculator Tools',
        description:
            'Mathematical calculation tools providing essential mathematical operations including trigonometric functions, logarithms, exponentials, and basic arithmetic calculations',
    },
    [FeatureSlug.BASE_FEATURES]: {
        slug: FeatureSlug.BASE_FEATURES,
        name: 'Access to Base Features',
        description:
            'Access to base features including local storage privacy, basic AI interactions, and core functionality',
    },
    [FeatureSlug.DARK_THEME]: {
        slug: FeatureSlug.DARK_THEME,
        name: 'Dark Theme',
        description: 'Dark theme for better viewing experience',
    },
    [FeatureSlug.DEEP_RESEARCH]: {
        slug: FeatureSlug.DEEP_RESEARCH,
        name: 'Grounding Web Search',
        description: 'Advanced research capabilities with comprehensive analysis',
    },
    [FeatureSlug.PRO_SEARCH]: {
        slug: FeatureSlug.PRO_SEARCH,
        name: 'Grounding Web Search',
        description: 'Enhanced search with web integration',
    },
    [FeatureSlug.GROUNDING_WEB_SEARCH]: {
        slug: FeatureSlug.GROUNDING_WEB_SEARCH,
        name: 'Google Dynamic Retrieval',
        description: 'Advanced AI-powered search with dynamic content retrieval from Google',
    },
    [FeatureSlug.ADVANCED_CHAT_MODES]: {
        slug: FeatureSlug.ADVANCED_CHAT_MODES,
        name: 'Advanced Chat Modes',
        description: 'Access to specialized chat modes and advanced AI capabilities',
    },
    [FeatureSlug.STRUCTURED_OUTPUT]: {
        slug: FeatureSlug.STRUCTURED_OUTPUT,
        name: 'Structured Data Extraction',
        description:
            'AI-powered extraction of structured data from PDF documents using Gemini models',
    },
    [FeatureSlug.THINKING_MODE]: {
        slug: FeatureSlug.THINKING_MODE,
        name: 'Thinking Mode',
        description:
            'Enhanced AI reasoning with visible thought processes for Gemini models (VT+ exclusive)',
    },
    [FeatureSlug.DOCUMENT_PARSING]: {
        slug: FeatureSlug.DOCUMENT_PARSING,
        name: 'Document Parsing',
        description:
            'AI-powered parsing and analysis of various document formats including PDFs, Word documents, and more',
    },
    [FeatureSlug.THINKING_MODE_TOGGLE]: {
        slug: FeatureSlug.THINKING_MODE_TOGGLE,
        name: 'Thinking Mode Toggle',
        description:
            'Ability to toggle thinking mode on/off for customized AI reasoning experience',
    },
    [FeatureSlug.REASONING_CHAIN]: {
        slug: FeatureSlug.REASONING_CHAIN,
        name: 'Reasoning Chain',
        description:
            'Advanced chain-of-thought reasoning capabilities for complex problem solving and analysis',
    },
    [FeatureSlug.GEMINI_EXPLICIT_CACHING]: {
        slug: FeatureSlug.GEMINI_EXPLICIT_CACHING,
        name: 'Gemini Explicit Caching',
        description:
            'Cost-effective caching for Gemini 2.5 and 2.0 models to reduce API costs through context reuse',
    },
    [FeatureSlug.CHART_VISUALIZATION]: {
        slug: FeatureSlug.CHART_VISUALIZATION,
        name: 'Interactive Chart Generation',
        description:
            'AI-powered interactive chart creation including bar charts, line charts, area charts, pie charts, and radar charts with beautiful visualizations',
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

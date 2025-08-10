/**
 * VT Chat Subscription Plans and Features
 *
 * This module defines the subscription plans and features for the VT Chat application.
 * It includes plan definitions, feature mappings, and utility functions for access control.
 */
export declare const PlanSlug: {
    readonly ANONYMOUS: "anonymous";
    readonly VT_BASE: "vt_base";
    readonly VT_PLUS: "vt_plus";
};
export type PlanSlug = (typeof PlanSlug)[keyof typeof PlanSlug];
export declare const FeatureSlug: {
    readonly ACCESS_CHAT: "access_chat";
    readonly BASE_MODELS: "base_models";
    readonly FREE_MODELS: "free_models";
    readonly MATH_CALCULATOR: "math_calculator";
    readonly BASE_FEATURES: "base_features";
    readonly DARK_THEME: "dark_theme";
    readonly DEEP_RESEARCH: "deep_research";
    readonly PRO_SEARCH: "pro_search";
    readonly GROUNDING_WEB_SEARCH: "grounding_web_search";
    readonly ADVANCED_CHAT_MODES: "advanced_chat_modes";
    readonly STRUCTURED_OUTPUT: "structured_output";
    readonly THINKING_MODE: "thinking_mode";
    readonly DOCUMENT_PARSING: "document_parsing";
    readonly THINKING_MODE_TOGGLE: "thinking_mode_toggle";
    readonly REASONING_CHAIN: "reasoning_chain";
    readonly GEMINI_EXPLICIT_CACHING: "gemini_explicit_caching";
    readonly CHART_VISUALIZATION: "chart_visualization";
    readonly MULTI_MODAL_CHAT: "multi_modal_chat";
    readonly GEMINI_MODELS_NO_BYOK: "gemini_models_no_byok";
    readonly CODE_SANDBOX: "code_sandbox";
};
export type FeatureSlug = (typeof FeatureSlug)[keyof typeof FeatureSlug];
export interface PlanConfig {
    slug: PlanSlug;
    name: string;
    description: string;
    features: FeatureSlug[];
    isDefault?: boolean;
}
export interface FeatureConfig {
    slug: FeatureSlug;
    name: string;
    description: string;
}
export declare const PLANS: Record<PlanSlug, PlanConfig>;
export declare const FEATURES: Record<FeatureSlug, FeatureConfig>;
export declare const DEFAULT_PLAN: "vt_base";
export type PlanSlugType = keyof typeof PlanSlug;
export type FeatureSlugType = keyof typeof FeatureSlug;
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
//# sourceMappingURL=subscription.d.ts.map
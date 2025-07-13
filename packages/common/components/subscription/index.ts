/**
 * VT Chat Subscription System - Main Export
 *
 * Centralized exports for the subscription system including:
 * - Types and enums
 * - Access control utilities
 * - React components and hooks
 * - Server-side helpers
 *
 * NOTE: Custom Protect components have been removed in favor of Better Auth's built-in components.
 * Use Better Auth components directly with plan/feature props, and our unified
 * checkSubscriptionAccess() function for programmatic checks.
 */

// Core types and configuration
export * from "@repo/shared/types/subscription";
// Re-export commonly used items for convenience
export {
    DEFAULT_PLAN,
    FEATURES,
    FeatureSlug,
    PLANS,
    PlanSlug,
} from "@repo/shared/types/subscription";
// Client-side utilities
export * from "@repo/shared/utils/subscription";

// Utility functions for subscription access control
export {
    checkSubscriptionAccess,
    getCurrentPlan,
    getRequiredPlanForFeature,
    getUserFeatures,
    getUserPlan,
    getUserSubscription,
    hasFeature,
    hasPremiumPlan,
    hasVtBasePlan,
    hasVtPlusPlan,
    isFreePlan,
    isPremiumPlan,
    requiresAuth,
} from "@repo/shared/utils/subscription";

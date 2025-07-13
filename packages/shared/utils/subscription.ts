/**
 * VT Chat Client-Side Subscription Utilities
 *
 * Client-side utilities for checking subscription access.
 */

import { log } from "@repo/shared/logger";
import { SUBSCRIPTION_SOURCES, type SubscriptionSource } from "../constants";
import { FeatureSlug, PLANS, type PlanConfig, PlanSlug } from "../types/subscription";
import { SubscriptionStatusEnum } from "../types/subscription-status";
import { canUpgrade as canUserUpgrade, hasVTPlusAccessByPlan } from "./access-control";

// Type for subscription access context
export interface SubscriptionContext {
    user?: any; // Better Auth user object
}

/**
 * Get user subscription data from Creem.io or other metadata
 * This function reads from user metadata (publicMetadata.subscription or planSlug)
 */
function getCreemSubscriptionData(context: SubscriptionContext): {
    planSlug: PlanSlug;
    isActive: boolean; // As reported by the payment provider or metadata
    expiresAt?: string; // ISO string format
    source: SubscriptionSource; // SUBSCRIPTION_SOURCES.CREEM indicates data came from a recognized subscription source
} {
    // Try to get user from context or window
    const user =
        context.user ||
        (typeof window !== "undefined" && (window as any).__BETTER_AUTH_USER__) ||
        null;

    if (user) {
        // Check for Creem subscription data in publicMetadata.subscription
        if (user.publicMetadata?.subscription) {
            const subscription = user.publicMetadata.subscription;
            return {
                planSlug: subscription.planSlug || subscription.plan || PlanSlug.VT_BASE,
                isActive: subscription.isActive === true,
                expiresAt: subscription.expiresAt, // Expects ISO string
                source: SUBSCRIPTION_SOURCES.CREEM,
            };
        }

        // Check for direct planSlug in publicMetadata (e.g., for admin-set plans)
        if (user.publicMetadata?.planSlug) {
            return {
                planSlug: user.publicMetadata.planSlug as PlanSlug,
                isActive: true, // Assume active if planSlug is directly set and no other info
                expiresAt: undefined, // No expiration info in this case
                source: SUBSCRIPTION_SOURCES.CREEM, // Consider this a valid source if planSlug is set
            };
        }

        // Check privateMetadata for subscription data (less common for client-side)
        if (user.privateMetadata?.subscription) {
            const subscription = user.privateMetadata.subscription;
            return {
                planSlug: subscription.planSlug || subscription.plan || PlanSlug.VT_BASE,
                isActive: subscription.isActive === true,
                expiresAt: subscription.expiresAt, // Expects ISO string
                source: SUBSCRIPTION_SOURCES.CREEM,
            };
        }
    }

    // Default to base plan if no user or no subscription data found
    return {
        planSlug: PlanSlug.VT_BASE,
        isActive: false, // No active subscription by default
        source: SUBSCRIPTION_SOURCES.NONE,
    };
}

export interface UserClientSubscriptionStatus {
    currentPlanSlug: PlanSlug;
    planConfig: PlanConfig;
    status: SubscriptionStatusEnum; // Overall status considering expiration and provider status
    isPremium: boolean;
    isVtPlus: boolean;
    isVtBase: boolean;
    canUpgrade: boolean;
    isActive: boolean; // True if the subscription allows access to features right now
    expiresAt?: Date;
    source: SubscriptionSource;
}

/**
 * Check if a user has VT+ plan
 *
 * This function checks Creem.io subscription data to determine
 * if the user has an active VT+ subscription.
 */
export function hasVtPlusPlan(context: SubscriptionContext): boolean {
    const status = getSubscriptionStatus(context);
    return status.isVtPlus && status.isActive;
}

/**
 * Check if a user has access to a specific feature
 */
export function hasFeature(context: SubscriptionContext, feature: FeatureSlug): boolean {
    const status = getSubscriptionStatus(context);
    if (!status.isActive) return false; // If overall subscription is not active, no features are accessible

    // VT+ exclusive features - only 3 features remain exclusive
    if ([FeatureSlug.DEEP_RESEARCH, FeatureSlug.PRO_SEARCH, FeatureSlug.RAG].includes(feature)) {
        return status.isVtPlus; // isActive check is already done
    }

    // Features available to all logged-in users (moved from VT+ to free tier)
    if (
        [
            FeatureSlug.ACCESS_CHAT,
            FeatureSlug.BASE_MODELS,
            FeatureSlug.FREE_MODELS,
            FeatureSlug.MATH_CALCULATOR,
            FeatureSlug.BASE_FEATURES,
            FeatureSlug.DARK_THEME,
            FeatureSlug.THINKING_MODE_TOGGLE,
            FeatureSlug.STRUCTURED_OUTPUT,
            FeatureSlug.THINKING_MODE,
            FeatureSlug.DOCUMENT_PARSING,
            FeatureSlug.REASONING_CHAIN,
            FeatureSlug.GEMINI_EXPLICIT_CACHING,
            FeatureSlug.CHART_VISUALIZATION,
            FeatureSlug.ADVANCED_CHAT_MODES,
        ].includes(feature)
    ) {
        return true; // Always available to active users
    }

    // Fall back to checking if user's plan includes this feature
    const planConfig = PLANS[status.currentPlanSlug];
    return planConfig.features.includes(feature);
}

/**
 * Check if a user has access to a specific plan
 */
export function hasPlan(context: SubscriptionContext, plan: PlanSlug): boolean {
    const status = getSubscriptionStatus(context);
    if (!status.isActive) return false;

    if (plan === PlanSlug.VT_PLUS) {
        return status.isVtPlus;
    }
    // Everyone with an active status has access to the base plan features
    // If checking for VT_BASE plan itself:
    return status.currentPlanSlug === PlanSlug.VT_BASE || status.isVtPlus; // VT+ includes base
}

/**
 * Check subscription access based on options
 */
export function checkSubscriptionAccess(
    context: SubscriptionContext,
    options: { feature?: FeatureSlug; plan?: PlanSlug; permission?: string },
): boolean {
    const { feature, plan, permission } = options;

    // Check feature access
    if (feature) {
        return hasFeature(context, feature);
    }

    // Check plan access
    if (plan) {
        return hasPlan(context, plan);
    }

    // Permission checks are not supported in the new system
    if (permission) {
        log.warn("Permission checks are not supported in the new subscription system");
        return false;
    }

    return false;
}

/**
 * Get the current plan for a user
 */
export function getCurrentPlan(context: SubscriptionContext): PlanSlug {
    const subscriptionData = getCreemSubscriptionData(context);
    return subscriptionData.planSlug;
}

/**
 * Get required plan for a specific feature
 */
export function getRequiredPlanForFeature(feature: FeatureSlug): PlanSlug | null {
    for (const [planSlug, plan] of Object.entries(PLANS)) {
        if (plan.features.includes(feature)) {
            return planSlug as PlanSlug;
        }
    }
    return null;
}

/**
 * Check if a plan is a premium plan
 */
export function isPremiumPlan(plan: PlanSlug): boolean {
    return plan !== PlanSlug.VT_BASE;
}

/**
 * Check if a plan is a free plan
 */
export function isFreePlan(plan: PlanSlug): boolean {
    return plan === PlanSlug.VT_BASE;
}

/**
 * Check if a user has a premium plan
 */
export function hasPremiumPlan(context: SubscriptionContext): boolean {
    const status = getSubscriptionStatus(context);
    return status.isPremium && status.isActive;
}

/**
 * Check if a user has VT Base plan
 */
export function hasVtBasePlan(context: SubscriptionContext): boolean {
    const status = getSubscriptionStatus(context);
    // User has VT Base if their current plan is VT_BASE and it's active.
    // Or, if they have no specific plan (defaults to VT_BASE) and it's considered active (e.g. free tier access)
    return status.isVtBase && status.isActive;
}

/**
 * Get subscription status for a user
 */
export function getSubscriptionStatus(context: SubscriptionContext): UserClientSubscriptionStatus {
    const subscriptionData = getCreemSubscriptionData(context);
    const planConfig = PLANS[subscriptionData.planSlug];

    let status: SubscriptionStatusEnum;
    let overallIsActive = subscriptionData.isActive; // Provider's status
    const parsedExpiresAt = subscriptionData.expiresAt
        ? new Date(subscriptionData.expiresAt)
        : undefined;

    if (parsedExpiresAt && parsedExpiresAt < new Date()) {
        status = SubscriptionStatusEnum.EXPIRED;
        overallIsActive = false; // Overrides provider's status if expired
    } else if (subscriptionData.isActive) {
        status = SubscriptionStatusEnum.ACTIVE;
    } else if (subscriptionData.source === SUBSCRIPTION_SOURCES.NONE) {
        // No subscription record found
        status = SubscriptionStatusEnum.NONE;
        overallIsActive = false; // Explicitly false if no subscription
    } else {
        status = SubscriptionStatusEnum.INACTIVE; // e.g. cancelled, payment failed, etc.
        overallIsActive = false;
    }

    // If it's VT_BASE and no specific subscription record (source NONE), it's effectively active for base features.
    if (
        subscriptionData.planSlug === PlanSlug.VT_BASE &&
        subscriptionData.source === SUBSCRIPTION_SOURCES.NONE
    ) {
        status = SubscriptionStatusEnum.ACTIVE; // Free tier is always 'active'
        overallIsActive = true;
    }

    return {
        currentPlanSlug: subscriptionData.planSlug,
        planConfig,
        status,
        isPremium: isPremiumPlan(subscriptionData.planSlug),
        isVtPlus: hasVTPlusAccessByPlan(subscriptionData.planSlug),
        isVtBase: subscriptionData.planSlug === PlanSlug.VT_BASE,
        canUpgrade: canUserUpgrade({ planSlug: subscriptionData.planSlug }),
        isActive: overallIsActive,
        expiresAt: parsedExpiresAt,
        source: subscriptionData.source,
    };
}

/**
 * Get features available to a user
 */
export function getUserFeatures(context: SubscriptionContext): FeatureSlug[] {
    const status = getSubscriptionStatus(context);
    if (!status.isActive) return [];
    return status.planConfig.features;
}

/**
 * Get plan for a user
 */
export function getUserPlan(context: SubscriptionContext): PlanSlug {
    const status = getSubscriptionStatus(context);
    return status.currentPlanSlug;
}

/**
 * Get subscription info for a user (Simplified version, consider deprecating or aligning with getSubscriptionStatus)
 */
export function getUserSubscription(user: any): {
    planSlug: PlanSlug;
    features: FeatureSlug[];
    isActive: boolean;
    expiresAt?: Date;
} {
    // This function seems to duplicate some logic from getCreemSubscriptionData and getSubscriptionStatus.
    // For consistency, it should ideally use getSubscriptionStatus or be refactored.
    // For now, providing a basic mapping based on its original intent.
    const context: SubscriptionContext = { user };
    const status = getSubscriptionStatus(context);

    return {
        planSlug: status.currentPlanSlug,
        features: status.isActive ? status.planConfig.features : [],
        isActive: status.isActive,
        expiresAt: status.expiresAt,
    };
}

/**
 * Check if authentication is required
 */
export function requiresAuth(options: { feature?: FeatureSlug; plan?: PlanSlug }): boolean {
    const { feature, plan } = options;

    // Features in the base plan don't require auth
    if (feature && PLANS[PlanSlug.VT_BASE].features.includes(feature)) {
        return false;
    }

    // VT Base plan doesn't require auth
    if (plan && plan === PlanSlug.VT_BASE) {
        return false;
    }

    return true;
}

// Export as default object for backward compatibility
export default {
    hasVtPlusPlan,
    hasFeature,
    hasPlan,
    checkSubscriptionAccess,
    getCurrentPlan,
    getRequiredPlanForFeature,
    isPremiumPlan,
    isFreePlan,
    hasPremiumPlan,
    hasVtBasePlan,
    getSubscriptionStatus,
    getUserFeatures,
    getUserPlan,
    getUserSubscription,
    requiresAuth,
};

/**
 * VT Chat Client-Side Subscription Utilities
 *
 * Client-side utilities for checking subscription access.
 */

import { FeatureSlug, PLANS, PlanSlug } from '../types/subscription';

// Type for subscription access context
export interface SubscriptionContext {
    user?: any; // Clerk user object
}

/**
 * Get user subscription data from Creem.io
 * This function reads from user metadata (publicMetadata.subscription)
 */
function getCreemSubscriptionData(context: SubscriptionContext): {
    planSlug: PlanSlug;
    isActive: boolean;
    expiresAt?: string;
    source: 'creem' | 'none';
} {
    // Try to get user from context or window
    const user =
        context.user || (typeof window !== 'undefined' && (window as any).__CLERK_USER__) || null;

    if (user && user.publicMetadata) {
        // Check for Creem subscription data in publicMetadata
        if (user.publicMetadata.subscription) {
            const subscription = user.publicMetadata.subscription;
            return {
                planSlug: subscription.plan || user.publicMetadata.planSlug || PlanSlug.VT_BASE,
                isActive: subscription.isActive === true,
                expiresAt: subscription.expiresAt,
                source: 'creem',
            };
        }

        // Check for direct planSlug in publicMetadata
        if (user.publicMetadata.planSlug) {
            return {
                planSlug: user.publicMetadata.planSlug,
                isActive: true, // Assume active if planSlug is set
                source: 'creem',
            };
        }

        // Check privateMetadata for subscription data
        if (user.privateMetadata?.subscription) {
            const subscription = user.privateMetadata.subscription;
            return {
                planSlug: subscription.plan || PlanSlug.VT_BASE,
                isActive: subscription.isActive === true,
                expiresAt: subscription.expiresAt,
                source: 'creem',
            };
        }
    }

    // Default to base plan
    return {
        planSlug: PlanSlug.VT_BASE,
        isActive: false,
        source: 'none',
    };
}

/**
 * Check if a user has VT+ plan
 *
 * This function checks Creem.io subscription data to determine
 * if the user has an active VT+ subscription.
 */
export function hasVtPlusPlan(context: SubscriptionContext): boolean {
    const subscriptionData = getCreemSubscriptionData(context);
    return subscriptionData.planSlug === PlanSlug.VT_PLUS && subscriptionData.isActive;
}

/**
 * Check if a user has access to a specific feature
 */
export function hasFeature(context: SubscriptionContext, feature: FeatureSlug): boolean {
    // For VT+ specific features, check if they have VT+ plan using our enhanced method
    if (
        [
            FeatureSlug.DARK_THEME,
            FeatureSlug.DEEP_RESEARCH,
            FeatureSlug.PRO_SEARCH,
            FeatureSlug.ADVANCED_CHAT_MODES,
        ].includes(feature)
    ) {
        if (hasVtPlusPlan(context)) {
            return true;
        }
    }

    // Fall back to checking if user's plan includes this feature
    const subscriptionData = getCreemSubscriptionData(context);
    const planConfig = PLANS[subscriptionData.planSlug];

    return planConfig.features.includes(feature);
}

/**
 * Check if a user has access to a specific plan
 */
export function hasPlan(context: SubscriptionContext, plan: PlanSlug): boolean {
    if (plan === PlanSlug.VT_PLUS) {
        return hasVtPlusPlan(context);
    }

    // Everyone has access to the base plan
    return true;
}

/**
 * Check subscription access based on options
 */
export function checkSubscriptionAccess(
    context: SubscriptionContext,
    options: { feature?: FeatureSlug; plan?: PlanSlug; permission?: string }
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
        console.warn('Permission checks are not supported in the new subscription system');
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
    return hasVtPlusPlan(context);
}

/**
 * Check if a user has VT Base plan
 */
export function hasVtBasePlan(context: SubscriptionContext): boolean {
    return !hasVtPlusPlan(context);
}

/**
 * Get subscription status for a user
 */
export function getSubscriptionStatus(context: SubscriptionContext): any {
    const subscriptionData = getCreemSubscriptionData(context);
    const planInfo = PLANS[subscriptionData.planSlug];

    return {
        currentPlan: subscriptionData.planSlug,
        planInfo,
        isPremium: isPremiumPlan(subscriptionData.planSlug),
        isVtPlus: subscriptionData.planSlug === PlanSlug.VT_PLUS,
        isVtBase: subscriptionData.planSlug === PlanSlug.VT_BASE,
        canUpgrade: subscriptionData.planSlug !== PlanSlug.VT_PLUS,
        isActive: subscriptionData.isActive,
        expiresAt: subscriptionData.expiresAt,
        source: subscriptionData.source,
    };
}

/**
 * Get features available to a user
 */
export function getUserFeatures(context: SubscriptionContext): FeatureSlug[] {
    const subscriptionData = getCreemSubscriptionData(context);
    return PLANS[subscriptionData.planSlug].features;
}

/**
 * Get plan for a user
 */
export function getUserPlan(context: SubscriptionContext): PlanSlug {
    return getCurrentPlan(context);
}

/**
 * Get subscription info for a user
 */
export function getUserSubscription(user: any): any {
    const planSlug = user?.publicMetadata?.planSlug || PlanSlug.VT_BASE;
    const isActive = user?.privateMetadata?.subscription?.isActive || true;
    const planConfig = PLANS[planSlug as keyof typeof PLANS];
    const features = planConfig ? planConfig.features : PLANS[PlanSlug.VT_BASE].features;
    const expiresAt = user?.privateMetadata?.subscription?.expiresAt
        ? new Date(user.privateMetadata.subscription.expiresAt)
        : undefined;

    return {
        planSlug,
        features,
        isActive,
        expiresAt,
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

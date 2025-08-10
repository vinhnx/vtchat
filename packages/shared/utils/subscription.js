/**
 * VT Chat Client-Side Subscription Utilities
 *
 * Client-side utilities for checking subscription access.
 */
import { log } from "@repo/shared/logger";
import { SUBSCRIPTION_SOURCES } from "../constants";
import { FeatureSlug, PLANS, PlanSlug } from "../types/subscription";
import { SubscriptionStatusEnum } from "../types/subscription-status";
import { canUpgrade as canUserUpgrade, hasVTPlusAccessByPlan } from "./access-control";
import { hasSubscriptionAccess } from "./subscription-grace-period";
/**
 * Get user subscription data from Creem.io or other metadata
 * This function reads from user metadata (publicMetadata.subscription or planSlug)
 */
function getCreemSubscriptionData(context) {
    var _a, _b, _c;
    // Try to get user from context or window
    var user = context.user ||
        (typeof window !== "undefined" && window.__BETTER_AUTH_USER__) ||
        null;
    if (user) {
        // Check for Creem subscription data in publicMetadata.subscription
        if ((_a = user.publicMetadata) === null || _a === void 0 ? void 0 : _a.subscription) {
            var subscription = user.publicMetadata.subscription;
            return {
                planSlug: subscription.planSlug || subscription.plan || PlanSlug.VT_BASE,
                isActive: subscription.isActive === true,
                expiresAt: subscription.expiresAt, // Expects ISO string
                source: SUBSCRIPTION_SOURCES.CREEM,
            };
        }
        // Check for direct planSlug in publicMetadata (e.g., for admin-set plans)
        if ((_b = user.publicMetadata) === null || _b === void 0 ? void 0 : _b.planSlug) {
            return {
                planSlug: user.publicMetadata.planSlug,
                isActive: true, // Assume active if planSlug is directly set and no other info
                expiresAt: undefined, // No expiration info in this case
                source: SUBSCRIPTION_SOURCES.CREEM, // Consider this a valid source if planSlug is set
            };
        }
        // Check privateMetadata for subscription data (less common for client-side)
        if ((_c = user.privateMetadata) === null || _c === void 0 ? void 0 : _c.subscription) {
            var subscription = user.privateMetadata.subscription;
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
/**
 * Check if a user has VT+ plan
 *
 * This function checks Creem.io subscription data to determine
 * if the user has an active VT+ subscription.
 */
export function hasVtPlusPlan(context) {
    var status = getSubscriptionStatus(context);
    return status.isVtPlus && status.isActive;
}
/**
 * Check if a user has access to a specific feature
 */
export function hasFeature(context, feature) {
    var status = getSubscriptionStatus(context);
    if (!status.isActive)
        return false; // If overall subscription is not active, no features are accessible
    // VT+ exclusive features - only 3 features remain exclusive
    if ([FeatureSlug.DEEP_RESEARCH, FeatureSlug.PRO_SEARCH].includes(feature)) {
        return status.isVtPlus; // isActive check is already done
    }
    // Features available to all logged-in users (moved from VT+ to free tier)
    if ([
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
    ].includes(feature)) {
        return true; // Always available to active users
    }
    // Fall back to checking if user's plan includes this feature
    var planConfig = PLANS[status.currentPlanSlug];
    return planConfig.features.includes(feature);
}
/**
 * Check if a user has access to a specific plan
 */
export function hasPlan(context, plan) {
    var status = getSubscriptionStatus(context);
    if (!status.isActive)
        return false;
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
export function checkSubscriptionAccess(context, options) {
    var feature = options.feature, plan = options.plan, permission = options.permission;
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
export function getCurrentPlan(context) {
    var subscriptionData = getCreemSubscriptionData(context);
    return subscriptionData.planSlug;
}
/**
 * Get required plan for a specific feature
 */
export function getRequiredPlanForFeature(feature) {
    for (var _i = 0, _a = Object.entries(PLANS); _i < _a.length; _i++) {
        var _b = _a[_i], planSlug = _b[0], plan = _b[1];
        if (plan.features.includes(feature)) {
            return planSlug;
        }
    }
    return null;
}
/**
 * Check if a plan is a premium plan
 */
export function isPremiumPlan(plan) {
    return plan !== PlanSlug.VT_BASE;
}
/**
 * Check if a plan is a free plan
 */
export function isFreePlan(plan) {
    return plan === PlanSlug.VT_BASE;
}
/**
 * Check if a user has a premium plan
 */
export function hasPremiumPlan(context) {
    var status = getSubscriptionStatus(context);
    return status.isPremium && status.isActive;
}
/**
 * Check if a user has VT Base plan
 */
export function hasVtBasePlan(context) {
    var status = getSubscriptionStatus(context);
    // User has VT Base if their current plan is VT_BASE and it's active.
    // Or, if they have no specific plan (defaults to VT_BASE) and it's considered active (e.g. free tier access)
    return status.isVtBase && status.isActive;
}
/**
 * Get subscription status for a user
 */
export function getSubscriptionStatus(context) {
    var _a;
    var subscriptionData = getCreemSubscriptionData(context);
    var planConfig = PLANS[subscriptionData.planSlug];
    var status;
    var overallIsActive = subscriptionData.isActive; // Provider's status
    var parsedExpiresAt = subscriptionData.expiresAt
        ? new Date(subscriptionData.expiresAt)
        : undefined;
    // Get the actual subscription status from database if available
    var dbStatus = (_a = subscriptionData.dbSubscription) === null || _a === void 0 ? void 0 : _a.status;
    if (dbStatus) {
        // Use the actual database status from webhook updates
        status = dbStatus;
        // Use centralized access logic
        overallIsActive = hasSubscriptionAccess({
            status: status,
            currentPeriodEnd: parsedExpiresAt,
        });
    }
    else if (parsedExpiresAt && parsedExpiresAt < new Date()) {
        status = SubscriptionStatusEnum.EXPIRED;
        overallIsActive = false; // Overrides provider's status if expired
    }
    else if (subscriptionData.isActive) {
        status = SubscriptionStatusEnum.ACTIVE;
        overallIsActive = true;
    }
    else if (subscriptionData.source === SUBSCRIPTION_SOURCES.NONE) {
        // No subscription record found
        status = SubscriptionStatusEnum.NONE;
        overallIsActive = false; // Explicitly false if no subscription
    }
    else {
        status = SubscriptionStatusEnum.INACTIVE; // e.g. cancelled, payment failed, etc.
        overallIsActive = false;
    }
    // If it's VT_BASE and no specific subscription record (source NONE), it's effectively active for base features.
    if (subscriptionData.planSlug === PlanSlug.VT_BASE &&
        subscriptionData.source === SUBSCRIPTION_SOURCES.NONE) {
        status = SubscriptionStatusEnum.ACTIVE; // Free tier is always 'active'
        overallIsActive = true;
    }
    return {
        currentPlanSlug: subscriptionData.planSlug,
        planConfig: planConfig,
        status: status,
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
export function getUserFeatures(context) {
    var status = getSubscriptionStatus(context);
    if (!status.isActive)
        return [];
    return status.planConfig.features;
}
/**
 * Get plan for a user
 */
export function getUserPlan(context) {
    var status = getSubscriptionStatus(context);
    return status.currentPlanSlug;
}
/**
 * Get subscription info for a user (Simplified version, consider deprecating or aligning with getSubscriptionStatus)
 */
export function getUserSubscription(user) {
    // This function seems to duplicate some logic from getCreemSubscriptionData and getSubscriptionStatus.
    // For consistency, it should ideally use getSubscriptionStatus or be refactored.
    // For now, providing a basic mapping based on its original intent.
    var context = { user: user };
    var status = getSubscriptionStatus(context);
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
export function requiresAuth(options) {
    var feature = options.feature, plan = options.plan;
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
    hasVtPlusPlan: hasVtPlusPlan,
    hasFeature: hasFeature,
    hasPlan: hasPlan,
    checkSubscriptionAccess: checkSubscriptionAccess,
    getCurrentPlan: getCurrentPlan,
    getRequiredPlanForFeature: getRequiredPlanForFeature,
    isPremiumPlan: isPremiumPlan,
    isFreePlan: isFreePlan,
    hasPremiumPlan: hasPremiumPlan,
    hasVtBasePlan: hasVtBasePlan,
    getSubscriptionStatus: getSubscriptionStatus,
    getUserFeatures: getUserFeatures,
    getUserPlan: getUserPlan,
    getUserSubscription: getUserSubscription,
    requiresAuth: requiresAuth,
};

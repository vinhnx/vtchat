/**
 * Unified Access Control System
 *
 * Centralizes all access control logic to eliminate scattered checks
 * throughout the codebase like `user?.planSlug === 'vt_plus'`
 */
import { PlanSlug } from "../types/subscription";
/**
 * Check if user has VT+ access based on plan slug
 */
export function hasVTPlusAccess(user) {
    return (user === null || user === void 0 ? void 0 : user.planSlug) === PlanSlug.VT_PLUS;
}
/**
 * Check if user has VT+ access by plan slug string
 */
export function hasVTPlusAccessByPlan(planSlug) {
    return planSlug === PlanSlug.VT_PLUS;
}
/**
 * Check if user has base plan access
 */
export function hasVTBaseAccess(user) {
    return (user === null || user === void 0 ? void 0 : user.planSlug) === PlanSlug.VT_BASE || !(user === null || user === void 0 ? void 0 : user.planSlug);
}
/**
 * Check if user can upgrade (not already VT+)
 */
export function canUpgrade(user) {
    return !hasVTPlusAccess(user);
}
/**
 * Check if two plan slugs are equal
 */
export function isPlanEqual(planA, planB) {
    var normalizedA = getNormalizedPlanSlug(planA);
    var normalizedB = getNormalizedPlanSlug(planB);
    return normalizedA === normalizedB;
}
/**
 * Check if user has VT+ access based on subscription data
 */
export function hasVTPlusAccessFromSubscription(subscription) {
    return subscription.plan === PlanSlug.VT_PLUS && subscription.isActive;
}
/**
 * Check if user is eligible for quota consumption
 * (VT+ user without BYOK)
 */
export function isEligibleForQuotaConsumption(user, isByokKey) {
    if (isByokKey === void 0) { isByokKey = false; }
    return !isByokKey && hasVTPlusAccess(user);
}
/**
 * Check if user should bypass API key requirements
 * (VT+ users get server-funded access)
 */
export function shouldBypassApiKeyRequirement(user) {
    return hasVTPlusAccess(user);
}
/**
 * Get normalized plan slug (handles null/undefined cases)
 */
export function getNormalizedPlanSlug(planSlug) {
    return planSlug === PlanSlug.VT_PLUS ? PlanSlug.VT_PLUS : PlanSlug.VT_BASE;
}
/**
 * Check if user has access to a specific feature
 */
export function hasFeatureAccess(user, requiredPlan) {
    if (requiredPlan === void 0) { requiredPlan = PlanSlug.VT_PLUS; }
    if (requiredPlan === PlanSlug.VT_BASE) {
        return true; // Base features are available to all users
    }
    if (requiredPlan === PlanSlug.VT_PLUS) {
        return hasVTPlusAccess(user);
    }
    return false;
}
/**
 * Validate user context for quota operations
 */
export function validateUserForQuota(user) {
    if (!(user === null || user === void 0 ? void 0 : user.id)) {
        return { isValid: false, reason: "User ID is required" };
    }
    if (!hasVTPlusAccess(user)) {
        return { isValid: false, reason: "VT+ access required" };
    }
    return { isValid: true };
}
/**
 * Determine VT+ feature based on chat mode
 * Centralizes the logic for mapping chat modes to VT+ features
 */
export function getVTPlusFeatureFromChatMode(mode) {
    // Import VtPlusFeature enum values as constants to avoid circular imports
    var VT_PLUS_FEATURES = {
        DEEP_RESEARCH: "DR",
        PRO_SEARCH: "PS",
    };
    // ChatMode constants to avoid imports
    var CHAT_MODES = {
        Deep: "deep",
        Pro: "pro",
    };
    switch (mode) {
        case CHAT_MODES.Deep:
            return VT_PLUS_FEATURES.DEEP_RESEARCH;
        case CHAT_MODES.Pro:
            return VT_PLUS_FEATURES.PRO_SEARCH;
        default:
            // Regular chat modes don't consume VT+ quota
            return null;
    }
}
/**
 * Common access control constants
 */
export var ACCESS_CONTROL = {
    VT_PLUS_PLAN: PlanSlug.VT_PLUS,
    VT_BASE_PLAN: PlanSlug.VT_BASE,
    REQUIRED_PLAN_FOR_QUOTA: PlanSlug.VT_PLUS,
};

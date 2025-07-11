/**
 * Unified Access Control System
 *
 * Centralizes all access control logic to eliminate scattered checks
 * throughout the codebase like `user?.planSlug === 'vt_plus'`
 */

import { PlanSlug } from '../types/subscription';
import { SubscriptionStatusEnum } from '../types/subscription-status';

export interface UserContext {
    id?: string;
    planSlug?: string | null;
    isActive?: boolean;
}

export interface SubscriptionData {
    plan: string;
    isActive: boolean;
    status?: SubscriptionStatusEnum;
}

/**
 * Check if user has VT+ access based on plan slug
 */
export function hasVTPlusAccess(user: UserContext): boolean {
    return user?.planSlug === PlanSlug.VT_PLUS;
}

/**
 * Check if user has VT+ access by plan slug string
 */
export function hasVTPlusAccessByPlan(planSlug?: string | null): boolean {
    return planSlug === PlanSlug.VT_PLUS;
}

/**
 * Check if user has base plan access
 */
export function hasVTBaseAccess(user: UserContext): boolean {
    return user?.planSlug === PlanSlug.VT_BASE || !user?.planSlug;
}

/**
 * Check if user can upgrade (not already VT+)
 */
export function canUpgrade(user: UserContext): boolean {
    return !hasVTPlusAccess(user);
}

/**
 * Check if two plan slugs are equal
 */
export function isPlanEqual(planA?: string | null, planB?: string | null): boolean {
    const normalizedA = getNormalizedPlanSlug(planA);
    const normalizedB = getNormalizedPlanSlug(planB);
    return normalizedA === normalizedB;
}

/**
 * Check if user has VT+ access based on subscription data
 */
export function hasVTPlusAccessFromSubscription(subscription: SubscriptionData): boolean {
    return subscription.plan === PlanSlug.VT_PLUS && subscription.isActive;
}

/**
 * Check if user is eligible for quota consumption
 * (VT+ user without BYOK)
 */
export function isEligibleForQuotaConsumption(
    user: UserContext,
    isByokKey: boolean = false
): boolean {
    return !isByokKey && hasVTPlusAccess(user);
}

/**
 * Check if user should bypass API key requirements
 * (VT+ users get server-funded access)
 */
export function shouldBypassApiKeyRequirement(user: UserContext): boolean {
    return hasVTPlusAccess(user);
}

/**
 * Get normalized plan slug (handles null/undefined cases)
 */
export function getNormalizedPlanSlug(planSlug?: string | null): PlanSlug {
    return planSlug === PlanSlug.VT_PLUS ? PlanSlug.VT_PLUS : PlanSlug.VT_BASE;
}

/**
 * Check if user has access to a specific feature
 */
export function hasFeatureAccess(
    user: UserContext,
    requiredPlan: PlanSlug = PlanSlug.VT_PLUS
): boolean {
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
export function validateUserForQuota(user: UserContext): {
    isValid: boolean;
    reason?: string;
} {
    if (!user?.id) {
        return { isValid: false, reason: 'User ID is required' };
    }

    if (!hasVTPlusAccess(user)) {
        return { isValid: false, reason: 'VT+ access required' };
    }

    return { isValid: true };
}

/**
 * Determine VT+ feature based on chat mode
 * Centralizes the logic for mapping chat modes to VT+ features
 */
export function getVTPlusFeatureFromChatMode(mode?: string): string {
    // Import VtPlusFeature enum values as constants to avoid circular imports
    const VT_PLUS_FEATURES = {
        DEEP_RESEARCH: 'DR',
        PRO_SEARCH: 'PS',
        RAG: 'RAG',
    } as const;

    // ChatMode constants to avoid imports
    const CHAT_MODES = {
        Deep: 'deep',
        Pro: 'pro',
    } as const;

    switch (mode) {
        case CHAT_MODES.Deep:
            return VT_PLUS_FEATURES.DEEP_RESEARCH;
        case CHAT_MODES.Pro:
            return VT_PLUS_FEATURES.PRO_SEARCH;
        default:
            return VT_PLUS_FEATURES.DEEP_RESEARCH;
    }
}

/**
 * Common access control constants
 */
export const ACCESS_CONTROL = {
    VT_PLUS_PLAN: PlanSlug.VT_PLUS,
    VT_BASE_PLAN: PlanSlug.VT_BASE,
    REQUIRED_PLAN_FOR_QUOTA: PlanSlug.VT_PLUS,
} as const;

export type AccessControlConstants = typeof ACCESS_CONTROL;

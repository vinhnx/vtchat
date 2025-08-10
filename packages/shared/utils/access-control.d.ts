/**
 * Unified Access Control System
 *
 * Centralizes all access control logic to eliminate scattered checks
 * throughout the codebase like `user?.planSlug === 'vt_plus'`
 */
import { PlanSlug } from "../types/subscription";
import type { SubscriptionStatusEnum } from "../types/subscription-status";
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
export declare function hasVTPlusAccess(user: UserContext): boolean;
/**
 * Check if user has VT+ access by plan slug string
 */
export declare function hasVTPlusAccessByPlan(planSlug?: string | null): boolean;
/**
 * Check if user has base plan access
 */
export declare function hasVTBaseAccess(user: UserContext): boolean;
/**
 * Check if user can upgrade (not already VT+)
 */
export declare function canUpgrade(user: UserContext): boolean;
/**
 * Check if two plan slugs are equal
 */
export declare function isPlanEqual(planA?: string | null, planB?: string | null): boolean;
/**
 * Check if user has VT+ access based on subscription data
 */
export declare function hasVTPlusAccessFromSubscription(subscription: SubscriptionData): boolean;
/**
 * Check if user is eligible for quota consumption
 * (VT+ user without BYOK)
 */
export declare function isEligibleForQuotaConsumption(user: UserContext, isByokKey?: boolean): boolean;
/**
 * Check if user should bypass API key requirements
 * (VT+ users get server-funded access)
 */
export declare function shouldBypassApiKeyRequirement(user: UserContext): boolean;
/**
 * Get normalized plan slug (handles null/undefined cases)
 */
export declare function getNormalizedPlanSlug(planSlug?: string | null): PlanSlug;
/**
 * Check if user has access to a specific feature
 */
export declare function hasFeatureAccess(user: UserContext, requiredPlan?: PlanSlug): boolean;
/**
 * Validate user context for quota operations
 */
export declare function validateUserForQuota(user: UserContext): {
    isValid: boolean;
    reason?: string;
};
/**
 * Determine VT+ feature based on chat mode
 * Centralizes the logic for mapping chat modes to VT+ features
 */
export declare function getVTPlusFeatureFromChatMode(mode?: string): string | null;
/**
 * Common access control constants
 */
export declare const ACCESS_CONTROL: {
    readonly VT_PLUS_PLAN: "vt_plus";
    readonly VT_BASE_PLAN: "vt_base";
    readonly REQUIRED_PLAN_FOR_QUOTA: "vt_plus";
};
export type AccessControlConstants = typeof ACCESS_CONTROL;
//# sourceMappingURL=access-control.d.ts.map
/**
 * VT Chat Client-Side Subscription Utilities
 *
 * Client-side utilities for checking subscription access.
 */
import { type SubscriptionSource } from "../constants";
import { FeatureSlug, type PlanConfig, PlanSlug } from "../types/subscription";
import { SubscriptionStatusEnum } from "../types/subscription-status";
export interface SubscriptionContext {
    user?: any;
}
export interface UserClientSubscriptionStatus {
    currentPlanSlug: PlanSlug;
    planConfig: PlanConfig;
    status: SubscriptionStatusEnum;
    isPremium: boolean;
    isVtPlus: boolean;
    isVtBase: boolean;
    canUpgrade: boolean;
    isActive: boolean;
    expiresAt?: Date;
    source: SubscriptionSource;
}
/**
 * Check if a user has VT+ plan
 *
 * This function checks Creem.io subscription data to determine
 * if the user has an active VT+ subscription.
 */
export declare function hasVtPlusPlan(context: SubscriptionContext): boolean;
/**
 * Check if a user has access to a specific feature
 */
export declare function hasFeature(context: SubscriptionContext, feature: FeatureSlug): boolean;
/**
 * Check if a user has access to a specific plan
 */
export declare function hasPlan(context: SubscriptionContext, plan: PlanSlug): boolean;
/**
 * Check subscription access based on options
 */
export declare function checkSubscriptionAccess(context: SubscriptionContext, options: {
    feature?: FeatureSlug;
    plan?: PlanSlug;
    permission?: string;
}): boolean;
/**
 * Get the current plan for a user
 */
export declare function getCurrentPlan(context: SubscriptionContext): PlanSlug;
/**
 * Get required plan for a specific feature
 */
export declare function getRequiredPlanForFeature(feature: FeatureSlug): PlanSlug | null;
/**
 * Check if a plan is a premium plan
 */
export declare function isPremiumPlan(plan: PlanSlug): boolean;
/**
 * Check if a plan is a free plan
 */
export declare function isFreePlan(plan: PlanSlug): boolean;
/**
 * Check if a user has a premium plan
 */
export declare function hasPremiumPlan(context: SubscriptionContext): boolean;
/**
 * Check if a user has VT Base plan
 */
export declare function hasVtBasePlan(context: SubscriptionContext): boolean;
/**
 * Get subscription status for a user
 */
export declare function getSubscriptionStatus(context: SubscriptionContext): UserClientSubscriptionStatus;
/**
 * Get features available to a user
 */
export declare function getUserFeatures(context: SubscriptionContext): FeatureSlug[];
/**
 * Get plan for a user
 */
export declare function getUserPlan(context: SubscriptionContext): PlanSlug;
/**
 * Get subscription info for a user (Simplified version, consider deprecating or aligning with getSubscriptionStatus)
 */
export declare function getUserSubscription(user: any): {
    planSlug: PlanSlug;
    features: FeatureSlug[];
    isActive: boolean;
    expiresAt?: Date;
};
/**
 * Check if authentication is required
 */
export declare function requiresAuth(options: {
    feature?: FeatureSlug;
    plan?: PlanSlug;
}): boolean;
declare const _default: {
    hasVtPlusPlan: typeof hasVtPlusPlan;
    hasFeature: typeof hasFeature;
    hasPlan: typeof hasPlan;
    checkSubscriptionAccess: typeof checkSubscriptionAccess;
    getCurrentPlan: typeof getCurrentPlan;
    getRequiredPlanForFeature: typeof getRequiredPlanForFeature;
    isPremiumPlan: typeof isPremiumPlan;
    isFreePlan: typeof isFreePlan;
    hasPremiumPlan: typeof hasPremiumPlan;
    hasVtBasePlan: typeof hasVtBasePlan;
    getSubscriptionStatus: typeof getSubscriptionStatus;
    getUserFeatures: typeof getUserFeatures;
    getUserPlan: typeof getUserPlan;
    getUserSubscription: typeof getUserSubscription;
    requiresAuth: typeof requiresAuth;
};
export default _default;
//# sourceMappingURL=subscription.d.ts.map
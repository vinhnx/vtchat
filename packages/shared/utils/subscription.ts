/**
 * VT Chat Subscription Handler Utilities
 *
 * This module provides utilities for checking subscription access control
 * using Clerk's native has() method for plan and feature access.
 * Client-side checks should primarily use Clerk's <Protect> component or useAuth().has.
 */

import type { User } from '@clerk/nextjs/server';
import type { UserResource } from '@clerk/types';
import {
    DEFAULT_PLAN,
    FeatureSlug,
    PLANS,
    PlanSlug,
    type UserSubscription,
} from '../types/subscription';

/**
 * Unified subscription access check options
 */
export interface SubscriptionAccessOptions {
    feature?: FeatureSlug;
    plan?: PlanSlug;
    permission?: string;
}

/**
 * Clerk's has() method type - we'll use 'any' to avoid complex type conflicts
 * This is compatible with both client-side (useAuth) and server-side (auth) has methods
 *
 * Based on Clerk's official examples:
 * - has({ feature: 'premium_access' })
 * - has({ plan: 'bronze' })
 */
export type ClerkHasMethod = any;

/**
 * Unified subscription access check function
 * This is the single interface for all subscription access checks in the application.
 * It works with Clerk's has() method (client-side or server-side) and provides
 * a consistent API for checking feature and plan access throughout the codebase.
 *
 * @param hasMethod - Clerk's has() method from useAuth() or auth()
 * @param options - Access check options (feature, plan, or permission)
 * @returns boolean indicating access (false if hasMethod is null/undefined)
 *
 * @example
 * // Server-side usage
 * const { has } = await auth();
 * const hasAccess = checkSubscriptionAccess(has, { feature: FeatureSlug.DARK_MODE });
 *
 * @example
 * // Client-side usage
 * const { has } = useAuth();
 * const hasAccess = checkSubscriptionAccess(has, { plan: PlanSlug.VT_PLUS });
 */
export function checkSubscriptionAccess(
    hasMethod: ClerkHasMethod,
    options: SubscriptionAccessOptions
): boolean {
    // Early return if no hasMethod provided or user not authenticated
    if (!hasMethod || typeof hasMethod !== 'function') {
        return false;
    }

    try {
        // Check feature access
        if (options.feature) {
            const result = hasMethod({ feature: options.feature });
            return result === true;
        }

        // Check plan access
        if (options.plan) {
            const result = hasMethod({ plan: options.plan });
            return result === true;
        }

        // Check permission access
        if (options.permission) {
            const result = hasMethod({ permission: options.permission });
            return result === true;
        }

        // If no specific options provided, return false (no access)
        return false;
    } catch (error) {
        console.warn('Error checking subscription access:', error);
        return false;
    }
}

/**
 * Extract subscription data from Clerk user object
 * This follows Clerk's pattern for storing plan information in user metadata.
 * This function is primarily for server-side use or for deriving context when direct Clerk hooks are not suitable.
 */
export function getUserSubscription(user: User | UserResource | null): UserSubscription {
    if (!user) {
        return {
            planSlug: DEFAULT_PLAN,
            features: [...PLANS[DEFAULT_PLAN].features], // Ensure a new array instance
            isActive: true, // Default to active for non-logged-in or non-existent users for base features
        };
    }

    const publicMetadata = user.publicMetadata as any;
    // User (server-side) has privateMetadata, UserResource (client-side) does not.
    const privateMetadata = (user as User).privateMetadata as any;

    const planSlug = (publicMetadata?.planSlug as PlanSlug) || DEFAULT_PLAN;
    const subscriptionDataSource = privateMetadata?.subscription || publicMetadata?.subscription;

    const plan = PLANS[planSlug];
    if (!plan) {
        console.warn(`Invalid plan slug: ${planSlug}, falling back to default`);
        return {
            planSlug: DEFAULT_PLAN,
            features: [...PLANS[DEFAULT_PLAN].features], // Ensure a new array instance
            isActive: true,
        };
    }

    return {
        planSlug,
        features: [...plan.features], // Ensure a new array instance
        isActive: subscriptionDataSource?.isActive ?? true,
        expiresAt: subscriptionDataSource?.expiresAt
            ? new Date(subscriptionDataSource.expiresAt)
            : undefined,
    };
}

/**
 * Get all available features for a user
 */
export function getUserFeatures(user: User | UserResource | null): FeatureSlug[] {
    const subscription = getUserSubscription(user);
    return [...subscription.features]; // Return a new array instance
}

/**
 * Get user's current plan information
 */
export function getUserPlan(user: User | null) {
    const subscription = getUserSubscription(user);
    return PLANS[subscription.planSlug];
}

/**
 * Check if user is on the default (free) plan
 */
export function isFreePlan(user: User | null): boolean {
    const subscription = getUserSubscription(user);
    return subscription.planSlug === DEFAULT_PLAN;
}

/**
 * Check if user is on a premium plan
 */
export function isPremiumPlan(user: User | null): boolean {
    return !isFreePlan(user);
}

/**
 * Get plan upgrade suggestions for a feature
 * Returns the minimum plan needed to access a feature
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
 * Check if a feature requires authentication/sign-in
 */
export function requiresAuth(feature: FeatureSlug): boolean {
    const basePlanFeatures = PLANS[PlanSlug.VT_BASE].features;
    return !basePlanFeatures.includes(feature);
}

/**
 * Optimized utility functions for common subscription checks
 * These functions provide easy-to-use wrappers around the unified checkSubscriptionAccess function
 */

/**
 * Check if user has VT_PLUS plan
 * @param hasMethod - Clerk's has() method from useAuth() or auth()
 * @returns boolean indicating if user has VT_PLUS plan
 *
 * @example
 * // Server-side
 * const { has } = await auth();
 * const isPlus = hasVtPlusPlan(has);
 *
 * @example
 * // Client-side
 * const { has } = useAuth();
 * const isPlus = hasVtPlusPlan(has);
 */
export function hasVtPlusPlan(hasMethod: ClerkHasMethod): boolean {
    return checkSubscriptionAccess(hasMethod, { plan: PlanSlug.VT_PLUS });
}

/**
 * Check if user has VT_BASE plan (free tier)
 * @param hasMethod - Clerk's has() method from useAuth() or auth()
 * @returns boolean indicating if user has VT_BASE plan
 */
export function hasVtBasePlan(hasMethod: ClerkHasMethod): boolean {
    return checkSubscriptionAccess(hasMethod, { plan: PlanSlug.VT_BASE });
}

/**
 * Check if user has a specific feature
 * @param hasMethod - Clerk's has() method from useAuth() or auth()
 * @param feature - Feature to check access for
 * @returns boolean indicating if user has the feature
 *
 * @example
 * const { has } = useAuth();
 * const canUseDarkMode = hasFeature(has, FeatureSlug.DARK_MODE);
 */
export function hasFeature(hasMethod: ClerkHasMethod, feature: FeatureSlug): boolean {
    return checkSubscriptionAccess(hasMethod, { feature });
}

/**
 * Check if user has any premium plan (not VT_BASE)
 * @param hasMethod - Clerk's has() method from useAuth() or auth()
 * @returns boolean indicating if user has any premium plan
 */
export function hasPremiumPlan(hasMethod: ClerkHasMethod): boolean {
    return hasVtPlusPlan(hasMethod);
}

/**
 * Get the current user's plan based on Clerk's has() method
 * @param hasMethod - Clerk's has() method from useAuth() or auth()
 * @returns PlanSlug indicating the user's current plan
 *
 * @example
 * const { has } = useAuth();
 * const currentPlan = getCurrentPlan(has);
 */
export function getCurrentPlan(hasMethod: ClerkHasMethod): PlanSlug {
    if (hasVtPlusPlan(hasMethod)) {
        return PlanSlug.VT_PLUS;
    }
    return PlanSlug.VT_BASE;
}

/**
 * Advanced subscription utilities for complex scenarios
 */

/**
 * Check multiple features at once
 * @param hasMethod - Clerk's has() method from useAuth() or auth()
 * @param features - Array of features to check
 * @returns Object with feature access status
 */
export function checkMultipleFeatures(
    hasMethod: ClerkHasMethod,
    features: FeatureSlug[]
): Record<FeatureSlug, boolean> {
    const result = {} as Record<FeatureSlug, boolean>;

    for (const feature of features) {
        result[feature] = hasFeature(hasMethod, feature);
    }

    return result;
}

/**
 * Check if user has access to any of the provided features
 * @param hasMethod - Clerk's has() method from useAuth() or auth()
 * @param features - Array of features to check
 * @returns boolean indicating if user has access to at least one feature
 */
export function hasAnyFeature(hasMethod: ClerkHasMethod, features: FeatureSlug[]): boolean {
    return features.some(feature => hasFeature(hasMethod, feature));
}

/**
 * Check if user has access to all of the provided features
 * @param hasMethod - Clerk's has() method from useAuth() or auth()
 * @param features - Array of features to check
 * @returns boolean indicating if user has access to all features
 */
export function hasAllFeatures(hasMethod: ClerkHasMethod, features: FeatureSlug[]): boolean {
    return features.every(feature => hasFeature(hasMethod, feature));
}

/**
 * Get detailed subscription status with comprehensive information
 * @param hasMethod - Clerk's has() method from useAuth() or auth()
 * @returns Comprehensive subscription status object
 */
export function getSubscriptionStatus(hasMethod: ClerkHasMethod) {
    const currentPlan = getCurrentPlan(hasMethod);
    const isPremium = hasPremiumPlan(hasMethod);
    const planInfo = PLANS[currentPlan];

    return {
        currentPlan,
        isPremium,
        isVtBase: hasVtBasePlan(hasMethod),
        isVtPlus: hasVtPlusPlan(hasMethod),
        planInfo,
        availableFeatures: planInfo.features,
        canUpgrade: currentPlan === PlanSlug.VT_BASE,
        displayName: planInfo.name,
        // Utility functions bound to this user's subscription
        hasFeature: (feature: FeatureSlug) => hasFeature(hasMethod, feature),
        hasAnyFeature: (features: FeatureSlug[]) => hasAnyFeature(hasMethod, features),
        hasAllFeatures: (features: FeatureSlug[]) => hasAllFeatures(hasMethod, features),
    };
}

/**
 * Subscription utilities. Many of these are now deprecated in favor of direct Clerk usage.
 */
export const SubscriptionUtils = {
    // Core unified interface
    checkSubscriptionAccess,

    // Optimized utility functions for common checks
    hasVtPlusPlan,
    hasVtBasePlan,
    hasFeature,
    hasPremiumPlan,
    getCurrentPlan,

    // Advanced utilities for complex scenarios
    checkMultipleFeatures,
    hasAnyFeature,
    hasAllFeatures,
    getSubscriptionStatus,

    // These utilities for getting subscription context can remain useful
    getUserSubscription,
    getUserFeatures,
    getUserPlan,
    isFreePlan,
    isPremiumPlan,
    getRequiredPlanForFeature,
    requiresAuth,
};

export default SubscriptionUtils;

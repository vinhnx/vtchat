'use client';

import { FeatureSlug, PlanSlug, PLANS } from '@repo/shared/types/subscription';
import { isDevTestMode } from '@repo/shared/utils';
import { useCallback } from 'react';
import { useSubscription, UserProfile } from './use-subscription'; // Changed from use-subscription-status
import { UserClientSubscriptionStatus } from '@repo/shared/utils/subscription';

/**
 * Custom hook for optimized subscription access checking.
 * This hook leverages the refactored `useSubscription` hook, which uses
 * the shared `getSubscriptionStatus` utility.
 *
 * @returns Object with subscription access methods and status
 */
export function useSubscriptionAccess() {
    // Use the refactored useSubscription hook
    const {
        subscriptionStatus, // This is UserClientSubscriptionStatus
        userProfile,        // This is UserProfile | null
        isLoading,
        error,
        refetch,            // Renamed from refreshSubscriptionStatus for consistency
    } = useSubscription();

    const isLoaded = !isLoading;
    // isSignedIn can be based on userProfile or if subscriptionStatus indicates an active, known user
    const isSignedIn = !!userProfile && subscriptionStatus.status !== 'none';


    const hasAccess = useCallback(
        (options: { feature?: FeatureSlug; plan?: PlanSlug; permission?: string }) => {
            if (isDevTestMode()) {
                console.log('🚧 DEV TEST MODE: Bypassing subscription access check in useSubscriptionAccess', options);
                return true;
            }

            if (!isLoaded || !subscriptionStatus || !subscriptionStatus.isActive) {
                 // If not loaded, or no status, or overall status is not active, then no access.
                return false;
            }

            const { feature, plan } = options;

            // Check plan access
            if (plan) {
                if (plan === PlanSlug.VT_PLUS) {
                    return subscriptionStatus.isVtPlus;
                }
                // If checking for VT_BASE, it's true if current plan is VT_BASE or VT_PLUS (as VT+ includes base)
                if (plan === PlanSlug.VT_BASE) {
                    return subscriptionStatus.isVtBase || subscriptionStatus.isVtPlus;
                }
                return false; // Unknown plan
            }

            // Check feature access
            if (feature) {
                // If the plan itself doesn't grant the feature (according to PLANS config)
                if (!subscriptionStatus.planConfig.features.includes(feature)) {
                    return false;
                }
                // Specific logic for VT+ features (already covered by planConfig if set up correctly, but double-check)
                const vtPlusExclusiveFeatures = [
                    FeatureSlug.DARK_THEME,
                    FeatureSlug.DEEP_RESEARCH,
                    FeatureSlug.PRO_SEARCH,
                    FeatureSlug.ADVANCED_CHAT_MODES,
                ];
                if (vtPlusExclusiveFeatures.includes(feature)) {
                    return subscriptionStatus.isVtPlus;
                }
                // If it's a base feature and included in their planConfig, they have access.
                return true;
            }

            // If permission is provided (legacy or future use)
            if (options.permission) {
                console.warn(`Permission checks ('${options.permission}') are not fully implemented in useSubscriptionAccess.`);
                return false;
            }

            return false; // Default to no access if no specific check matches
        },
        [isLoaded, subscriptionStatus]
    );

    const canAccess = useCallback(
        (feature: FeatureSlug) => hasAccess({ feature }),
        [hasAccess]
    );

    const hasPlanAccess = useCallback( // Renamed from hasPlan to avoid conflict with local var
        (plan: PlanSlug) => hasAccess({ plan }),
        [hasAccess]
    );

    return {
        isLoaded,
        isLoading, // Keep isLoading for direct use
        isSignedIn,
        userProfile, // Expose userProfile
        error, // Expose error state

        hasAccess,
        canAccess,
        hasPlan: hasPlanAccess, // Use the renamed callback

        // Convenience properties derived from subscriptionStatus
        currentPlan: subscriptionStatus.currentPlanSlug,
        isPremium: subscriptionStatus.isPremium && subscriptionStatus.isActive,
        isVtPlus: subscriptionStatus.isVtPlus && subscriptionStatus.isActive,
        isVtBase: subscriptionStatus.isVtBase && subscriptionStatus.isActive, // Base plan is active if current is base and active
        canUpgrade: subscriptionStatus.canUpgrade,

        subscriptionStatus, // Expose the full detailed status object

        refreshSubscriptionStatus: refetch, // Expose refetch function

        hasAnyFeature: useCallback(
            (features: FeatureSlug[]) => {
                if (!isLoaded || !subscriptionStatus.isActive) return false;
                return features.some(feature => hasAccess({ feature }));
            },
            [isLoaded, subscriptionStatus.isActive, hasAccess]
        ),

        hasAllFeatures: useCallback(
            (features: FeatureSlug[]) => {
                if (!isLoaded || !subscriptionStatus.isActive) return false;
                return features.every(feature => hasAccess({ feature }));
            },
            [isLoaded, subscriptionStatus.isActive, hasAccess]
        ),
    };
}

export function useFeatureAccess(feature: FeatureSlug): boolean {
    const { canAccess, isLoaded } = useSubscriptionAccess();
    if (!isLoaded) return false; // Or handle loading state appropriately
    return canAccess(feature);
}

export function usePlanAccess(plan: PlanSlug): boolean {
    const { hasPlan, isLoaded } = useSubscriptionAccess();
    if (!isLoaded) return false;
    return hasPlan(plan);
}

export function useVtPlusAccess(): boolean {
    const { isVtPlus, isLoaded } = useSubscriptionAccess();
    if (!isLoaded) return false;
    return isVtPlus;
}

export function useCurrentPlan(): {
    planSlug: PlanSlug;
    planConfig: UserClientSubscriptionStatus['planConfig'];
    canUpgrade: boolean;
    isVtPlus: boolean;
    isActive: boolean;
    isLoaded: boolean;
} {
    const { subscriptionStatus, isLoaded } = useSubscriptionAccess();
    return {
        planSlug: subscriptionStatus.currentPlanSlug,
        planConfig: subscriptionStatus.planConfig,
        canUpgrade: subscriptionStatus.canUpgrade,
        isVtPlus: subscriptionStatus.isVtPlus && subscriptionStatus.isActive,
        isActive: subscriptionStatus.isActive,
        isLoaded,
    };
}

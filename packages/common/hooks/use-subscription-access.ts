'use client';

import { FeatureSlug, PLANS, PlanSlug } from '@repo/shared/types/subscription';
import type { UserClientSubscriptionStatus } from '@repo/shared/utils/subscription';
import { useCallback, useMemo } from 'react';
import { useGlobalSubscriptionStatus } from '../providers/subscription-provider'; // Use global provider

/**
 * Custom hook for optimized subscription access checking.
 * This hook leverages the global `SubscriptionProvider` for better performance
 * and to prevent multiple API calls across components.
 *
 * @returns Object with subscription access methods and status
 */
export function useSubscriptionAccess() {
    const { subscriptionStatus, isLoading, error, refreshSubscriptionStatus } =
        useGlobalSubscriptionStatus();

    const convertedStatus: UserClientSubscriptionStatus = useMemo(() => {
        const currentPlanSlug = PlanSlug.VT_BASE;
        const planConfig = PLANS[currentPlanSlug];

        return {
            currentPlanSlug,
            isActive: true,
            isPremium: false,
            isVtPlus: false,
            isVtBase: true,
            canUpgrade: false,
            status: subscriptionStatus?.status || 'active',
            planConfig,
            source: 'none',
        } as const;
    }, [subscriptionStatus]);

    const isLoaded = true;
    const isSignedIn = true;

    const hasAccess = useCallback(
        (options: { feature?: FeatureSlug; plan?: PlanSlug; permission?: string; }) => {
            void options.permission;
            const { feature, plan } = options;

            if (plan) {
                return true;
            }

            if (feature) {
                return true;
            }

            return true;
        },
        [],
    );

    const canAccess = useCallback((feature: FeatureSlug) => hasAccess({ feature }), [hasAccess]);

    const hasPlanAccess = useCallback(
        // Renamed from hasPlan to avoid conflict with local var
        (plan: PlanSlug) => hasAccess({ plan }),
        [hasAccess],
    );

    return {
        isLoaded,
        isLoading, // Keep isLoading for direct use
        isSignedIn,
        userProfile: null, // Not available from subscription status API
        error, // Expose error state

        hasAccess,
        canAccess,
        hasPlan: hasPlanAccess, // Use the renamed callback

        // Convenience properties derived from convertedStatus
        currentPlan: convertedStatus.currentPlanSlug,
        isPremium: convertedStatus.isPremium && convertedStatus.isActive,
        isVtPlus: convertedStatus.isVtPlus && convertedStatus.isActive,
        isVtBase: convertedStatus.isVtBase && convertedStatus.isActive, // Base plan is active if current is base and active
        canUpgrade: convertedStatus.canUpgrade,
        isActive: convertedStatus.isActive, // Add missing isActive property

        subscriptionStatus: convertedStatus, // Expose the full detailed status object

        refreshSubscriptionStatus, // Use the optimized refresh function

        hasAnyFeature: useCallback(
            (features: FeatureSlug[]) => {
                if (!(isLoaded && convertedStatus.isActive)) return false;
                return features.some((feature) => hasAccess({ feature }));
            },
            [isLoaded, convertedStatus.isActive, hasAccess],
        ),

        hasAllFeatures: useCallback(
            (features: FeatureSlug[]) => {
                if (!(isLoaded && convertedStatus.isActive)) return false;
                return features.every((feature) => hasAccess({ feature }));
            },
            [isLoaded, convertedStatus.isActive, hasAccess],
        ),
    };
}

export function useFeatureAccess(feature: FeatureSlug): boolean {
    const { canAccess } = useSubscriptionAccess();
    return canAccess(feature);
}

export function usePlanAccess(plan: PlanSlug): boolean {
    const { hasPlan } = useSubscriptionAccess();
    return hasPlan(plan);
}

export function useVtPlusAccess(): boolean {
    void useSubscriptionAccess();
    return true;
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
        canUpgrade: false,
        isVtPlus: false,
        isActive: true,
        isLoaded,
    };
}

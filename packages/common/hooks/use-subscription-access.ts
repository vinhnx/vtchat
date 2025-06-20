'use client';

import { FeatureSlug, PLANS, PlanSlug } from '@repo/shared/types/subscription';
import { SubscriptionStatusEnum } from '@repo/shared/types/subscription-status';
import { UserClientSubscriptionStatus } from '@repo/shared/utils/subscription';
import { useCallback } from 'react';
import { useGlobalSubscriptionStatus } from '../providers/subscription-provider'; // Use global provider

/**
 * Custom hook for optimized subscription access checking.
 * This hook leverages the global `SubscriptionProvider` for better performance
 * and to prevent multiple API calls across components.
 *
 * @returns Object with subscription access methods and status
 */
export function useSubscriptionAccess() {
    // Use the global subscription provider
    const { subscriptionStatus, isLoading, error, refreshSubscriptionStatus } =
        useGlobalSubscriptionStatus();

    // Convert subscriptionStatus to UserClientSubscriptionStatus format
    const currentPlanSlug = (subscriptionStatus?.plan as PlanSlug) || PlanSlug.VT_BASE;
    const planConfig = PLANS[currentPlanSlug]; // Get the actual plan configuration
    const isStatusActive = subscriptionStatus?.status === SubscriptionStatusEnum.ACTIVE;

    const convertedStatus: UserClientSubscriptionStatus = {
        currentPlanSlug,
        isActive: isStatusActive,
        isPremium: subscriptionStatus?.isPlusSubscriber || false,
        isVtPlus: subscriptionStatus?.isPlusSubscriber || false,
        isVtBase: !subscriptionStatus?.isPlusSubscriber,
        canUpgrade: !subscriptionStatus?.isPlusSubscriber,
        status:
            subscriptionStatus?.status === SubscriptionStatusEnum.ACTIVE
                ? SubscriptionStatusEnum.ACTIVE
                : SubscriptionStatusEnum.NONE,
        planConfig, // Use the actual plan configuration with features
        source: subscriptionStatus?.hasSubscription ? 'creem' : 'none', // Add missing source
    } as const;

    const isLoaded = !isLoading;
    // For logged-in users, isSignedIn is true if we have a user-based subscription status
    // For anonymous users, we still provide access but with base plan
    const isSignedIn = !subscriptionStatus?.isAnonymous;

    const hasAccess = useCallback(
        (options: { feature?: FeatureSlug; plan?: PlanSlug; permission?: string }) => {
            if (!isLoaded || !subscriptionStatus || !convertedStatus.isActive) {
                // If not loaded, or no status, or overall status is not active, then no access.
                return false;
            }

            const { feature, plan } = options;

            // Check plan access
            if (plan) {
                if (plan === PlanSlug.VT_PLUS) {
                    return convertedStatus.isVtPlus;
                }
                // If checking for VT_BASE, it's true if current plan is VT_BASE or VT_PLUS (as VT+ includes base)
                if (plan === PlanSlug.VT_BASE) {
                    return convertedStatus.isVtBase || convertedStatus.isVtPlus;
                }
                return false; // Unknown plan
            }

            // Check feature access
            if (feature) {
                // If the plan itself doesn't grant the feature (according to PLANS config)
                if (!convertedStatus.planConfig.features.includes(feature)) {
                    return false;
                }
                // Specific logic for VT+ features (already covered by planConfig if set up correctly, but double-check)
                const vtPlusExclusiveFeatures = [
                    FeatureSlug.DARK_THEME,
                    FeatureSlug.DEEP_RESEARCH,
                    FeatureSlug.PRO_SEARCH,
                    FeatureSlug.ADVANCED_CHAT_MODES,
                    FeatureSlug.STRUCTURED_OUTPUT,
                    FeatureSlug.THINKING_MODE,
                    FeatureSlug.DOCUMENT_PARSING,
                    FeatureSlug.THINKING_MODE_TOGGLE,
                    FeatureSlug.REASONING_CHAIN,
                ];
                if (vtPlusExclusiveFeatures.includes(feature)) {
                    return convertedStatus.isVtPlus;
                }
                // If it's a base feature and included in their planConfig, they have access.
                return true;
            }

            // If permission is provided (legacy or future use)
            if (options.permission) {
                console.warn(
                    `Permission checks ('${options.permission}') are not fully implemented in useSubscriptionAccess.`
                );
                return false;
            }

            return false; // Default to no access if no specific check matches
        },
        [isLoaded, convertedStatus]
    );

    const canAccess = useCallback((feature: FeatureSlug) => hasAccess({ feature }), [hasAccess]);

    const hasPlanAccess = useCallback(
        // Renamed from hasPlan to avoid conflict with local var
        (plan: PlanSlug) => hasAccess({ plan }),
        [hasAccess]
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

        subscriptionStatus: convertedStatus, // Expose the full detailed status object

        refreshSubscriptionStatus, // Use the optimized refresh function

        hasAnyFeature: useCallback(
            (features: FeatureSlug[]) => {
                if (!isLoaded || !convertedStatus.isActive) return false;
                return features.some(feature => hasAccess({ feature }));
            },
            [isLoaded, convertedStatus.isActive, hasAccess]
        ),

        hasAllFeatures: useCallback(
            (features: FeatureSlug[]) => {
                if (!isLoaded || !convertedStatus.isActive) return false;
                return features.every(feature => hasAccess({ feature }));
            },
            [isLoaded, convertedStatus.isActive, hasAccess]
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

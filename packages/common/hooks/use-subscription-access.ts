"use client";

import { SUBSCRIPTION_SOURCES } from "@repo/shared/constants";
import { log } from "@repo/shared/logger";
import { FeatureSlug, PLANS, PlanSlug } from "@repo/shared/types/subscription";
import { SubscriptionStatusEnum } from "@repo/shared/types/subscription-status";
import type { UserClientSubscriptionStatus } from "@repo/shared/utils/subscription";
import {
    getEffectiveAccessStatus,
    hasSubscriptionAccess,
} from "@repo/shared/utils/subscription-grace-period";
import { useCallback, useMemo } from "react";
import { useGlobalSubscriptionStatus } from "../providers/subscription-provider"; // Use global provider

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
    const convertedStatus: UserClientSubscriptionStatus = useMemo(() => {
        const currentPlanSlug = (subscriptionStatus?.plan as PlanSlug) || PlanSlug.ANONYMOUS;
        const planConfig = PLANS[currentPlanSlug]; // Get the actual plan configuration

        // Use centralized access logic instead of checking only ACTIVE
        const hasActiveAccess = subscriptionStatus
            ? hasSubscriptionAccess({
                  status: subscriptionStatus.status,
                  currentPeriodEnd: subscriptionStatus.currentPeriodEnd,
              })
            : false;

        // Get effective status for UI display
        const effectiveStatus = subscriptionStatus
            ? getEffectiveAccessStatus({
                  status: subscriptionStatus.status,
                  currentPeriodEnd: subscriptionStatus.currentPeriodEnd,
              })
            : SubscriptionStatusEnum.NONE;

        return {
            currentPlanSlug,
            isActive: hasActiveAccess, // Use access logic instead of just ACTIVE status
            isPremium: subscriptionStatus?.isPlusSubscriber && hasActiveAccess,
            isVtPlus: subscriptionStatus?.isPlusSubscriber && hasActiveAccess,
            isVtBase:
                !subscriptionStatus?.isPlusSubscriber &&
                currentPlanSlug === PlanSlug.VT_BASE &&
                hasActiveAccess,
            canUpgrade: !subscriptionStatus?.isPlusSubscriber,
            status: effectiveStatus, // Use effective status instead of binary ACTIVE/NONE
            planConfig, // Use the actual plan configuration with features
            source: subscriptionStatus?.hasSubscription
                ? SUBSCRIPTION_SOURCES.CREEM
                : SUBSCRIPTION_SOURCES.NONE, // Add missing source
        } as const;
    }, [subscriptionStatus]);

    const isLoaded = !isLoading;
    // For logged-in users, isSignedIn is true if we have a user-based subscription status
    // For anonymous users, isSignedIn is false and they get only anonymous plan access
    const isSignedIn = !subscriptionStatus?.isAnonymous;

    const hasAccess = useCallback(
        (options: { feature?: FeatureSlug; plan?: PlanSlug; permission?: string }) => {
            if (!(isLoaded && subscriptionStatus && convertedStatus.isActive)) {
                // If not loaded, or no status, or overall status is not active, then no access.
                return false;
            }

            const { feature, plan } = options;

            // Check plan access
            if (plan) {
                if (plan === PlanSlug.VT_PLUS) {
                    return convertedStatus.isVtPlus;
                }
                // If checking for VT_BASE, requires authentication and current plan is VT_BASE or VT_PLUS
                if (plan === PlanSlug.VT_BASE) {
                    return isSignedIn && (convertedStatus.isVtBase || convertedStatus.isVtPlus);
                }
                // Anonymous plan is accessible without authentication
                if (plan === PlanSlug.ANONYMOUS) {
                    return convertedStatus.currentPlanSlug === PlanSlug.ANONYMOUS;
                }
                return false; // Unknown plan
            }

            // Check feature access
            if (feature) {
                // If the plan itself doesn't grant the feature (according to PLANS config)
                if (!convertedStatus.planConfig.features.includes(feature)) {
                    return false;
                }
                // Specific logic for VT+ exclusive features
                const vtPlusExclusiveFeatures = [
                    FeatureSlug.PRO_SEARCH,
                    FeatureSlug.DEEP_RESEARCH,
                    FeatureSlug.RAG,
                    FeatureSlug.GROUNDING_WEB_SEARCH,
                    FeatureSlug.ADVANCED_CHAT_MODES,
                ];
                if (vtPlusExclusiveFeatures.includes(feature)) {
                    return convertedStatus.isVtPlus;
                }

                // Features available to all logged-in users (free tier)
                const freeFeatures = [
                    FeatureSlug.DARK_THEME,
                    FeatureSlug.THINKING_MODE_TOGGLE,
                    FeatureSlug.STRUCTURED_OUTPUT,
                    FeatureSlug.THINKING_MODE,
                    FeatureSlug.DOCUMENT_PARSING,
                    FeatureSlug.REASONING_CHAIN,
                    FeatureSlug.GEMINI_EXPLICIT_CACHING,
                    FeatureSlug.CHART_VISUALIZATION,
                ];
                if (freeFeatures.includes(feature)) {
                    return isSignedIn; // Available to all logged-in users
                }
                // If it's a base feature and included in their planConfig, they have access.
                return true;
            }

            // If permission is provided (legacy or future use)
            if (options.permission) {
                log.warn(
                    { permission: options.permission },
                    "Permission checks are not fully implemented in useSubscriptionAccess",
                );
                return false;
            }

            return false; // Default to no access if no specific check matches
        },
        [isLoaded, convertedStatus, subscriptionStatus, isSignedIn],
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
    const { isVtPlus, isActive, isLoaded } = useSubscriptionAccess();
    if (!isLoaded) return false;
    return isVtPlus && isActive;
}

export function useCurrentPlan(): {
    planSlug: PlanSlug;
    planConfig: UserClientSubscriptionStatus["planConfig"];
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

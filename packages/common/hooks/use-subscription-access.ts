'use client';

import { useAuth } from '@clerk/nextjs';
import { FeatureSlug, PlanSlug } from '@repo/shared/types/subscription';
import {
    checkSubscriptionAccess,
    getCurrentPlan,
    getSubscriptionStatus,
    hasFeature,
    hasVtPlusPlan,
} from '@repo/shared/utils/subscription';
import { useCallback, useMemo } from 'react';

/**
 * Custom hook for optimized subscription access checking
 * Combines Clerk's reactive has() method with convenient utility functions
 *
 * This hook is optimized for performance and provides a clean API for
 * checking subscription access throughout the application.
 *
 * @returns Object with subscription access methods and status
 *
 * @example
 * function MyComponent() {
 *   const {
 *     hasAccess,
 *     isPremium,
 *     currentPlan,
 *     canAccess
 *   } = useSubscriptionAccess();
 *
 *   const canUseDarkTheme = hasAccess({ feature: FeatureSlug.DARK_THEME });
 *   const isVtPlus = hasAccess({ plan: PlanSlug.VT_PLUS });
 *
 *   return (
 *     <div>
 *       {canUseDarkMode && <DarkModeToggle />}
 *       {!isPremium && <UpgradeButton />}
 *     </div>
 *   );
 * }
 */
export function useSubscriptionAccess() {
    const { has, isLoaded, isSignedIn } = useAuth();

    // Memoize the subscription status to avoid recalculations
    const subscriptionStatus = useMemo(() => {
        if (!isLoaded || !has) {
            return null;
        }
        return getSubscriptionStatus(has);
    }, [has, isLoaded]);

    // Create stable callback for access checking
    const hasAccess = useCallback(
        (options: { feature?: FeatureSlug; plan?: PlanSlug; permission?: string }) => {
            if (!isLoaded || !has) return false;
            return checkSubscriptionAccess(has, options);
        },
        [has, isLoaded]
    );

    // Create stable callback for feature checking
    const canAccess = useCallback(
        (feature: FeatureSlug) => {
            if (!isLoaded || !has) return false;
            return hasFeature(has, feature);
        },
        [has, isLoaded]
    );

    // Create stable callback for plan checking
    const hasPlan = useCallback(
        (plan: PlanSlug) => {
            if (!isLoaded || !has) return false;
            return checkSubscriptionAccess(has, { plan });
        },
        [has, isLoaded]
    );

    return {
        // Loading and auth states
        isLoaded,
        isSignedIn,

        // Core access checking functions
        hasAccess,
        canAccess,
        hasPlan,

        // Direct access to Clerk's has method
        has,

        // Convenience properties
        currentPlan: subscriptionStatus?.currentPlan || PlanSlug.VT_BASE,
        isPremium: subscriptionStatus?.isPremium || false,
        isVtPlus: subscriptionStatus?.isVtPlus || false,
        isVtBase: subscriptionStatus?.isVtBase || true,
        canUpgrade: subscriptionStatus?.canUpgrade || true,

        // Full subscription status object
        subscriptionStatus,

        // Utility functions for complex checks
        hasAnyFeature: useCallback(
            (features: FeatureSlug[]) => {
                if (!isLoaded || !has) return false;
                return features.some(feature => hasFeature(has, feature));
            },
            [has, isLoaded]
        ),

        hasAllFeatures: useCallback(
            (features: FeatureSlug[]) => {
                if (!isLoaded || !has) return false;
                return features.every(feature => hasFeature(has, feature));
            },
            [has, isLoaded]
        ),
    };
}

/**
 * Simplified hook for checking a specific feature access
 * Optimized for components that only need to check one feature
 *
 * @param feature - The feature to check access for
 * @returns boolean indicating if the user has access to the feature
 *
 * @example
 * function DarkModeToggle() {
 *   const canUseDarkTheme = useFeatureAccess(FeatureSlug.DARK_THEME);
 *
 *   if (!canUseDarkMode) {
 *     return <UpgradePrompt feature="Dark Mode" />;
 *   }
 *
 *   return <DarkModeSwitch />;
 * }
 */
export function useFeatureAccess(feature: FeatureSlug): boolean {
    const { has, isLoaded } = useAuth();

    return useMemo(() => {
        if (!isLoaded || !has) return false;
        return hasFeature(has, feature);
    }, [has, isLoaded, feature]);
}

/**
 * Simplified hook for checking a specific plan access
 * Optimized for components that only need to check one plan
 *
 * @param plan - The plan to check access for
 * @returns boolean indicating if the user has access to the plan
 *
 * @example
 * function PremiumContent() {
 *   const hasVtPlus = usePlanAccess(PlanSlug.VT_PLUS);
 *
 *   if (!hasVtPlus) {
 *     return <UpgradePrompt plan="VT Plus" />;
 *   }
 *
 *   return <PremiumFeatures />;
 * }
 */
export function usePlanAccess(plan: PlanSlug): boolean {
    const { has, isLoaded } = useAuth();

    return useMemo(() => {
        if (!isLoaded || !has) return false;
        return checkSubscriptionAccess(has, { plan });
    }, [has, isLoaded, plan]);
}

/**
 * Hook specifically for checking VT Plus access
 * Commonly used pattern extracted into a dedicated hook
 *
 * @returns boolean indicating if the user has VT Plus plan
 *
 * @example
 * function UserTierBadge() {
 *   const isVtPlus = useVtPlusAccess();
 *
 *   return (
 *     <Badge className={isVtPlus ? 'premium' : 'free'}>
 *       {isVtPlus ? 'VT Plus' : 'VT Base'}
 *     </Badge>
 *   );
 * }
 */
export function useVtPlusAccess(): boolean {
    const { has, isLoaded, user } = useAuth();

    return useMemo(() => {
        if (!isLoaded || !has) return false;

        // Check through the hasVtPlusPlan function (which now checks both Clerk and Polar)
        return hasVtPlusPlan(has);
    }, [
        has,
        isLoaded,
        user?.publicMetadata?.planSlug,
        user?.privateMetadata?.subscription?.isActive,
    ]);
}

/**
 * Hook that provides the current user's plan information
 * Optimized for components that need plan details
 *
 * @returns Object with current plan information
 *
 * @example
 * function SubscriptionCard() {
 *   const { planSlug, planInfo, canUpgrade } = useCurrentPlan();
 *
 *   return (
 *     <Card>
 *       <h3>{planInfo.name}</h3>
 *       <p>{planInfo.description}</p>
 *       {canUpgrade && <UpgradeButton />}
 *     </Card>
 *   );
 * }
 */
export function useCurrentPlan() {
    const { has, isLoaded } = useAuth();

    return useMemo(() => {
        if (!isLoaded || !has) {
            return {
                planSlug: PlanSlug.VT_BASE,
                planInfo: null,
                canUpgrade: true,
            };
        }

        const planSlug = getCurrentPlan(has);
        const subscriptionStatus = getSubscriptionStatus(has);

        return {
            planSlug,
            planInfo: subscriptionStatus.planInfo,
            canUpgrade: subscriptionStatus.canUpgrade,
        };
    }, [has, isLoaded]);
}

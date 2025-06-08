'use client';

import { FeatureSlug, PlanSlug } from '@repo/shared/types/subscription';
import { isDevTestMode } from '@repo/shared/utils';
import { useCallback } from 'react';
import { useSubscriptionStatus } from './use-subscription-status';

/**
 * Custom hook for optimized subscription access checking
 * Now uses database-backed subscription status instead of user metadata
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
    const { subscriptionStatus, isPlusSubscriber, isLoading, refreshSubscriptionStatus } =
        useSubscriptionStatus();

    const isLoaded = !isLoading;
    const isSignedIn = !!subscriptionStatus;
    // Create stable callback for access checking
    const hasAccess = useCallback(
        (options: { feature?: FeatureSlug; plan?: PlanSlug; permission?: string }) => {
            // DEV TEST MODE: Bypass all access checks
            if (isDevTestMode()) {
                console.log(
                    '🚧 DEV TEST MODE: Bypassing subscription access check in hook',
                    options
                );
                return true;
            }

            if (!isLoaded || !subscriptionStatus) return false;

            const { feature, plan } = options;

            // Check plan access
            if (plan) {
                if (plan === PlanSlug.VT_PLUS) {
                    return isPlusSubscriber;
                }
                // Everyone has access to the base plan
                return true;
            }

            // Check feature access
            if (feature) {
                // VT+ exclusive features
                const vtPlusFeatures = [
                    FeatureSlug.DARK_THEME,
                    FeatureSlug.DEEP_RESEARCH,
                    FeatureSlug.PRO_SEARCH,
                    FeatureSlug.ADVANCED_CHAT_MODES,
                ];

                if (vtPlusFeatures.includes(feature)) {
                    return isPlusSubscriber;
                }

                // All other features are available to everyone
                return true;
            }

            return false;
        },
        [isLoaded, subscriptionStatus, isPlusSubscriber]
    );

    // Create stable callback for feature checking
    const canAccess = useCallback(
        (feature: FeatureSlug) => {
            return hasAccess({ feature });
        },
        [hasAccess]
    );

    // Create stable callback for plan checking
    const hasPlan = useCallback(
        (plan: PlanSlug) => {
            return hasAccess({ plan });
        },
        [hasAccess]
    );

    return {
        // Loading and auth states
        isLoaded,
        isSignedIn,

        // Core access checking functions
        hasAccess,
        canAccess,
        hasPlan,

        // Convenience properties
        currentPlan: subscriptionStatus?.plan || 'free',
        isPremium: isPlusSubscriber,
        isVtPlus: isPlusSubscriber,
        isVtBase: !isPlusSubscriber,
        canUpgrade: !isPlusSubscriber,

        // Full subscription status object
        subscriptionStatus,

        // Refresh function
        refreshSubscriptionStatus,

        // Utility functions for complex checks
        hasAnyFeature: useCallback(
            (features: FeatureSlug[]) => {
                if (!isLoaded) return false;
                return features.some(feature => hasAccess({ feature }));
            },
            [isLoaded, hasAccess]
        ),

        hasAllFeatures: useCallback(
            (features: FeatureSlug[]) => {
                if (!isLoaded) return false;
                return features.every(feature => hasAccess({ feature }));
            },
            [isLoaded, hasAccess]
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
    const { hasAccess } = useSubscriptionAccess();
    return hasAccess({ feature });
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
    const { hasAccess } = useSubscriptionAccess();
    return hasAccess({ plan });
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
    const { isPlusSubscriber } = useSubscriptionStatus();
    return isPlusSubscriber;
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
    const { subscriptionStatus, isPlusSubscriber } = useSubscriptionStatus();

    return {
        planSlug: subscriptionStatus?.plan || 'free',
        canUpgrade: !isPlusSubscriber,
        isVtPlus: isPlusSubscriber,
    };
}

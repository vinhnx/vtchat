'use client';

import { useSession } from '@repo/shared/lib/auth-client';
import { FeatureSlug, PlanSlug } from '@repo/shared/types/subscription';
import { isDevTestMode } from '@repo/shared/utils';
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
 * Combines Better Auth's user session with convenient utility functions
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
    const { data: session } = useSession();
    const isLoaded = !!session;
    const isSignedIn = !!session;
    const user = session?.user;

    // Memoize the subscription status to avoid recalculations
    const subscriptionStatus = useMemo(() => {
        if (!isLoaded) {
            return null;
        }

        // Create subscription context with user data
        const context = {
            user,
        };

        return getSubscriptionStatus(context);
    }, [isLoaded, user]);

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

            if (!isLoaded) return false;

            const context = {
                user,
            };

            return checkSubscriptionAccess(context, options);
        },
        [isLoaded, user]
    );

    // Create stable callback for feature checking
    const canAccess = useCallback(
        (feature: FeatureSlug) => {
            // DEV TEST MODE: Bypass all feature checks
            if (isDevTestMode()) {
                console.log('🚧 DEV TEST MODE: Bypassing feature check in hook', feature);
                return true;
            }

            if (!isLoaded) return false;

            const context = {
                user,
            };

            return hasFeature(context, feature);
        },
        [isLoaded, user]
    );

    // Create stable callback for plan checking
    const hasPlan = useCallback(
        (plan: PlanSlug) => {
            // DEV TEST MODE: Bypass all plan checks
            if (isDevTestMode()) {
                console.log('🚧 DEV TEST MODE: Bypassing plan check in hook', plan);
                return true;
            }

            if (!isLoaded) return false;

            const context = {
                user,
            };

            return checkSubscriptionAccess(context, { plan });
        },
        [isLoaded, user]
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
                if (!isLoaded) return false;
                const context = { user };
                return features.some(feature => hasFeature(context, feature));
            },
            [isLoaded, user]
        ),

        hasAllFeatures: useCallback(
            (features: FeatureSlug[]) => {
                if (!isLoaded) return false;
                const context = { user };
                return features.every(feature => hasFeature(context, feature));
            },
            [isLoaded, user]
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
    const { data: session } = useSession();
    const user = session?.user;

    return useMemo(() => {
        if (!session) return false;

        const context = {
            user,
        };

        return hasFeature(context, feature);
    }, [session, user, feature]);
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
    const { data: session } = useSession();
    const user = session?.user;

    return useMemo(() => {
        if (!session) return false;

        const context = {
            user,
        };

        return checkSubscriptionAccess(context, { plan });
    }, [session, user, plan]);
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
    const { data: session } = useSession();
    const user = session?.user;

    return useMemo(() => {
        if (!session) return false;

        const context = { user };
        return hasVtPlusPlan(context);
    }, [session, user]);
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
    const { data: session } = useSession();
    const user = session?.user;

    return useMemo(() => {
        if (!session) {
            return {
                planSlug: PlanSlug.VT_BASE,
                planInfo: null,
                canUpgrade: true,
            };
        }

        const context = { user };
        const planSlug = getCurrentPlan(context);
        const subscriptionStatus = getSubscriptionStatus(context);

        return {
            planSlug,
            planInfo: subscriptionStatus.planInfo,
            canUpgrade: subscriptionStatus.canUpgrade,
        };
    }, [session, user]);
}

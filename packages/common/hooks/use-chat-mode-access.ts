'use client';

/**
 * Chat Mode Access Hook with Credits Integration
 *
 * Combines subscription-based and credit-based access control
 * for chat modes, providing a unified interface
 */

import { useAuth, useUser } from '@clerk/nextjs';
import { ChatMode } from '@repo/shared/config';
import {
    checkChatModeAccess,
    getAvailableChatModes,
    type ChatModeAccess,
} from '@repo/shared/utils/chat-credits';
import { useCallback, useMemo } from 'react';
import { useCredits } from '../store/credits.store';
import { useSubscriptionAccess } from './use-subscription-access';

export function useChatModeAccess() {
    const { isLoaded, isSignedIn } = useAuth();
    const { user } = useUser();
    const { balance: userCredits } = useCredits();
    const { isLoaded: subscriptionLoaded } = useSubscriptionAccess();

    // Check access for a specific chat mode
    const checkAccess = useCallback(
        (chatMode: ChatMode): ChatModeAccess => {
            if (!isLoaded || !subscriptionLoaded) {
                return {
                    canAccess: false,
                    accessType: 'blocked',
                    creditCost: 0,
                    reason: 'Loading...',
                };
            }

            // Create subscription context for access checking
            const subscriptionContext = {
                user,
            };

            return checkChatModeAccess(chatMode, {
                subscriptionContext,
                userCredits,
                isAuthenticated: isSignedIn,
            });
        },
        [isLoaded, userCredits, isSignedIn, subscriptionLoaded, user]
    );

    // Get all available chat modes with their access status
    const availableModes = useMemo(() => {
        if (!isLoaded || !subscriptionLoaded) return [];

        // Create subscription context for access checking
        const subscriptionContext = {
            user,
        };

        return getAvailableChatModes({
            subscriptionContext,
            userCredits,
            isAuthenticated: isSignedIn,
        });
    }, [isLoaded, userCredits, isSignedIn, subscriptionLoaded, user]);

    // Get modes by access type
    const modesByAccess = useMemo(() => {
        const grouped = {
            free: [] as ChatMode[],
            subscription: [] as ChatMode[],
            credits: [] as ChatMode[],
            blocked: [] as ChatMode[],
        };

        availableModes.forEach(({ mode, access }) => {
            if (access.canAccess) {
                grouped[access.accessType].push(mode);
            } else {
                grouped.blocked.push(mode);
            }
        });

        return grouped;
    }, [availableModes]);

    // Check if user can afford a specific mode with credits
    const canAffordWithCredits = useCallback(
        (chatMode: ChatMode): boolean => {
            const access = checkAccess(chatMode);
            return access.accessType === 'credits' && access.canAccess;
        },
        [checkAccess]
    );

    // Check if user has subscription access to a mode
    const hasSubscriptionAccess = useCallback(
        (chatMode: ChatMode): boolean => {
            const access = checkAccess(chatMode);
            return access.accessType === 'subscription' && access.canAccess;
        },
        [checkAccess]
    );

    // Get credit cost for a mode
    const getCreditCost = useCallback(
        (chatMode: ChatMode): number => {
            const access = checkAccess(chatMode);
            return access.creditCost;
        },
        [checkAccess]
    );

    // Check if mode is completely free
    const isFreeMode = useCallback(
        (chatMode: ChatMode): boolean => {
            const access = checkAccess(chatMode);
            return access.accessType === 'free' && access.canAccess;
        },
        [checkAccess]
    );

    return {
        // Core access checking
        checkAccess,
        availableModes,
        modesByAccess,

        // Specific access type checks
        canAffordWithCredits,
        hasSubscriptionAccess,
        isFreeMode,

        // Utility functions
        getCreditCost,

        // Current state
        userCredits,
        isLoaded: isLoaded && subscriptionLoaded,
        isSignedIn,
    };
}

/**
 * Hook for managing credit usage during chat sessions
 */
export function useChatCreditUsage() {
    const { useCredits: spendCredits, canAfford } = useCredits();
    const { checkAccess } = useChatModeAccess();

    // Attempt to use credits for a chat mode
    const useCreditForChat = useCallback(
        (chatMode: ChatMode, sessionInfo?: string): boolean => {
            const access = checkAccess(chatMode);

            // If subscription covers it, no credits needed
            if (access.accessType === 'subscription' || access.accessType === 'free') {
                return true;
            }

            // If credits are required, deduct them
            if (access.accessType === 'credits' && access.canAccess) {
                const description = `Chat session: ${chatMode}${sessionInfo ? ` - ${sessionInfo}` : ''}`;
                return spendCredits(access.creditCost, description);
            }

            return false;
        },
        [checkAccess, spendCredits]
    );

    // Check if user can afford a chat session
    const canAffordChat = useCallback(
        (chatMode: ChatMode): boolean => {
            const access = checkAccess(chatMode);

            // Free or subscription access
            if (access.accessType === 'free' || access.accessType === 'subscription') {
                return true;
            }

            // Credit-based access
            return canAfford(access.creditCost);
        },
        [checkAccess, canAfford]
    );

    return {
        useCreditForChat,
        canAffordChat,
    };
}

/**
 * Hook for chat mode recommendations and pricing
 */
export function useChatModeRecommendations() {
    const { modesByAccess, userCredits, getCreditCost } = useChatModeAccess();
    const { isVtPlus } = useSubscriptionAccess();

    // Recommend chat modes based on user's current access
    const recommendedModes = useMemo(() => {
        const recommendations = [];

        // Always recommend free modes
        recommendations.push(
            ...modesByAccess.free.map(mode => ({
                mode,
                reason: 'Free to use',
                priority: 1,
            }))
        );

        // Recommend subscription modes if user has VT+
        if (isVtPlus) {
            recommendations.push(
                ...modesByAccess.subscription.map(mode => ({
                    mode,
                    reason: 'Included with VT+ subscription',
                    priority: 2,
                }))
            );
        }

        // Recommend affordable credit modes
        recommendations.push(
            ...modesByAccess.credits.map(mode => ({
                mode,
                reason: `${getCreditCost(mode)} credits`,
                priority: 3,
            }))
        );

        return recommendations.sort((a, b) => a.priority - b.priority);
    }, [modesByAccess, isVtPlus, userCredits]);

    // Suggest upgrade if user is using many credit-based modes
    const shouldSuggestUpgrade = useMemo(() => {
        // If user has used more than 500 credits worth of sessions this month
        // (would need to track usage history for accurate calculation)
        return !isVtPlus && userCredits < 100 && modesByAccess.blocked.length > 2;
    }, [isVtPlus, userCredits, modesByAccess.blocked]);

    return {
        recommendedModes,
        shouldSuggestUpgrade,
    };
}

export default {
    useChatModeAccess,
    useChatCreditUsage,
    useChatModeRecommendations,
};

/**
 * Credit-based Chat Mode Access Control
 *
 * Integrates Polar credits with existing chat mode system
 * Provides fallback to subscription-based access
 */

import { ChatMode } from '../config/chat-mode';
import { FeatureSlug, PlanSlug } from '../types/subscription';
import { checkSubscriptionAccess, type ClerkHasMethod } from './subscription';

// Credit costs for each chat mode (imported from existing config)
export const CHAT_MODE_CREDIT_COSTS = {
    [ChatMode.Deep]: 10,
    [ChatMode.Pro]: 5,
    [ChatMode.DEEPSEEK_R1]: 5,
    [ChatMode.CLAUDE_4_SONNET]: 5,
    [ChatMode.CLAUDE_4_OPUS]: 8,
    [ChatMode.GPT_4o]: 3,
    [ChatMode.GPT_4o_Mini]: 1,
    [ChatMode.GPT_4_1]: 5,
    [ChatMode.GPT_4_1_Mini]: 2,
    [ChatMode.GPT_4_1_Nano]: 1,
    [ChatMode.O4_Mini]: 4,
    [ChatMode.GEMINI_2_0_FLASH]: 2,
    [ChatMode.GEMINI_2_5_PRO]: 4,
} as const;

// Free chat modes (no credits required)
export const FREE_CHAT_MODES = [ChatMode.GPT_4o_Mini, ChatMode.GPT_4_1_Nano] as const;

export interface ChatModeAccess {
    canAccess: boolean;
    accessType: 'free' | 'subscription' | 'credits' | 'blocked';
    creditCost: number;
    reason?: string;
    requiredPlan?: PlanSlug;
    requiredFeature?: FeatureSlug;
}

export interface CreditAccessOptions {
    hasMethod?: ClerkHasMethod; // Clerk's has() method for subscription checks
    userCredits?: number; // User's current credit balance
    isAuthenticated?: boolean;
}

/**
 * Check if user can access a chat mode with current credits/subscription
 */
export function checkChatModeAccess(
    chatMode: ChatMode,
    options: CreditAccessOptions = {}
): ChatModeAccess {
    const { hasMethod, userCredits = 0, isAuthenticated = false } = options;

    const creditCost = CHAT_MODE_CREDIT_COSTS[chatMode] || 0;
    const isFreeMode = FREE_CHAT_MODES.includes(chatMode as any);

    // Free modes - always accessible
    if (isFreeMode) {
        return {
            canAccess: true,
            accessType: 'free',
            creditCost: 0,
        };
    }

    // Check subscription access first (if hasMethod provided)
    if (hasMethod) {
        // Check if user has subscription access to this mode
        const hasSubscriptionAccess = checkChatModeSubscriptionAccess(chatMode, hasMethod);

        if (hasSubscriptionAccess.canAccess) {
            return {
                canAccess: true,
                accessType: 'subscription',
                creditCost: 0, // No credits needed if subscription covers it
            };
        }
    }

    // Authentication required for credit-based access
    if (!isAuthenticated) {
        return {
            canAccess: false,
            accessType: 'blocked',
            creditCost,
            reason: 'Authentication required for credit-based access',
        };
    }

    // Check credit-based access
    if (userCredits >= creditCost) {
        return {
            canAccess: true,
            accessType: 'credits',
            creditCost,
        };
    }

    // Insufficient credits
    return {
        canAccess: false,
        accessType: 'blocked',
        creditCost,
        reason: `Insufficient credits. Need ${creditCost} credits, have ${userCredits}`,
    };
}

/**
 * Check subscription-based access to chat mode (existing logic)
 */
function checkChatModeSubscriptionAccess(
    chatMode: ChatMode,
    hasMethod: ClerkHasMethod
): { canAccess: boolean; requiredPlan?: PlanSlug; requiredFeature?: FeatureSlug } {
    // Map chat modes to their subscription requirements
    const subscriptionRequirements: Record<
        ChatMode,
        { plan?: PlanSlug; feature?: FeatureSlug } | null
    > = {
        [ChatMode.Deep]: { plan: PlanSlug.VT_PLUS, feature: FeatureSlug.DEEP_RESEARCH },
        [ChatMode.Pro]: { plan: PlanSlug.VT_PLUS, feature: FeatureSlug.PRO_SEARCH },
        [ChatMode.DEEPSEEK_R1]: {
            plan: PlanSlug.VT_PLUS,
            feature: FeatureSlug.ADVANCED_CHAT_MODES,
        },
        [ChatMode.CLAUDE_4_SONNET]: { plan: PlanSlug.VT_PLUS },
        [ChatMode.CLAUDE_4_OPUS]: { plan: PlanSlug.VT_PLUS },
        [ChatMode.GPT_4o]: { plan: PlanSlug.VT_PLUS },
        [ChatMode.GPT_4o_Mini]: null, // Free
        [ChatMode.GPT_4_1]: { plan: PlanSlug.VT_PLUS },
        [ChatMode.GPT_4_1_Mini]: null, // Credit-only
        [ChatMode.GPT_4_1_Nano]: null, // Free
        [ChatMode.O4_Mini]: { plan: PlanSlug.VT_PLUS },
        [ChatMode.GEMINI_2_0_FLASH]: { plan: PlanSlug.VT_PLUS },
        [ChatMode.GEMINI_2_5_PRO]: { plan: PlanSlug.VT_PLUS },
    };

    const requirement = subscriptionRequirements[chatMode];

    if (!requirement) {
        return { canAccess: false }; // No subscription access, credit-only or free
    }

    // Check if user has required subscription
    const hasAccess = checkSubscriptionAccess(hasMethod, {
        plan: requirement.plan,
        feature: requirement.feature,
    });

    return {
        canAccess: hasAccess,
        requiredPlan: requirement.plan,
        requiredFeature: requirement.feature,
    };
}

/**
 * Get all chat modes available to user with their access types
 */
export function getAvailableChatModes(options: CreditAccessOptions = {}) {
    const allModes = Object.values(ChatMode);

    return allModes.map(mode => ({
        mode,
        access: checkChatModeAccess(mode, options),
    }));
}

/**
 * Get recommended credit package based on usage patterns
 */
export function getRecommendedCreditPackage(plannedUsage: { mode: ChatMode; sessions: number }[]): {
    totalCredits: number;
    estimatedCost: number;
} {
    const totalCredits = plannedUsage.reduce((total, usage) => {
        const creditCost = CHAT_MODE_CREDIT_COSTS[usage.mode] || 0;
        return total + creditCost * usage.sessions;
    }, 0);

    // Add 20% buffer for extra usage
    const recommendedCredits = Math.ceil(totalCredits * 1.2);

    return {
        totalCredits: recommendedCredits,
        estimatedCost: totalCredits,
    };
}

/**
 * Check if a chat mode is cost-effective with subscription vs credits
 */
export function isSubscriptionWorthwhile(monthlyUsage: { mode: ChatMode; sessions: number }[]): {
    worthwhile: boolean;
    monthlyCreditCost: number;
    subscriptionValue: number;
} {
    const monthlyCreditCost = monthlyUsage.reduce((total, usage) => {
        const creditCost = CHAT_MODE_CREDIT_COSTS[usage.mode] || 0;
        return total + creditCost * usage.sessions;
    }, 0);

    // VT+ subscription includes 1000 credits/month + unlimited access to VT+ features
    const subscriptionValue = 1000; // credits equivalent

    return {
        worthwhile: monthlyCreditCost > subscriptionValue * 0.7, // 70% threshold
        monthlyCreditCost,
        subscriptionValue,
    };
}

export default {
    checkChatModeAccess,
    getAvailableChatModes,
    getRecommendedCreditPackage,
    isSubscriptionWorthwhile,
    CHAT_MODE_CREDIT_COSTS,
    FREE_CHAT_MODES,
};

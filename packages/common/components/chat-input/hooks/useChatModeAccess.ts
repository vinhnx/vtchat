'use client';

import { useSubscriptionAccess } from '@repo/common/hooks';
import { useApiKeysStore } from '@repo/common/store';
import { ChatMode, ChatModeConfig } from '@repo/shared/config';
import { FeatureSlug, PlanSlug } from '@repo/shared/types/subscription';

interface AccessResult {
    isGated: boolean;
    reason?: {
        requiredFeature?: FeatureSlug;
        requiredPlan?: PlanSlug;
        missingApiKey?: boolean;
    };
}

export const useChatModeAccess = (mode: ChatMode): AccessResult => {
    const { hasAccess, isLoaded } = useSubscriptionAccess();
    const apiKeys = useApiKeysStore((state) => state.getAllKeys());

    const config = ChatModeConfig[mode];

    // If not loaded, show as gated to prevent unauthorized access
    if (!isLoaded) {
        return { isGated: true };
    }

    // If no requirements, not gated
    if (!(config?.requiredFeature || config?.requiredPlan)) {
        return { isGated: false };
    }

    // CRITICAL: Special handling for Deep Research and Pro Search
    if (mode === ChatMode.Deep || mode === ChatMode.Pro) {
        // Check if user has VT+ subscription first
        const hasVtPlusAccess = hasAccess({ plan: PlanSlug.VT_PLUS });
        const hasFeatureAccess =
            mode === ChatMode.Deep
                ? hasAccess({ feature: FeatureSlug.DEEP_RESEARCH })
                : hasAccess({ feature: FeatureSlug.PRO_SEARCH });

        // If user has VT+ and feature access, they can use it without BYOK
        if (hasVtPlusAccess && hasFeatureAccess) {
            return { isGated: false };
        }

        // For free users, check if they have BYOK Gemini key
        const hasByokGeminiKey = !!apiKeys[API_KEY_NAMES.GEMINI_API_KEY];
        if (hasByokGeminiKey) {
            return { isGated: false }; // Free users can use BYOK
        }

        // No VT+ subscription and no BYOK key - show gated
        return {
            isGated: true,
            reason: {
                requiredFeature:
                    mode === ChatMode.Deep ? FeatureSlug.DEEP_RESEARCH : FeatureSlug.PRO_SEARCH,
                requiredPlan: PlanSlug.VT_PLUS,
                missingApiKey: !hasByokGeminiKey,
            },
        };
    }

    // For other modes, use regular logic
    let hasRequiredAccess = true;
    const reason: AccessResult['reason'] = {};

    if (config.requiredFeature) {
        hasRequiredAccess = hasAccess({
            feature: config.requiredFeature as FeatureSlug,
        });
        if (!hasRequiredAccess) {
            reason.requiredFeature = config.requiredFeature as FeatureSlug;
        }
    }

    if (config.requiredPlan && hasRequiredAccess) {
        hasRequiredAccess = hasAccess({ plan: config.requiredPlan as PlanSlug });
        if (!hasRequiredAccess) {
            reason.requiredPlan = config.requiredPlan as PlanSlug;
        }
    }

    return {
        isGated: !hasRequiredAccess,
        reason: !hasRequiredAccess ? reason : undefined,
    };
};

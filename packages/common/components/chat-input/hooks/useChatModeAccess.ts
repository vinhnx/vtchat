'use client';

import { useApiKeysStore } from '@repo/common/store';
import { useSubscriptionAccess } from '@repo/common/hooks';
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
        // Check BYOK bypass first for these specific modes
        const hasByokGeminiKey = !!apiKeys['GEMINI_API_KEY'];
        if (hasByokGeminiKey) {
            return { isGated: false }; // Not gated if user has BYOK Gemini key
        }

        // For Deep Research and Pro Search, user MUST have VT+ subscription
        const hasVtPlusAccess = hasAccess({ plan: PlanSlug.VT_PLUS });
        const hasFeatureAccess =
            mode === ChatMode.Deep
                ? hasAccess({ feature: FeatureSlug.DEEP_RESEARCH })
                : hasAccess({ feature: FeatureSlug.PRO_SEARCH });

        if (!(hasVtPlusAccess && hasFeatureAccess)) {
            return {
                isGated: true,
                reason: {
                    requiredFeature:
                        mode === ChatMode.Deep ? FeatureSlug.DEEP_RESEARCH : FeatureSlug.PRO_SEARCH,
                    requiredPlan: PlanSlug.VT_PLUS,
                },
            };
        }

        return { isGated: false };
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

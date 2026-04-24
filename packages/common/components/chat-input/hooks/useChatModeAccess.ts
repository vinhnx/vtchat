'use client';

import { useSubscriptionAccess } from '@repo/common/hooks';
import { ChatMode } from '@repo/shared/config';
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
    void mode;
    useSubscriptionAccess();

    return { isGated: false };
};

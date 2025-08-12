'use client';

import { useChatStore } from '@repo/common/store';
import { log } from '@repo/shared/logger';
import type { FeatureSlug } from '@repo/shared/types/subscription';
import { useLoginPrompt } from './useLoginPrompt';
import { useSubscriptionGate } from './useSubscriptionGate';

export interface FeatureToggleConfig {
    enabledSelector: (state: any) => boolean;
    activeKey: 'webSearch' | 'mathCalculator' | 'charts';
    requiredFeature?: FeatureSlug;
    featureName: string;
    logPrefix: string;
}

export const useFeatureToggle = (config: FeatureToggleConfig) => {
    const { enabledSelector, activeKey, requiredFeature, featureName, logPrefix } = config;

    const isEnabled = useChatStore(enabledSelector);
    const setActiveButton = useChatStore((state) => state.setActiveButton);
    const { requireLogin, showLoginPrompt, setShowLoginPrompt } = useLoginPrompt();
    const { canAccessFeature } = useSubscriptionGate();

    const hasFeatureAccess = requiredFeature ? canAccessFeature(requiredFeature) : true;

    const handleToggle = () => {
        if (requireLogin()) {
            return;
        }

        if (!hasFeatureAccess) {
            log.info(`${logPrefix} ${featureName} feature requires sign in`);
            return;
        }

        log.info({ [activeKey]: isEnabled }, `${logPrefix} ${featureName} button clicked`);
        setActiveButton(activeKey);
        log.info(`${logPrefix} ${featureName} button toggled`);
    };

    return {
        isEnabled,
        hasFeatureAccess,
        handleToggle,
        showLoginPrompt,
        setShowLoginPrompt,
    };
};

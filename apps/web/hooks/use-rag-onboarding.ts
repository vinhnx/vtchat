import { useApiKeysStore } from '@repo/common/store';
import { useEffect, useState } from 'react';
import { API_KEY_NAMES } from '@repo/shared/constants/api-keys';

export function useRagOnboarding() {
    const [showOnboarding, setShowOnboarding] = useState(false);

    const { getAllKeys } = useApiKeysStore();
    const apiKeys = getAllKeys();
    const hasApiKeys = Object.keys(apiKeys).some(
        (key) => key === API_KEY_NAMES.GOOGLE || key === API_KEY_NAMES.OPENAI
    );

    useEffect(() => {
        // Show onboarding if no API keys available
        if (!hasApiKeys) {
            setShowOnboarding(true);
        }
    }, [hasApiKeys]);

    const completeOnboarding = () => {
        setShowOnboarding(false);
    };

    const skipOnboarding = () => {
        setShowOnboarding(false);
    };

    return {
        showOnboarding,
        hasApiKeys,
        completeOnboarding,
        skipOnboarding,
    };
}

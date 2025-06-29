import { useApiKeysStore } from '@repo/common/store';
import { useState, useEffect } from 'react';

export function useRagOnboarding() {
    const [showOnboarding, setShowOnboarding] = useState(false);
    
    const { getAllKeys } = useApiKeysStore();
    const apiKeys = getAllKeys();
    const hasApiKeys = Object.keys(apiKeys).some(key => 
        key === 'GEMINI_API_KEY' || key === 'OPENAI_API_KEY'
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

import { useApiKeysStore } from "@repo/common/store";
import { API_KEY_NAMES } from "@repo/shared/constants/api-keys";
import { useState } from "react";

export function useRagOnboarding() {
    const [isOnboardingDismissed, setIsOnboardingDismissed] = useState(false);

    const { getAllKeys } = useApiKeysStore();
    const apiKeys = getAllKeys();

    // Calculate derived state during render - no effect needed
    const hasApiKeys = Object.keys(apiKeys).some(
        (key) => key === API_KEY_NAMES.GOOGLE || key === API_KEY_NAMES.OPENAI,
    );

    // Derive showOnboarding directly from hasApiKeys and dismissal state
    const showOnboarding = !hasApiKeys && !isOnboardingDismissed;

    const completeOnboarding = () => {
        setIsOnboardingDismissed(true);
    };

    const skipOnboarding = () => {
        setIsOnboardingDismissed(true);
    };

    return {
        showOnboarding,
        hasApiKeys,
        completeOnboarding,
        skipOnboarding,
    };
}

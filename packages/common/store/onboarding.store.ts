import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type OnboardingState = {
    hasCompletedFirstLaunch: boolean;
    hasSetupApiKeys: boolean;
    lastVisitedVersion?: string;
    setFirstLaunchCompleted: () => void;
    setApiKeysSetupCompleted: () => void;
    shouldShowApiKeysOnboarding: () => boolean;
    resetOnboarding: () => void;
};

export const useOnboardingStore = create<OnboardingState>()(
    persist(
        (set, get) => ({
            hasCompletedFirstLaunch: false,
            hasSetupApiKeys: false,
            lastVisitedVersion: undefined,

            setFirstLaunchCompleted: () => {
                set({ hasCompletedFirstLaunch: true });
            },

            setApiKeysSetupCompleted: () => {
                set({ hasSetupApiKeys: true });
            },

            shouldShowApiKeysOnboarding: () => {
                const state = get();
                return !state.hasCompletedFirstLaunch || !state.hasSetupApiKeys;
            },

            resetOnboarding: () => {
                set({
                    hasCompletedFirstLaunch: false,
                    hasSetupApiKeys: false,
                    lastVisitedVersion: undefined,
                });
            },
        }),
        {
            name: 'vtchat-onboarding',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

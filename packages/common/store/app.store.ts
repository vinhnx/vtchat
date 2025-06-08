'use client';
import { getSidebarPreference, setSidebarPreference } from '@repo/common/utils/cookies';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { useSettingsStore } from './settings.store';

export const SETTING_TABS = {
    API_KEYS: 'api-keys',
    MCP_TOOLS: 'mcp-tools',
    CREDITS: 'credits',
    PERSONALIZATION: 'personalization',
} as const;

type SideDrawerProps = {
    open: boolean;
    badge?: number;
    title: string | (() => React.ReactNode);
    renderContent: () => React.ReactNode;
};

type State = {
    isSidebarOpen: boolean;
    sidebarAnimationDisabled: boolean;
    isSourcesOpen: boolean;
    isSettingsOpen: boolean;
    showSignInModal: boolean;
    settingTab: (typeof SETTING_TABS)[keyof typeof SETTING_TABS];
    sideDrawer: SideDrawerProps;
    openSideDrawer: (props: SideDrawerProps) => void;
    dismissSideDrawer: () => void;
};

type Actions = {
    setIsSidebarOpen: (prev: (prev: boolean) => boolean) => void;
    setSidebarAnimationDisabled: (disabled: boolean) => void;
    setIsSourcesOpen: (prev: (prev: boolean) => boolean) => void;
    setIsSettingsOpen: (open: boolean) => void;
    setSettingTab: (tab: (typeof SETTING_TABS)[keyof typeof SETTING_TABS]) => void;
    setShowSignInModal: (show: boolean) => void;
    openSideDrawer: (props: Omit<SideDrawerProps, 'open'>) => void;
    updateSideDrawer: (props: Partial<SideDrawerProps>) => void;
    dismissSideDrawer: () => void;
};

// Initialize sidebar state from settings store instead of cookies
const initializeSidebarState = () => {
    if (typeof window === 'undefined') return { isOpen: false, animationDisabled: false };

    // Check if sidebar should auto-close on app launch
    const settingsStore = useSettingsStore.getState();
    const shouldAutoClose = settingsStore.getSidebarAutoClose();

    if (shouldAutoClose) {
        // Auto-close sidebar with no animation on app launch
        return { isOpen: false, animationDisabled: true };
    }

    // Otherwise, load from cookies as fallback
    const preference = getSidebarPreference();
    if (preference) {
        return {
            isOpen: preference.isOpen,
            animationDisabled: preference.disableAnimation,
        };
    }

    // Default to closed sidebar with no animation disabled
    return { isOpen: false, animationDisabled: false };
};

export const useAppStore = create(
    immer<State & Actions>((set, get) => {
        const { isOpen: initialSidebarOpen, animationDisabled } = initializeSidebarState();

        return {
            isSidebarOpen: initialSidebarOpen,
            sidebarAnimationDisabled: animationDisabled,
            isSourcesOpen: false,
            isSettingsOpen: false,
            settingTab: 'api-keys',
            showSignInModal: false,
            setIsSidebarOpen: (prev: (prev: boolean) => boolean) => {
                const newState = prev(get().isSidebarOpen);
                set({ isSidebarOpen: newState });

                // Save preference to both cookie and settings
                setSidebarPreference({
                    isOpen: newState,
                    disableAnimation: get().sidebarAnimationDisabled,
                });
            },
            setSidebarAnimationDisabled: (disabled: boolean) => {
                set({ sidebarAnimationDisabled: disabled });

                // Save preference to both cookie and settings
                setSidebarPreference({
                    isOpen: get().isSidebarOpen,
                    disableAnimation: disabled,
                });
            },
            setIsSourcesOpen: (prev: (prev: boolean) => boolean) =>
                set({ isSourcesOpen: prev(get().isSourcesOpen) }),
            setIsSettingsOpen: (open: boolean) => set({ isSettingsOpen: open }),
            setSettingTab: (tab: (typeof SETTING_TABS)[keyof typeof SETTING_TABS]) =>
                set({ settingTab: tab }),
            setShowSignInModal: (show: boolean) => set({ showSignInModal: show }),
            sideDrawer: { open: false, title: '', renderContent: () => null, badge: undefined },
            openSideDrawer: (props: Omit<SideDrawerProps, 'open'>) => {
                set({ sideDrawer: { ...props, open: true } });
            },
            updateSideDrawer: (props: Partial<SideDrawerProps>) =>
                set(state => ({
                    sideDrawer: { ...state.sideDrawer, ...props },
                })),
            dismissSideDrawer: () =>
                set({
                    sideDrawer: {
                        open: false,
                        title: '',
                        renderContent: () => null,
                        badge: undefined,
                    },
                }),
        };
    })
);

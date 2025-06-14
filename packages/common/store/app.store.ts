'use client';
import { STORAGE_KEYS } from '@repo/shared/config';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export const SETTING_TABS = {
    API_KEYS: 'api-keys',
    MCP_TOOLS: 'mcp-tools',
    PERSONALIZATION: 'personalization',
    TERMS: 'terms',
    PRIVACY: 'privacy',
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
    // User preferences
    showExamplePrompts: boolean;
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
    // User preference actions
    setShowExamplePrompts: (show: boolean) => void;
};

// Initialize sidebar state with auto-hide behavior as default
const initializeSidebarState = () => {
    // Always start with sidebar closed (auto-hide behavior)
    return { isOpen: false, animationDisabled: false };
};

// Initialize user preferences - defer localStorage access to client-side hydration
const initializePreferences = () => {
    return { showExamplePrompts: true };
};

export const useAppStore = create(
    immer<State & Actions>((set, get) => {
        const { isOpen: initialSidebarOpen, animationDisabled } = initializeSidebarState();
        const { showExamplePrompts } = initializePreferences();

        return {
            isSidebarOpen: initialSidebarOpen,
            sidebarAnimationDisabled: animationDisabled,
            isSourcesOpen: false,
            isSettingsOpen: false,
            settingTab: 'api-keys',
            showSignInModal: false,
            showExamplePrompts,
            setIsSidebarOpen: (prev: (prev: boolean) => boolean) => {
                const newState = prev(get().isSidebarOpen);
                set({ isSidebarOpen: newState });
            },
            setSidebarAnimationDisabled: (disabled: boolean) => {
                set({ sidebarAnimationDisabled: disabled });
            },
            setIsSourcesOpen: (prev: (prev: boolean) => boolean) =>
                set({ isSourcesOpen: prev(get().isSourcesOpen) }),
            setIsSettingsOpen: (open: boolean) => set({ isSettingsOpen: open }),
            setSettingTab: (tab: (typeof SETTING_TABS)[keyof typeof SETTING_TABS]) =>
                set({ settingTab: tab }),
            setShowSignInModal: (show: boolean) => set({ showSignInModal: show }),
            setShowExamplePrompts: (show: boolean) => {
                set({ showExamplePrompts: show });
                if (typeof window !== 'undefined') {
                    localStorage.setItem(
                        STORAGE_KEYS.USER_PREFERENCES,
                        JSON.stringify({ showExamplePrompts: show })
                    );
                }
            },
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

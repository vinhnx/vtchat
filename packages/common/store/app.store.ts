'use client';

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';

export const SETTING_TABS = {
    API_KEYS: 'api-keys',
    MCP_TOOLS: 'mcp-tools',
    PERSONALIZATION: 'personalization',
    PROFILE: 'profile',
    USAGE_CREDITS: 'usage-credits',
    PLUS: 'plus',
    REASONING_MODE: 'reasoning-mode',
    ACTIVE_SESSIONS: 'active-sessions',
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
    // Unified settings
    showExamplePrompts: boolean;
    customInstructions: string;
    useWebSearch: boolean;
    useMathCalculator: boolean;
    useCharts: boolean;
    showSuggestions: boolean;
    thinkingMode: {
        enabled: boolean;
        budget: number;
        includeThoughts: boolean;
    };
    geminiCaching: {
        enabled: boolean;
        ttlSeconds: number;
        maxCaches: number;
    };
    // Customer portal state
    portalState: {
        isOpen: boolean;
        url: string | null;
    };
};

type Actions = {
    // UI state actions
    setIsSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
    setSidebarAnimationDisabled: (disabled: boolean) => void;
    setIsSourcesOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
    setIsSettingsOpen: (open: boolean) => void;
    setSettingTab: (tab: (typeof SETTING_TABS)[keyof typeof SETTING_TABS]) => void;
    setShowSignInModal: (show: boolean) => void;
    // Side drawer actions
    openSideDrawer: (props: SideDrawerProps) => void;
    updateSideDrawer: (props: Partial<SideDrawerProps>) => void;
    dismissSideDrawer: () => void;
    // Settings actions
    setShowExamplePrompts: (show: boolean) => void;
    setCustomInstructions: (instructions: string) => void;
    setUseWebSearch: (use: boolean) => void;
    setUseMathCalculator: (use: boolean) => void;
    setUseCharts: (use: boolean) => void;
    setShowSuggestions: (show: boolean) => void;
    setThinkingMode: (mode: Partial<State['thinkingMode']>) => void;
    setGeminiCaching: (caching: Partial<State['geminiCaching']>) => void;
    // Reset actions
    resetUserState: () => void;
    // Customer portal actions
    setPortalState: (state: { isOpen: boolean; url: string | null }) => void;
    openPortal: (url: string) => void;
    closePortal: () => void;
};

// Helper to initialize sidebar state
function initializeSidebarState() {
    if (typeof window === 'undefined') {
        return { isOpen: true, animationDisabled: false };
    }

    try {
        const stored = localStorage.getItem('sidebar-state');
        if (stored) {
            const parsed = JSON.parse(stored);
            return {
                isOpen: parsed.isOpen ?? true,
                animationDisabled: parsed.animationDisabled ?? false,
            };
        }
    } catch {
        // Invalid data, use defaults
    }

    return { isOpen: true, animationDisabled: false };
}

export const useAppStore = create<State & Actions>()(
    persist(
        immer((set, get) => {
            const { isOpen: initialSidebarOpen, animationDisabled } = initializeSidebarState();

            return {
                // Initial state
                isSidebarOpen: initialSidebarOpen,
                sidebarAnimationDisabled: animationDisabled,
                isSourcesOpen: false,
                isSettingsOpen: false,
                settingTab: SETTING_TABS.PROFILE,
                showSignInModal: false,
                // Default settings
                showExamplePrompts: true,
                customInstructions: '',
                useWebSearch: false,
                useMathCalculator: false,
                useCharts: false,
                showSuggestions: false,
                thinkingMode: {
                    enabled: false,
                    budget: 8192,
                    includeThoughts: true,
                },
                geminiCaching: {
                    enabled: false,
                    ttlSeconds: 3600,
                    maxCaches: 10,
                },
                sideDrawer: {
                    open: false,
                    badge: undefined,
                    title: '',
                    renderContent: () => null,
                },
                portalState: {
                    isOpen: false,
                    url: null,
                },

                // Actions
                setIsSidebarOpen: open => {
                    const newState = typeof open === 'function' ? open(get().isSidebarOpen) : open;
                    set({ isSidebarOpen: newState });

                    // Save to localStorage
                    try {
                        localStorage.setItem(
                            'sidebar-state',
                            JSON.stringify({
                                isOpen: newState,
                                animationDisabled: get().sidebarAnimationDisabled,
                            })
                        );
                    } catch (error) {
                        console.warn('Failed to save sidebar state:', error);
                    }
                },

                setSidebarAnimationDisabled: disabled => {
                    set({ sidebarAnimationDisabled: disabled });

                    // Save to localStorage
                    try {
                        localStorage.setItem(
                            'sidebar-state',
                            JSON.stringify({
                                isOpen: get().isSidebarOpen,
                                animationDisabled: disabled,
                            })
                        );
                    } catch (error) {
                        console.warn('Failed to save sidebar state:', error);
                    }
                },

                setIsSourcesOpen: open => {
                    const newState = typeof open === 'function' ? open(get().isSourcesOpen) : open;
                    set({ isSourcesOpen: newState });
                },

                setIsSettingsOpen: open => set({ isSettingsOpen: open }),

                setSettingTab: tab => set({ settingTab: tab }),

                setShowSignInModal: show => set({ showSignInModal: show }),

                openSideDrawer: props => {
                    set({
                        sideDrawer: {
                            open: true,
                            badge: props.badge,
                            title: props.title,
                            renderContent: props.renderContent,
                        },
                    });
                },

                updateSideDrawer: props => {
                    set(state => {
                        Object.assign(state.sideDrawer, props);
                    });
                },

                dismissSideDrawer: () => {
                    set({
                        sideDrawer: {
                            open: false,
                            badge: undefined,
                            title: '',
                            renderContent: () => null,
                        },
                    });
                },

                setShowExamplePrompts: show => {
                    set({ showExamplePrompts: show });
                },

                setCustomInstructions: (instructions: string) => {
                    set({ customInstructions: instructions });
                },

                setUseWebSearch: (use: boolean) => {
                    set({ useWebSearch: use });
                },

                setUseMathCalculator: (use: boolean) => {
                    set({ useMathCalculator: use });
                },

                setUseCharts: (use: boolean) => {
                    set({ useCharts: use });
                },

                setShowSuggestions: (show: boolean) => {
                    set({ showSuggestions: show });
                },

                setThinkingMode: (mode: Partial<State['thinkingMode']>) => {
                    set(state => {
                        state.thinkingMode = { ...state.thinkingMode, ...mode };
                    });
                },

                setGeminiCaching: (caching: Partial<State['geminiCaching']>) => {
                    set(state => {
                        state.geminiCaching = { ...state.geminiCaching, ...caching };
                    });
                },

                resetUserState: () => {
                    set(state => {
                        // Reset all user preferences to defaults
                        state.showExamplePrompts = true;
                        state.customInstructions = '';
                        state.useWebSearch = false;
                        state.useMathCalculator = false;
                        state.useCharts = false;
                        state.showSuggestions = false;
                        state.thinkingMode = {
                            enabled: false,
                            budget: 8192,
                            includeThoughts: true,
                        };
                        state.geminiCaching = {
                            enabled: false,
                            ttlSeconds: 3600,
                            maxCaches: 10,
                        };
                        // Reset UI state to defaults
                        state.isSettingsOpen = false;
                        state.settingTab = SETTING_TABS.PROFILE;
                        state.showSignInModal = false;
                        state.sideDrawer = {
                            open: false,
                            badge: undefined,
                            title: '',
                            renderContent: () => null,
                        };
                        state.portalState = {
                            isOpen: false,
                            url: null,
                        };
                    });
                },

                setPortalState: state => {
                    set({ portalState: state });
                },

                openPortal: url => {
                    set({
                        portalState: {
                            isOpen: true,
                            url,
                        },
                    });
                },

                closePortal: () => {
                    set({
                        portalState: {
                            isOpen: false,
                            url: null,
                        },
                    });
                },
            };
        }),
        {
            name: 'vtchat-settings',
            partialize: state => ({
                showExamplePrompts: state.showExamplePrompts,
                customInstructions: state.customInstructions,
                useWebSearch: state.useWebSearch,
                useMathCalculator: state.useMathCalculator,
                useCharts: state.useCharts,
                showSuggestions: state.showSuggestions,
                thinkingMode: state.thinkingMode,
                geminiCaching: state.geminiCaching,
            }),
        }
    )
);

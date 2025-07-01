'use client';

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { PlanSlug } from '@repo/shared/types/subscription';
import {
    getDefaultSettingsForPlan,
    mergeWithPlusDefaults,
    PlusDefaultSettings,
} from '@repo/shared/utils/plus-defaults';
import { DEFAULT_EMBEDDING_MODEL, type EmbeddingModel } from '@repo/shared/config/embedding-models';
import { ModelEnum } from '@repo/ai/models';
import { log } from '@repo/shared/logger';

export const SETTING_TABS = {
    API_KEYS: 'api-keys',
    MCP_TOOLS: 'mcp-tools',
    PERSONALIZATION: 'personalization',
    PROFILE: 'profile',
    USAGE: 'usage',
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
    sidebarPlacement: 'left' | 'right';
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
        claude4InterleavedThinking: boolean;
    };
    geminiCaching: {
        enabled: boolean;
        ttlSeconds: number;
        maxCaches: number;
    };
    embeddingModel: EmbeddingModel;
    ragChatModel: ModelEnum;
    // Profile settings for Personal AI Assistant
    profile: {
    name: string;
    workDescription: string;
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
    setSidebarPlacement: (placement: 'left' | 'right') => void;
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
    setEmbeddingModel: (model: EmbeddingModel) => void;
    setRagChatModel: (model: ModelEnum) => void;
    // Profile settings actions
     setProfile: (profile: Partial<State['profile']>) => void;
     // Plus user settings actions
    applyPlusDefaults: (plan: PlanSlug, preserveUserChanges?: boolean) => void;
    initializeSettingsForPlan: (plan: PlanSlug) => void;
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

            // Initialize with base plan defaults
            const baseDefaults = getDefaultSettingsForPlan(PlanSlug.VT_BASE);

            return {
                // Initial state
                isSidebarOpen: initialSidebarOpen,
                sidebarAnimationDisabled: animationDisabled,
                sidebarPlacement: 'right',
                isSourcesOpen: false,
                isSettingsOpen: false,
                settingTab: SETTING_TABS.USAGE_CREDITS,
                showSignInModal: false,
                // Default settings - using base plan defaults initially
                showExamplePrompts: false,
                customInstructions: '',
                useWebSearch: false,
                useMathCalculator: false,
                useCharts: false,
                showSuggestions: false,
                thinkingMode: baseDefaults.thinkingMode,
                geminiCaching: baseDefaults.geminiCaching,
                embeddingModel: DEFAULT_EMBEDDING_MODEL,
                ragChatModel: ModelEnum.GEMINI_2_5_FLASH,
                profile: {
                     name: '',
                     workDescription: '',
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
                        log.warn('Failed to save sidebar state:', { data: error });
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
                        log.warn('Failed to save sidebar state:', { data: error });
                    }
                },

                setSidebarPlacement: placement => {
                    set({ sidebarPlacement: placement });
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

                setEmbeddingModel: (model: EmbeddingModel) => {
                    set({ embeddingModel: model });
                },

                setRagChatModel: (model: ModelEnum) => {
                set({ ragChatModel: model });
                },

                setProfile: (profile: Partial<State['profile']>) => {
                     set(state => {
                         state.profile = { ...state.profile, ...profile };
                     });
                 },

                 applyPlusDefaults: (plan: PlanSlug, preserveUserChanges = true) => {
                    set(state => {
                        const currentSettings: PlusDefaultSettings = {
                            thinkingMode: state.thinkingMode,
                            geminiCaching: state.geminiCaching,
                        };

                        const mergedSettings = mergeWithPlusDefaults(
                            currentSettings,
                            plan,
                            preserveUserChanges
                        );

                        state.thinkingMode = mergedSettings.thinkingMode;
                        state.geminiCaching = mergedSettings.geminiCaching;
                    });
                },

                initializeSettingsForPlan: (plan: PlanSlug) => {
                    const defaults = getDefaultSettingsForPlan(plan);
                    set(state => {
                        // Only apply defaults if current settings are still at base defaults
                        const isUsingBaseDefaults =
                            !state.thinkingMode.enabled && !state.geminiCaching.enabled;

                        if (isUsingBaseDefaults || plan === PlanSlug.VT_PLUS) {
                            state.thinkingMode = defaults.thinkingMode;
                            state.geminiCaching = defaults.geminiCaching;
                        }
                    });
                },

                resetUserState: () => {
                    set(state => {
                        // Reset all user preferences to base plan defaults
                        const baseDefaults = getDefaultSettingsForPlan(PlanSlug.VT_BASE);

                        state.showExamplePrompts = false;
                        state.customInstructions = '';
                        state.useWebSearch = false;
                        state.useMathCalculator = false;
                        state.useCharts = false;
                        state.showSuggestions = false;
                        state.thinkingMode = baseDefaults.thinkingMode;
                        state.geminiCaching = baseDefaults.geminiCaching;
                        state.embeddingModel = DEFAULT_EMBEDDING_MODEL;
                        state.ragChatModel = ModelEnum.GEMINI_2_5_FLASH;
                        // Reset UI state to defaults
                        state.isSettingsOpen = false;
                        state.settingTab = SETTING_TABS.USAGE_CREDITS;
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
                sidebarPlacement: state.sidebarPlacement,
                showExamplePrompts: state.showExamplePrompts,
                customInstructions: state.customInstructions,
                useWebSearch: state.useWebSearch,
                useMathCalculator: state.useMathCalculator,
                useCharts: state.useCharts,
                showSuggestions: state.showSuggestions,
                thinkingMode: state.thinkingMode,
                geminiCaching: state.geminiCaching,
                embeddingModel: state.embeddingModel,
                ragChatModel: state.ragChatModel,
                 profile: state.profile,
            }),
        }
    )
);

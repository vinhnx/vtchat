import { ChatMode } from '@repo/shared/config';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { safeJsonParse } from '../utils/storage-cleanup';

export type ApiKeys = {
    OPENAI_API_KEY?: string;
    ANTHROPIC_API_KEY?: string;
    GEMINI_API_KEY?: string;
    JINA_API_KEY?: string;
    FIREWORKS_API_KEY?: string;
    XAI_API_KEY?: string;

    OPENROUTER_API_KEY?: string;
    TOGETHER_API_KEY?: string;
};

// User-specific storage key management for per-account API key isolation
let currentStorageKey = 'api-keys-storage-anonymous';
let currentUserId: string | null = null;

/**
 * Get user-specific storage key for API keys isolation
 */
function getStorageKey(userId: string | null): string {
    return userId ? `api-keys-storage-${userId}` : 'api-keys-storage-anonymous';
}

type ApiKeysState = {
    keys: ApiKeys;
    setKey: (provider: keyof ApiKeys, key: string) => void;
    removeKey: (provider: keyof ApiKeys) => void;
    clearAllKeys: () => void;
    getAllKeys: () => ApiKeys;
    hasApiKeyForChatMode: (chatMode: ChatMode, isSignedIn: boolean) => boolean;
    switchUserStorage: (userId: string | null) => void;
};

export const useApiKeysStore = create<ApiKeysState>()(
    persist(
        (set, get) => ({
            keys: {},
            setKey: (provider, key) => {
                set(state => ({
                    keys: { ...state.keys, [provider]: key },
                }));

                // Immediate synchronous persistence to prevent data loss
                try {
                    const currentState = get();
                    const persistData = {
                        state: { keys: { ...currentState.keys, [provider]: key } },
                        version: 0,
                    };
                    localStorage.setItem(currentStorageKey, JSON.stringify(persistData));
                    console.log(
                        `[ApiKeys] Immediately persisted API key for ${provider} to ${currentStorageKey}`
                    );

                    // Also trigger the zustand persist mechanism
                    // Force a state change to trigger persist middleware
                    setTimeout(() => {
                        const latestState = get();
                        set({ keys: latestState.keys });
                    }, 0);
                } catch (error) {
                    console.error('[ApiKeys] Failed to persist API key:', error);
                    // Don't throw error to prevent store initialization failure
                }
            },
            removeKey: provider => {
                set(state => {
                    const newKeys = { ...state.keys };
                    delete newKeys[provider];
                    return { keys: newKeys };
                });
            },
            clearAllKeys: () => {
                set({ keys: {} });
            },
            getAllKeys: () => get().keys,
            switchUserStorage: (userId: string | null) => {
                const newUserId = userId || null;

                // Only switch if user changed
                if (currentUserId !== newUserId) {
                    console.log(
                        `[ApiKeys] Switching storage from user ${currentUserId || 'anonymous'} to ${newUserId || 'anonymous'}`
                    );

                    // Store current state before switching
                    const currentState = get();
                    const currentPersistData = {
                        state: { keys: currentState.keys },
                        version: 0,
                    };

                    // Save current state to current storage key
                    try {
                        localStorage.setItem(currentStorageKey, JSON.stringify(currentPersistData));
                        console.log(`[ApiKeys] Saved current state to ${currentStorageKey}`);
                    } catch (error) {
                        console.error('[ApiKeys] Failed to save current state:', error);
                    }

                    // Update user context
                    currentUserId = newUserId;
                    currentStorageKey = getStorageKey(newUserId);

                    // Load API keys for the new user from localStorage with safe JSON parsing
                    const storedData = localStorage.getItem(currentStorageKey);
                    const userData = safeJsonParse(storedData, { state: { keys: {} } });

                    // Update state with new user's data
                    set({ keys: userData.state?.keys || {} });

                    console.log(
                        `[ApiKeys] Loaded ${Object.keys(userData.state?.keys || {}).length} API keys for user: ${newUserId || 'anonymous'}`
                    );

                    // Force persistence with new storage key - but don't fail if it doesn't work
                    try {
                        const newPersistData = {
                            state: { keys: userData.state?.keys || {} },
                            version: 0,
                        };
                        localStorage.setItem(currentStorageKey, JSON.stringify(newPersistData));
                        console.log(
                            `[ApiKeys] Initialized storage for new user: ${currentStorageKey}`
                        );
                    } catch (error) {
                        console.warn(
                            '[ApiKeys] Failed to initialize storage after user switch:',
                            error
                        );
                    }
                }
            },
            hasApiKeyForChatMode: (chatMode: ChatMode, isSignedIn: boolean) => {
                if (!isSignedIn) return false;
                const apiKeys = get().keys;
                switch (chatMode) {
                    case ChatMode.O3:
                    case ChatMode.O3_Mini:
                    case ChatMode.O4_Mini:
                    case ChatMode.GPT_4o_Mini:
                    case ChatMode.GPT_4o:
                    case ChatMode.GPT_4_1_Mini:
                    case ChatMode.GPT_4_1_Nano:
                    case ChatMode.GPT_4_1:
                        return !!apiKeys['OPENAI_API_KEY'];
                    case ChatMode.Deep:
                        // Deep Research mode requires Gemini API key (uses Gemini 2.5 Pro)
                        return !!apiKeys['GEMINI_API_KEY'];
                    case ChatMode.Pro:
                    case ChatMode.GEMINI_2_0_FLASH:
                    case ChatMode.GEMINI_2_5_PRO:
                    case ChatMode.GEMINI_2_0_FLASH_LITE:
                    case ChatMode.GEMINI_2_5_FLASH:
                        return !!apiKeys['GEMINI_API_KEY'];
                    case ChatMode.CLAUDE_4_SONNET:
                    case ChatMode.CLAUDE_4_OPUS:
                        return !!apiKeys['ANTHROPIC_API_KEY'];
                    case ChatMode.DEEPSEEK_R1:
                        return !!apiKeys['FIREWORKS_API_KEY'];
                    case ChatMode.GROK_3:
                    case ChatMode.GROK_3_MINI:
                        return !!apiKeys['XAI_API_KEY'];
                    // OpenRouter models
                    case ChatMode.DEEPSEEK_V3_0324_FREE:
                    case ChatMode.DEEPSEEK_V3_0324:
                    case ChatMode.DEEPSEEK_R1_FREE:
                    case ChatMode.DEEPSEEK_R1_0528_FREE:
                    case ChatMode.QWEN3_235B_A22B:
                    case ChatMode.QWEN3_32B:
                    case ChatMode.MISTRAL_NEMO:
                    case ChatMode.QWEN3_14B_FREE:
                        return !!apiKeys['OPENROUTER_API_KEY'];
                    default:
                        return false;
                }
            },
        }),
        {
            name: 'api-keys-storage',
            version: 1,
            // Use createJSONStorage with a custom storage that respects user switching
            storage: createJSONStorage(() => ({
                getItem: (name: string) => {
                    // SSR protection
                    if (typeof window === 'undefined') {
                        return null;
                    }

                    try {
                        const key = currentStorageKey || name;
                        const value = localStorage.getItem(key);
                        console.log(
                            `[ApiKeys] Storage getItem: ${key} -> ${value ? 'found' : 'not found'}`
                        );
                        return value;
                    } catch (error) {
                        console.error('[ApiKeys] Storage getItem error:', error);
                        return null;
                    }
                },
                setItem: (name: string, value: string) => {
                    // SSR protection
                    if (typeof window === 'undefined') {
                        return;
                    }

                    try {
                        const key = currentStorageKey || name;
                        localStorage.setItem(key, value);
                        console.log(`[ApiKeys] Storage setItem: ${key} -> saved`);

                        // Simplified verification - only log warning instead of throwing
                        setTimeout(() => {
                            try {
                                const verification = localStorage.getItem(key);
                                if (verification !== value) {
                                    console.warn(
                                        `[ApiKeys] Storage verification mismatch for ${key}, but continuing`
                                    );
                                }
                            } catch (verifyError) {
                                console.warn(
                                    `[ApiKeys] Storage verification failed for ${key}:`,
                                    verifyError
                                );
                            }
                        }, 0);
                    } catch (error) {
                        console.error('[ApiKeys] Storage setItem error:', error);
                        // Don't throw error to prevent store initialization failure
                    }
                },
                removeItem: (name: string) => {
                    // SSR protection
                    if (typeof window === 'undefined') {
                        return;
                    }

                    try {
                        const key = currentStorageKey || name;
                        localStorage.removeItem(key);
                        console.log(`[ApiKeys] Storage removeItem: ${key}`);
                    } catch (error) {
                        console.error('[ApiKeys] Storage removeItem error:', error);
                    }
                },
            })),
            // Add migration and hydration logic
            migrate: (persistedState: any, version: number) => {
                console.log(`[ApiKeys] Migrating from version ${version}`);
                // Ensure the state has the correct structure
                if (persistedState && typeof persistedState === 'object') {
                    return {
                        keys: persistedState.keys || {},
                    };
                }
                return { keys: {} };
            },
            // Add state hydration
            onRehydrateStorage: () => {
                return (state, error) => {
                    if (error) {
                        console.error('[ApiKeys] Hydration error:', error);
                        // Reset to default state on hydration error
                        return { keys: {} };
                    }
                    console.log(
                        '[ApiKeys] Hydration successful:',
                        state?.keys ? Object.keys(state.keys) : 'no keys'
                    );
                };
            },
        }
    )
);

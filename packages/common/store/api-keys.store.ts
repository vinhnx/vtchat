import { ChatMode } from '@repo/shared/config';
import { log } from '@repo/shared/logger';
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

/**
 * Get effective storage key for the current context
 * Handles the case where Zustand passes the default name during hydration
 */
function getEffectiveStorageKey(requestedName: string): string {
    // During initial hydration, Zustand passes the persist name
    if (requestedName === 'api-keys-storage') {
        return currentStorageKey;
    }
    return requestedName;
}

/**
 * Try to find API keys in any available storage location
 * Used during hydration to recover data from previous storage keys
 */
function findStoredApiKeys(): string | null {
    if (typeof window === 'undefined') return null;

    // Try current storage key first
    let stored = localStorage.getItem(currentStorageKey);
    if (stored) {
        return stored;
    }

    // Try anonymous key if not current
    if (currentStorageKey !== 'api-keys-storage-anonymous') {
        stored = localStorage.getItem('api-keys-storage-anonymous');
        if (stored) {
            return stored;
        }
    }

    // Try original Zustand key (fallback for older data)
    stored = localStorage.getItem('api-keys-storage');
    if (stored) {
        return stored;
    }

    return null;
}

type ApiKeysState = {
    keys: ApiKeys;
    setKey: (provider: keyof ApiKeys, key: string) => void;
    removeKey: (provider: keyof ApiKeys) => void;
    clearAllKeys: () => void;
    getAllKeys: () => ApiKeys;
    hasApiKeyForChatMode: (chatMode: ChatMode, isSignedIn: boolean) => boolean;
    switchUserStorage: (userId: string | null) => void;
    forceRehydrate: () => void;
};

export const useApiKeysStore = create<ApiKeysState>()(
    persist(
        (set, get) => ({
            keys: {},
            setKey: (provider, key) => {
                set((state) => ({
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

                    // Also trigger the zustand persist mechanism
                    // Force a state change to trigger persist middleware
                    setTimeout(() => {
                        const latestState = get();
                        set({ keys: latestState.keys });
                    }, 0);
                } catch (error) {
                    log.error({ error, provider }, '[ApiKeys] Failed to persist API key');
                    // Don't throw error to prevent store initialization failure
                }
            },
            removeKey: (provider) => {
                set((state) => {
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
                    // Store current state before switching
                    const currentState = get();
                    const currentPersistData = {
                        state: { keys: currentState.keys },
                        version: 0,
                    };

                    // Save current state to current storage key
                    try {
                        localStorage.setItem(currentStorageKey, JSON.stringify(currentPersistData));
                    } catch (error) {
                        log.error(
                            { error, storageKey: currentStorageKey },
                            '[ApiKeys] Failed to save current state'
                        );
                    }

                    // Update user context
                    currentUserId = newUserId;
                    currentStorageKey = getStorageKey(newUserId);

                    // Load API keys for the new user - try multiple storage locations
                    let storedData = localStorage.getItem(currentStorageKey);

                    // If no data found in user-specific storage, try fallback locations
                    if (!storedData && newUserId) {
                        // Try anonymous storage first
                        storedData = localStorage.getItem('api-keys-storage-anonymous');
                        if (storedData) {
                            // Copy the data to the new user-specific storage
                            localStorage.setItem(currentStorageKey, storedData);
                        }
                    }

                    const userData = safeJsonParse(storedData, { state: { keys: {} } });

                    // Update state with new user's data
                    set({ keys: userData.state?.keys || {} });

                    // Force persistence with new storage key - but don't fail if it doesn't work
                    try {
                        const newPersistData = {
                            state: { keys: userData.state?.keys || {} },
                            version: 0,
                        };
                        localStorage.setItem(currentStorageKey, JSON.stringify(newPersistData));
                    } catch (error) {
                        log.warn(
                            { error, storageKey: currentStorageKey },
                            '[ApiKeys] Failed to initialize storage after user switch'
                        );
                    }
                }
            },
            forceRehydrate: () => {
                // Force re-read from current storage location
                const storedData = localStorage.getItem(currentStorageKey);
                const userData = safeJsonParse(storedData, { state: { keys: {} } });
                set({ keys: userData.state?.keys || {} });
            },
            hasApiKeyForChatMode: (chatMode: ChatMode, isSignedIn: boolean) => {
                if (!isSignedIn) return false;
                const apiKeys = get().keys;

                // Helper function to check if API key exists and is not empty
                const isValidKey = (key: string | undefined): boolean => {
                    return !!(key && key.trim() !== '');
                };

                switch (chatMode) {
                    case ChatMode.O3:
                    case ChatMode.O3_Mini:
                    case ChatMode.O4_Mini:
                    case ChatMode.GPT_4o_Mini:
                    case ChatMode.GPT_4o:
                    case ChatMode.GPT_4_1_Mini:
                    case ChatMode.GPT_4_1_Nano:
                    case ChatMode.GPT_4_1:
                        return isValidKey(apiKeys['OPENAI_API_KEY']);
                    case ChatMode.Deep:
                        // Deep Research mode requires Gemini API key (uses Gemini 2.5 Pro)
                        return isValidKey(apiKeys['GEMINI_API_KEY']);
                    case ChatMode.Pro:
                    case ChatMode.GEMINI_2_0_FLASH:
                    case ChatMode.GEMINI_2_5_PRO:
                    case ChatMode.GEMINI_2_0_FLASH_LITE:
                    case ChatMode.GEMINI_2_5_FLASH:
                        return isValidKey(apiKeys['GEMINI_API_KEY']);
                    case ChatMode.GEMINI_2_5_FLASH_LITE:
                        return true; // Free model, no API key required
                    case ChatMode.CLAUDE_4_SONNET:
                    case ChatMode.CLAUDE_4_OPUS:
                        return isValidKey(apiKeys['ANTHROPIC_API_KEY']);
                    case ChatMode.DEEPSEEK_R1:
                        return isValidKey(apiKeys['FIREWORKS_API_KEY']);
                    case ChatMode.GROK_3:
                    case ChatMode.GROK_3_MINI:
                        return isValidKey(apiKeys['XAI_API_KEY']);
                    // OpenRouter models
                    case ChatMode.DEEPSEEK_V3_0324_FREE:
                    case ChatMode.DEEPSEEK_V3_0324:
                    case ChatMode.DEEPSEEK_R1_FREE:
                    case ChatMode.DEEPSEEK_R1_0528_FREE:
                    case ChatMode.QWEN3_235B_A22B:
                    case ChatMode.QWEN3_32B:
                    case ChatMode.MISTRAL_NEMO:
                    case ChatMode.QWEN3_14B_FREE:
                        return isValidKey(apiKeys['OPENROUTER_API_KEY']);
                    // LM Studio local models - no API key required
                    case ChatMode.LMSTUDIO_LLAMA_3_8B:
                    case ChatMode.LMSTUDIO_QWEN_7B:
                    case ChatMode.LMSTUDIO_GEMMA_7B:
                    case ChatMode.LMSTUDIO_GEMMA_3_1B:
                        return true; // Local models don't require API keys
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
                        // For hydration requests, try to find data from any storage location
                        if (name === 'api-keys-storage') {
                            const value = findStoredApiKeys();
                            return value;
                        }

                        // For other requests, use the effective storage key
                        const key = getEffectiveStorageKey(name);
                        const value = localStorage.getItem(key);
                        return value;
                    } catch (error) {
                        log.error({ error, name }, '[ApiKeys] Storage getItem error');
                        return null;
                    }
                },
                setItem: (name: string, value: string) => {
                    // SSR protection
                    if (typeof window === 'undefined') {
                        return;
                    }

                    try {
                        const key = getEffectiveStorageKey(name);
                        localStorage.setItem(key, value);

                        // Simplified verification - only log warning instead of throwing
                        setTimeout(() => {
                            try {
                                const verification = localStorage.getItem(key);
                                if (verification !== value) {
                                    log.warn(
                                        { key },
                                        '[ApiKeys] Storage verification mismatch, but continuing'
                                    );
                                }
                            } catch (verifyError) {
                                log.warn(
                                    { error: verifyError, key },
                                    '[ApiKeys] Storage verification failed'
                                );
                            }
                        }, 0);
                    } catch (error) {
                        log.error({ error, name }, '[ApiKeys] Storage setItem error');
                        // Don't throw error to prevent store initialization failure
                    }
                },
                removeItem: (name: string) => {
                    // SSR protection
                    if (typeof window === 'undefined') {
                        return;
                    }

                    try {
                        const key = getEffectiveStorageKey(name);
                        localStorage.removeItem(key);
                    } catch (error) {
                        log.error({ error, name }, '[ApiKeys] Storage removeItem error');
                    }
                },
            })),
            // Add migration and hydration logic
            migrate: (persistedState: any, _version: number) => {
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
                        log.error({ error }, '[ApiKeys] Hydration error');
                        // Reset to default state on hydration error
                        return { keys: {} };
                    }
                    log.debug(
                        {
                            keyCount: state?.keys ? Object.keys(state.keys).length : 0,
                        },
                        '[ApiKeys] Hydration successful'
                    );
                };
            },
        }
    )
);

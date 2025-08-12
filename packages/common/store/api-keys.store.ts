import { ChatMode } from '@repo/shared/config';
import type { ApiKeyMetadata } from '@repo/shared/utils/key-rotation';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { log } from '../../shared/src/lib/logger';
import { isGeminiModel } from '../utils';

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

export type ApiKeyWithMetadata = {
    value: string;
    metadata: ApiKeyMetadata;
};

export type SecureApiKeys = {
    [K in keyof ApiKeys]: ApiKeyWithMetadata;
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
    hasApiKeyForChatMode: (chatMode: ChatMode, isSignedIn: boolean, isVtPlus?: boolean) => boolean;
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
                            '[ApiKeys] Failed to save current state',
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

                    const userData = storedData ? JSON.parse(storedData) : { state: { keys: {} } };

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
                            '[ApiKeys] Failed to initialize storage after user switch',
                        );
                    }
                }
            },
            forceRehydrate: () => {
                // Force re-read from current storage location
                const storedData = localStorage.getItem(currentStorageKey);
                const userData = storedData ? JSON.parse(storedData) : { state: { keys: {} } };
                set({ keys: userData.state?.keys || {} });
            },
            hasApiKeyForChatMode: (
                chatMode: ChatMode,
                isSignedIn: boolean,
                isVtPlus: boolean = false,
            ) => {
                // Free models don't require authentication or API keys
                if (chatMode === ChatMode.GEMINI_2_5_FLASH_LITE) {
                    return true;
                }

                // For non-local models, user must be signed in
                if (!isSignedIn) return false;

                // VT+ users don't need API keys for Gemini models and research modes
                if (
                    isVtPlus
                    && (isGeminiModel(chatMode)
                        || chatMode === ChatMode.Deep
                        || chatMode === ChatMode.Pro)
                ) {
                    return true; // VT+ users can use system API key
                }

                const apiKeys = get().keys;

                // Helper function to check if API key exists and is not empty
                const isValidKey = (key: string | undefined): boolean => {
                    return !!(key && key.trim() !== '');
                };

                switch (chatMode) {
                    case ChatMode.GPT_5:
                    case ChatMode.O3:
                    case ChatMode.O3_Mini:
                    case ChatMode.O4_Mini:
                    case ChatMode.O1_MINI:
                    case ChatMode.O1:
                    case ChatMode.GPT_4o_Mini:
                    case ChatMode.GPT_4o:
                    case ChatMode.GPT_4_1_Mini:
                    case ChatMode.GPT_4_1_Nano:
                    case ChatMode.GPT_4_1:
                        return isValidKey(apiKeys.OPENAI_API_KEY);
                    case ChatMode.Deep:
                    case ChatMode.Pro:
                        // Deep Research and Pro Search modes support BYOK for free users
                        return isValidKey(apiKeys.GEMINI_API_KEY);
                    case ChatMode.GEMINI_2_5_PRO:
                    case ChatMode.GEMINI_2_5_FLASH:
                        return isValidKey(apiKeys.GEMINI_API_KEY);
                    case ChatMode.GEMINI_2_5_FLASH_LITE:
                        return true; // Free model, no API key required
                    case ChatMode.CLAUDE_4_1_OPUS:
                    case ChatMode.CLAUDE_4_SONNET:
                    case ChatMode.CLAUDE_4_OPUS:
                        return isValidKey(apiKeys.ANTHROPIC_API_KEY);
                    case ChatMode.DEEPSEEK_R1_FIREWORKS:
                    case ChatMode.KIMI_K2_INSTRUCT_FIREWORKS:
                        return isValidKey(apiKeys.FIREWORKS_API_KEY);
                    case ChatMode.GROK_3:
                    case ChatMode.GROK_3_MINI:
                    case ChatMode.GROK_4:
                        return isValidKey(apiKeys.XAI_API_KEY);
                    // OpenRouter models
                    case ChatMode.DEEPSEEK_V3_0324:
                    case ChatMode.DEEPSEEK_R1:
                    case ChatMode.QWEN3_235B_A22B:
                    case ChatMode.QWEN3_32B:
                    case ChatMode.MISTRAL_NEMO:
                    case ChatMode.QWEN3_14B:
                    case ChatMode.KIMI_K2:
                    case ChatMode.GPT_OSS_120B:
                    case ChatMode.GPT_OSS_20B:
                        return isValidKey(apiKeys.OPENROUTER_API_KEY);
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
                                        '[ApiKeys] Storage verification mismatch, but continuing',
                                    );
                                }
                            } catch (verifyError) {
                                log.warn(
                                    { error: verifyError, key },
                                    '[ApiKeys] Storage verification failed',
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
                        '[ApiKeys] Hydration successful',
                    );
                };
            },
        },
    ),
);

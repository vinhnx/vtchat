import { ChatMode } from '@repo/shared/config';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

                    currentUserId = newUserId;
                    currentStorageKey = getStorageKey(newUserId);

                    // Load API keys for the new user from localStorage with safe JSON parsing
                    const storedData = localStorage.getItem(currentStorageKey);
                    const userData = safeJsonParse(storedData, { state: { keys: {} } });

                    set({ keys: userData.state?.keys || {} });

                    console.log(
                        `[ApiKeys] Loaded ${Object.keys(userData.state?.keys || {}).length} API keys for user: ${newUserId || 'anonymous'}`
                    );
                }
            },
            hasApiKeyForChatMode: (chatMode: ChatMode, isSignedIn: boolean) => {
                if (!isSignedIn) return false;
                const apiKeys = get().keys;
                switch (chatMode) {
                    case ChatMode.O4_Mini:
                    case ChatMode.GPT_4o_Mini:
                    case ChatMode.GPT_4o:
                    case ChatMode.GPT_4_1_Mini:
                    case ChatMode.GPT_4_1_Nano:
                    case ChatMode.GPT_4_1:
                        return !!apiKeys['OPENAI_API_KEY'];
                    case ChatMode.Deep:
                        // Deep Research mode can use any available API key (fallback logic)
                        return !!(
                            apiKeys['GEMINI_API_KEY'] ||
                            apiKeys['OPENAI_API_KEY'] ||
                            apiKeys['ANTHROPIC_API_KEY'] ||
                            apiKeys['FIREWORKS_API_KEY'] ||
                            apiKeys['TOGETHER_API_KEY']
                        );
                    case ChatMode.Pro:
                    case ChatMode.GEMINI_2_0_FLASH:
                    case ChatMode.GEMINI_2_5_PRO:
                    case ChatMode.GEMINI_2_0_FLASH_LITE:
                    case ChatMode.GEMINI_2_5_FLASH_PREVIEW:
                    case ChatMode.GEMINI_2_5_PRO_PREVIEW:
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
            name: currentStorageKey,
            // Use a custom storage implementation that respects the current user context
            storage: {
                getItem: (name: string) => {
                    const key = currentStorageKey || name;
                    const value = localStorage.getItem(key);
                    return value;
                },
                setItem: (name: string, value: string) => {
                    const key = currentStorageKey || name;
                    localStorage.setItem(key, value);
                },
                removeItem: (name: string) => {
                    const key = currentStorageKey || name;
                    localStorage.removeItem(key);
                },
            } as any, // Type assertion to handle Zustand storage interface complexities
        }
    )
);

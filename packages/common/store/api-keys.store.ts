import { ChatMode } from '@repo/shared/config';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ApiKeys = {
    OPENAI_API_KEY?: string;
    ANTHROPIC_API_KEY?: string;
    GEMINI_API_KEY?: string;
    JINA_API_KEY?: string;
    FIREWORKS_API_KEY?: string;

    OPENROUTER_API_KEY?: string;
    TOGETHER_API_KEY?: string;
};

type ApiKeysState = {
    keys: ApiKeys;
    setKey: (provider: keyof ApiKeys, key: string) => void;
    removeKey: (provider: keyof ApiKeys) => void;
    clearAllKeys: () => void;
    getAllKeys: () => ApiKeys;
    hasApiKeyForChatMode: (chatMode: ChatMode, isSignedIn: boolean) => boolean;
};

export const useApiKeysStore = create<ApiKeysState>()(
    persist(
        (set, get) => ({
            keys: {},
            setKey: (provider, key) => {
                // const { data: session } = useSession(); // Removed hook call
                // if (!session) return; // Caller should handle session check
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
            hasApiKeyForChatMode: (chatMode: ChatMode, isSignedIn: boolean) => {
                // Added isSignedIn parameter
                // const { data: session } = useSession(); // Removed hook call
                if (!isSignedIn) return false; // Use passed isSignedIn
                const apiKeys = get().keys;
                switch (chatMode) {
                    case ChatMode.O4_Mini:
                    case ChatMode.GPT_4o_Mini:
                    case ChatMode.GPT_4o:
                    case ChatMode.GPT_4_1_Mini:
                    case ChatMode.GPT_4_1_Nano:
                    case ChatMode.GPT_4_1:
                        return !!apiKeys['OPENAI_API_KEY'];
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
                    default:
                        return false;
                }
            },
        }),
        {
            name: 'api-keys-storage',
        }
    )
);

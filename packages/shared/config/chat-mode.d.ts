import { FeatureSlug, PlanSlug } from "../types/subscription";
import { type SubscriptionContext } from "../utils/subscription";
export declare const ChatMode: {
    readonly Pro: "pro";
    readonly Deep: "deep";
    readonly O3: "o3";
    readonly O3_Mini: "o3-mini";
    readonly O4_Mini: "o4-mini";
    readonly O1_MINI: "o1-mini";
    readonly O1: "o1";
    readonly GPT_4_1: "gpt-4.1";
    readonly GPT_4_1_Mini: "gpt-4.1-mini";
    readonly GPT_4_1_Nano: "gpt-4.1-nano";
    readonly GPT_5: "gpt-5-2025-08-07";
    readonly GPT_4o: "gpt-4o";
    readonly GPT_4o_Mini: "gpt-4o-mini";
    readonly GEMINI_2_5_PRO: "gemini-2.5-pro";
    readonly GEMINI_2_5_FLASH: "gemini-2.5-flash";
    readonly GEMINI_2_5_FLASH_LITE: "gemini-2.5-flash-lite-preview-06-17";
    readonly CLAUDE_4_1_OPUS: "claude-opus-4-1-20250805";
    readonly CLAUDE_4_SONNET: "claude-sonnet-4-20250514";
    readonly CLAUDE_4_OPUS: "claude-opus-4-20250514";
    readonly DEEPSEEK_R1_FIREWORKS: "deepseek-r1-fireworks";
    readonly KIMI_K2_INSTRUCT_FIREWORKS: "kimi-k2-instruct-fireworks";
    readonly GROK_3: "grok-3";
    readonly GROK_3_MINI: "grok-3-mini";
    readonly GROK_4: "grok-4";
    readonly DEEPSEEK_V3_0324: "deepseek-v3-0324";
    readonly DEEPSEEK_R1: "deepseek-r1";
    readonly QWEN3_235B_A22B: "qwen3-235b-a22b";
    readonly QWEN3_32B: "qwen3-32b";
    readonly MISTRAL_NEMO: "mistral-nemo";
    readonly QWEN3_14B: "qwen3-14b";
    readonly KIMI_K2: "kimi-k2";
    readonly GPT_OSS_120B: "gpt-oss-120b";
    readonly GPT_OSS_20B: "gpt-oss-20b";
};
export type ChatMode = (typeof ChatMode)[keyof typeof ChatMode];
export declare const ChatModeConfig: Record<ChatMode, {
    webSearch: boolean;
    imageUpload: boolean;
    multiModal: boolean;
    retry: boolean;
    isNew?: boolean;
    isAuthRequired?: boolean;
    requiredFeature?: FeatureSlug;
    requiredPlan?: PlanSlug;
}>;
/**
 * Get available chat modes for a user based on their subscription
 * Uses the new SubscriptionContext pattern for access control
 */
export declare function getAvailableChatModes(context: SubscriptionContext): ChatMode[];
/**
 * Get restricted chat modes that require upgrade
 * Uses the new SubscriptionContext pattern for access control
 */
export declare function getRestrictedChatModes(context: SubscriptionContext): ChatMode[];
/**
 * Get upgrade requirements for a specific chat mode
 */
export declare function getChatModeUpgradeRequirements(mode: ChatMode): {
    requiredFeature?: FeatureSlug;
    requiredPlan?: PlanSlug;
};
/**
 * Check if a chat mode supports multi-modal features (images/PDFs)
 */
export declare function supportsMultiModal(mode: ChatMode): boolean;
/**
 * Get unified display name for AI model
 * Uses the centralized getChatModeName function for consistency
 *
 * @param mode - ChatMode string
 * @returns Display name for the model
 */
export declare function getModelDisplayName(mode: string): string;
export declare const getChatModeName: (mode: ChatMode) => "Deep Research - Gemini 2.5 Pro" | "Pro Search - Gemini 2.5 Flash" | "OpenAI GPT 4.1" | "OpenAI GPT 4.1 Mini" | "OpenAI GPT 4.1 Nano" | "OpenAI GPT-5" | "OpenAI GPT 4o Mini" | "OpenAI GPT 4o" | "Anthropic Claude 4.1 Opus" | "Anthropic Claude 4 Sonnet" | "Anthropic Claude 4 Opus" | "OpenAI o3" | "OpenAI o3 mini" | "OpenAI o4 mini" | "Google Gemini 2.5 Pro" | "Google Gemini 2.5 Flash" | "Google Gemini 2.5 Flash Lite Preview" | "xAI Grok 3" | "xAI Grok 3 Mini" | "xAI Grok 4" | "OpenAI gpt-oss-120b (via OpenRouter)" | "OpenAI gpt-oss-20b (via OpenRouter)" | "OpenRouter DeepSeek V3 0324" | "OpenRouter DeepSeek R1" | "OpenRouter Qwen3 235B A22B" | "OpenRouter Qwen3 32B" | "OpenRouter Mistral Nemo" | "OpenRouter Qwen3 14B" | "Fireworks DeepSeek R1" | "Fireworks Kimi K2 Instruct" | "OpenAI o1-mini" | "OpenAI o1" | "OpenRouter Kimi K2";
//# sourceMappingURL=chat-mode.d.ts.map
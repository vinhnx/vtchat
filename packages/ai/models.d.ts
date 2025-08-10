import { ChatMode } from "@repo/shared/config";
import type { CoreMessage } from "ai";
import { ReasoningType } from "./constants/reasoning";
import type { ProviderEnumType } from "./providers";
export declare const ModelEnum: {
    readonly CLAUDE_4_1_OPUS: "claude-opus-4-1-20250805";
    readonly CLAUDE_4_SONNET: "claude-sonnet-4-20250514";
    readonly CLAUDE_4_OPUS: "claude-opus-4-20250514";
    readonly GEMINI_2_5_FLASH_LITE: "gemini-2.5-flash-lite-preview-06-17";
    readonly GEMINI_2_5_FLASH: "gemini-2.5-flash";
    readonly GEMINI_2_5_PRO: "gemini-2.5-pro";
    readonly GPT_4o_Mini: "gpt-4o-mini";
    readonly GPT_4o: "gpt-4o";
    readonly GPT_4_1_Mini: "gpt-4.1-mini";
    readonly GPT_4_1_Nano: "gpt-4.1-nano";
    readonly GPT_4_1: "gpt-4.1";
    readonly GPT_5: "gpt-5-2025-08-07";
    readonly O3: "o3";
    readonly O3_Mini: "o3-mini";
    readonly O4_Mini: "o4-mini";
    readonly O1_MINI: "o1-mini";
    readonly O1: "o1";
    readonly GROK_3: "grok-3";
    readonly GROK_3_MINI: "grok-3-mini";
    readonly GROK_4: "grok-4";
    readonly DEEPSEEK_R1_FIREWORKS: "accounts/fireworks/models/deepseek-r1-0528";
    readonly KIMI_K2_INSTRUCT_FIREWORKS: "accounts/fireworks/models/kimi-k2-instruct";
    readonly DEEPSEEK_V3_0324: "deepseek/deepseek-chat-v3-0324";
    readonly DEEPSEEK_R1: "deepseek/deepseek-r1";
    readonly QWEN3_235B_A22B: "qwen/qwen3-235b-a22b";
    readonly QWEN3_32B: "qwen/qwen3-32b";
    readonly MISTRAL_NEMO: "mistralai/mistral-nemo";
    readonly QWEN3_14B: "qwen/qwen3-14b";
    readonly KIMI_K2: "moonshot/kimi-k2";
    readonly GPT_OSS_120B: "openai/gpt-oss-120b";
    readonly GPT_OSS_20B: "openai/gpt-oss-20b";
};
export type ModelEnum = (typeof ModelEnum)[keyof typeof ModelEnum];
export type Model = {
    id: ModelEnum;
    name: string;
    provider: ProviderEnumType;
    maxTokens: number;
    contextWindow: number;
    isFree?: boolean;
};
export declare const models: Model[];
export declare const getModelFromChatMode: (mode?: string) => ModelEnum;
export declare const getChatModeMaxTokens: (mode: ChatMode) => 128000 | 1047576 | 100000 | 200000 | 1048576 | 131072 | 256000 | 163840 | 40960;
export declare const estimateTokensByWordCount: (text: string) => number;
export declare const estimateTokensForMessages: (messages: CoreMessage[]) => number;
export declare const supportsNativeWebSearch: (model: ModelEnum) => boolean;
export declare const supportsOpenAIWebSearch: (model: ModelEnum) => boolean;
export declare const trimMessageHistoryEstimated: (messages: CoreMessage[], chatMode: ChatMode) => {
    trimmedMessages: CoreMessage[];
    tokenCount: number;
};
/**
 * Detects if a model supports reasoning tokens/thinking capabilities
 */
export declare const supportsReasoning: (model: ModelEnum) => boolean;
/**
 * Checks if a model supports tool calls/function calling
 * Based on capabilities defined in models-data.json
 */
export declare const supportsTools: (model: ModelEnum) => boolean;
/**
 * Checks if a model supports web search
 * Most models support web search through our implementation
 */
export declare const supportsWebSearch: (model: ModelEnum) => boolean;
/**
 * Determines the reasoning implementation type for a model
 */
export declare const getReasoningType: (model: ModelEnum) => ReasoningType;
/**
 * Gets the appropriate middleware tag for reasoning extraction
 */
export declare const getReasoningTagName: (model: ModelEnum) => string | null;
//# sourceMappingURL=models.d.ts.map
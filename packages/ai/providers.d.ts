import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import type { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { LanguageModelV1 } from "@ai-sdk/provider";
import { createTogetherAI } from "@ai-sdk/togetherai";
import { createXai } from "@ai-sdk/xai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { type LanguageModelV1Middleware } from "ai";
export declare const Providers: {
    readonly OPENAI: "openai";
    readonly ANTHROPIC: "anthropic";
    readonly TOGETHER: "together";
    readonly GOOGLE: "google";
    readonly FIREWORKS: "fireworks";
    readonly XAI: "xai";
    readonly OPENROUTER: "openrouter";
};
export type ProviderEnumType = (typeof Providers)[keyof typeof Providers];
import { type ModelEnum } from "./models";
declare global {
    interface Window {
        AI_API_KEYS?: {
            [key in ProviderEnumType]?: string;
        };
        JINA_API_KEY?: string;
        NEXT_PUBLIC_APP_URL?: string;
    }
    interface WorkerGlobalScope {
        AI_API_KEYS?: {
            [key in ProviderEnumType]?: string;
        };
    }
}
type ProviderInstance = ReturnType<typeof createOpenAI> | ReturnType<typeof createAnthropic> | ReturnType<typeof createGoogleGenerativeAI> | ReturnType<typeof createTogetherAI> | ReturnType<typeof createXai> | ReturnType<typeof createOpenRouter> | ReturnType<typeof createOpenAICompatible>;
export declare const getProviderInstance: (provider: ProviderEnumType, byokKeys?: Record<string, string>, isFreeModel?: boolean, claude4InterleavedThinking?: boolean, isVtPlus?: boolean) => ProviderInstance;
export declare const getLanguageModel: (m: ModelEnum, middleware?: LanguageModelV1Middleware, byokKeys?: Record<string, string>, useSearchGrounding?: boolean, cachedContent?: string, claude4InterleavedThinking?: boolean, isVtPlus?: boolean) => LanguageModelV1;
export {};
//# sourceMappingURL=providers.d.ts.map
import { ChatMode } from "@repo/shared/config";
import { isGeminiModel } from "@repo/shared/utils";

const FREE_SERVER_MODELS: ChatMode[] = [ChatMode.GEMINI_2_5_FLASH_LITE];

const PLUS_SERVER_MODELS: ChatMode[] = [
    // Only Gemini models are server-funded for VT+ users
    ChatMode.GEMINI_2_5_PRO,
    ChatMode.GEMINI_2_5_FLASH,
    ChatMode.GEMINI_2_5_FLASH_LITE,
    // All other models (Claude, OpenAI, xAI, etc.) require BYOK even for VT+ users
];

export type ServerSideAPIOpts = {
    mode: ChatMode;
    hasVtPlus: boolean;
    deepResearch?: boolean;
    proSearch?: boolean;
    rag?: boolean;
};

/**
 * Returns true when the request **must** be routed to `/api/completion`
 *
 * Rules:
 * 1. Free tier server-funded models (always server-side)
 * 2. VT+ server-funded models (when user has VT+)
 * 3. VT+ exclusive features (Deep Research, Pro Search, RAG)
 */
export function shouldUseServerSideAPI({
    mode,
    hasVtPlus,
    deepResearch = false,
    proSearch = false,
    rag = false,
}: ServerSideAPIOpts): boolean {
    // 1. Free tier server-funded model?
    if (FREE_SERVER_MODELS.includes(mode)) {
        return true;
    }

    // 2. VT+ models that we fund on the backend?
    if (hasVtPlus && PLUS_SERVER_MODELS.includes(mode)) {
        return true;
    }

    // 3. VT+ exclusive features always run on the server because
    //    they require vector DB / orchestrated tools.
    if (deepResearch || proSearch || rag) {
        return true;
    }

    return false;
}

/**
 * Helper to determine if a model needs server-side API for VT+ users
 */
export function needsServerSideForPlus(mode: ChatMode): boolean {
    return PLUS_SERVER_MODELS.includes(mode);
}

/**
 * List of all provider API keys that should be removed for server-side calls
 */
const PROVIDER_API_KEYS = [
    "ANTHROPIC_API_KEY",
    "OPENAI_API_KEY",
    "GEMINI_API_KEY",
    "XAI_API_KEY",
    "GROQ_API_KEY",
    "DEEPSEEK_API_KEY",
    "FIREWORKS_API_KEY",
    "OPENROUTER_API_KEY",
    "TOGETHER_API_KEY",
];

/**
 * Helper to determine which API key to remove for server-side calls
 * @deprecated Use filterApiKeysForServerSide instead
 */
export function getProviderKeyToRemove(mode: ChatMode): string | null {
    if (isGeminiModel(mode)) {
        return "GEMINI_API_KEY";
    }
    if (typeof mode === "string" && mode.includes("claude")) {
        return "ANTHROPIC_API_KEY";
    }
    if (
        typeof mode === "string" &&
        (mode.includes("gpt") || mode.includes("o1") || mode.includes("o3") || mode.includes("o4"))
    ) {
        return "OPENAI_API_KEY";
    }
    if (typeof mode === "string" && mode.includes("grok")) {
        return "XAI_API_KEY";
    }
    if (typeof mode === "string" && mode.includes("fireworks")) {
        return "FIREWORKS_API_KEY";
    }
    // OpenRouter models
    if (
        typeof mode === "string" &&
        (mode.includes("deepseek") ||
            mode.includes("qwen") ||
            mode.includes("mistral") ||
            mode.includes("kimi"))
    ) {
        return "OPENROUTER_API_KEY";
    }
    return null;
}

/**
 * Filter API keys for server-side calls based on model type
 * - For server-funded models: Remove ALL provider keys to prevent mixing
 * - For BYOK models: Keep only the required provider key for that model
 */
export function filterApiKeysForServerSide(
    apiKeys: Record<string, string>,
    mode: ChatMode,
    isServerFunded: boolean = false,
): Record<string, string> {
    const filtered: Record<string, string> = {};

    // Keep non-provider API keys (SERP_API_KEY, etc.)
    for (const [key, value] of Object.entries(apiKeys)) {
        if (!PROVIDER_API_KEYS.includes(key)) {
            filtered[key] = value;
        }
    }

    // For server-funded models, don't include any provider keys
    if (isServerFunded) {
        return filtered;
    }

    // For BYOK models, include only the required provider key
    const requiredKey = getProviderKeyToRemove(mode);
    if (requiredKey && apiKeys[requiredKey]) {
        filtered[requiredKey] = apiKeys[requiredKey];
    }

    return filtered;
}

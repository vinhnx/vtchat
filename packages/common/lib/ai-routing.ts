import { ChatMode } from "@repo/shared/config";
import { isGeminiModel } from "@repo/shared/utils";

const FREE_SERVER_MODELS: ChatMode[] = [ChatMode.GEMINI_2_5_FLASH_LITE];

const PLUS_SERVER_MODELS: ChatMode[] = [
    ChatMode.CLAUDE_4_SONNET,
    ChatMode.CLAUDE_4_OPUS,
    ChatMode.GPT_4o,
    ChatMode.GPT_4o_Mini,
    ChatMode.DEEPSEEK_R1,
    ChatMode.GROK_BETA,
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
    if (typeof mode === "string" && (mode.includes("gpt") || mode.includes("o1"))) {
        return "OPENAI_API_KEY";
    }
    return null;
}

/**
 * Remove ALL provider API keys for server-side calls to prevent mixing with server-funded keys
 * This is critical for security and cost attribution
 */
export function filterApiKeysForServerSide(
    apiKeys: Record<string, string>,
): Record<string, string> {
    const filtered: Record<string, string> = {};

    // Only keep non-provider API keys (e.g., SERP_API_KEY, etc.)
    for (const [key, value] of Object.entries(apiKeys)) {
        if (!PROVIDER_API_KEYS.includes(key)) {
            filtered[key] = value;
        }
    }

    return filtered;
}

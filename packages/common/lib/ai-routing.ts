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
    if (hasVtPlus && (PLUS_SERVER_MODELS.includes(mode) || isGeminiModel(mode))) {
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
    return PLUS_SERVER_MODELS.includes(mode) || isGeminiModel(mode);
}

/**
 * Helper to determine which API key to remove for server-side calls
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
 * Remove provider-specific API key for server-side calls to prevent mixing
 */
export function filterApiKeysForServerSide(
    apiKeys: Record<string, string>,
    mode: ChatMode,
): Record<string, string> {
    const keyToRemove = getProviderKeyToRemove(mode);
    if (!keyToRemove) {
        return apiKeys;
    }

    const { [keyToRemove]: _, ...restKeys } = apiKeys;
    return restKeys;
}

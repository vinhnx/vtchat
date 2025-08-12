import type { ChatMode, UserTier } from '@repo/shared/config';
import { log } from '@repo/shared/lib/logger';
import type { CoreMessage } from 'ai';

export type ThreadMeta = {
    threadId: string;
    query: string;
    optimisticAiThreadItemId: string;
    mode: ChatMode;
    coreMessages: CoreMessage[];
};

export type SubmitOptions = {
    useWebSearch: boolean;
    useMathCalculator: boolean;
    useCharts: boolean;
    useDeepResearch?: boolean;
    useProSearch?: boolean;
    useRag?: boolean;
    showSuggestions?: boolean;
    customInstructions?: string;
};

export type ServerSideCallParams =
    & ThreadMeta
    & SubmitOptions
    & {
        apiKeys: Record<string, string>;
        userTier: UserTier;
        newChatMode?: ChatMode;
    };

export type ClientSideCallParams =
    & ThreadMeta
    & SubmitOptions
    & {
        apiKeys: Record<string, string>;
        userTier: UserTier;
        thinkingMode?: any;
    };

/**
 * Log the API routing decision for debugging
 */
export function logRoutingDecision(params: {
    mode: ChatMode;
    isFreeModel: boolean;
    hasVtPlusAccess: boolean;
    needsServerSide: boolean;
    shouldUseServerSideAPI: boolean;
    hasApiKey: boolean;
    deepResearch?: boolean;
    proSearch?: boolean;
}) {
    log.info(params, '🎯 API routing decision');
}

/**
 * Log which execution path is being taken
 */
export function logExecutionPath(
    path: 'client-workflow' | 'server-api' | 'api-key-modal',
    mode: ChatMode,
) {
    const icons = {
        'client-workflow': '📱',
        'server-api': '🖥️',
        'api-key-modal': '🔑',
    };

    const messages = {
        'client-workflow': 'Using client-side workflow path',
        'server-api': 'Using server-side API path (/api/completion)',
        'api-key-modal': 'Showing API key modal - missing required key',
    };

    log.info({ mode }, `${icons[path]} ${messages[path]}`);
}

/**
 * Log API key removal for server-side calls
 */
export function logApiKeyRemoval(mode: ChatMode, keyType: string) {
    log.info({ mode }, `🔄 Removing ${keyType} key for server-side API call`);
}

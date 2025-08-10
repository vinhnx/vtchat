import type { ChatMode } from "@repo/shared/config";
import { type UserTierType } from "@repo/shared/constants/user-tiers";
import type { CoreAssistantMessage, CoreUserMessage } from "ai";
export type WorkflowConfig = {
    maxIterations?: number;
    maxRetries?: number;
    timeoutMs?: number;
    retryDelayMs?: number;
    retryDelayMultiplier?: number;
    signal?: AbortSignal;
};
export type WorkflowEventSchema = {
    flow: {
        query: string;
        threadId: string;
        threadItemId: string;
        status: "PENDING" | "COMPLETED" | "FAILED";
        goals?: Record<string, {
            id: number;
            text: string;
            final: boolean;
            status?: "PENDING" | "COMPLETED" | "FAILED";
        }>;
        steps?: Record<string, {
            type: string;
            final: boolean;
            goalId?: number;
            queries?: string[];
            results?: {
                title: string;
                link: string;
            }[];
        }>;
        toolCalls?: any[];
        toolResults?: any[];
        reasoning?: {
            text: string;
            final: boolean;
            status?: "PENDING" | "COMPLETED" | "FAILED";
            details?: Array<{
                type: "text" | "redacted";
                text?: string;
                data?: string;
                signature?: string;
            }>;
        };
        answer: {
            text: string;
            object?: any;
            objectType?: string;
            final: boolean;
            status?: "PENDING" | "COMPLETED" | "FAILED";
        };
        final: boolean;
    };
};
export type WorkflowWorkerStatus = "idle" | "running" | "completed" | "error" | "aborted";
export declare function useWorkflowWorker(onMessage?: (data: any) => void, _onAbort?: () => void): {
    status: WorkflowWorkerStatus;
    error: Error | null;
    flowState: {
        query: string;
        threadId: string;
        threadItemId: string;
        status: "PENDING" | "COMPLETED" | "FAILED";
        goals?: Record<string, {
            id: number;
            text: string;
            final: boolean;
            status?: "PENDING" | "COMPLETED" | "FAILED";
        }>;
        steps?: Record<string, {
            type: string;
            final: boolean;
            goalId?: number;
            queries?: string[];
            results?: {
                title: string;
                link: string;
            }[];
        }>;
        toolCalls?: any[];
        toolResults?: any[];
        reasoning?: {
            text: string;
            final: boolean;
            status?: "PENDING" | "COMPLETED" | "FAILED";
            details?: Array<{
                type: "text" | "redacted";
                text?: string;
                data?: string;
                signature?: string;
            }>;
        };
        answer: {
            text: string;
            object?: any;
            objectType?: string;
            final: boolean;
            status?: "PENDING" | "COMPLETED" | "FAILED";
        };
        final: boolean;
    } | null;
    startWorkflow: ({ mode, question, threadId, threadItemId, parentThreadItemId, customInstructions, messages, config, apiKeys, mcpConfig, webSearch, mathCalculator, charts, showSuggestions, thinkingMode, userTier, }: {
        mode: ChatMode;
        question: string;
        threadId: string;
        threadItemId: string;
        parentThreadItemId: string;
        customInstructions?: string;
        messages: (CoreUserMessage | CoreAssistantMessage)[];
        config?: WorkflowConfig;
        apiKeys?: Record<string, string>;
        mcpConfig?: Record<string, string>;
        webSearch?: boolean;
        mathCalculator?: boolean;
        charts?: boolean;
        showSuggestions?: boolean;
        thinkingMode?: {
            enabled: boolean;
            budget: number;
            includeThoughts: boolean;
        };
        userTier?: UserTierType;
    }) => void;
    abortWorkflow: (graceful?: boolean) => void;
};
//# sourceMappingURL=use-workflow-worker.d.ts.map
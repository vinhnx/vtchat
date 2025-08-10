import { type WorkflowConfig } from "@repo/orchestrator";
import type { ChatMode } from "@repo/shared/config";
import { type UserTierType } from "@repo/shared/constants/user-tiers";
import type { Geo } from "@vercel/functions";
import type { CoreMessage } from "ai";
type Status = "PENDING" | "COMPLETED" | "ERROR" | "HUMAN_REVIEW";
export type WorkflowEventSchema = {
    steps?: Record<string, {
        id: number;
        text?: string;
        steps: Record<string, {
            data?: any;
            status: Status;
        }>;
        status: Status;
    }>;
    toolCalls?: any[];
    toolResults?: any[];
    answer: {
        text?: string;
        object?: any;
        objectType?: string;
        finalText?: string;
        status: Status;
    };
    sources?: {
        index: number;
        title: string;
        link: string;
    }[];
    object?: Record<string, any>;
    error?: {
        error: string;
        status: Status;
    };
    status: Status;
    suggestions?: string[];
};
export type WorkflowContextSchema = {
    question: string;
    search_queries: string[];
    messages: CoreMessage[];
    mode: ChatMode;
    goals: {
        id: number;
        text: string;
        final: boolean;
        status: "PENDING" | "COMPLETED" | "ERROR";
    }[];
    steps: {
        type: string;
        final: boolean;
        goalId: number;
        queries?: string[];
        results?: {
            title: string;
            link: string;
        }[];
    }[];
    webSearch: boolean;
    mathCalculator: boolean;
    charts: boolean;
    codeSandbox: boolean;
    queries: string[];
    summaries: string[];
    gl?: Geo;
    sources: {
        index: number;
        title: string;
        link: string;
    }[];
    answer: string | undefined;
    threadId: string;
    threadItemId: string;
    showSuggestions: boolean;
    customInstructions?: string;
    onFinish: (data: any) => void;
    apiKeys?: Record<string, string>;
    thinkingMode?: {
        enabled: boolean;
        budget: number;
        includeThoughts: boolean;
    };
    userTier?: UserTierType;
    userId?: string;
};
export declare const runWorkflow: ({ mode, question, threadId, threadItemId, messages, config, signal, webSearch, mathCalculator, charts, codeSandbox, showSuggestions, onFinish, customInstructions, gl, apiKeys, thinkingMode, userTier, userId, }: {
    mode: ChatMode;
    question: string;
    threadId: string;
    threadItemId: string;
    messages: CoreMessage[];
    config?: WorkflowConfig;
    signal?: AbortSignal;
    webSearch?: boolean;
    mathCalculator?: boolean;
    charts?: boolean;
    showSuggestions?: boolean;
    onFinish?: (data: any) => void;
    gl?: Geo;
    customInstructions?: string;
    apiKeys?: Record<string, string>;
    thinkingMode?: {
        enabled: boolean;
        budget: number;
        includeThoughts: boolean;
    };
    userTier?: UserTierType;
    userId?: string;
}) => import("@repo/orchestrator").WorkflowEngine<WorkflowEventSchema, WorkflowContextSchema>;
export {};
//# sourceMappingURL=flow.d.ts.map
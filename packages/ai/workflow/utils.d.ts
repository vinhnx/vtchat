import type { TaskParams, TypedEventEmitter } from "@repo/orchestrator";
import { type UserTierType } from "@repo/shared/constants/user-tiers";
import { type CoreMessage, type ToolSet } from "ai";
import type { ZodSchema } from "zod";
import { ModelEnum } from "../models";
import type { GenerateTextWithReasoningResult, ReasoningDetail, ThinkingModeConfig } from "../types/reasoning";
import type { WorkflowEventSchema } from "./flow";
export type ChunkBufferOptions = {
    threshold?: number;
    breakOn?: string[];
    onFlush: (chunk: string, fullText: string) => void;
};
export declare class ChunkBuffer {
    private buffer;
    private fullText;
    private threshold?;
    private breakPatterns;
    private onFlush;
    constructor(options: ChunkBufferOptions);
    add(chunk: string): void;
    flush(): void;
    end(): void;
}
export declare const generateTextWithGeminiSearch: ({ prompt, model, onChunk, messages, signal, byokKeys, thinkingMode, userTier, userId, }: {
    prompt: string;
    model: ModelEnum;
    onChunk?: (chunk: string, fullText: string) => void;
    messages?: CoreMessage[];
    signal?: AbortSignal;
    byokKeys?: Record<string, string>;
    thinkingMode?: ThinkingModeConfig;
    userTier?: UserTierType;
    userId?: string;
}) => Promise<GenerateTextWithReasoningResult>;
export declare const generateText: ({ prompt, model, onChunk, messages, onReasoning, onReasoningDetails, tools, onToolCall, onToolResult, signal, toolChoice, maxSteps, byokKeys, useSearchGrounding, thinkingMode, userTier, userId, mode, }: {
    prompt: string;
    model: ModelEnum;
    onChunk?: (chunk: string, fullText: string) => void;
    messages?: CoreMessage[];
    onReasoning?: (chunk: string, fullText: string) => void;
    onReasoningDetails?: (details: ReasoningDetail[]) => void;
    tools?: ToolSet;
    onToolCall?: (toolCall: any) => void;
    onToolResult?: (toolResult: any) => void;
    signal?: AbortSignal;
    toolChoice?: "auto" | "none" | "required";
    maxSteps?: number;
    byokKeys?: Record<string, string>;
    useSearchGrounding?: boolean;
    thinkingMode?: ThinkingModeConfig;
    userTier?: UserTierType;
    userId?: string;
    mode?: string;
}) => Promise<any>;
export declare const generateObject: ({ prompt, model, schema, messages, signal, byokKeys, thinkingMode, userTier, userId, feature, }: {
    prompt: string;
    model: ModelEnum;
    schema: ZodSchema;
    messages?: CoreMessage[];
    signal?: AbortSignal;
    byokKeys?: Record<string, string>;
    thinkingMode?: ThinkingModeConfig;
    userTier?: UserTierType;
    userId?: string;
    feature?: string;
}) => Promise<any>;
export type EventSchema<T extends Record<string, any>> = {
    [K in keyof T]: (current: T[K] | undefined) => T[K];
};
export declare class EventEmitter<T extends Record<string, any>> {
    private listeners;
    private state;
    constructor(initialState?: Partial<T>);
    on(event: string, callback: (data: any) => void): this;
    off(event: string, callback: (data: any) => void): this;
    emit(event: string, data: any): this;
    getState(): Partial<T>;
    updateState<K extends keyof T>(key: K, updater: (current: T[K] | undefined) => T[K]): this;
}
export declare function createEventManager<T extends Record<string, any>>(initialState?: Partial<T>, _schema?: EventSchema<T>): {
    on: (event: string, callback: (data: any) => void) => EventEmitter<T>;
    off: (event: string, callback: (data: any) => void) => EventEmitter<T>;
    emit: (event: string, data: any) => EventEmitter<T>;
    getState: () => Partial<T>;
    update: <K extends keyof T>(key: K, value: T[K] | ((current: T[K] | undefined) => T[K])) => Partial<T>;
};
export declare const getHumanizedDate: () => string;
export declare const getWebPageContent: (url: string) => Promise<string>;
export declare const readURL: (url: string) => Promise<TReaderResult>;
export declare const processWebPages: (results: Array<{
    link: string;
    title: string;
}>, signal?: AbortSignal, options?: {
    batchSize: number;
    maxPages: number;
    timeout: number;
}) => Promise<{
    title: string;
    link: string;
    content: string;
}[]>;
export type TReaderResponse = {
    success: boolean;
    title: string;
    url: string;
    markdown: string;
    error?: string;
    source?: "jina" | "readability";
};
export type TReaderResult = {
    success: boolean;
    title?: string;
    url?: string;
    description?: string;
    markdown?: string;
    source?: "jina" | "readability";
    error?: string;
};
export declare const handleError: (error: Error, { events }: TaskParams) => Promise<{
    retry: boolean;
    result: string;
}>;
export declare const sendEvents: (events?: TypedEventEmitter<WorkflowEventSchema>) => {
    updateStep: (params: {
        stepId: number;
        text?: string;
        stepStatus: "PENDING" | "COMPLETED";
        subSteps: Record<string, {
            status: "PENDING" | "COMPLETED";
            data?: any;
        }>;
    }) => void;
    addSources: (sources: any[]) => void;
    updateAnswer: ({ text, finalText, status, }: {
        text?: string;
        finalText?: string;
        status?: "PENDING" | "COMPLETED";
    }) => void;
    nextStepId: () => number;
    updateStatus: (status: "PENDING" | "COMPLETED" | "ERROR") => void;
    updateObject: (object: any) => void;
};
/**
 * Selects an appropriate model based on available API keys
 * Provides fallback mechanism when primary model isn't available
 */
export declare const selectAvailableModel: (preferredModel: ModelEnum, byokKeys?: Record<string, string>) => ModelEnum;
//# sourceMappingURL=utils.d.ts.map
'use client';

import type { ChatMode } from '@repo/shared/config';
import { UserTier, type UserTierType } from '@repo/shared/constants/user-tiers';
import type { ModelAssistantMessage, ModelUserMessage } from 'ai';
import { useEffect, useRef, useState } from 'react';

export type WorkflowConfig = {
    maxIterations?: number;
    maxRetries?: number;
    timeoutMs?: number;
    retryDelayMs?: number;
    retryDelayMultiplier?: number;
    signal?: AbortSignal;
};

// Define the workflow schema type
export type WorkflowEventSchema = {
    flow: {
        query: string;
        threadId: string;
        threadItemId: string;
        status: 'PENDING' | 'COMPLETED' | 'FAILED';
        goals?: Record<
            string,
            {
                id: number;
                text: string;
                final: boolean;
                status?: 'PENDING' | 'COMPLETED' | 'FAILED';
            }
        >;
        steps?: Record<
            string,
            {
                type: string;
                final: boolean;
                goalId?: number;
                queries?: string[];
                results?: {
                    title: string;
                    link: string;
                }[];
            }
        >;
        toolCalls?: any[];
        toolResults?: any[];
        reasoningText?: {
            text: string;
            final: boolean;
            status?: 'PENDING' | 'COMPLETED' | 'FAILED';
            details?: Array<{
                type: 'text' | 'redacted';
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
            status?: 'PENDING' | 'COMPLETED' | 'FAILED';
        };
        final: boolean;
    };
};

export type WorkflowWorkerStatus = 'idle' | 'running' | 'completed' | 'error' | 'aborted';

export function useWorkflowWorker(onMessage?: (data: any) => void, _onAbort?: () => void) {
    const [status, setStatus] = useState<WorkflowWorkerStatus>('idle');
    const [error, setError] = useState<Error | null>(null);
    const [flowState, setFlowState] = useState<WorkflowEventSchema['flow'] | null>(null);
    const workerRef = useRef<Worker | null>(null);
    const onMessageRef = useRef(onMessage);

    // Keep the callback ref updated
    useEffect(() => {
        onMessageRef.current = onMessage;
    }, [onMessage]);

    // Initialize worker once on mount
    useEffect(() => {
        if (typeof window === 'undefined') return;

        if (!workerRef.current) {
            workerRef.current = new Worker(new URL('./worker.ts', import.meta.url), {
                type: 'module',
            });

            // Set up message handler
            workerRef.current.onmessage = (event) => {
                const data = event.data;
                if (onMessageRef.current) {
                    onMessageRef.current(data);
                }
            };
        }

        // Clean up worker when component unmounts
        return () => {
            if (workerRef.current) {
                workerRef.current.terminate();
                workerRef.current = null;
            }
        };
    }, []);

    const startWorkflow = ({
        mode,
        question,
        threadId,
        threadItemId,
        parentThreadItemId,
        customInstructions,
        messages,
        config,
        apiKeys,
        mcpConfig,
        webSearch,
        mathCalculator,
        charts,
        showSuggestions,
        thinkingMode,
        userTier = UserTier.FREE,
    }: {
        mode: ChatMode;
        question: string;
        threadId: string;
        threadItemId: string;
        parentThreadItemId: string;
        customInstructions?: string;
        messages: (ModelUserMessage | ModelAssistantMessage)[];
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
    }) => {
        // Reset state
        setError(null);
        setFlowState(null);

        try {
            if (typeof window === 'undefined') {
                throw new Error('Workers can only be used in the browser environment');
            }

            // Ensure worker exists
            if (!workerRef.current) {
                workerRef.current = new Worker(new URL('./worker.ts', import.meta.url), {
                    type: 'module',
                });

                // Set up message handler
                workerRef.current.onmessage = (event) => {
                    const data = event.data;
                    if (onMessageRef.current) {
                        onMessageRef.current(data);
                    }
                };
            }

            // Start workflow with existing worker
            workerRef.current.postMessage({
                type: 'START_WORKFLOW',
                payload: {
                    mode,
                    question,
                    threadId,
                    threadItemId,
                    parentThreadItemId,
                    customInstructions,
                    messages,
                    config,
                    apiKeys: apiKeys || {},
                    mcpConfig,
                    webSearch,
                    mathCalculator,
                    charts,
                    showSuggestions,
                    thinkingMode,
                    userTier,
                },
            });

            setStatus('running');
        } catch (err) {
            setStatus('error');
            setError(err instanceof Error ? err : new Error('Failed to start workflow'));
        }
    };

    const abortWorkflow = (graceful = false) => {
        if (!workerRef.current) {
            return;
        }

        // Signal the worker to abort
        workerRef.current.postMessage({
            type: 'ABORT_WORKFLOW',
            payload: { graceful },
        });

        setStatus('aborted');
    };

    return {
        status,
        error,
        flowState,
        startWorkflow,
        abortWorkflow,
    };
}

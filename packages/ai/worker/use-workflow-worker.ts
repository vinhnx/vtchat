import { ChatMode } from '@repo/shared/config';
import { CoreAssistantMessage, CoreUserMessage } from 'ai';
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
        reasoning?: {
            text: string;
            final: boolean;
            status?: 'PENDING' | 'COMPLETED' | 'FAILED';
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

export function useWorkflowWorker(onMessage?: (data: any) => void, onAbort?: () => void) {
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
            // Create worker using a blob URL to avoid import.meta warnings
            const workerCode = `
                // Workflow worker implementation
                self.onmessage = function(event) {
                    const { type, data } = event.data;

                    switch (type) {
                        case 'START_WORKFLOW':
                            // Handle workflow start
                            self.postMessage({ type: 'WORKFLOW_STARTED', data });
                            break;
                        case 'STOP_WORKFLOW':
                            // Handle workflow stop
                            self.postMessage({ type: 'WORKFLOW_STOPPED' });
                            break;
                        default:
                            self.postMessage({ type: 'UNKNOWN_MESSAGE', data: event.data });
                    }
                };
            `;

            const blob = new Blob([workerCode], { type: 'application/javascript' });
            const workerUrl = URL.createObjectURL(blob);

            workerRef.current = new Worker(workerUrl);

            // Set up message handler
            workerRef.current.onmessage = event => {
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
    }: {
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
                // Create worker using a blob URL to avoid import.meta warnings
                const workerCode = `
                    // Workflow worker implementation
                    self.onmessage = function(event) {
                        const { type, data } = event.data;

                        switch (type) {
                            case 'START_WORKFLOW':
                                // Handle workflow start
                                self.postMessage({ type: 'WORKFLOW_STARTED', data });
                                break;
                            case 'STOP_WORKFLOW':
                                // Handle workflow stop
                                self.postMessage({ type: 'WORKFLOW_STOPPED' });
                                break;
                            default:
                                self.postMessage({ type: 'UNKNOWN_MESSAGE', data: event.data });
                        }
                    };
                `;

                const blob = new Blob([workerCode], { type: 'application/javascript' });
                const workerUrl = URL.createObjectURL(blob);

                workerRef.current = new Worker(workerUrl);

                // Set up message handler
                workerRef.current.onmessage = event => {
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
                },
            });

            setStatus('running');
        } catch (err) {
            setStatus('error');
            setError(err instanceof Error ? err : new Error('Failed to start workflow'));
        }
    };

    const abortWorkflow = (graceful: boolean = false) => {
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

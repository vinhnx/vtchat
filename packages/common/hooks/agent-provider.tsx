import { useWorkflowWorker } from '@repo/ai/worker';
import { ChatMode, ChatModeConfig } from '@repo/shared/config';
import { getRateLimitMessage } from '@repo/shared/constants';
import { useSession } from '@repo/shared/lib/auth-client';
import { log } from '@repo/shared/logger';
import type { ThreadItem } from '@repo/shared/types';
import { buildCoreMessagesFromThreadItems } from '@repo/shared/utils';
import { nanoid } from 'nanoid';
import { useParams, useRouter } from 'next/navigation';
import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { ApiKeyPromptModal } from '../components/api-key-prompt-modal';
import { useApiKeysStore, useChatStore } from '../store';
import { useVtPlusAccess } from './use-subscription-access';

// Define common event types to reduce repetition - using as const to prevent Fast Refresh issues
const EVENT_TYPES = [
    'steps',
    'sources',
    'answer',
    'error',
    'status',
    'suggestions',
    'toolCalls',
    'toolResults',
    'object',
    'toolRouter',
] as const;

export type AgentContextType = {
    runAgent: (body: any) => Promise<void>;
    handleSubmit: (args: {
        formData: FormData;
        newThreadId?: string;
        existingThreadItemId?: string;
        newChatMode?: string;
        messages?: ThreadItem[];
        useWebSearch?: boolean;
        useMathCalculator?: boolean;
        useCharts?: boolean;
        showSuggestions?: boolean;
    }) => Promise<void>;
    updateContext: (threadId: string, data: any) => void;
};

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const AgentProvider = ({ children }: { children: ReactNode }) => {
    const { threadId: currentThreadId } = useParams();
    const { data: session } = useSession();
    const isSignedIn = !!session;

    const [showApiKeyModal, setShowApiKeyModal] = useState(false);
    const [modalChatMode, setModalChatMode] = useState<ChatMode>(ChatMode.GPT_4o_Mini);

    const updateThreadItem = useChatStore((state) => state.updateThreadItem);
    const setIsGenerating = useChatStore((state) => state.setIsGenerating);
    const setAbortController = useChatStore((state) => state.setAbortController);
    const createThreadItem = useChatStore((state) => state.createThreadItem);
    const setCurrentThreadItem = useChatStore((state) => state.setCurrentThreadItem);
    const setCurrentSources = useChatStore((state) => state.setCurrentSources);
    const updateThread = useChatStore((state) => state.updateThread);
    const chatMode = useChatStore((state) => state.chatMode);
    const customInstructions = useChatStore((state) => state.customInstructions);
    const thinkingMode = useChatStore((state) => state.thinkingMode);
    const { push } = useRouter();

    const getAllKeys = useApiKeysStore((state) => state.getAllKeys);
    const hasApiKeyForChatMode = useApiKeysStore((state) => state.hasApiKeyForChatMode);
    const hasVtPlusAccess = useVtPlusAccess();

    // Store setters for syncing tool states
    const setUseMathCalculator = useChatStore((state) => state.setUseMathCalculator);
    const setUseWebSearch = useChatStore((state) => state.setUseWebSearch);
    const setUseCharts = useChatStore((state) => state.setUseCharts);

    // In-memory store for thread items
    const threadItemMap = useMemo(() => new Map<string, ThreadItem>(), []);

    // Helper: Update in-memory and store thread item
    const handleThreadItemUpdate = useCallback(
        (
            threadId: string,
            threadItemId: string,
            eventType: string,
            eventData: any,
            parentThreadItemId?: string,
            _shouldPersistToDB = true
        ) => {
            const prevItem = threadItemMap.get(threadItemId) || ({} as ThreadItem);

            // Extract reasoning from steps if present
            let reasoning = prevItem.reasoning;
            let reasoningDetails = prevItem.reasoningDetails;

            if (eventType === 'steps' && eventData?.steps) {
                // Look for reasoning in the steps structure
                const stepsData = eventData.steps;
                if (stepsData[0]?.steps?.reasoning?.data) {
                    reasoning = stepsData[0].steps.reasoning.data;
                }
                // Look for structured reasoning details
                if (stepsData[0]?.steps?.reasoningDetails?.data) {
                    reasoningDetails = stepsData[0].steps.reasoningDetails.data;
                }
            }

            // Handle reasoning details from answer events if present
            if (eventType === 'answer' && eventData?.answer?.reasoningDetails) {
                reasoningDetails = eventData.answer.reasoningDetails;
            }

            // Handle semantic tool router events - sync UI state with activated tools
            if (eventType === 'toolRouter' && eventData?.selected) {
                const selectedTools = eventData.selected;
                log.info(
                    { selectedTools, reasoning: eventData.reasoning },
                    '🧠 Semantic router activated tools'
                );

                // Sync UI toggles with semantic router decisions
                if (selectedTools.includes('calculator')) {
                    setUseMathCalculator(true);
                }
                if (selectedTools.includes('web-search')) {
                    setUseWebSearch(true);
                }
                if (selectedTools.includes('charts')) {
                    setUseCharts(true);
                }
            }

            const updatedItem: ThreadItem = {
                ...prevItem,
                query: eventData?.query || prevItem.query || '',
                mode: eventData?.mode || prevItem.mode,
                threadId,
                parentId: parentThreadItemId || prevItem.parentId,
                id: threadItemId,
                object: eventData?.object || prevItem.object,
                reasoning,
                reasoningDetails,
                createdAt: prevItem.createdAt || new Date(),
                updatedAt: new Date(),
                ...(eventType === 'answer'
                    ? {
                          answer: {
                              ...eventData.answer,
                              text: (prevItem.answer?.text || '') + eventData.answer.text,
                          },
                      }
                    : { [eventType]: eventData[eventType] }),
            };

            threadItemMap.set(threadItemId, updatedItem);
            updateThreadItem(threadId, { ...updatedItem, persistToDB: true });
        },
        [threadItemMap, updateThreadItem, setUseMathCalculator, setUseWebSearch, setUseCharts]
    );

    const { startWorkflow, abortWorkflow } = useWorkflowWorker(
        useCallback(
            (data: any) => {
                if (
                    data?.threadId &&
                    data?.threadItemId &&
                    data.event &&
                    EVENT_TYPES.includes(data.event)
                ) {
                    handleThreadItemUpdate(
                        data.threadId,
                        data.threadItemId,
                        data.event,
                        data,
                        data.parentThreadItemId
                    );
                }

                if (data.type === 'done') {
                    setIsGenerating(false);
                    // Don't delete the thread item from memory as it's needed for future reference
                    // The threadItemMap serves as a cache and should retain completed items
                }
            },
            [handleThreadItemUpdate, setIsGenerating]
        )
    );

    const runAgent = useCallback(
        async (body: any) => {
            const abortController = new AbortController();
            setAbortController(abortController);
            setIsGenerating(true);
            const startTime = performance.now();

            abortController.signal.addEventListener('abort', () => {
                log.info({ threadId: body.threadId }, 'Abort controller triggered');
                setIsGenerating(false);
                updateThreadItem(body.threadId, {
                    id: body.threadItemId,
                    status: 'ABORTED',
                    persistToDB: true,
                });
            });

            try {
                const response = await fetch('/api/completion', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                    credentials: 'include',
                    cache: 'no-store',
                    signal: abortController.signal,
                });

                if (!response.ok) {
                    let errorText = await response.text();

                    if (response.status === 429) {
                        try {
                            const errorData = JSON.parse(errorText);
                            if (errorData.message) {
                                errorText = errorData.message;
                            } else if (errorData.limitType === 'daily_limit_exceeded') {
                                errorText = getRateLimitMessage.dailyLimit(isSignedIn);
                            } else {
                                errorText = getRateLimitMessage.minuteLimit(isSignedIn);
                            }
                        } catch {
                            // Fallback if JSON parsing fails
                            errorText = getRateLimitMessage.dailyLimit(isSignedIn);
                        }
                    }

                    setIsGenerating(false);
                    updateThreadItem(body.threadId, {
                        id: body.threadItemId,
                        status: 'ERROR',
                        error: errorText,
                        persistToDB: true,
                    });
                    log.error({ errorText, status: response.status }, 'Error response received');
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                if (!response.body) {
                    throw new Error('No response body received');
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let lastDbUpdate = Date.now();
                const DB_UPDATE_INTERVAL = 1000;
                let eventCount = 0;
                const streamStartTime = performance.now();

                let buffer = '';

                while (true) {
                    try {
                        const { value, done } = await reader.read();
                        if (done) break;

                        buffer += decoder.decode(value, { stream: true });
                        const messages = buffer.split('\n\n');
                        buffer = messages.pop() || '';

                        for (const message of messages) {
                            if (!message.trim()) continue;

                            const eventMatch = message.match(/^event: (.+)$/m);
                            const dataMatch = message.match(/^data: (.+)$/m);

                            if (eventMatch && dataMatch) {
                                const currentEvent = eventMatch[1];
                                eventCount++;

                                try {
                                    const data = JSON.parse(dataMatch[1]);
                                    if (
                                        EVENT_TYPES.includes(currentEvent) &&
                                        data?.threadId &&
                                        data?.threadItemId
                                    ) {
                                        const shouldPersistToDB =
                                            Date.now() - lastDbUpdate >= DB_UPDATE_INTERVAL;
                                        handleThreadItemUpdate(
                                            data.threadId,
                                            data.threadItemId,
                                            currentEvent,
                                            data,
                                            data.parentThreadItemId,
                                            shouldPersistToDB
                                        );
                                        if (shouldPersistToDB) {
                                            lastDbUpdate = Date.now();
                                        }
                                    } else if (currentEvent === 'done' && data.type === 'done') {
                                        setIsGenerating(false);
                                        const streamDuration = performance.now() - streamStartTime;
                                        log.info(
                                            {
                                                eventCount,
                                                streamDurationMs: streamDuration.toFixed(2),
                                            },
                                            'done event received'
                                        );
                                        if (data.threadItemId) {
                                            threadItemMap.delete(data.threadItemId);
                                        }
                                        if (data.status === 'error') {
                                            log.error({ error: data.error }, 'Stream error');
                                        }
                                    }
                                } catch (jsonError) {
                                    log.warn(
                                        {
                                            rawData: dataMatch[1],
                                            error: jsonError,
                                        },
                                        'JSON parse error for data'
                                    );
                                }
                            }
                        }
                    } catch (readError) {
                        log.error({ error: readError }, 'Error reading from stream');
                        await new Promise((resolve) => setTimeout(resolve, 1000));
                    }
                }
            } catch (streamError: any) {
                const totalTime = performance.now() - startTime;
                log.error(
                    {
                        error: streamError,
                        totalTimeMs: totalTime.toFixed(2),
                    },
                    'Fatal stream error'
                );
                setIsGenerating(false);
                if (streamError.name === 'AbortError') {
                    updateThreadItem(body.threadId, {
                        id: body.threadItemId,
                        status: 'ABORTED',
                        error: 'Generation aborted',
                    });
                } else if (streamError.message.includes('429')) {
                    updateThreadItem(body.threadId, {
                        id: body.threadItemId,
                        status: 'ERROR',
                        error: getRateLimitMessage.dailyLimit(isSignedIn),
                    });
                } else {
                    updateThreadItem(body.threadId, {
                        id: body.threadItemId,
                        status: 'ERROR',
                        error: 'Something went wrong. Please try again.',
                    });
                }
            } finally {
                setIsGenerating(false);

                const totalTime = performance.now() - startTime;
                log.info({ totalTimeMs: totalTime.toFixed(2) }, 'Stream completed');
            }
        },
        [
            setAbortController,
            setIsGenerating,
            updateThreadItem,
            handleThreadItemUpdate,
            isSignedIn,
            threadItemMap,
        ]
    );

    const handleSubmit = useCallback(
        async ({
            formData,
            newThreadId,
            existingThreadItemId,
            newChatMode,
            messages,
            useWebSearch,
            useMathCalculator,
            useCharts,
            showSuggestions,
        }: {
            formData: FormData;
            newThreadId?: string;
            existingThreadItemId?: string;
            newChatMode?: string;
            messages?: ThreadItem[];
            useWebSearch?: boolean;
            useMathCalculator?: boolean;
            useCharts?: boolean;
            showSuggestions?: boolean;
        }) => {
            log.info(
                { useWebSearch, useMathCalculator, useCharts },
                'Agent provider received flags'
            );

            const mode = (newChatMode || chatMode) as ChatMode;
            if (
                !isSignedIn &&
                !!ChatModeConfig[mode as keyof typeof ChatModeConfig]?.isAuthRequired
            ) {
                push('/login');

                return;
            }

            const threadId = currentThreadId?.toString() || newThreadId;
            if (!threadId) return;

            // Update thread title
            updateThread({ id: threadId, title: formData.get('query') as string });

            const optimisticAiThreadItemId = existingThreadItemId || nanoid();
            const query = formData.get('query') as string;
            const imageAttachment = formData.get('imageAttachment') as string;
            const documentAttachment = formData.get('documentAttachment') as string;
            const documentMimeType = formData.get('documentMimeType') as string;
            const documentFileName = formData.get('documentFileName') as string;
            const multiModalAttachmentsStr = formData.get('multiModalAttachments') as string;
            const multiModalAttachments = multiModalAttachmentsStr
                ? JSON.parse(multiModalAttachmentsStr)
                : undefined;

            const aiThreadItem: ThreadItem = {
                id: optimisticAiThreadItemId,
                createdAt: new Date(),
                updatedAt: new Date(),
                status: 'QUEUED',
                threadId,
                query,
                imageAttachment,
                documentAttachment: documentAttachment
                    ? {
                          base64: documentAttachment,
                          mimeType: documentMimeType,
                          fileName: documentFileName,
                      }
                    : undefined,
                attachments: multiModalAttachments,
                mode,
            };

            createThreadItem(aiThreadItem);
            setCurrentThreadItem(aiThreadItem);
            setIsGenerating(true);
            setCurrentSources([]);

            // Build core messages array
            const coreMessages = buildCoreMessagesFromThreadItems({
                messages: messages || [],
                query,
                imageAttachment,
                documentAttachment: documentAttachment
                    ? {
                          base64: documentAttachment,
                          mimeType: documentMimeType,
                          fileName: documentFileName,
                      }
                    : undefined,
                attachments: multiModalAttachments,
            });

            // Check if this is a free model that should use server-side API
            const isFreeModel = mode === ChatMode.GEMINI_2_5_FLASH_LITE;

            if (hasApiKeyForChatMode(mode, isSignedIn) && !isFreeModel) {
                const abortController = new AbortController();
                setAbortController(abortController);
                setIsGenerating(true);

                abortController.signal.addEventListener('abort', () => {
                    log.info({ threadId }, 'Abort signal received');
                    setIsGenerating(false);
                    abortWorkflow();
                    updateThreadItem(threadId, {
                        id: optimisticAiThreadItemId,
                        status: 'ABORTED',
                    });
                });

                log.info(
                    { useWebSearch, useMathCalculator, useCharts },
                    'About to call startWorkflow'
                );
                startWorkflow({
                    mode,
                    question: query,
                    threadId,
                    messages: coreMessages,
                    threadItemId: optimisticAiThreadItemId,
                    parentThreadItemId: '',
                    customInstructions,
                    webSearch: useWebSearch,
                    mathCalculator: useMathCalculator,
                    charts: useCharts, // Charts now available to all users
                    showSuggestions: showSuggestions ?? true,
                    apiKeys: getAllKeys(),
                    thinkingMode,
                    userTier: hasVtPlusAccess ? 'PLUS' : 'FREE',
                });
            } else {
                // Show API key modal if user is signed in but missing required API key
                // BUT NOT for free models which don't require user API keys
                if (isSignedIn && !isFreeModel) {
                    setModalChatMode(mode);
                    setShowApiKeyModal(true);
                    setIsGenerating(false);
                    return;
                }

                runAgent({
                    mode: newChatMode || chatMode,
                    prompt: query,
                    threadId,
                    messages: coreMessages,
                    threadItemId: optimisticAiThreadItemId,
                    customInstructions,
                    parentThreadItemId: '',
                    webSearch: useWebSearch,
                    mathCalculator: useMathCalculator,
                    charts: useCharts, // Charts now available to all users
                    showSuggestions: showSuggestions ?? true,
                    apiKeys: getAllKeys(),
                    userTier: hasVtPlusAccess ? 'PLUS' : 'FREE',
                });
            }
        },
        [
            isSignedIn,
            currentThreadId,
            chatMode,
            push,
            updateThread,
            createThreadItem,
            setCurrentThreadItem,
            setIsGenerating,
            setCurrentSources,
            abortWorkflow,
            startWorkflow,
            customInstructions,
            getAllKeys,
            hasApiKeyForChatMode,
            updateThreadItem,
            runAgent,
            setAbortController,
            thinkingMode,
            hasVtPlusAccess,
        ]
    );

    const updateContext = useCallback(
        (threadId: string, data: any) => {
            log.info({ contextData: data }, 'Updating context');
            updateThreadItem(threadId, {
                id: data.threadItemId,
                parentId: data.parentThreadItemId,
                threadId: data.threadId,
                metadata: data.context,
            });
        },
        [updateThreadItem]
    );

    const contextValue = useMemo(
        () => ({
            runAgent,
            handleSubmit,
            updateContext,
        }),
        [runAgent, handleSubmit, updateContext]
    );

    const handleApiKeyComplete = useCallback(() => {
        setShowApiKeyModal(false);
        // Retry the submission after API key is set
        // The form data would need to be preserved, but for now we'll just close the modal
        // In a real implementation, you might want to store the form data and retry automatically
    }, []);

    return (
        <AgentContext.Provider value={contextValue}>
            {children}
            <ApiKeyPromptModal
                chatMode={modalChatMode}
                isOpen={showApiKeyModal}
                onClose={() => setShowApiKeyModal(false)}
                onComplete={handleApiKeyComplete}
            />
        </AgentContext.Provider>
    );
};

export const useAgentStream = (): AgentContextType => {
    const context = useContext(AgentContext);
    if (!context) {
        throw new Error('useAgentStream must be used within an AgentProvider');
    }
    return context;
};

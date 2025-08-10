"use client";

import { getModelFromChatMode } from "@repo/ai/models";
import { ProviderErrorExtractor } from "@repo/ai/services/provider-error-extractor";
import { useWorkflowWorker } from "@repo/ai/worker";
import { ChatMode, ChatModeConfig } from "@repo/shared/config";
import { getRateLimitMessage } from "@repo/shared/constants";
import { UserTier } from "@repo/shared/constants/user-tiers";
import { useSession } from "@repo/shared/lib/auth-client";
import { generateThreadId } from "@repo/shared/lib/thread-id";
import { log } from "@repo/shared/logger";
import type { ThreadItem } from "@repo/shared/types";
import { GEMINI_MODEL_ENUMS_ARRAY, buildCoreMessagesFromThreadItems } from "@repo/shared/utils";
import { useToast } from "@repo/ui/src/components/use-sonner-toast";
import { useParams, useRouter } from "next/navigation";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";
import { ApiKeyPromptModal } from "../components/api-key-prompt-modal";
import { useApiKeysStore, useChatStore } from "../store";
import { isGeminiModel } from "../utils/document-processing";
import { useGenerationTimeout } from "./use-generation-timeout";
import { useVtPlusAccess } from "./use-subscription-access";

// Define common event types to reduce repetition - using as const to prevent Fast Refresh issues
const EVENT_TYPES = [
    "steps",
    "sources",
    "answer",
    "error",
    "status",
    "suggestions",
    "toolCalls",
    "toolResults",
    "object",
    "toolRouter",
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

    // Add unique instance ID for debugging
    const instanceId = useRef(Math.random().toString(36).substring(7));

    useEffect(() => {
        log.info("🏗️ AgentProvider instance created", { instanceId: instanceId.current });
        return () => {
            log.info("🗑️ AgentProvider instance destroyed", { instanceId: instanceId.current });
        };
    }, []);

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
    const { toast } = useToast();

    // Track active abort controllers for cleanup
    const activeControllersRef = useRef<Set<AbortController>>(new Set());

    // Debounce rapid submission attempts
    const lastSubmissionRef = useRef<number>(0);
    const SUBMISSION_DEBOUNCE_MS = 500;

    // Track active submissions to prevent duplicates
    const activeSubmissionRef = useRef<string | null>(null);

    // Store setters for syncing tool states
    const _setUseMathCalculator = useChatStore((state) => state.setUseMathCalculator);
    const _setUseWebSearch = useChatStore((state) => state.setUseWebSearch);
    const _setUseCharts = useChatStore((state) => state.setUseCharts);

    // Enable timeout tracking for generation
    useGenerationTimeout({
        timeoutThreshold: 5000, // Show timeout indicator after 5 seconds
        slowResponseThreshold: 15000, // Consider slow after 15 seconds
        enabled: true,
    });

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
            _shouldPersistToDB = true,
        ) => {
            const prevItem = threadItemMap.get(threadItemId) || ({} as ThreadItem);

            // Extract reasoning from steps if present
            let reasoning = prevItem.reasoning;
            let reasoningDetails = prevItem.reasoningDetails;

            if (eventType === "steps" && eventData?.steps) {
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
            if (eventType === "answer" && eventData?.answer?.reasoningDetails) {
                reasoningDetails = eventData.answer.reasoningDetails;
            }

            const updatedItem: ThreadItem = {
                ...prevItem,
                query: eventData?.query || prevItem.query || "",
                mode: eventData?.mode || prevItem.mode,
                threadId,
                parentId: parentThreadItemId || prevItem.parentId,
                id: threadItemId,
                object: eventData?.object || prevItem.object,
                reasoning,
                reasoningDetails,
                createdAt: prevItem.createdAt || new Date(),
                updatedAt: new Date(),
                ...(eventType === "answer"
                    ? {
                          answer: {
                              ...eventData.answer,
                              // Check if this is a complete text (fullText) or incremental chunk
                              text: eventData.answer.fullText
                                  ? eventData.answer.fullText // Use complete text directly
                                  : (prevItem.answer?.text || "") + eventData.answer.text, // Concatenate chunks
                          },
                      }
                    : { [eventType]: eventData[eventType] }),
            };

            threadItemMap.set(threadItemId, updatedItem);
            updateThreadItem(threadId, { ...updatedItem, persistToDB: true });
        },
        [threadItemMap, updateThreadItem],
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
                        data.parentThreadItemId,
                    );
                }

                if (data.type === "done") {
                    setIsGenerating(false);

                    // Handle workflow errors
                    if (data.status === "error") {
                        log.error(
                            { error: data.error, threadId: data.threadId },
                            "❌ Workflow error",
                        );
                        log.error(
                            { error: data.error, threadId: data.threadId },
                            "Workflow failed",
                        );

                        // Update thread item with error status - use ERROR status and error field for toast
                        if (data.threadItemId) {
                            updateThreadItem(data.threadId, {
                                id: data.threadItemId,
                                status: "ERROR",
                                error: data.error || "Workflow failed",
                                persistToDB: true,
                            });
                        }
                    }

                    // Don't delete the thread item from memory as it's needed for future reference
                    // The threadItemMap serves as a cache and should retain completed items
                }
            },
            [handleThreadItemUpdate, setIsGenerating, updateThreadItem],
        ),
    );

    // Setup page cleanup listeners
    useEffect(() => {
        const activeControllers = activeControllersRef.current;

        const handleBeforeUnload = () => {
            log.info("Page unloading, aborting active connections");
            activeControllers.forEach((controller) => {
                if (!controller.signal.aborted) {
                    controller.abort();
                }
            });
            activeControllers.clear();
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                log.debug("Tab hidden, connections will timeout naturally");
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            // Cleanup any remaining connections
            activeControllers.forEach((controller) => {
                if (!controller.signal.aborted) {
                    controller.abort();
                }
            });
        };
    }, []);

    const runAgent = useCallback(
        async (body: any) => {
            const abortController = new AbortController();
            setAbortController(abortController);

            // Track this controller for cleanup
            activeControllersRef.current.add(abortController);

            setIsGenerating(true);
            const startTime = performance.now();

            abortController.signal.addEventListener("abort", () => {
                log.info({ threadId: body.threadId }, "Abort controller triggered");
                setIsGenerating(false);
                log.info("🧹 Clearing active submission in abort handler", {
                    previousActiveSubmission: activeSubmissionRef.current,
                });
                activeSubmissionRef.current = null; // Clear active submission

                // Only mark as ABORTED if the abort was not due to cleanup for new conversation
                // Check if this is a user-initiated abort vs cleanup abort
                if (!abortController.signal.reason || abortController.signal.reason !== "cleanup") {
                    updateThreadItem(body.threadId, {
                        id: body.threadItemId,
                        status: "ABORTED",
                        error: "Generation stopped",
                        persistToDB: true,
                    });
                } else {
                    // For cleanup aborts, mark as completed if there's content
                    // Don't set error message to prevent flashing alerts
                    const threadItem = threadItemMap.get(body.threadItemId);
                    if (threadItem?.answer?.text) {
                        updateThreadItem(body.threadId, {
                            id: body.threadItemId,
                            status: "COMPLETED",
                            persistToDB: true,
                        });
                    }
                }

                // Remove from tracking
                activeControllersRef.current.delete(abortController);
            });

            try {
                const response = await fetch("/api/completion", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                    credentials: "include",
                    cache: "no-store",
                    signal: abortController.signal,
                });

                if (!response.ok) {
                    const errorText = await response.text();

                    // Use ProviderErrorExtractor to get structured error information
                    let finalErrorMessage = errorText;
                    let errorTitle = "API Error";

                    try {
                        const errorData = JSON.parse(errorText);
                        const errorResult = ProviderErrorExtractor.extractError(errorData);

                        if (errorResult.success && errorResult.error) {
                            finalErrorMessage = errorResult.error.userMessage;
                            // Add suggested action to the error message for better user guidance
                            if (errorResult.error.suggestedAction) {
                                finalErrorMessage += ` ${errorResult.error.suggestedAction}`;
                            }
                            errorTitle = `${errorResult.error.provider} Error`;
                        } else if (errorResult.fallbackMessage) {
                            finalErrorMessage = errorResult.fallbackMessage;
                        } else if (errorData.message) {
                            finalErrorMessage = errorData.message;
                        } else if (errorData.error?.message) {
                            finalErrorMessage = errorData.error.message;
                        } else if (errorData.detail) {
                            finalErrorMessage = errorData.detail;
                        }
                    } catch {
                        // If JSON parsing or extraction fails, try to extract error with ProviderErrorExtractor directly
                        const errorResult = ProviderErrorExtractor.extractError(errorText);
                        if (errorResult.success && errorResult.error) {
                            finalErrorMessage = errorResult.error.userMessage;
                            if (errorResult.error.suggestedAction) {
                                finalErrorMessage += ` ${errorResult.error.suggestedAction}`;
                            }
                            errorTitle = `${errorResult.error.provider} Error`;
                        } else if (errorResult.fallbackMessage) {
                            finalErrorMessage = errorResult.fallbackMessage;
                        }
                    }

                    // Handle specific error status codes
                    if (response.status === 429) {
                        try {
                            const errorData = JSON.parse(errorText);
                            if (errorData.limitType === "daily_limit_exceeded") {
                                finalErrorMessage = getRateLimitMessage.dailyLimit(
                                    isSignedIn,
                                    hasVtPlusAccess,
                                );
                            } else {
                                finalErrorMessage = getRateLimitMessage.minuteLimit(
                                    isSignedIn,
                                    hasVtPlusAccess,
                                );
                            }
                        } catch {
                            // Fallback if JSON parsing fails
                            finalErrorMessage = getRateLimitMessage.dailyLimit(
                                isSignedIn,
                                hasVtPlusAccess,
                            );
                        }
                    } else if (response.status === 403) {
                        // Handle 403 errors with structured error responses
                        try {
                            const errorData = JSON.parse(errorText);

                            // Handle VT+ subscription required errors (Gemini models)
                            if (
                                errorData.error === "VT+ subscription required" &&
                                errorData.upgradeUrl
                            ) {
                                finalErrorMessage = errorData.message || finalErrorMessage;
                                // Note: The structured error includes upgradeUrl and usageSettingsAction
                                // These could be used to show actionable buttons in the UI
                            }
                            // Handle X.AI credit issues
                            else if (
                                finalErrorMessage.includes("doesn't have any credits yet") ||
                                finalErrorMessage.includes("console.x.ai")
                            ) {
                                finalErrorMessage = `X.AI Credits Required: ${finalErrorMessage}`;
                            } else {
                                // Use the parsed message or fallback to generic message
                                finalErrorMessage =
                                    errorData.message ||
                                    `Access Denied (${response.status}): ${finalErrorMessage}`;
                            }
                        } catch {
                            // Fallback for non-JSON 403 responses
                            if (
                                finalErrorMessage.includes("doesn't have any credits yet") ||
                                finalErrorMessage.includes("console.x.ai")
                            ) {
                                finalErrorMessage = `X.AI Credits Required: ${finalErrorMessage}`;
                            } else {
                                finalErrorMessage = `Access Denied (${response.status}): ${finalErrorMessage}`;
                            }
                        }
                    } else if (response.status === 400) {
                        // For 400 errors, use the extracted message or provide context
                        if (!finalErrorMessage || finalErrorMessage === errorText) {
                            finalErrorMessage = `API Error (${response.status}): ${finalErrorMessage}`;
                        }
                    } else if (response.status >= 500) {
                        finalErrorMessage = `Service Error (${response.status}): ${finalErrorMessage || "Internal server error"}`;
                    }

                    setIsGenerating(false);
                    updateThreadItem(body.threadId, {
                        id: body.threadItemId,
                        status: "ERROR",
                        error: finalErrorMessage,
                        persistToDB: true,
                    });
                    log.error({ errorText, status: response.status }, "Error response received");

                    // Show error message to user using Sonner
                    toast({
                        title: errorTitle,
                        description: finalErrorMessage,
                        variant: "destructive",
                        duration: 5000,
                    });

                    // Throw the parsed error message instead of generic HTTP status
                    throw new Error(finalErrorMessage || `HTTP error! status: ${response.status}`);
                }

                if (!response.body) {
                    throw new Error("No response body received");
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let lastDbUpdate = Date.now();
                const DB_UPDATE_INTERVAL = 1000;
                let eventCount = 0;
                const streamStartTime = performance.now();

                let buffer = "";
                let consecutiveErrors = 0;

                while (true) {
                    try {
                        const { value, done } = await reader.read();
                        if (done) break;

                        // Reset consecutive errors on successful read
                        consecutiveErrors = 0;

                        buffer += decoder.decode(value, { stream: true });
                        const messages = buffer.split("\n\n");
                        buffer = messages.pop() || "";

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
                                            shouldPersistToDB,
                                        );
                                        if (shouldPersistToDB) {
                                            lastDbUpdate = Date.now();
                                        }
                                    } else if (currentEvent === "done" && data.type === "done") {
                                        setIsGenerating(false);
                                        const streamDuration = performance.now() - streamStartTime;
                                        log.info(
                                            {
                                                eventCount,
                                                streamDurationMs: streamDuration.toFixed(2),
                                            },
                                            "done event received",
                                        );

                                        // Handle quota exceeded specifically
                                        if (data.status === "quota_exceeded") {
                                            log.warn({ error: data.error }, "VT+ quota exceeded");
                                            // Error will be handled by the thread item component
                                        }

                                        // Record rate limit usage for successful Gemini completions
                                        if (
                                            data.status !== "error" &&
                                            data.status !== "aborted" &&
                                            data.status !== "quota_exceeded"
                                        ) {
                                            const modelId = getModelFromChatMode(body.mode);
                                            const isGemini =
                                                GEMINI_MODEL_ENUMS_ARRAY.includes(modelId);

                                            if (isGemini) {
                                                fetch(
                                                    `/api/rate-limit/status?model=${encodeURIComponent(modelId)}`,
                                                    {
                                                        method: "POST",
                                                        credentials: "include",
                                                    },
                                                ).catch(() => {
                                                    // Fail silently - server-side safety net will handle recording
                                                });
                                            }
                                        }

                                        if (data.threadItemId) {
                                            threadItemMap.delete(data.threadItemId);
                                        }
                                        if (data.status === "error") {
                                            log.error({ error: data.error }, "Stream error");
                                        }
                                    }
                                } catch (jsonError) {
                                    log.warn(
                                        {
                                            rawData: dataMatch[1],
                                            error: jsonError,
                                        },
                                        "JSON parse error for data",
                                    );
                                }
                            }
                        }
                    } catch (readError: any) {
                        consecutiveErrors++;

                        // Check if this is a stream closed error or abort error
                        if (
                            readError.name === "AbortError" ||
                            readError.message?.includes("stream") ||
                            readError.message?.includes("closed") ||
                            readError.message?.includes("cancelled")
                        ) {
                            log.info("Stream was closed or aborted, ending read loop");
                            break;
                        }

                        // If we've had too many consecutive errors, break the loop
                        if (consecutiveErrors > 3) {
                            log.error("Too many consecutive stream read errors, breaking loop");
                            break;
                        }

                        // For other errors, log and retry with backoff
                        log.error(
                            { error: readError, consecutiveErrors },
                            "Error reading from stream",
                        );
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
                    "Fatal stream error",
                );
                setIsGenerating(false);

                // Extract meaningful error message using ProviderErrorExtractor
                let errorMessage = "Something went wrong. Please try again.";
                let errorTitle = "Stream Error";

                if (streamError.name === "AbortError") {
                    updateThreadItem(body.threadId, {
                        id: body.threadItemId,
                        status: "ABORTED",
                        error: "Generation aborted",
                        persistToDB: true,
                    });
                    return; // Early return for abort errors
                }

                // Use ProviderErrorExtractor to get structured error information
                const errorResult = ProviderErrorExtractor.extractError(streamError);

                if (errorResult.success && errorResult.error) {
                    errorMessage = errorResult.error.userMessage;
                    // Add suggested action to the error message for better user guidance
                    if (errorResult.error.suggestedAction) {
                        errorMessage += ` ${errorResult.error.suggestedAction}`;
                    }
                    errorTitle = `${errorResult.error.provider} Error`;
                } else if (errorResult.fallbackMessage) {
                    errorMessage = errorResult.fallbackMessage;
                } else if (streamError.message) {
                    const errorMsg = streamError.message.toLowerCase();

                    if (errorMsg.includes("429") || errorMsg.includes("rate limit")) {
                        errorMessage = getRateLimitMessage.dailyLimit(isSignedIn, hasVtPlusAccess);
                    } else if (
                        errorMsg.includes("credit balance") ||
                        errorMsg.includes("too low")
                    ) {
                        errorMessage =
                            "Your credit balance is too low to access the API. Please go to Plans & Billing to upgrade or purchase credits.";
                    } else if (
                        errorMsg.includes("unauthorized") ||
                        errorMsg.includes("invalid api key")
                    ) {
                        errorMessage =
                            "Authentication failed. Please check your API key in settings.";
                    } else if (
                        errorMsg.includes("503") ||
                        errorMsg.includes("service unavailable")
                    ) {
                        errorMessage =
                            "Service is temporarily unavailable. Please try again later.";
                    } else if (errorMsg.includes("network") || errorMsg.includes("connection")) {
                        errorMessage =
                            "Network error occurred. Please check your connection and try again.";
                    } else if (streamError.message.length < 200) {
                        // Use the actual error message if it's not too long
                        errorMessage = streamError.message;
                    }
                }

                updateThreadItem(body.threadId, {
                    id: body.threadItemId,
                    status: "ERROR",
                    error: errorMessage,
                    persistToDB: true,
                });

                // Show error message to user using Sonner
                toast({
                    title: errorTitle,
                    description: errorMessage,
                    variant: "destructive",
                    duration: 5000,
                });
            } finally {
                setIsGenerating(false);
                log.info("🧹 Clearing active submission in runAgent finally block", {
                    previousActiveSubmission: activeSubmissionRef.current,
                });
                activeSubmissionRef.current = null; // Clear active submission

                // Remove from tracking and cleanup
                activeControllersRef.current.delete(abortController);

                const totalTime = performance.now() - startTime;
                log.info({ totalTimeMs: totalTime.toFixed(2) }, "Stream completed");
            }
        },
        [
            setAbortController,
            setIsGenerating,
            updateThreadItem,
            handleThreadItemUpdate,
            isSignedIn,
            hasVtPlusAccess,
            threadItemMap,
        ],
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
            const query = formData.get("query") as string;
            log.info("🚀 handleSubmit called", {
                instanceId: instanceId.current,
                query: query?.substring(0, 50) + "...",
                newThreadId,
                existingThreadItemId,
                activeSubmission: activeSubmissionRef.current,
            });

            // Stop any existing generation before starting new conversation
            // This prevents old streaming text from continuing when starting new chat
            const { stopGeneration } = useChatStore.getState();
            stopGeneration();

            // Clean up any tracked active controllers
            activeControllersRef.current.forEach((controller) => {
                if (!controller.signal.aborted) {
                    // Use "cleanup" reason to distinguish from user-initiated aborts
                    controller.abort("cleanup");
                }
            });
            activeControllersRef.current.clear();

            // Debounce rapid submissions
            const now = Date.now();
            if (now - lastSubmissionRef.current < SUBMISSION_DEBOUNCE_MS) {
                log.debug("Submission debounced - too frequent");
                return;
            }
            lastSubmissionRef.current = now;

            log.info(
                { useWebSearch, useMathCalculator, useCharts },
                "Agent provider received flags",
            );

            const mode = (newChatMode || chatMode) as ChatMode;
            if (
                !isSignedIn &&
                !!ChatModeConfig[mode as keyof typeof ChatModeConfig]?.isAuthRequired
            ) {
                push("/login");

                return;
            }

            const threadId = currentThreadId?.toString() || newThreadId;

            // Create a unique submission ID to prevent duplicates
            const submissionId = `${threadId}-${query}-${now}`;

            // Check if this exact submission is already in progress
            if (activeSubmissionRef.current === submissionId) {
                log.warn("🚫 Duplicate submission detected, ignoring", {
                    submissionId,
                    activeSubmission: activeSubmissionRef.current,
                    query: query.substring(0, 50) + "...",
                });
                return;
            }

            // Mark this submission as active
            activeSubmissionRef.current = submissionId;
            log.info("✅ Marking submission as active", {
                submissionId,
                query: query.substring(0, 50) + "...",
            });
            if (!threadId) return;

            // Update thread title
            updateThread({ id: threadId, title: query });

            const optimisticAiThreadItemId = existingThreadItemId || (await generateThreadId());
            const imageAttachment = formData.get("imageAttachment") as string;
            const documentAttachment = formData.get("documentAttachment") as string;
            const documentMimeType = formData.get("documentMimeType") as string;
            const documentFileName = formData.get("documentFileName") as string;
            const multiModalAttachmentsStr = formData.get("multiModalAttachments") as string;
            const multiModalAttachments = multiModalAttachmentsStr
                ? JSON.parse(multiModalAttachmentsStr)
                : undefined;

            const aiThreadItem: ThreadItem = {
                id: optimisticAiThreadItemId,
                createdAt: new Date(),
                updatedAt: new Date(),
                status: "QUEUED",
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

            // Import routing utilities
            const { shouldUseServerSideAPI: mustUseServer } = await import("../lib/ai-routing");
            const { logRoutingDecision, logExecutionPath } = await import("../lib/agent-submit");

            // Determine routing based on model, user tier, and features
            const shouldUseServerSideAPI = mustUseServer({
                mode,
                hasVtPlus: hasVtPlusAccess,
                deepResearch: mode === ChatMode.Deep,
                proSearch: mode === ChatMode.Pro,
            });

            // Log routing decision for debugging
            logRoutingDecision({
                mode,
                isFreeModel: mode === ChatMode.GEMINI_2_5_FLASH_LITE,
                hasVtPlusAccess,
                needsServerSide:
                    (hasVtPlusAccess &&
                        [ChatMode.CLAUDE_4_SONNET, ChatMode.GPT_4o].includes(mode)) ||
                    isGeminiModel(mode),
                shouldUseServerSideAPI,
                hasApiKey: hasApiKeyForChatMode(mode, isSignedIn, hasVtPlusAccess),
                deepResearch: mode === ChatMode.Deep,
                proSearch: mode === ChatMode.Pro,
            });

            if (
                hasApiKeyForChatMode(mode, isSignedIn, hasVtPlusAccess) &&
                !shouldUseServerSideAPI
            ) {
                logExecutionPath("client-workflow", mode);
                const abortController = new AbortController();
                setAbortController(abortController);
                setIsGenerating(true);

                abortController.signal.addEventListener("abort", () => {
                    log.info({ threadId }, "Abort signal received");
                    setIsGenerating(false);
                    abortWorkflow();
                    activeSubmissionRef.current = null; // Clear active submission

                    // Only mark as ABORTED if not a cleanup abort
                    if (
                        !abortController.signal.reason ||
                        abortController.signal.reason !== "cleanup"
                    ) {
                        updateThreadItem(threadId, {
                            id: optimisticAiThreadItemId,
                            status: "ABORTED",
                            error: "Generation stopped",
                        });
                    }
                });

                const apiKeys = getAllKeys();
                // SECURITY: Log workflow start without exposing API key metadata
                log.info(
                    { useWebSearch, useMathCalculator, useCharts },
                    "About to call startWorkflow",
                );
                log.info(
                    {
                        mode,
                        apiKeysConfigured:
                            Object.keys(apiKeys).filter((key) => apiKeys[key]).length > 0,
                    },
                    "🚀 Starting workflow with API keys",
                );

                // Clear active submission when workflow completes
                const originalOnFinish = onFinish;
                const wrappedOnFinish = (data: any) => {
                    activeSubmissionRef.current = null;
                    originalOnFinish?.(data);
                };

                startWorkflow({
                    mode,
                    question: query,
                    threadId,
                    messages: coreMessages,
                    threadItemId: optimisticAiThreadItemId,
                    parentThreadItemId: "",
                    customInstructions,
                    webSearch: useWebSearch,
                    mathCalculator: useMathCalculator,
                    charts: useCharts, // Charts now available to all users
                    showSuggestions: showSuggestions ?? true,
                    apiKeys: apiKeys,
                    thinkingMode,
                    userTier: hasVtPlusAccess ? UserTier.PLUS : UserTier.FREE,
                });
            } else {
                // Show API key modal if user is signed in but missing required API key
                // BUT NOT for free models or VT+ users with server-funded models which don't require user API keys
                if (isSignedIn && !shouldUseServerSideAPI) {
                    logExecutionPath("api-key-modal", mode);
                    setModalChatMode(mode);
                    setShowApiKeyModal(true);
                    setIsGenerating(false);
                    activeSubmissionRef.current = null; // Clear active submission
                    return;
                }

                logExecutionPath("server-api", mode);

                // For ALL server-side API calls, filter API keys based on model type
                const { filterApiKeysForServerSide } = await import("../lib/ai-routing");
                const serverApiKeys = getAllKeys();

                // A request to /api/completion is always a server-side call → we must filter on EVERY path
                const isServerFundedModel = [
                    ChatMode.GEMINI_2_5_FLASH_LITE, // Free server model
                    ...(hasVtPlusAccess
                        ? [ChatMode.GEMINI_2_5_PRO, ChatMode.GEMINI_2_5_FLASH]
                        : []), // VT+ server models
                ].includes(mode);

                const finalApiKeys = filterApiKeysForServerSide(
                    serverApiKeys,
                    mode,
                    isServerFundedModel,
                );

                if (isServerFundedModel) {
                    log.info({ mode }, "🔐 Server-funded model: Removed ALL provider API keys");
                } else {
                    log.info({ mode }, "🔑 BYOK model: Kept required provider API key only");
                }

                // Clear active submission when server API completes
                const clearActiveSubmission = () => {
                    activeSubmissionRef.current = null;
                };

                runAgent({
                    mode: newChatMode || chatMode,
                    prompt: query,
                    threadId,
                    messages: coreMessages,
                    threadItemId: optimisticAiThreadItemId,
                    customInstructions,
                    parentThreadItemId: "",
                    webSearch: useWebSearch,
                    mathCalculator: useMathCalculator,
                    charts: useCharts, // Charts now available to all users
                    showSuggestions: showSuggestions ?? true,
                    apiKeys: finalApiKeys,
                    userTier: hasVtPlusAccess ? UserTier.PLUS : UserTier.FREE,
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
        ],
    );

    const updateContext = useCallback(
        (threadId: string, data: any) => {
            log.info({ contextData: data }, "Updating context");
            updateThreadItem(threadId, {
                id: data.threadItemId,
                parentId: data.parentThreadItemId,
                threadId: data.threadId,
                metadata: data.context,
            });
        },
        [updateThreadItem],
    );

    const contextValue = useMemo(
        () => ({
            runAgent,
            handleSubmit,
            updateContext,
        }),
        [runAgent, handleSubmit, updateContext],
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
        throw new Error("useAgentStream must be used within an AgentProvider");
    }
    return context;
};

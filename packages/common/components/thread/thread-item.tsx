"use client";

import { isChartTool } from "@repo/common/constants/chart-tools";
import { isMathTool } from "@repo/common/constants/math-tools";
import { useAnimatedText, useMathCalculator } from "@repo/common/hooks";
import { useChatStore } from "@repo/common/store";
import type { ThreadItem as ThreadItemType } from "@repo/shared/types";
import { cn, useToast } from "@repo/ui";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { getErrorDiagnosticMessage } from "../../utils/error-diagnostics";
import { ChartComponent } from "../charts/chart-components";
import { DocumentSidePanel } from "../document-side-panel";
import { MathCalculatorIndicator } from "../math-calculator-indicator";
import { MotionSkeleton } from "../motion-skeleton";
import { RateLimitErrorAlert } from "../rate-limit-error-alert";
import { ThinkingLog } from "../thinking-log";
import { ThreadLoadingIndicator } from "../thread-loading-indicator";
import { ToolsPanel } from "../tools-panel";
import { CitationProvider } from "./citation-provider";
import { AIMessage } from "./components/ai-message";
import { SpeechButton } from "./components/speech-button";
import { Steps } from "./components/goals";
import { MessageActions } from "./components/message-actions";
import { QuestionPrompt } from "./components/question-prompt";
import { SourceGrid } from "./components/source-grid";
import { UserMessage } from "./components/user-message";

export const ThreadItem = memo(
    ({
        threadItem,
        isGenerating,
        isLast,
    }: {
        isAnimated: boolean;
        threadItem: ThreadItemType;
        isGenerating: boolean;
        isLast: boolean;
    }) => {
        // Determine if this thread item should animate
        // Only animate if it's the last item, currently generating, AND not already completed
        const shouldAnimate =
            isLast &&
            isGenerating &&
            !["COMPLETED", "ERROR", "ABORTED"].includes(threadItem.status || "");

        const { isAnimationComplete, text: animatedText } = useAnimatedText(
            threadItem.answer?.text || "",
            shouldAnimate,
        );
        const setCurrentSources = useChatStore((state) => state.setCurrentSources);
        const messageRef = useRef<HTMLDivElement>(null);
        const { useMathCalculator: mathCalculatorEnabled } = useMathCalculator();
        const { toast } = useToast();

        // Debounced status to prevent flashing during rapid status changes
        const [_debouncedStatus, setDebouncedStatus] = useState(threadItem.status);
        const [_debouncedError, setDebouncedError] = useState(threadItem.error);

        useEffect(() => {
            // Add a small delay to prevent flashing during rapid status transitions
            const timer = setTimeout(() => {
                setDebouncedStatus(threadItem.status);
                setDebouncedError(threadItem.error);
            }, 50); // 50ms delay to smooth out rapid changes

            return () => clearTimeout(timer);
        }, [threadItem.status, threadItem.error]);

        // Check if there are active math tool calls
        const hasMathToolCalls = Object.values(threadItem?.toolCalls || {}).some((toolCall) =>
            isMathTool(toolCall.toolName),
        );

        // Only show calculating indicator if generating AND there are no completed math results yet
        const hasCompletedMathResults = Object.values(threadItem?.toolResults || {}).some(
            (result) => isMathTool(result.toolName),
        );

        const isCalculatingMath =
            isLast &&
            isGenerating &&
            mathCalculatorEnabled &&
            hasMathToolCalls &&
            !hasCompletedMathResults;

        // Check for chart tool results
        const chartToolResults = Object.values(threadItem?.toolResults || {}).filter((result) =>
            isChartTool(result.toolName),
        );

        const { ref: inViewRef, inView } = useInView({});

        useEffect(() => {
            if (inView && threadItem.id) {
                useChatStore.getState().setActiveThreadItemView(threadItem.id);
            }
        }, [inView, threadItem.id]);

        useEffect(() => {
            const sources =
                Object.values(threadItem.steps || {})
                    ?.filter(
                        (step) =>
                            step.steps && "read" in step.steps && !!step.steps?.read?.data?.length,
                    )
                    .flatMap((step) => step.steps?.read?.data?.map((result: any) => result.link))
                    .filter((link): link is string => link !== undefined) || [];
            return setCurrentSources(sources);
        }, [threadItem, setCurrentSources]);

        // Show toast notification for API call failures
        useEffect(() => {
            const showErrorToast = async () => {
                if (
                    threadItem.error &&
                    (threadItem.status === "ERROR" || threadItem.status === "ABORTED")
                ) {
                    const errorMessage =
                        typeof threadItem.error === "string"
                            ? threadItem.error
                            : getErrorDiagnosticMessage(threadItem.error);

                    // Determine toast variant and title based on error type
                    let variant: "destructive" | "default" = "destructive";
                    let title = "API Call Failed";

                    const errorLower = errorMessage.toLowerCase();

                    // Use centralized error message service for consistent error categorization
                    try {
                        const { generateErrorMessage } = await import(
                            "@repo/ai/services/error-messages"
                        );
                        const structuredError = generateErrorMessage(errorMessage, {
                            // Add context if available from thread item
                            originalError: errorMessage,
                        });
                        title = structuredError.title;
                    } catch {
                        // Fallback to existing logic if service fails
                        if (
                            errorLower.includes("credit balance") ||
                            errorLower.includes("too low") ||
                            errorLower.includes("plans & billing")
                        ) {
                            title = "Credit Balance Too Low";
                        } else if (
                            errorLower.includes("x.ai credits required") ||
                            errorLower.includes("doesn't have any credits yet") ||
                            errorLower.includes("console.x.ai")
                        ) {
                            title = "X.AI Credits Required";
                        } else if (
                            errorLower.includes("rate limit") ||
                            errorLower.includes("quota")
                        ) {
                            title = "Rate Limit Exceeded";
                        } else if (
                            errorLower.includes("network") ||
                            errorLower.includes("connection") ||
                            errorLower.includes("networkerror")
                        ) {
                            title = "Network Error";
                        } else if (
                            errorLower.includes("unauthorized") ||
                            errorLower.includes("invalid api key") ||
                            errorLower.includes("authentication")
                        ) {
                            title = "Authentication Error";
                        } else if (
                            errorLower.includes("billing") ||
                            errorLower.includes("payment") ||
                            errorLower.includes("plans & billing")
                        ) {
                            title = "Billing Issue";
                        } else if (
                            errorLower.includes("503") ||
                            errorLower.includes("service unavailable") ||
                            errorLower.includes("502")
                        ) {
                            title = "Service Unavailable";
                        } else if (
                            errorLower.includes("aborted") ||
                            errorLower.includes("stopped") ||
                            errorLower.includes("cancelled")
                        ) {
                            title = "Request Cancelled";
                            variant = "default";
                        }
                    }

                    toast({
                        title,
                        description: errorMessage,
                        variant,
                        duration: 6000, // Show for 6 seconds for better readability
                    });
                }
            };

            showErrorToast();
        }, [threadItem.error, threadItem.status, toast]);

        const hasAnswer = useMemo(() => {
            return threadItem.answer?.text && threadItem.answer?.text.length > 0;
        }, [threadItem.answer]);

        const hasResponse = useMemo(() => {
            return (
                !!threadItem?.steps ||
                !!threadItem?.answer?.text ||
                !!threadItem?.object ||
                !!threadItem?.error ||
                threadItem?.status === "COMPLETED" ||
                threadItem?.status === "ABORTED" ||
                threadItem?.status === "ERROR"
            );
        }, [threadItem]);

        const steps = useMemo(() => {
            return Object.values(threadItem?.steps || {});
        }, [threadItem.steps]);

        const validSources = useMemo(() => {
            // Prefer explicit sources on the thread item
            let sources = threadItem.sources || [];

            // Fallback: extract links from steps.read.data if sources array is empty
            if (!sources.length) {
                const stepLinks =
                    Object.values(threadItem.steps || {})
                        ?.filter(
                            (step) =>
                                step.steps &&
                                "read" in step.steps &&
                                !!step.steps?.read?.data?.length,
                        )
                        .flatMap((step) =>
                            step.steps?.read?.data?.map(
                                (result: any, i: number) =>
                                    ({
                                        title:
                                            typeof result.title === "string" && result.title.trim()
                                                ? result.title
                                                : result.link,
                                        link: result.link,
                                        index:
                                            typeof result.index === "number"
                                                ? result.index
                                                : i,
                                    }) as {
                                        title: string;
                                        link: string;
                                        index: number;
                                    },
                            ),
                        )
                        .filter((r): r is { title: string; link: string; index: number } => !!r) ||
                    [];
                sources = stepLinks;
            }

            // Validate final list
            return sources.filter(
                (source) =>
                    source &&
                    typeof source.title === "string" &&
                    typeof source.link === "string" &&
                    source.link.trim() !== "" &&
                    typeof source.index === "number",
            );
        }, [threadItem.sources, threadItem.steps]);

        // Aggregated footer sources: dedupe and cap to max 5 for Deep Research & Pro Search
        const aggregatedFooterSources = useMemo(() => {
            const MAX = 5;
            const dedupMap = new Map<string, { title: string; link: string }>();
            for (const s of validSources) {
                try {
                    const u = new URL(s.link);
                    const key = `${u.hostname}${u.pathname}`;
                    if (!dedupMap.has(key)) {
                        dedupMap.set(key, { title: s.title, link: s.link });
                    }
                } catch {
                    // fallback when invalid URL
                    if (!dedupMap.has(s.link)) {
                        dedupMap.set(s.link, { title: s.title, link: s.link });
                    }
                }
                if (dedupMap.size >= MAX) break;
            }
            return Array.from(dedupMap.values()).slice(0, MAX);
        }, [validSources]);
        return (
            <CitationProvider sources={validSources}>
                <div className="w-full" id={`thread-item-${threadItem.id}`} ref={inViewRef}>
                    <div className={cn("flex w-full flex-col items-start gap-3 pt-4")}>
                        {threadItem.query && (
                            <UserMessage
                                imageAttachment={threadItem?.imageAttachment}
                                message={threadItem.query}
                                threadItem={threadItem}
                            />
                        )}
                        {threadItem.steps && <Steps steps={steps} threadItem={threadItem} />}

                        <ToolsPanel threadItem={threadItem} />

                        {isCalculatingMath && <MathCalculatorIndicator isCalculating={true} />}

                        {/* Enhanced loading indicator for generating responses */}
                        {isLast && isGenerating && !hasResponse && (
                            <ThreadLoadingIndicator className="mb-4" size="md" />
                        )}

                        {!hasResponse && !(isLast && isGenerating) && (
                            <div className="flex w-full flex-col items-start gap-2 opacity-10">
                                <MotionSkeleton className="bg-muted-foreground/40 mb-2 h-4 !w-[100px] rounded-sm" />
                                <MotionSkeleton className="w-full bg-gradient-to-r" />
                                <MotionSkeleton className="w-[70%] bg-gradient-to-r" />
                                <MotionSkeleton className="w-[50%] bg-gradient-to-r" />
                            </div>
                        )}

                        <div className="w-full transform-gpu" ref={messageRef}>
                            {hasAnswer && threadItem.answer?.text && (
                                <div className="flex flex-col gap-3">
                                    <SourceGrid sources={validSources} />

                                    {/* Show thinking log if reasoning data is available */}
                                    {(threadItem.reasoning ||
                                        threadItem.reasoningDetails?.length ||
                                        threadItem.parts?.some(
                                            (part) => part.type === "reasoning",
                                        )) && <ThinkingLog thread={threadItem} />}

                                    <AIMessage
                                        content={animatedText || ""}
                                        threadItem={threadItem}
                                        isGenerating={isGenerating && isLast}
                                        isLast={isLast}
                                        isCompleted={["COMPLETED", "ERROR", "ABORTED"].includes(
                                            threadItem.status || "",
                                        )}
                                    />

                                    {/* Inline compact sources preview under MDX content (above buttons) */}
                                    {["deep", "pro"].includes(
                                        String(threadItem.mode || "").toLowerCase(),
                                    ) &&
                                        aggregatedFooterSources.length > 0 && (
                                            <div className="mt-3 w-full">
                                                <p className="mb-1 text-xs font-medium text-muted-foreground">
                                                    Sources
                                                </p>
                                                <SourceGrid
                                                    sources={aggregatedFooterSources.map((s, i) => ({
                                                        title: s.title || s.link,
                                                        link: s.link,
                                                        index: i,
                                                    }))}
                                                />
                                            </div>
                                        )}
                                </div>
                            )}
                        </div>
                        <QuestionPrompt threadItem={threadItem} />
                        {threadItem.error && (
                            <RateLimitErrorAlert
                                error={
                                    typeof threadItem.error === "string"
                                        ? threadItem.error
                                        : getErrorDiagnosticMessage(threadItem.error)
                                }
                            />
                        )}

                        {isAnimationComplete &&
                            (threadItem.status === "COMPLETED" ||
                                threadItem.status === "ABORTED" ||
                                threadItem.status === "ERROR") && (
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2">
                                        <SpeechButton
                                            text={threadItem.answer?.text || ""}
                                            className="h-8 px-3"
                                        />
                                        <MessageActions
                                            isLast={isLast}
                                            ref={messageRef}
                                            threadItem={threadItem}
                                        />
                                    </div>

                                    {/* Render Chart Components */}
                                    {chartToolResults.length > 0 && (
                                        <div className="mt-4 w-full space-y-4">
                                            {chartToolResults.map((toolResult) => (
                                                <ChartComponent
                                                    chartData={toolResult.result}
                                                    key={toolResult.toolCallId}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {threadItem.documentAttachment && (
                                        <div className="flex justify-start">
                                            <DocumentSidePanel
                                                documentAttachment={threadItem.documentAttachment}
                                            />
                                        </div>
                                    )}

                                    {/* Footer sources removed to avoid duplication; shown above under MDX content */}
                                </div>
                            )}
                        {/* Follow-up suggestions are disabled entirely */}
                    </div>
                </div>
            </CitationProvider>
        );
    },
    // Custom comparison function to prevent unnecessary re-renders and flashing
    (prevProps, nextProps) => {
        // Only re-render if these specific properties change
        return (
            prevProps.threadItem.id === nextProps.threadItem.id &&
            prevProps.threadItem.status === nextProps.threadItem.status &&
            prevProps.threadItem.error === nextProps.threadItem.error &&
            prevProps.threadItem.answer?.text === nextProps.threadItem.answer?.text &&
            prevProps.threadItem.updatedAt?.getTime() ===
                nextProps.threadItem.updatedAt?.getTime() &&
            prevProps.isGenerating === nextProps.isGenerating &&
            prevProps.isLast === nextProps.isLast
        );
    },
);

ThreadItem.displayName = "ThreadItem";

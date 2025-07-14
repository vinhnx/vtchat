"use client";

import {
    ChartComponent,
    CitationProvider,
    DocumentSidePanel,
    MarkdownContent,
    MathCalculatorIndicator,
    Message,
    MessageActions,
    MotionSkeleton,
    QuestionPrompt,
    SourceGrid,
    Steps,
    ThinkingLog,
    ThreadLoadingIndicator,
    ToolsPanel,
} from "@repo/common/components";
import { isChartTool } from "@repo/common/constants/chart-tools";
import { isMathTool } from "@repo/common/constants/math-tools";
import { useAnimatedText, useMathCalculator } from "@repo/common/hooks";
import { useChatStore } from "@repo/common/store";
import type { ThreadItem as ThreadItemType } from "@repo/shared/types";
import { Alert, AlertDescription, cn, useToast } from "@repo/ui";
import { AlertCircle } from "lucide-react";
import { memo, useEffect, useMemo, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { getErrorDiagnosticMessage } from "../../utils/error-diagnostics";
import { RateLimitErrorAlert } from "../rate-limit-error-alert";

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
        const { isAnimationComplete, text: animatedText } = useAnimatedText(
            threadItem.answer?.text || "",
            isLast && isGenerating,
        );
        const setCurrentSources = useChatStore((state) => state.setCurrentSources);
        const messageRef = useRef<HTMLDivElement>(null);
        const { useMathCalculator: mathCalculatorEnabled } = useMathCalculator();
        const { toast } = useToast();

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

                if (errorLower.includes("credit balance") || errorLower.includes("too low")) {
                    title = "Credit Balance Too Low";
                } else if (
                    errorLower.includes("x.ai credits required") ||
                    errorLower.includes("doesn't have any credits yet") ||
                    errorLower.includes("console.x.ai")
                ) {
                    title = "X.AI Credits Required";
                } else if (errorLower.includes("rate limit") || errorLower.includes("quota")) {
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

                toast({
                    title,
                    description: errorMessage,
                    variant,
                    duration: 6000, // Show for 6 seconds for better readability
                });
            }
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
            const sources = threadItem.sources || [];
            return sources.filter(
                (source) =>
                    source &&
                    typeof source.title === "string" &&
                    typeof source.link === "string" &&
                    source.link.trim() !== "" &&
                    typeof source.index === "number",
            );
        }, [threadItem.sources]);
        return (
            <CitationProvider sources={validSources}>
                <div className="w-full" id={`thread-item-${threadItem.id}`} ref={inViewRef}>
                    <div className={cn("flex w-full flex-col items-start gap-3 pt-4")}>
                        {threadItem.query && (
                            <Message
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
                            <ThreadLoadingIndicator
                                className="mb-4"
                                size="md"
                                showElapsedTime={true}
                            />
                        )}

                        {!hasResponse && !(isLast && isGenerating) && (
                            <div className="flex w-full flex-col items-start gap-2 opacity-10">
                                <MotionSkeleton className="bg-muted-foreground/40 mb-2 h-4 !w-[100px] rounded-sm" />
                                <MotionSkeleton className="w-full bg-gradient-to-r" />
                                <MotionSkeleton className="w-[70%] bg-gradient-to-r" />
                                <MotionSkeleton className="w-[50%] bg-gradient-to-r" />
                            </div>
                        )}

                        <div className="w-full" ref={messageRef}>
                            {hasAnswer && threadItem.answer?.text && (
                                <div className="flex flex-col">
                                    <SourceGrid sources={validSources} />

                                    {/* Show thinking log if reasoning data is available */}
                                    {(threadItem.reasoning ||
                                        threadItem.reasoningDetails?.length ||
                                        threadItem.parts?.some(
                                            (part) => part.type === "reasoning",
                                        )) && <ThinkingLog threadItem={threadItem} />}

                                    <MarkdownContent
                                        content={animatedText || ""}
                                        isCompleted={["COMPLETED", "ERROR", "ABORTED"].includes(
                                            threadItem.status || "",
                                        )}
                                        isLast={isLast}
                                        key={`answer-${threadItem.id}`}
                                        shouldAnimate={
                                            !["COMPLETED", "ERROR", "ABORTED"].includes(
                                                threadItem.status || "",
                                            )
                                        }
                                    />
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

                        {threadItem.status === "ABORTED" && (
                            <Alert variant="warning">
                                <AlertDescription>
                                    <AlertCircle className="mt-0.5 size-3.5" />
                                    {threadItem.error ?? "Generation stopped"}
                                </AlertDescription>
                            </Alert>
                        )}

                        {isAnimationComplete &&
                            (threadItem.status === "COMPLETED" ||
                                threadItem.status === "ABORTED" ||
                                threadItem.status === "ERROR" ||
                                !isGenerating) && (
                                <div className="flex flex-col gap-3">
                                    <MessageActions
                                        isLast={isLast}
                                        ref={messageRef}
                                        threadItem={threadItem}
                                    />

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
                                </div>
                            )}
                        {/* Follow-up suggestions are disabled entirely */}
                    </div>
                </div>
            </CitationProvider>
        );
    },
    (prevProps, nextProps) => {
        return JSON.stringify(prevProps.threadItem) === JSON.stringify(nextProps.threadItem);
    },
);

ThreadItem.displayName = "ThreadItem";

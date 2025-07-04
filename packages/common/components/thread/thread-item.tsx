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
    ToolsPanel,
} from '@repo/common/components';
import { isChartTool } from '@repo/common/constants/chart-tools';
import { isMathTool } from '@repo/common/constants/math-tools';
import { useAnimatedText, useMathCalculator } from '@repo/common/hooks';
import { useChatStore } from '@repo/common/store';
import type { ThreadItem as ThreadItemType } from '@repo/shared/types';
import { Alert, AlertDescription, cn } from '@repo/ui';
import { AlertCircle, Book } from 'lucide-react';
import { memo, useEffect, useMemo, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { getErrorDiagnosticMessage } from '../../utils/error-diagnostics';
import { RateLimitErrorAlert } from '../rate-limit-error-alert';

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
            threadItem.answer?.text || '',
            isLast && isGenerating
        );
        const setCurrentSources = useChatStore((state) => state.setCurrentSources);
        const messageRef = useRef<HTMLDivElement>(null);
        const { useMathCalculator: mathCalculatorEnabled } = useMathCalculator();

        // Check if there are active math tool calls
        const hasMathToolCalls = Object.values(threadItem?.toolCalls || {}).some((toolCall) =>
            isMathTool(toolCall.toolName)
        );

        // Only show calculating indicator if generating AND there are no completed math results yet
        const hasCompletedMathResults = Object.values(threadItem?.toolResults || {}).some(
            (result) => isMathTool(result.toolName)
        );

        const isCalculatingMath =
            isLast &&
            isGenerating &&
            mathCalculatorEnabled &&
            hasMathToolCalls &&
            !hasCompletedMathResults;

        // Check for chart tool results
        const chartToolResults = Object.values(threadItem?.toolResults || {}).filter((result) =>
            isChartTool(result.toolName)
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
                            step.steps && 'read' in step.steps && !!step.steps?.read?.data?.length
                    )
                    .flatMap((step) => step.steps?.read?.data?.map((result: any) => result.link))
                    .filter((link): link is string => link !== undefined) || [];
            return setCurrentSources(sources);
        }, [threadItem, setCurrentSources]);

        const hasAnswer = useMemo(() => {
            return threadItem.answer?.text && threadItem.answer?.text.length > 0;
        }, [threadItem.answer]);

        const hasResponse = useMemo(() => {
            return (
                !!threadItem?.steps ||
                !!threadItem?.answer?.text ||
                !!threadItem?.object ||
                !!threadItem?.error ||
                threadItem?.status === 'COMPLETED' ||
                threadItem?.status === 'ABORTED' ||
                threadItem?.status === 'ERROR'
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
                    typeof source.title === 'string' &&
                    typeof source.link === 'string' &&
                    source.link.trim() !== '' &&
                    typeof source.index === 'number'
            );
        }, [threadItem.sources]);
        return (
            <CitationProvider sources={validSources}>
                <div className="w-full" id={`thread-item-${threadItem.id}`} ref={inViewRef}>
                    <div className={cn('flex w-full flex-col items-start gap-3 pt-4')}>
                        {threadItem.query && (
                            <Message
                                imageAttachment={threadItem?.imageAttachment}
                                message={threadItem.query}
                                threadItem={threadItem}
                            />
                        )}

                        <div className="text-muted-foreground flex flex-row items-center gap-1.5 text-xs font-medium">
                            <Book size={16} strokeWidth={2} />
                            Answer
                        </div>

                        {threadItem.steps && <Steps steps={steps} threadItem={threadItem} />}

                        <ToolsPanel threadItem={threadItem} />

                        {isCalculatingMath && <MathCalculatorIndicator isCalculating={true} />}

                        {!hasResponse && (
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
                                            (part) => part.type === 'reasoning'
                                        )) && <ThinkingLog threadItem={threadItem} />}

                                    <MarkdownContent
                                        content={animatedText || ''}
                                        isCompleted={['COMPLETED', 'ERROR', 'ABORTED'].includes(
                                            threadItem.status || ''
                                        )}
                                        isLast={isLast}
                                        key={`answer-${threadItem.id}`}
                                        shouldAnimate={
                                            !['COMPLETED', 'ERROR', 'ABORTED'].includes(
                                                threadItem.status || ''
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
                                    typeof threadItem.error === 'string'
                                        ? threadItem.error
                                        : getErrorDiagnosticMessage(threadItem.error)
                                }
                            />
                        )}

                        {threadItem.status === 'ABORTED' && (
                            <Alert variant="warning">
                                <AlertDescription>
                                    <AlertCircle className="mt-0.5 size-3.5" />
                                    {threadItem.error ?? 'Generation stopped'}
                                </AlertDescription>
                            </Alert>
                        )}

                        {isAnimationComplete &&
                            (threadItem.status === 'COMPLETED' ||
                                threadItem.status === 'ABORTED' ||
                                threadItem.status === 'ERROR' ||
                                !isGenerating) && (
                                <div className="flex flex-col gap-3">
                                    <MessageActions
                                        isLast={isLast}
                                        ref={messageRef}
                                        threadItem={threadItem}
                                    />

                                    {/* Render Chart Components */}
                                    {chartToolResults.length > 0 && (
                                        <div className="mt-4 space-y-4">
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
    }
);

ThreadItem.displayName = 'ThreadItem';

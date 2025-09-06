'use client';

import { Image as AIImage } from '@repo/common/components';
import { isChartTool } from '@repo/common/constants/chart-tools';
import { isMathTool } from '@repo/common/constants/math-tools';
import {
    useAnimatedText,
    useDebounced,
    useErrorToast,
    useMathCalculator,
} from '@repo/common/hooks';
import { useChatStore } from '@repo/common/store';
import type { ThreadItem as ThreadItemType } from '@repo/shared/types';
import { cn } from '@repo/ui';
import { memo, useEffect, useMemo, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { getErrorDiagnosticMessage } from '../../utils/error-diagnostics';
import { ChartComponent } from '../charts/chart-components';
import { DocumentSidePanel } from '../document-side-panel';
import { MathCalculatorIndicator } from '../math-calculator-indicator';
import { MotionSkeleton } from '../motion-skeleton';
import { RateLimitErrorAlert } from '../rate-limit-error-alert';
import { ThinkingLog } from '../thinking-log';
import { ThreadLoadingIndicator } from '../thread-loading-indicator';
import { ToolsPanel } from '../tools-panel';
import { CitationProvider } from './citation-provider';
import { AIMessage } from './components/ai-message';
import { Steps } from './components/goals';
import { MessageActions } from './components/message-actions';
import { QuestionPrompt } from './components/question-prompt';
import { SourceGrid } from './components/source-grid';
import { UserMessage } from './components/user-message';

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
        const shouldAnimate = isLast
            && isGenerating
            && !['COMPLETED', 'ERROR', 'ABORTED'].includes(threadItem.status || '');

        const { isAnimationComplete, text: animatedText } = useAnimatedText(
            threadItem.answer?.text || '',
            shouldAnimate,
        );
        const setCurrentSources = useChatStore((state) => state.setCurrentSources);
        const messageRef = useRef<HTMLDivElement>(null);
        const { useMathCalculator: mathCalculatorEnabled } = useMathCalculator();

        // Debounced status to prevent flashing during rapid status changes
        const debouncedStatus = useDebounced(threadItem.status, 50);
        const debouncedError = useDebounced(threadItem.error, 50);

        // Handle error toasts with custom hook
        useErrorToast({
            error: threadItem.error,
            status: threadItem.status,
        });

        // Check if there are active math tool calls
        const hasMathToolCalls = Object.values(threadItem?.toolCalls || {}).some((toolCall) =>
            isMathTool(toolCall.toolName)
        );

        // Only show calculating indicator if generating AND there are no completed math results yet
        const hasCompletedMathResults = Object.values(threadItem?.toolResults || {}).some(
            (result) => isMathTool(result.toolName),
        );

        const isCalculatingMath = isLast
            && isGenerating
            && mathCalculatorEnabled
            && hasMathToolCalls
            && !hasCompletedMathResults;

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

        // Extract sources and update store - using useMemo for derived state
        const extractedSources = useMemo(() => {
            return (
                Object.values(threadItem.steps || {})
                    ?.filter(
                        (step) =>
                            step.steps && 'read' in step.steps && !!step.steps?.read?.data?.length,
                    )
                    .flatMap((step) => step.steps?.read?.data?.map((result: any) => result.link))
                    .filter((link): link is string => link !== undefined) || []
            );
        }, [threadItem.steps]);

        // Update store when sources change - this is a side effect but necessary for global state
        useEffect(() => {
            setCurrentSources(extractedSources);
        }, [extractedSources, setCurrentSources]);

        const hasAnswer = useMemo(() => {
            return threadItem.answer?.text && threadItem.answer?.text.length > 0;
        }, [threadItem.answer]);

        const hasGeneratedImages = useMemo(() => {
            return Array.isArray(threadItem.imageOutputs) && threadItem.imageOutputs.length > 0;
        }, [threadItem.imageOutputs]);

        const hasResponse = useMemo(() => {
            return (
                !!threadItem?.steps
                || !!threadItem?.answer?.text
                || !!threadItem?.object
                || !!threadItem?.error
                || threadItem?.status === 'COMPLETED'
                || threadItem?.status === 'ABORTED'
                || threadItem?.status === 'ERROR'
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
                const stepLinks = Object.values(threadItem.steps || {})
                    ?.filter(
                        (step) =>
                            step.steps
                            && 'read' in step.steps
                            && !!step.steps?.read?.data?.length,
                    )
                    .flatMap((step) =>
                        step.steps?.read?.data?.map(
                            (result: any, i: number) =>
                                ({
                                    title: typeof result.title === 'string' && result.title.trim()
                                        ? result.title
                                        : result.link,
                                    link: result.link,
                                    index: typeof result.index === 'number' ? result.index : i,
                                }) as {
                                    title: string;
                                    link: string;
                                    index: number;
                                },
                        )
                    )
                    .filter((r): r is { title: string; link: string; index: number; } => !!r)
                    || [];
                sources = stepLinks;
            }

            // Validate final list
            return sources.filter(
                (source) =>
                    source
                    && typeof source.title === 'string'
                    && typeof source.link === 'string'
                    && source.link.trim() !== ''
                    && typeof source.index === 'number',
            );
        }, [threadItem.sources, threadItem.steps]);

        // Aggregated footer sources: dedupe and cap to max 5 for Deep Research & Pro Search
        const aggregatedFooterSources = useMemo(() => {
            const MAX = 5;
            const dedupMap = new Map<string, { title: string; link: string; }>();
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
                <div className='w-full' id={`thread-item-${threadItem.id}`} ref={inViewRef}>
                    <div className={cn('flex w-full flex-col items-start gap-3 pt-4')}>
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
                            <ThreadLoadingIndicator className='mb-4' size='md' />
                        )}

                        {!hasResponse && !(isLast && isGenerating) && (
                            <div className='flex w-full flex-col items-start gap-2 opacity-10'>
                                <MotionSkeleton className='bg-muted-foreground/40 mb-2 h-4 !w-[100px] rounded-sm' />
                                <MotionSkeleton className='w-full bg-gradient-to-r' />
                                <MotionSkeleton className='w-[70%] bg-gradient-to-r' />
                                <MotionSkeleton className='w-[50%] bg-gradient-to-r' />
                            </div>
                        )}

                        <div className='w-full transform-gpu' ref={messageRef}>
                            {hasAnswer && threadItem.answer?.text && (
                                <div className='flex flex-col gap-3'>
                                    <SourceGrid sources={validSources} />

                                    {/* Show thinking log if reasoning data is available */}
                                    {(threadItem.reasoning
                                        || threadItem.reasoningDetails?.length
                                        || threadItem.parts?.some(
                                            (part) => part.type === 'reasoning',
                                        )) && <ThinkingLog thread={threadItem} />}

                                    <AIMessage
                                        content={animatedText || ''}
                                        threadItem={threadItem}
                                        isGenerating={isGenerating && isLast}
                                        isLast={isLast}
                                        isCompleted={['COMPLETED', 'ERROR', 'ABORTED'].includes(
                                            threadItem.status || '',
                                        )}
                                    />

                                    {/* Inline compact sources preview under MDX content (above buttons) */}
                                    {['deep', 'pro'].includes(
                                        String(threadItem.mode || '').toLowerCase(),
                                    )
                                        && aggregatedFooterSources.length > 0 && (
                                        <div className='mt-3 w-full'>
                                            <p className='text-muted-foreground mb-1 text-xs font-medium'>
                                                Sources
                                            </p>
                                            <SourceGrid
                                                sources={aggregatedFooterSources.map(
                                                    (s, i) => ({
                                                        title: s.title || s.link,
                                                        link: s.link,
                                                        index: i,
                                                    }),
                                                )}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <QuestionPrompt threadItem={threadItem} />
                        {threadItem.error && (
                            <RateLimitErrorAlert
                                error={typeof threadItem.error === 'string'
                                    ? threadItem.error
                                    : getErrorDiagnosticMessage(threadItem.error)}
                            />
                        )}

                        {(threadItem.status === 'COMPLETED'
                            || threadItem.status === 'ABORTED'
                            || threadItem.status === 'ERROR'
                            || (!isGenerating && hasAnswer)) && ( // Show for completed threads or non-generating threads with answers
                                <>
                                    {!hasGeneratedImages && (
                                        <div className='mb-4 mt-2 flex flex-col gap-2'>
                                            <MessageActions
                                                isLast={isLast}
                                                ref={messageRef}
                                                threadItem={threadItem}
                                            />
                                        </div>
                                    )}

                                    {/* Render Chart Components */}
                                    {chartToolResults.length > 0 && (
                                        <div className='mt-4 w-full space-y-4'>
                                            {chartToolResults.map((toolResult) => (
                                                <ChartComponent
                                                    chartData={toolResult.result}
                                                    key={toolResult.toolCallId}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Render AI-generated images, if any */}
                                    {Array.isArray(threadItem.imageOutputs)
                                        && threadItem.imageOutputs.length > 0 && (
                                        <div className='mt-4 grid w-full grid-cols-1 gap-3 sm:grid-cols-2'>
                                            {threadItem.imageOutputs.map((img, idx) => {
                                                const dataUrl = img.dataUrl || undefined;
                                                const url = img.url || undefined;
                                                const mediaType = img.mediaType || undefined;
                                                if (!dataUrl && !url) return null;
                                                // Determine aspect ratio string for CSS, default to 16/9
                                                const ratioStr = (img as any).aspectRatio || '16:9';
                                                const [rw, rh] = ratioStr.split(/[:xX]/).map((n) =>
                                                    parseInt(n.trim(), 10)
                                                );
                                                const cssRatio = rw && rh
                                                    ? `${rw} / ${rh}`
                                                    : '16 / 9';
                                                return (
                                                    <div
                                                        className='border-border bg-muted overflow-hidden rounded-md border'
                                                        key={`${threadItem.id}-img-${idx}`}
                                                    >
                                                        {/* Use object-contain inside dynamic Aspect Ratio to avoid distortion */}
                                                        <div
                                                            className='relative w-full'
                                                            style={{ aspectRatio: cssRatio as any }}
                                                        >
                                                            <AIImage
                                                                alt={img.name || `generated-${idx}`}
                                                                dataUrl={dataUrl}
                                                                url={url}
                                                                mediaType={mediaType}
                                                                fill
                                                                sizes='(max-width: 768px) 100vw, 50vw'
                                                                priority={false}
                                                                className='object-contain'
                                                            />
                                                        </div>
                                                        {(img as any).aspectRatio && (
                                                            <div className='text-muted-foreground/70 px-2 py-1 text-[11px]'>
                                                                Aspect ratio:{' '}
                                                                {(img as any).aspectRatio}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {threadItem.documentAttachment && (
                                        <div className='flex justify-start'>
                                            <DocumentSidePanel
                                                documentAttachment={threadItem.documentAttachment}
                                            />
                                        </div>
                                    )}

                                    {/* Footer sources removed to avoid duplication; shown above under MDX content */}
                                </>
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
            prevProps.threadItem.id === nextProps.threadItem.id
            && prevProps.threadItem.status === nextProps.threadItem.status
            && prevProps.threadItem.error === nextProps.threadItem.error
            && prevProps.threadItem.answer?.text === nextProps.threadItem.answer?.text
            && prevProps.threadItem.updatedAt?.getTime()
                === nextProps.threadItem.updatedAt?.getTime()
            && prevProps.isGenerating === nextProps.isGenerating
            && prevProps.isLast === nextProps.isLast
        );
    },
);

ThreadItem.displayName = 'ThreadItem';

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
import type { Attachment, ThreadItem as ThreadItemType } from '@repo/shared/types';
import { AspectRatio, Button, cn } from '@repo/ui';
import { ZoomIn } from 'lucide-react';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useAgentStream } from '../../hooks/agent-provider';
import { getErrorDiagnosticMessage } from '../../utils/error-diagnostics';
import { ChartComponent } from '../charts/chart-components';
import { AttachmentPreviewModal } from '../chat-input/multi-modal-attachments-display';
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
        const getChatStore = useChatStore((state) => state);

        // Check if this is an image generation workflow by looking at thread context
        const isImageGenerationWorkflow = useMemo(() => {
            // Check if this thread item is explicitly marked as image generation
            if (threadItem.isImageGeneration) {
                return true;
            }

            // If threadItem has a parentId, check if any previous items in this thread had imageOutputs
            if (threadItem.parentId) {
                return true; // Likely an image edit/continuation
            }

            // Conservative fallback - only show for explicit image generation
            return false;
        }, [threadItem.isImageGeneration, threadItem.parentId]); // Determine if this thread item should animate
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
        const { handleSubmit } = useAgentStream();
        const [speaking, setSpeaking] = useState(false);
        const [imageZoomOpen, setImageZoomOpen] = useState(false);
        const [imageZoomIndex, setImageZoomIndex] = useState(0);

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

                        {/* Render skeleton placeholders for pending image generation ONLY */}
                        {threadItem.status === 'PENDING'
                            && threadItem.query
                            && (!Array.isArray(threadItem.imageOutputs)
                                || threadItem.imageOutputs.length === 0)
                            && isImageGenerationWorkflow
                            && (
                                <div className='mt-4 grid w-full grid-cols-1 gap-3 sm:grid-cols-2'>
                                    {/* Single skeleton placeholder */}
                                    <div className='border-border bg-muted/30 overflow-hidden rounded-md border relative group'>
                                        <AspectRatio ratio={1} className='relative'>
                                            {/* Gradient background */}
                                            <div className='absolute inset-0 bg-gradient-to-br from-muted/80 via-muted/40 to-muted/60' />

                                            {/* Animated shimmer overlay */}
                                            <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] -translate-x-full' />

                                            {/* Content */}
                                            <div className='absolute inset-0 flex flex-col items-center justify-center z-10'>
                                                {/* Icon with pulse */}
                                                <div className='bg-muted-foreground/20 rounded-full p-4 mb-3 animate-pulse'>
                                                    <svg
                                                        className='h-8 w-8 text-muted-foreground'
                                                        fill='none'
                                                        viewBox='0 0 24 24'
                                                        stroke='currentColor'
                                                    >
                                                        <path
                                                            strokeLinecap='round'
                                                            strokeLinejoin='round'
                                                            strokeWidth={1.5}
                                                            d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                                                        />
                                                    </svg>
                                                </div>

                                                {/* Status text with progressive prompt */}
                                                <div className='text-center px-4'>
                                                    <div className='text-sm font-medium text-muted-foreground mb-2'>
                                                        Generating image...
                                                    </div>
                                                    {threadItem.query && (
                                                        <div className='text-xs text-muted-foreground/80 mb-2 max-w-xs leading-relaxed'>
                                                            "{threadItem.query.length > 60
                                                                ? threadItem.query.slice(0, 60)
                                                                    + '...'
                                                                : threadItem.query}"
                                                        </div>
                                                    )}
                                                    <div className='text-xs text-muted-foreground/70'>
                                                        Using Gemini 2.5 Flash Image Preview
                                                    </div>
                                                </div>

                                                {/* Progress indicator */}
                                                <div className='mt-4 w-20 h-1 bg-muted-foreground/20 rounded-full overflow-hidden'>
                                                    <div className='h-full bg-muted-foreground/40 rounded-full animate-pulse w-1/2' />
                                                </div>
                                            </div>
                                        </AspectRatio>
                                    </div>
                                </div>
                            )}

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

                                                // Better aspect ratio detection: check for actual dimensions first
                                                let ratioNum = 1; // Default to square (1:1) for better image generation UX

                                                if ((img as any).aspectRatio) {
                                                    // Use provided aspect ratio if available
                                                    const ratioStr = (img as any).aspectRatio;
                                                    const [rw, rh] = ratioStr.split(/[:xX]/).map((
                                                        n: string,
                                                    ) => parseInt(n.trim(), 10));
                                                    if (rw && rh) {
                                                        ratioNum = rw / rh;
                                                    }
                                                } else if (
                                                    (img as any).width && (img as any).height
                                                ) {
                                                    // Calculate from actual dimensions if available
                                                    ratioNum = (img as any).width
                                                        / (img as any).height;
                                                }
                                                return (
                                                    <div
                                                        className='border-border bg-muted overflow-hidden rounded-md border'
                                                        key={`${threadItem.id}-img-${idx}`}
                                                    >
                                                        {/* Use object-contain within AspectRatio to avoid distortion */}
                                                        <AspectRatio
                                                            className='group cursor-zoom-in'
                                                            ratio={ratioNum}
                                                            role='button'
                                                            tabIndex={0}
                                                            onClick={(e) => {
                                                                const target = e
                                                                    .target as HTMLElement;
                                                                if (
                                                                    target.closest('button')
                                                                ) return;
                                                                setImageZoomIndex(idx);
                                                                setImageZoomOpen(true);
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (
                                                                    e.key === 'Enter'
                                                                    || e.key === ' '
                                                                ) {
                                                                    setImageZoomIndex(idx);
                                                                    setImageZoomOpen(true);
                                                                }
                                                            }}
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
                                                            <div className='pointer-events-none absolute inset-0 flex items-start justify-end p-2 opacity-0 transition-opacity group-hover:opacity-100'>
                                                                <div className='flex gap-1'>
                                                                    <Button
                                                                        className='pointer-events-auto h-6 px-2 text-[11px]'
                                                                        size='sm'
                                                                        variant='secondary'
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setImageZoomIndex(idx);
                                                                            setImageZoomOpen(true);
                                                                        }}
                                                                    >
                                                                        <ZoomIn className='h-3 w-3' />
                                                                    </Button>
                                                                    <Button
                                                                        className='pointer-events-auto h-6 px-2 text-[11px]'
                                                                        size='sm'
                                                                        variant='secondary'
                                                                        onClick={async () => {
                                                                            const attachment = {
                                                                                url: dataUrl || url
                                                                                    || '',
                                                                                name: img.name
                                                                                    || `image-${
                                                                                        idx + 1
                                                                                    }`,
                                                                                contentType:
                                                                                    mediaType
                                                                                    || 'image/png',
                                                                            };
                                                                            const formData =
                                                                                new FormData();
                                                                            formData.append(
                                                                                'multiModalAttachments',
                                                                                JSON.stringify([
                                                                                    attachment,
                                                                                ]),
                                                                            );
                                                                            formData.append(
                                                                                'query',
                                                                                'Describe this image based on the conversation context. Include key subjects, actions, setting, and any notable details. Avoid hallucinations.',
                                                                            );
                                                                            const threadItems =
                                                                                await useChatStore
                                                                                    .getState()
                                                                                    .getThreadItems(
                                                                                        threadItem
                                                                                            .threadId,
                                                                                    );
                                                                            handleSubmit({
                                                                                formData,
                                                                                messages:
                                                                                    threadItems,
                                                                            });
                                                                        }}
                                                                    >
                                                                        Describe
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </AspectRatio>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Fullscreen image viewer using shared attachment modal */}
                                    {Array.isArray(threadItem.imageOutputs)
                                        && threadItem.imageOutputs.length > 0 && (
                                        <AttachmentPreviewModal
                                            open={imageZoomOpen}
                                            onClose={() => setImageZoomOpen(false)}
                                            attachments={threadItem.imageOutputs.map((im, i) => {
                                                // Progressive image naming logic
                                                let imageName = '';

                                                if (im.name) {
                                                    // Use provided name if available
                                                    imageName = im.name;
                                                } else if (threadItem.query) {
                                                    // Use the generation prompt as the image name
                                                    const prompt = threadItem.query.trim();
                                                    const maxLength = 80; // Reasonable length for display

                                                    if (prompt.length <= maxLength) {
                                                        imageName = prompt;
                                                    } else {
                                                        // Smart truncation - try to break at word boundaries
                                                        const truncated = prompt.substring(
                                                            0,
                                                            maxLength,
                                                        );
                                                        const lastSpaceIndex = truncated
                                                            .lastIndexOf(' ');

                                                        if (lastSpaceIndex > maxLength * 0.7) {
                                                            // If we can find a good word boundary, use it
                                                            imageName = truncated.substring(
                                                                0,
                                                                lastSpaceIndex,
                                                            ) + '...';
                                                        } else {
                                                            // Otherwise, hard truncate with ellipsis
                                                            imageName = truncated + '...';
                                                        }
                                                    }

                                                    // Add image number if multiple images
                                                    if (
                                                        threadItem.imageOutputs
                                                        && threadItem.imageOutputs.length > 1
                                                    ) {
                                                        imageName = `${imageName} (${
                                                            i + 1
                                                        }/${threadItem.imageOutputs.length})`;
                                                    }
                                                } else {
                                                    // Fallback to generic name
                                                    imageName = threadItem.imageOutputs
                                                            && threadItem.imageOutputs.length > 1
                                                        ? `Generated Image ${
                                                            i + 1
                                                        } of ${threadItem.imageOutputs.length}`
                                                        : 'Generated Image';
                                                }

                                                return {
                                                    url: im.dataUrl || im.url || '',
                                                    name: imageName,
                                                    contentType: im.mediaType || 'image/png',
                                                };
                                            }) as Attachment[]}
                                            index={imageZoomIndex}
                                            setIndex={setImageZoomIndex}
                                        />
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

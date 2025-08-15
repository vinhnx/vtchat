import { MarkdownContent, SearchResultsList, StepStatus } from '@repo/common/components';
import type { Step } from '@repo/shared/types';
import { Badge, Label } from '@repo/ui';
import { Search } from 'lucide-react';

export type StepRendererType = {
    step: Step;
};

export const StepRenderer = ({ step }: StepRendererType) => {
    const isCompleted = step.status === 'COMPLETED';

    const renderTextStep = () => {
        if (step?.text) {
            return (
                <div className='text-muted-foreground text-sm leading-relaxed'>
                    <MarkdownContent
                        content={step.text}
                        isCompleted={isCompleted}
                        isLast={false}
                        shouldAnimate={!isCompleted}
                    />
                </div>
            );
        }
        return null;
    };

    const renderSearchStep = () => {
        if (step?.steps && 'search' in step.steps) {
            return (
                <div className='flex flex-col gap-3'>
                    <div className='flex flex-col gap-3'>
                        <div className='w-fit'>
                            <Label className='text-muted-foreground/80 text-xs font-medium'>
                                Searching
                            </Label>
                        </div>

                        <div className='flex flex-row flex-wrap gap-2'>
                            {Array.isArray(step.steps?.search?.data)
                                && step.steps?.search?.data?.map((query: string, index: number) => (
                                    <div key={index}>
                                        <Badge className='bg-muted/50 hover:bg-muted/70 border-border/50 transition-colors duration-200'>
                                            <Search className='mr-1.5 opacity-60' size={11} />
                                            <span className='text-xs'>{query}</span>
                                        </Badge>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            );
        }
    };

    const renderReadStep = () => {
        if (step?.steps && 'read' in step.steps) {
            return (
                <div className='flex flex-col gap-3'>
                    <div className='w-fit'>
                        <Label className='text-muted-foreground/80 text-xs font-medium'>
                            Reading
                        </Label>
                    </div>
                    <div>
                        <SearchResultsList
                            sources={Array.isArray(step.steps?.read?.data)
                                ? step.steps.read.data
                                : []}
                        />
                    </div>
                </div>
            );
        }
        return null;
    };

    const renderReasoningStep = () => {
        if (step?.steps && 'reasoning' in step.steps) {
            const reasoningData = typeof step.steps?.reasoningText?.data === 'string'
                ? step.steps.reasoningText.data
                : '';

            return (
                <div className='flex flex-col gap-3'>
                    <div className='w-fit'>
                        <Label className='text-muted-foreground/80 text-xs font-medium'>
                            Analyzing
                        </Label>
                    </div>
                    <div className='text-muted-foreground text-sm leading-relaxed'>
                        <MarkdownContent
                            content={reasoningData}
                            isCompleted={isCompleted}
                            isLast={false}
                            shouldAnimate={!isCompleted}
                        />
                    </div>
                </div>
            );
        }
        return null;
    };

    const renderWrapupStep = () => {
        if (step?.steps && 'wrapup' in step.steps) {
            return (
                <div className='flex flex-col gap-3'>
                    <div className='w-fit'>
                        <Label className='text-muted-foreground/80 text-xs font-medium'>
                            Wrapping up
                        </Label>
                    </div>
                    <div className='text-muted-foreground text-sm leading-relaxed'>
                        <MarkdownContent
                            content={step.steps?.wrapup?.data || ''}
                            isCompleted={isCompleted}
                            isLast={false}
                            shouldAnimate={!isCompleted}
                        />
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className='flex w-full flex-row items-stretch justify-start gap-3'>
            {/* Enhanced timeline indicator */}
            <div className='flex min-h-full shrink-0 flex-col items-center justify-start px-2'>
                <div className='bg-border/30 h-2 shrink-0' />

                <div className='bg-background z-10 p-1'>
                    <StepStatus status={step.status} />
                </div>

                <div
                    className='border-border/40 min-h-full w-[1px] flex-1 border-l border-dashed transition-opacity duration-500'
                    style={{
                        height: '100%',
                        opacity: isCompleted ? 0.6 : 0.3,
                    }}
                />
            </div>

            {/* Enhanced content area */}
            <div className='flex w-full flex-1 flex-col gap-5 overflow-hidden pb-3 pr-2'>
                {renderWrapupStep()}
                {renderTextStep()}
                {renderReasoningStep()}
                {renderSearchStep()}
                {renderReadStep()}
            </div>
        </div>
    );
};

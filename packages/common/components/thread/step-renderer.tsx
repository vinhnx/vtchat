import { MarkdownContent, SearchResultsList, StepStatus } from '@repo/common/components';
import type { Step } from '@repo/shared/types';
import { Badge, Label } from '@repo/ui';
import { Search } from 'lucide-react';

// Import AI Elements Task components
import { Task, TaskContent, TaskItem, TaskItemFile, TaskTrigger } from '@/components/ai-elements';

export type StepRendererType = {
    step: Step;
    useAIElements?: boolean; // Optional flag to use AI Elements Task component
};

// AI Elements version using Task component
export const AIElementsStepRenderer = ({ step }: StepRendererType) => {
    const getStatusFromStep = (step: Step): 'pending' | 'in_progress' | 'completed' | 'error' => {
        switch (step.status) {
            case 'PENDING':
                return 'pending';
            case 'QUEUED':
                return 'in_progress';
            case 'COMPLETED':
                return 'completed';
            case 'ERROR':
            case 'ABORTED':
                return 'error';
            default:
                return 'pending';
        }
    };

    const getTaskTitle = (step: Step): string => {
        if (step.text) {
            // Extract first line as title
            const firstLine = step.text.split('\n')[0];
            return firstLine.substring(0, 80) + (firstLine.length > 80 ? '...' : '');
        }
        if (step.steps?.search) {
            return 'Web Search';
        }
        if (step.steps?.read) {
            return 'Reading Sources';
        }
        if (step.steps?.reasoning) {
            return 'Analysis';
        }
        if (step.steps?.wrapup) {
            return 'Finalizing';
        }
        return 'Processing';
    };

    const renderTaskItems = () => {
        const items: React.ReactNode[] = [];

        // Add search items
        if (step.steps?.search && Array.isArray(step.steps.search.data)) {
            items.push(
                <TaskItem key="search">
                    Searching: {step.steps.search.data.map((query: string, index: number) => (
                        <span key={index} className="inline-flex items-center">
                            "{query}"{index < step.steps.search.data.length - 1 ? ', ' : ''}
                        </span>
                    ))}
                </TaskItem>
            );
        }

        // Add read items
        if (step.steps?.read && Array.isArray(step.steps.read.data)) {
            step.steps.read.data.forEach((source: any, index: number) => {
                items.push(
                    <TaskItem key={`read-${index}`}>
                        Read <TaskItemFile>{source.title || `Source ${index + 1}`}</TaskItemFile>
                    </TaskItem>
                );
            });
        }

        // Add reasoning item
        if (step.steps?.reasoning) {
            items.push(
                <TaskItem key="reasoning">
                    Analyzing information and formulating response
                </TaskItem>
            );
        }

        // Add wrapup item
        if (step.steps?.wrapup) {
            items.push(
                <TaskItem key="wrapup">
                    Finalizing response
                </TaskItem>
            );
        }

        // Add text content as task item if no specific steps
        if (step.text && items.length === 0) {
            const lines = step.text.split('\n').filter(line => line.trim());
            lines.slice(0, 5).forEach((line, index) => { // Show first 5 lines
                items.push(
                    <TaskItem key={`text-${index}`}>
                        {line.trim()}
                    </TaskItem>
                );
            });
        }

        return items;
    };

    return (
        <Task defaultOpen={step.status === 'COMPLETED'} className="mb-4">
            <TaskTrigger 
                title={getTaskTitle(step)}
                status={getStatusFromStep(step)}
            />
            <TaskContent>
                {renderTaskItems()}
            </TaskContent>
        </Task>
    );
};

// Legacy version (original implementation)
export const LegacyStepRenderer = ({ step }: StepRendererType) => {
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
            const reasoningData = typeof step.steps?.reasoning?.data === 'string'
                ? step.steps.reasoning.data
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

// Use AI Elements version by default, with fallback to legacy
export const StepRenderer = ({ step, useAIElements = true }: StepRendererType) => {
    if (useAIElements) {
        return <AIElementsStepRenderer step={step} />;
    }
    return <LegacyStepRenderer step={step} />;
};

StepRenderer.displayName = 'StepRenderer';
AIElementsStepRenderer.displayName = 'AIElementsStepRenderer';
LegacyStepRenderer.displayName = 'LegacyStepRenderer';

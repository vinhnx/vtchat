import {
    MotionSkeleton,
    StepRenderer,
    StepStatus,
    ToolCallStep,
    ToolResultStep,
} from '@repo/common/components';
import { useAppStore } from '@repo/common/store';
import { ChatMode } from '@repo/shared/config';
import type { Step, ThreadItem, ToolCall, ToolResult } from '@repo/shared/types';
import { Badge, Card } from '@repo/ui';
import { motion } from 'framer-motion';
import { Atom, ChevronRight, ListChecks, Star } from 'lucide-react';
import { memo, useEffect, useMemo } from 'react';

const getTitle = (threadItem: ThreadItem) => {
    if (threadItem.mode === ChatMode.Deep) {
        return 'Research';
    }
    if ([ChatMode.DEEPSEEK_R1].includes(threadItem.mode)) {
        return 'Thinking';
    }
    if (threadItem.mode === ChatMode.Pro) {
        return 'Grounding Web Search';
    }
    return 'Steps';
};

const getIcon = (threadItem: ThreadItem) => {
    if (threadItem.mode === ChatMode.Deep) {
        return <Atom className="text-muted-foreground" size={16} strokeWidth={2} />;
    }
    if (threadItem.mode === ChatMode.Pro) {
        return <Star className="text-muted-foreground" size={16} strokeWidth={2} />;
    }
    return <ListChecks className="text-muted-foreground" size={16} strokeWidth={2} />;
};

const getNote = (threadItem: ThreadItem) => {
    if (threadItem.mode === ChatMode.Deep) {
        return 'This process takes approximately 15 minutes. Please keep the tab open during this time.';
    }
    if (threadItem.mode === ChatMode.Pro) {
        return 'This process takes approximately 5 minutes. Please keep the tab open during this time.';
    }
    return '';
};

type ReasoningStepProps = {
    step: string;
};

type ToolStepProps = {
    toolCall?: ToolCall;
    toolResult?: ToolResult;
};

const ToolStep = memo(({ toolCall, toolResult }: ToolStepProps) => (
    <div className="flex w-full flex-row items-stretch justify-start gap-2">
        <div className="flex min-h-full flex-col items-center justify-start px-2">
            <div className="bg-border/50 h-1.5 shrink-0" />
            <div className="bg-background z-10">
                <StepStatus status="COMPLETED" />
            </div>
            <div className="bg-border/50 min-h-full w-[1px] flex-1" />
        </div>
        <div className="flex w-full flex-1 flex-col gap-2 overflow-hidden pb-2">
            <p className="text-sm">Using the following tool</p>
            {toolCall && <ToolCallStep toolCall={toolCall} />}
            {toolResult && <ToolResultStep toolResult={toolResult} />}
        </div>
    </div>
));

export const Steps = ({ steps, threadItem }: { steps: Step[]; threadItem: ThreadItem }) => {
    const openSideDrawer = useAppStore((state) => state.openSideDrawer);
    const dismissSideDrawer = useAppStore((state) => state.dismissSideDrawer);
    const updateSideDrawer = useAppStore((state) => state.updateSideDrawer);

    const isStopped = threadItem.status === 'ABORTED' || threadItem.status === 'ERROR';

    const isLoading = steps.some((step) => step.status === 'PENDING') && !isStopped;
    const hasAnswer =
        !!threadItem?.answer?.text &&
        (threadItem.status === 'COMPLETED' ||
            threadItem.status === 'ABORTED' ||
            threadItem.status === 'ERROR');

    useEffect(() => {
        if (hasAnswer) {
            dismissSideDrawer();
        }
    }, [hasAnswer]);

    useEffect(() => {
        if (steps[0]?.status === 'PENDING') {
            handleClick();
        }
    }, [steps[0]]);

    const toolCallAndResults = useMemo(() => {
        return Object.entries(threadItem?.toolCalls || {}).map(([key, toolCall]) => {
            const toolResult = threadItem?.toolResults?.[key];
            return {
                toolCall,
                toolResult,
            };
        });
    }, [threadItem?.toolCalls, threadItem?.toolResults]);

    const stepCounts = steps.length;

    useEffect(() => {
        if (steps.length > 0) {
            updateSideDrawer({
                renderContent: () => (
                    <div className="flex w-full flex-1 flex-col px-2 py-4">
                        {steps.map((step, index) => (
                            <StepRenderer key={index} step={step} />
                        ))}
                        {toolCallAndResults.map(({ toolCall, toolResult }, index) => (
                            <ToolStep
                                key={`tool-${index}`}
                                toolCall={toolCall}
                                toolResult={toolResult}
                            />
                        ))}
                    </div>
                ),
                badge: stepCounts,
                title: () => renderTitle(false),
            });
        }
    }, [steps, threadItem?.status]);

    const handleClick = () => {
        dismissSideDrawer();

        openSideDrawer({
            badge: stepCounts,
            title: `${getTitle(threadItem)} - Steps`,
            renderContent: () => (
                <div className="flex w-full flex-1 flex-col px-2 py-4">
                    {steps.map((step, index) => (
                        <StepRenderer key={index} step={step} />
                    ))}
                    {toolCallAndResults.map(({ toolCall, toolResult }, index) => (
                        <ToolStep
                            key={`tool-${index}`}
                            toolCall={toolCall}
                            toolResult={toolResult}
                        />
                    ))}
                </div>
            ),
        });
    };

    const renderTitle = (useNote = true) => {
        return (
            <div className="flex flex-row items-start gap-2">
                <div className="mt-0.5">
                    {isLoading ? (
                        <MotionSkeleton className="h-4 w-4 rounded" />
                    ) : (
                        getIcon(threadItem)
                    )}
                </div>
                <div className="flex flex-col">
                    <p className="text-sm font-medium">{getTitle(threadItem)}</p>
                    {useNote && !hasAnswer && (
                        <p className="text-muted-foreground/70 text-xs">{getNote(threadItem)}</p>
                    )}
                </div>
            </div>
        );
    };

    if (steps.length === 0 && !toolCallAndResults.length) {
        return null;
    }

    return (
        <>
            <Card className="border-muted/50 bg-muted/20 hover:bg-muted/30 w-full cursor-pointer transition-all duration-200">
                <motion.div
                    className="flex w-full flex-row items-center gap-3 p-3"
                    onClick={handleClick}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                >
                    <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-md">
                        {isLoading ? (
                            <MotionSkeleton className="h-4 w-4 rounded" />
                        ) : (
                            getIcon(threadItem)
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="text-foreground text-sm font-medium">
                            {getTitle(threadItem)}
                        </div>
                        {!hasAnswer && (
                            <div className="text-muted-foreground text-xs">
                                {getNote(threadItem)}
                            </div>
                        )}
                    </div>
                    <div className="flex-1" />
                    <Badge
                        className="border-muted-foreground/20 bg-muted/30 text-muted-foreground text-xs"
                        variant="secondary"
                    >
                        {stepCounts} {stepCounts === 1 ? 'Step' : 'Steps'}
                    </Badge>
                    <motion.div className="hover:bg-muted/60 rounded-md p-1" whileHover={{ x: 2 }}>
                        <ChevronRight className="text-muted-foreground" size={14} strokeWidth={2} />
                    </motion.div>
                </motion.div>
            </Card>
        </>
    );
};

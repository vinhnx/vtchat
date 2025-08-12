'use client';

import type { Thread } from '@repo/shared/types/thread';
import { formatDuration } from '@repo/shared/utils';
import { Badge, Button, Collapsible, CollapsibleContent, CollapsibleTrigger } from '@repo/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';

interface ThinkingLogProps {
    thread: Thread;
    className?: string;
    autoExpand?: boolean;
}

interface ThinkingStepProps {
    step: { content: string; timestamp?: number; };
    index: number;
}

function ThinkingStep({ step, index }: ThinkingStepProps) {
    return (
        <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 10 }}
            key={index}
            transition={{ delay: index * 0.05, duration: 0.3 }}
        >
            <div className='border-border bg-muted/20 rounded-lg border p-4'>
                <div className='text-muted-foreground whitespace-pre-wrap font-sans text-sm'>
                    {step.content}
                </div>
            </div>
        </motion.div>
    );
}

export function ThinkingLog({ thread, className = '', autoExpand = false }: ThinkingLogProps) {
    const [isOpen, setIsOpen] = useState(autoExpand);

    const thinkingData = useMemo(() => {
        if (!thread?.thinking) return null;

        try {
            const parsed = JSON.parse(thread.thinking);
            return {
                duration: parsed.totalDuration || 0,
                steps: parsed.steps || [],
                model: parsed.model || 'Unknown',
            };
        } catch {
            return null;
        }
    }, [thread?.thinking]);

    if (!thinkingData || thinkingData.steps.length === 0) {
        return null;
    }

    const toggleOpen = () => setIsOpen(!isOpen);

    return (
        <div className={`${className}`}>
            <Collapsible onOpenChange={setIsOpen} open={isOpen}>
                <CollapsibleTrigger asChild>
                    <Button
                        className='border-border bg-muted/30 hover:bg-muted/50 group mb-4 flex w-full items-center justify-between rounded-lg border p-4 transition-all duration-200'
                        onClick={toggleOpen}
                        variant='ghost'
                    >
                        <div className='flex items-center gap-3'>
                            <div className='bg-foreground h-4 w-4 flex-shrink-0 rounded' />
                            <span className='text-foreground text-sm font-medium'>
                                Thinking Process
                            </span>
                        </div>
                        <div className='flex items-center gap-3'>
                            <Badge variant='outline' className='text-foreground'>
                                {thinkingData.steps.length} steps
                            </Badge>
                            <span className='text-muted-foreground text-xs'>
                                {formatDuration(thinkingData.duration)}
                            </span>
                            <ChevronDown
                                className='text-foreground transition-transform duration-200 group-data-[state=open]:rotate-180'
                                size={16}
                            />
                        </div>
                    </Button>
                </CollapsibleTrigger>

                <AnimatePresence>
                    {isOpen && (
                        <CollapsibleContent forceMount>
                            <motion.div
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                initial={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className='border-border bg-muted/10 mt-3 rounded-lg border p-6 shadow-sm'>
                                    {/* Header */}
                                    <div className='border-border flex items-center gap-3 border-b pb-3'>
                                        <div className='bg-foreground h-4 w-4 rounded' />
                                        <span className='text-foreground text-sm font-medium'>
                                            Reasoning Steps ({thinkingData.steps.length})
                                        </span>
                                    </div>

                                    {/* Thinking Steps */}
                                    <div className='mt-4 max-h-96 touch-pan-y space-y-4 overflow-y-auto overscroll-contain'>
                                        {thinkingData.steps.map((step: any, index: number) => (
                                            <ThinkingStep key={index} step={step} index={index} />
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </CollapsibleContent>
                    )}
                </AnimatePresence>
            </Collapsible>
        </div>
    );
}

export type { ThinkingLogProps };

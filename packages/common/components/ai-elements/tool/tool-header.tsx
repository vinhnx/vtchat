'use client';

import { CollapsibleTrigger } from '@repo/ui';
import { Badge, cn } from '@repo/ui';
import { CheckCircle2, ChevronDown, Play, TriangleAlert, UploadCloud } from 'lucide-react';
import type { ComponentProps } from 'react';

export type ToolState = 'input-streaming' | 'input-available' | 'output-available' | 'output-error';

type ToolHeaderProps = {
    type: string;
    state: ToolState;
    className?: string;
} & Omit<ComponentProps<typeof CollapsibleTrigger>, 'className'>;

function StateBadge({ state }: { state: ToolState; }) {
    switch (state) {
        case 'input-streaming':
            return (
                <Badge
                    variant='outline'
                    className='border-amber-400/30 bg-amber-500/10 text-amber-600'
                >
                    <UploadCloud className='mr-1' size={12} />
                    Pending
                </Badge>
            );
        case 'input-available':
            return (
                <Badge
                    variant='outline'
                    className='border-blue-400/30 bg-blue-500/10 text-blue-600'
                >
                    <Play className='mr-1' size={12} />
                    Running
                </Badge>
            );
        case 'output-available':
            return (
                <Badge
                    variant='outline'
                    className='border-emerald-400/30 bg-emerald-500/10 text-emerald-600'
                >
                    <CheckCircle2 className='mr-1' size={12} />
                    Completed
                </Badge>
            );
        case 'output-error':
            return (
                <Badge variant='outline' className='border-red-400/30 bg-red-500/10 text-red-600'>
                    <TriangleAlert className='mr-1' size={12} />
                    Error
                </Badge>
            );
    }
}

export const ToolHeader = ({ type, state, className, ...props }: ToolHeaderProps) => {
    return (
        <CollapsibleTrigger
            className={cn(
                'bg-muted/30 hover:bg-muted/40 border-border/50 flex w-full items-center justify-between rounded-md border p-3 text-left outline-hidden transition-colors',
                className,
            )}
            {...props}
        >
            <div className='flex min-w-0 items-center gap-2'>
                <span className='text-muted-foreground truncate text-xs font-medium'>
                    {type}
                </span>
                <span className='text-muted-foreground/70 hidden text-xs md:inline'>•</span>
                <StateBadge state={state} />
            </div>
            <ChevronDown className='text-muted-foreground/80 shrink-0' size={16} />
        </CollapsibleTrigger>
    );
};

export default ToolHeader;

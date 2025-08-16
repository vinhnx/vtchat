'use client';

import { Badge, Collapsible, CollapsibleContent, CollapsibleTrigger } from '@repo/ui';
import { cn } from '@/lib/utils';
import { ChevronDown, FileText, CheckCircle, Clock, Loader2, AlertTriangle } from 'lucide-react';
import { forwardRef, useState } from 'react';

interface TaskProps extends React.ComponentProps<typeof Collapsible> {
    defaultOpen?: boolean;
}

interface TaskTriggerProps extends React.ComponentProps<typeof CollapsibleTrigger> {
    title: string;
    status?: 'pending' | 'in_progress' | 'completed' | 'error';
}

interface TaskContentProps extends React.ComponentProps<typeof CollapsibleContent> {}

interface TaskItemProps extends React.ComponentProps<'div'> {}

interface TaskItemFileProps extends React.ComponentProps<'div'> {}

const Task = forwardRef<
    React.ElementRef<typeof Collapsible>,
    TaskProps
>(({ defaultOpen = false, className, ...props }, ref) => {
    return (
        <Collapsible
            ref={ref}
            className={cn(
                'w-full rounded-lg border border-border/50 bg-card/50 hover:bg-card/80 transition-colors',
                className
            )}
            defaultOpen={defaultOpen}
            {...props}
        />
    );
});
Task.displayName = 'Task';

const TaskTrigger = forwardRef<
    React.ElementRef<typeof CollapsibleTrigger>,
    TaskTriggerProps
>(({ title, status = 'pending', className, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);

    const getStatusIcon = () => {
        switch (status) {
            case 'pending':
                return <Clock className="size-4 text-muted-foreground" />;
            case 'in_progress':
                return <Loader2 className="size-4 animate-spin text-blue-500" />;
            case 'completed':
                return <CheckCircle className="size-4 text-green-500" />;
            case 'error':
                return <AlertTriangle className="size-4 text-red-500" />;
            default:
                return <Clock className="size-4 text-muted-foreground" />;
        }
    };

    const getStatusBadge = () => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary" className="text-xs">Pending</Badge>;
            case 'in_progress':
                return <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700">In Progress</Badge>;
            case 'completed':
                return <Badge variant="secondary" className="text-xs bg-green-50 text-green-700">Completed</Badge>;
            case 'error':
                return <Badge variant="destructive" className="text-xs">Error</Badge>;
            default:
                return <Badge variant="secondary" className="text-xs">Unknown</Badge>;
        }
    };

    return (
        <CollapsibleTrigger
            ref={ref}
            asChild
            className={cn(
                'flex w-full cursor-pointer items-center justify-between gap-4 p-4 text-left transition-colors hover:bg-muted/30',
                className,
            )}
            onClick={() => setIsOpen(!isOpen)}
            {...props}
        >
            <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-3">
                    {getStatusIcon()}
                    <div className="flex flex-col gap-1">
                        <span className="font-medium text-foreground">{title}</span>
                        {getStatusBadge()}
                    </div>
                </div>
                <ChevronDown 
                    className={cn(
                        'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
                        isOpen ? 'rotate-180' : 'rotate-0'
                    )}
                />
            </div>
        </CollapsibleTrigger>
    );
});
TaskTrigger.displayName = 'TaskTrigger';

const TaskContent = forwardRef<
    React.ElementRef<typeof CollapsibleContent>,
    TaskContentProps
>(({ className, ...props }, ref) => {
    return (
        <CollapsibleContent
            ref={ref}
            className={cn('space-y-2 px-4 pb-4', className)}
            {...props}
        />
    );
});
TaskContent.displayName = 'TaskContent';

const TaskItem = forwardRef<
    HTMLDivElement,
    TaskItemProps
>(({ className, children, ...props }, ref) => {
    return (
        <div 
            ref={ref} 
            className={cn(
                'flex items-start gap-2 text-sm text-muted-foreground pl-2 py-1',
                className
            )} 
            {...props}
        >
            <div className="mt-1.5">
                <div className="size-1.5 rounded-full bg-muted-foreground/50" />
            </div>
            <div className="flex-1">{children}</div>
        </div>
    );
});
TaskItem.displayName = 'TaskItem';

const TaskItemFile = forwardRef<
    HTMLDivElement,
    TaskItemFileProps
>(({ className, children, ...props }, ref) => {
    return (
        <div 
            ref={ref} 
            className={cn(
                'inline-flex items-center gap-1.5 rounded-md bg-muted/50 px-2 py-1 text-xs font-mono',
                className
            )} 
            {...props}
        >
            <FileText className="size-3" />
            {children}
        </div>
    );
});
TaskItemFile.displayName = 'TaskItemFile';

export { Task, TaskContent, TaskItem, TaskItemFile, TaskTrigger };
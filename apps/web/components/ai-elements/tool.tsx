'use client';

import { Badge, Button, Collapsible, CollapsibleContent, CollapsibleTrigger } from '@repo/ui';
import { cn } from '@/lib/utils';
import { ChevronDown, Code, Settings, AlertTriangle, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { forwardRef, useState } from 'react';

interface ToolProps extends React.ComponentProps<typeof Collapsible> {
    defaultOpen?: boolean;
}

interface ToolHeaderProps extends React.ComponentProps<typeof CollapsibleTrigger> {
    type: string;
    state: 'input-streaming' | 'input-available' | 'output-available' | 'output-error';
    className?: string;
}

interface ToolContentProps extends React.ComponentProps<typeof CollapsibleContent> {}

interface ToolInputProps extends React.ComponentProps<'div'> {
    input: any;
}

interface ToolOutputProps extends React.ComponentProps<'div'> {
    output: React.ReactNode;
    errorText?: string;
}

const Tool = forwardRef<
    React.ElementRef<typeof Collapsible>,
    ToolProps
>(({ defaultOpen = false, className, ...props }, ref) => {
    return (
        <Collapsible
            ref={ref}
            className={cn('w-full', className)}
            defaultOpen={defaultOpen}
            {...props}
        />
    );
});
Tool.displayName = 'Tool';

const ToolHeader = forwardRef<
    React.ElementRef<typeof CollapsibleTrigger>,
    ToolHeaderProps
>(({ type, state, className, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);

    const getStateIcon = () => {
        switch (state) {
            case 'input-streaming':
                return <Loader2 className="size-4 animate-spin text-blue-500" />;
            case 'input-available':
                return <Clock className="size-4 text-orange-500" />;
            case 'output-available':
                return <CheckCircle className="size-4 text-green-500" />;
            case 'output-error':
                return <AlertTriangle className="size-4 text-red-500" />;
            default:
                return <Code className="size-4 text-muted-foreground" />;
        }
    };

    const getStateBadge = () => {
        switch (state) {
            case 'input-streaming':
                return 'Pending';
            case 'input-available':
                return 'Running';
            case 'output-available':
                return 'Completed';
            case 'output-error':
                return 'Error';
            default:
                return 'Unknown';
        }
    };

    const getStateColor = () => {
        switch (state) {
            case 'input-streaming':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'input-available':
                return 'bg-orange-50 text-orange-700 border-orange-200';
            case 'output-available':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'output-error':
                return 'bg-red-50 text-red-700 border-red-200';
            default:
                return 'bg-muted text-muted-foreground border-border';
        }
    };

    // Auto-open for completed tools or errors
    const shouldDefaultOpen = state === 'output-available' || state === 'output-error';

    return (
        <CollapsibleTrigger
            ref={ref}
            asChild
            className={cn(
                'flex w-full items-center justify-between gap-4 p-4 text-left transition-colors hover:bg-muted/50',
                className,
            )}
            onClick={() => setIsOpen(!isOpen)}
            {...props}
        >
            <Button variant="ghost" className="h-auto w-full justify-start p-0">
                <div className="flex w-full items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        {getStateIcon()}
                        <div className="flex flex-col gap-1">
                            <span className="font-medium">{type}</span>
                            <Badge variant="secondary" className={cn('text-xs', getStateColor())}>
                                {getStateBadge()}
                            </Badge>
                        </div>
                    </div>
                    <ChevronDown 
                        className={cn(
                            'size-4 shrink-0 transition-transform duration-200',
                            isOpen ? 'rotate-180' : 'rotate-0'
                        )}
                    />
                </div>
            </Button>
        </CollapsibleTrigger>
    );
});
ToolHeader.displayName = 'ToolHeader';

const ToolContent = forwardRef<
    React.ElementRef<typeof CollapsibleContent>,
    ToolContentProps
>(({ className, ...props }, ref) => {
    return (
        <CollapsibleContent
            ref={ref}
            className={cn('space-y-4 px-4 pb-4', className)}
            {...props}
        />
    );
});
ToolContent.displayName = 'ToolContent';

const ToolInput = forwardRef<
    HTMLDivElement,
    ToolInputProps
>(({ input, className, ...props }, ref) => {
    return (
        <div ref={ref} className={cn('space-y-2', className)} {...props}>
            <div className="flex items-center gap-2">
                <Settings className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Input</span>
            </div>
            <div className="rounded-md border bg-muted/30 p-3">
                <pre className="overflow-x-auto text-sm">
                    <code>{JSON.stringify(input, null, 2)}</code>
                </pre>
            </div>
        </div>
    );
});
ToolInput.displayName = 'ToolInput';

const ToolOutput = forwardRef<
    HTMLDivElement,
    ToolOutputProps
>(({ output, errorText, className, ...props }, ref) => {
    return (
        <div ref={ref} className={cn('space-y-2', className)} {...props}>
            <div className="flex items-center gap-2">
                <Code className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                    {errorText ? 'Error' : 'Output'}
                </span>
            </div>
            <div className={cn(
                'rounded-md border p-3',
                errorText 
                    ? 'border-red-200 bg-red-50 text-red-900' 
                    : 'bg-muted/30'
            )}>
                {errorText ? (
                    <div className="text-sm">{errorText}</div>
                ) : (
                    <div className="text-sm">{output}</div>
                )}
            </div>
        </div>
    );
});
ToolOutput.displayName = 'ToolOutput';

export { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput };
'use client';

import { CodeBlock, Response } from '@repo/common/components';
import { cn } from '@repo/ui';
import type { ComponentProps, ReactNode } from 'react';
import { isValidElement } from 'react';

type ToolOutputProps = {
    output: ReactNode;
    errorText?: string | null;
} & ComponentProps<'div'>;

export const ToolOutput = ({ output, errorText, className, ...rest }: ToolOutputProps) => {
    const renderOutput = () => {
        if (errorText) {
            return (
                <div className='border-red-200/40 bg-red-50/50 text-red-700 rounded-md border p-3 text-sm dark:border-red-300/20 dark:bg-red-950/20 dark:text-red-400'>
                    {errorText}
                </div>
            );
        }

        if (isValidElement(output)) return output;

        if (typeof output === 'string') {
            return (
                <Response className='prose-sm max-w-none'>
                    {output}
                </Response>
            );
        }

        try {
            const json = JSON.stringify(output, null, 2);
            return (
                <CodeBlock
                    className='border-border/50 rounded-md'
                    code={json}
                    lang='json'
                    showHeader={false}
                    variant='secondary'
                />
            );
        } catch {
            return <div className='text-sm text-muted-foreground'>Unsupported output</div>;
        }
    };

    return (
        <div className={cn('space-y-2', className)} {...rest}>
            <div className='text-xs font-medium text-muted-foreground'>Result</div>
            {renderOutput()}
        </div>
    );
};

export default ToolOutput;

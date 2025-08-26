'use client';

import { CodeBlock } from '@repo/common/components';
import type { ComponentProps } from 'react';

type ToolInputProps = {
    input: unknown;
} & ComponentProps<'div'>;

export const ToolInput = ({ input, ...rest }: ToolInputProps) => {
    const pretty = typeof input === 'string'
        ? input
        : JSON.stringify(input, null, 2);

    return (
        <div {...rest}>
            <div className='mb-2 text-xs font-medium text-muted-foreground'>Parameters</div>
            <CodeBlock
                className='border-border/50 rounded-md'
                code={pretty}
                lang='json'
                showHeader={false}
                variant='secondary'
            />
        </div>
    );
};

export default ToolInput;

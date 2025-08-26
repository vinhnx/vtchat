'use client';

import { CollapsibleContent } from '@repo/ui';
import type { ComponentProps, PropsWithChildren } from 'react';

type ToolContentProps = PropsWithChildren<ComponentProps<typeof CollapsibleContent>>;

export const ToolContent = ({ children, ...props }: ToolContentProps) => {
    return (
        <CollapsibleContent {...props}>
            <div className='border-border/50 bg-muted/20 rounded-md border p-3'>
                {children}
            </div>
        </CollapsibleContent>
    );
};

export default ToolContent;

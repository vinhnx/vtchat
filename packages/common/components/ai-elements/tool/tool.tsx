'use client';

import { Collapsible } from '@repo/ui';
import type { ComponentProps, PropsWithChildren } from 'react';

type ToolProps = PropsWithChildren<ComponentProps<typeof Collapsible>> & {
    defaultOpen?: boolean;
};

export const Tool = ({ children, defaultOpen = false, ...props }: ToolProps) => {
    return (
        <Collapsible defaultOpen={defaultOpen} {...props}>
            {children}
        </Collapsible>
    );
};

export default Tool;

'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import Link from 'next/link';
import * as React from 'react';

import { cn } from '../../lib/utils';

const internalLinksVariants = cva('list-none space-y-1 pl-0');

export interface InternalLinksProps
    extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof internalLinksVariants>
{
    links: { href: string; label: string; }[];
    title?: string;
}

const InternalLinks = React.forwardRef<HTMLDivElement, InternalLinksProps>(
    ({ className, links, title, ...props }, ref) => {
        return (
            <div ref={ref} className={cn('py-8', className)} {...props}>
                {title && <h3 className='mb-4 text-lg font-semibold text-foreground'>{title}</h3>}
                <ul className={cn(internalLinksVariants())}>
                    {links.map(link => {
                        const isExternal = link.href.startsWith('http');
                        return (
                            <li key={link.href} className='flex items-start'>
                                <span className='mr-2 text-muted-foreground'>•</span>
                                {isExternal
                                    ? (
                                        <a
                                            href={link.href}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline'
                                        >
                                            {link.label}
                                        </a>
                                    )
                                    : (
                                        <Link
                                            href={link.href}
                                            className='text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline'
                                        >
                                            {link.label}
                                        </Link>
                                    )}
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    },
);
InternalLinks.displayName = 'InternalLinks';

export { InternalLinks };

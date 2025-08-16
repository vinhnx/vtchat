'use client'

import * as React from 'react'
import Link from 'next/link'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'

const internalLinksVariants = cva('grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5')

export interface InternalLinksProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof internalLinksVariants> {
    links: { href: string; label: string }[]
    title?: string
}

const InternalLinks = React.forwardRef<HTMLDivElement, InternalLinksProps>(
    ({ className, links, title, ...props }, ref) => {
        return (
            <div ref={ref} className={cn('py-8', className)} {...props}>
                {title && <h3 className="mb-4 text-lg font-semibold text-foreground">{title}</h3>}
                <div className={cn(internalLinksVariants())}>
                    {links.map(link => {
                        const isExternal = link.href.startsWith('http');
                        return isExternal ? (
                            <a
                                key={link.href}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {link.label}
                            </a>
                        ) : (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </div>
            </div>
        )
    }
)
InternalLinks.displayName = 'InternalLinks'

export { InternalLinks }

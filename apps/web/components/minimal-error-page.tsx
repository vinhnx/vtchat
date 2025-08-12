'use client';

// import { Button } from "@repo/ui";
import Link from 'next/link';
import type { ReactNode } from 'react';

interface MinimalErrorPageProps {
    code?: string;
    title: string;
    description: string;
    actionButton?: {
        text: string;
        href?: string;
        onClick?: () => void;
    };
    children?: ReactNode;
}

export function MinimalErrorPage({
    code,
    title,
    description,
    actionButton,
    children,
}: MinimalErrorPageProps) {
    return (
        <div className='flex min-h-dvh flex-col'>
            <main className='flex flex-1 items-center justify-center px-4'>
                <div className='w-full max-w-md text-center'>
                    <div className='mb-8'>
                        {code && <h1 className='text-foreground mb-2 text-4xl font-bold'>{code}
                        </h1>}
                        <h2 className='text-foreground mb-3 text-xl font-medium'>{title}</h2>
                        <p className='text-muted-foreground text-sm'>{description}</p>
                    </div>
                    {children}
                    {actionButton?.href && (
                        <Link
                            href={actionButton.href}
                            className='ring-offset-background focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
                        >
                            {actionButton.text}
                        </Link>
                    )}
                    {actionButton && !actionButton.href && actionButton.onClick && (
                        <button
                            type='button'
                            className='ring-offset-background focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
                            onClick={actionButton.onClick}
                        >
                            {actionButton.text}
                        </button>
                    )}
                </div>
            </main>
        </div>
    );
}

'use client';

import { Footer } from '@repo/common/components';
import { useSession } from '@repo/shared/lib/auth-client';
import { Button } from '@repo/ui';
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
    const { isPending } = useSession();

    return (
        <div className="flex min-h-dvh flex-col">
            <main className="flex flex-1 items-center justify-center px-4">
                <div className="w-full max-w-md text-center">
                    <div className="mb-8">
                        {code && (
                            <h1 className="text-foreground mb-2 text-4xl font-bold">{code}</h1>
                        )}
                        <h2 className="text-foreground mb-3 text-xl font-medium">{title}</h2>
                        <p className="text-muted-foreground text-sm">{description}</p>
                    </div>
                    {children}
                    {actionButton && (
                        <>
                            {actionButton.href ? (
                                <Link href={actionButton.href}>
                                    <Button size="sm" variant="default">
                                        {actionButton.text}
                                    </Button>
                                </Link>
                            ) : (
                                <Button size="sm" variant="default" onClick={actionButton.onClick}>
                                    {actionButton.text}
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* Footer */}
            {!isPending && (
                <footer className="border-border/50 bg-background/50 border-t">
                    <div className="mx-auto max-w-7xl">
                        <Footer />
                    </div>
                </footer>
            )}
        </div>
    );
}

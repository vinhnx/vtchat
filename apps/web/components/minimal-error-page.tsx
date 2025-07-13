"use client";

import { Button } from "@repo/ui";
import Link from "next/link";
import type { ReactNode } from "react";

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
        <div className="flex min-h-dvh flex-col">
            <main className="flex flex-1 items-center justify-center px-4">
                <div className="w-full max-w-md text-center">
                    <div className="mb-8">
                        {code ? (
                            <h1 className="text-foreground mb-2 text-4xl font-bold">{code}</h1>
                        ) : null}
                        <h2 className="text-foreground mb-3 text-xl font-medium">{title}</h2>
                        <p className="text-muted-foreground text-sm">{description}</p>
                    </div>
                    {children}
                    {actionButton ? (
                        actionButton.href ? (
                            <Button size="sm" variant="default" asChild>
                                <Link href={actionButton.href}>{actionButton.text}</Link>
                            </Button>
                        ) : (
                            <Button size="sm" variant="default" onClick={actionButton.onClick}>
                                {actionButton.text}
                            </Button>
                        )
                    ) : null}
                </div>
            </main>
        </div>
    );
}

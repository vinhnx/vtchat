"use client";

// import { Button } from "@repo/ui";
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
                            <Link
                                href={actionButton.href}
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                            >
                                {actionButton.text}
                            </Link>
                        ) : (
                            <button
                                type="button"
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                                onClick={actionButton.onClick}
                            >
                                {actionButton.text}
                            </button>
                        )
                    ) : null}
                </div>
            </main>
        </div>
    );
}
